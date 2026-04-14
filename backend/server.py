from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== AUTH HELPERS =====================
def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=120), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ===================== PYDANTIC MODELS =====================
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    room_type: str
    x: float
    y: float
    width: float
    height: float
    floor: int = 1
    direction: str = ""
    vastu_score: float = 0.0
    vastu_warnings: List[str] = []

class PlumbingElement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    element_type: str
    x: float
    y: float
    x2: Optional[float] = None
    y2: Optional[float] = None
    label: str = ""
    room_id: str = ""
    floor: int = 1

class ElectricalElement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    element_type: str
    x: float
    y: float
    label: str = ""
    room_id: str = ""
    floor: int = 1

class ProjectInput(BaseModel):
    plot_length: float
    plot_width: float
    facing_direction: str
    num_floors: int
    bedrooms: int
    kitchen: int = 1
    bathrooms: int
    pooja_room: int = 0
    parking: int = 0
    style: str
    budget_range: Optional[str] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    user_id: str = ""
    plot_length: float
    plot_width: float
    facing_direction: str
    num_floors: int
    style: str
    budget_range: Optional[str] = None
    rooms: List[Room] = []
    plumbing: List[PlumbingElement] = []
    electrical: List[ElectricalElement] = []
    vastu_overall_score: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Revision(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    version: int
    label: str = ""
    rooms: List[Room] = []
    vastu_overall_score: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CopilotMessage(BaseModel):
    project_id: str
    message: str

class CopilotResponse(BaseModel):
    response: str
    modified_layout: bool = False
    updated_rooms: Optional[List[Room]] = None

# ===================== VASTU RULES =====================
VASTU_RULES = {
    "kitchen": {"ideal_direction": "southeast", "acceptable_directions": ["southeast", "south", "east"], "avoid_directions": ["north", "northeast", "northwest"]},
    "master_bedroom": {"ideal_direction": "southwest", "acceptable_directions": ["southwest", "south", "west"], "avoid_directions": ["northeast", "north", "east"]},
    "bedroom": {"ideal_direction": "southwest", "acceptable_directions": ["southwest", "west", "south", "northwest"], "avoid_directions": ["northeast"]},
    "pooja_room": {"ideal_direction": "northeast", "acceptable_directions": ["northeast", "north", "east"], "avoid_directions": ["south", "southwest", "west"]},
    "bathroom": {"ideal_direction": "northwest", "acceptable_directions": ["northwest", "west", "south"], "avoid_directions": ["northeast", "north", "east", "southwest"]},
    "living_room": {"ideal_direction": "northeast", "acceptable_directions": ["northeast", "north", "east"], "avoid_directions": ["southwest"]},
    "parking": {"ideal_direction": "northwest", "acceptable_directions": ["northwest", "north", "southeast"], "avoid_directions": ["northeast", "southwest"]},
    "staircase": {"ideal_direction": "south", "acceptable_directions": ["south", "west", "southwest"], "avoid_directions": ["northeast", "north", "east"]},
}

def calculate_room_direction(room: Room, plot_width: float, plot_height: float, facing: str) -> str:
    center_x = plot_width / 2
    center_y = plot_height / 2
    room_center_x = room.x + room.width / 2
    room_center_y = room.y + room.height / 2
    if room_center_x < center_x / 2:
        if room_center_y < center_y / 2: return "northeast"
        elif room_center_y > center_y * 1.5: return "southeast"
        else: return "east"
    elif room_center_x > center_x * 1.5:
        if room_center_y < center_y / 2: return "northwest"
        elif room_center_y > center_y * 1.5: return "southwest"
        else: return "west"
    else:
        if room_center_y < center_y: return "north"
        else: return "south"

def validate_vastu_for_room(room: Room, plot_width: float, plot_height: float, facing: str) -> tuple:
    room_type = room.room_type.lower().replace(" ", "_")
    actual_direction = calculate_room_direction(room, plot_width, plot_height, facing)
    room.direction = actual_direction
    if room_type not in VASTU_RULES:
        return 70.0, []
    rules = VASTU_RULES[room_type]
    if actual_direction == rules["ideal_direction"]:
        return 100.0, []
    elif actual_direction in rules["acceptable_directions"]:
        return 75.0, [f"{room.name} is in {actual_direction}, better in {rules['ideal_direction']} for optimal Vastu"]
    elif actual_direction in rules["avoid_directions"]:
        return 40.0, [f"{room.name} in {actual_direction} violates Vastu! Should be in {rules['ideal_direction']}"]
    else:
        return 60.0, [f"{room.name} placement needs review - consider {rules['ideal_direction']}"]

# ===================== PLUMBING GENERATION =====================
def generate_plumbing_for_rooms(rooms: List[Room], plot_length: float, plot_width: float) -> List[PlumbingElement]:
    elements = []
    # Ground floor infrastructure
    elements.append(PlumbingElement(element_type="overhead_tank", x=5, y=5, label="Overhead Tank", floor=1))
    elements.append(PlumbingElement(element_type="sump", x=plot_length - 10, y=plot_width - 10, label="Underground Sump", floor=1))
    
    for room in rooms:
        rt = room.room_type.lower()
        cx = room.x + room.width / 2
        fl = room.floor
        
        if rt == "kitchen":
            elements.append(PlumbingElement(element_type="tap", x=room.x + 2, y=room.y + 2, label="Kitchen Sink", room_id=room.id, floor=fl))
            elements.append(PlumbingElement(element_type="drain", x=room.x + 2, y=room.y + room.height - 1, label="Kitchen Drain", room_id=room.id, floor=fl))
            elements.append(PlumbingElement(element_type="pipe", x=5, y=5, x2=room.x + 2, y2=room.y + 2, label="Cold Water Line", room_id=room.id, floor=fl))
        elif rt == "bathroom":
            elements.append(PlumbingElement(element_type="shower", x=cx, y=room.y + 2, label="Shower", room_id=room.id, floor=fl))
            elements.append(PlumbingElement(element_type="tap", x=room.x + 2, y=room.y + room.height / 2, label="Basin Tap", room_id=room.id, floor=fl))
            elements.append(PlumbingElement(element_type="drain", x=cx, y=room.y + room.height - 1, label="Floor Drain", room_id=room.id, floor=fl))
            elements.append(PlumbingElement(element_type="pipe", x=5, y=5, x2=cx, y2=room.y + 2, label="Water Supply", room_id=room.id, floor=fl))
    
    elements.append(PlumbingElement(element_type="pipe", x=plot_length / 2, y=plot_width - 3, x2=plot_length - 3, y2=plot_width - 3, label="Main Drain Line", floor=1))
    elements.append(PlumbingElement(element_type="septic", x=plot_length - 5, y=plot_width - 5, label="Septic Tank", floor=1))
    return elements

# ===================== ELECTRICAL GENERATION =====================
def generate_electrical_for_rooms(rooms: List[Room], plot_length: float, plot_width: float) -> List[ElectricalElement]:
    elements = []
    elements.append(ElectricalElement(element_type="db_panel", x=plot_length / 2, y=3, label="Main DB Panel", floor=1))
    elements.append(ElectricalElement(element_type="earthing", x=plot_length - 3, y=plot_width - 3, label="Earthing Point", floor=1))
    
    for room in rooms:
        rt = room.room_type.lower()
        cx = room.x + room.width / 2
        cy = room.y + room.height / 2
        fl = room.floor
        
        elements.append(ElectricalElement(element_type="light", x=cx, y=cy, label=f"{room.name} Light", room_id=room.id, floor=fl))
        elements.append(ElectricalElement(element_type="switch", x=room.x + 1, y=cy, label=f"{room.name} Switch", room_id=room.id, floor=fl))
        
        if rt in ["master_bedroom", "bedroom"]:
            elements.append(ElectricalElement(element_type="fan", x=cx, y=cy, label=f"{room.name} Fan", room_id=room.id, floor=fl))
            elements.append(ElectricalElement(element_type="socket", x=room.x + room.width - 1, y=room.y + 2, label="Bed Side Socket", room_id=room.id, floor=fl))
            elements.append(ElectricalElement(element_type="socket", x=room.x + 1, y=room.y + room.height - 2, label="Charging Socket", room_id=room.id, floor=fl))
            if rt == "master_bedroom":
                elements.append(ElectricalElement(element_type="ac", x=room.x + room.width - 2, y=room.y + 1, label="AC Point", room_id=room.id, floor=fl))
        elif rt == "kitchen":
            elements.append(ElectricalElement(element_type="socket", x=room.x + 2, y=room.y + 1, label="Chimney Socket", room_id=room.id, floor=fl))
            elements.append(ElectricalElement(element_type="socket", x=room.x + room.width - 2, y=room.y + 1, label="Fridge Socket", room_id=room.id, floor=fl))
            elements.append(ElectricalElement(element_type="socket", x=cx, y=room.y + 1, label="Mixer/Oven Socket", room_id=room.id, floor=fl))
        elif rt == "living_room":
            elements.append(ElectricalElement(element_type="fan", x=cx, y=cy, label="Ceiling Fan", room_id=room.id, floor=fl))
            elements.append(ElectricalElement(element_type="socket", x=room.x + 1, y=room.y + 2, label="TV Socket", room_id=room.id, floor=fl))
            elements.append(ElectricalElement(element_type="socket", x=room.x + room.width - 1, y=room.y + 2, label="Power Socket", room_id=room.id, floor=fl))
        elif rt == "bathroom":
            elements.append(ElectricalElement(element_type="socket", x=room.x + 2, y=room.y + 1, label="Geyser Point", room_id=room.id, floor=fl))
        elif rt == "parking":
            elements.append(ElectricalElement(element_type="socket", x=cx, y=cy, label="EV Charging Point", room_id=room.id, floor=fl))
    return elements

# ===================== AI LAYOUT GENERATION =====================
async def generate_layout_with_ai(project_input: ProjectInput) -> List[Room]:
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    
    floor_guidance = ""
    if project_input.num_floors > 1:
        floor_guidance = f"""
This is a {project_input.num_floors}-floor building. Generate UNIQUE layouts for each floor:
- Floor 1 (Ground): Living room, kitchen, dining, parking, one bathroom, staircase
- Floor 2 (First): Bedrooms, bathrooms, balcony
- Floor 3+ (Upper): Additional bedrooms, study, terrace access
Include a "staircase" room on EVERY floor at the SAME position (same x,y,width,height).
Add a "floor" field (integer 1-{project_input.num_floors}) to each room.
Distribute rooms logically: public spaces on ground floor, private spaces upstairs.
"""
    else:
        floor_guidance = "This is a single floor building. Set floor=1 for all rooms."
    
    prompt = f"""You are an expert architect specializing in Vastu-compliant house designs.

Generate a floor plan for:
- Plot Size: {project_input.plot_length}ft x {project_input.plot_width}ft
- Facing: {project_input.facing_direction}
- Floors: {project_input.num_floors}
- Bedrooms: {project_input.bedrooms}
- Kitchen: {project_input.kitchen}
- Bathrooms: {project_input.bathrooms}
- Pooja Room: {project_input.pooja_room}
- Parking: {project_input.parking}
- Style: {project_input.style}

{floor_guidance}

Vastu Guidelines:
- Kitchen: Southeast (ideal)
- Master Bedroom: Southwest (ideal)
- Pooja Room: Northeast (ideal)
- Bathrooms: Northwest or West
- Living Room: Northeast or North
- Parking: Northwest or Southeast
- Staircase: South or West

Provide the layout as a JSON array of rooms with:
- name, room_type, x, y (position in feet from top-left, use 5ft setback), width, height (in feet), floor (integer)

Return ONLY valid JSON array, no other text."""
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"layout_{uuid.uuid4()}",
        system_message="You are a Vastu-compliant architecture AI. Respond only with valid JSON."
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    response = await chat.send_message(UserMessage(text=prompt))
    
    try:
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        rooms_data = json.loads(response_text)
        rooms = []
        for rd in rooms_data:
            if 'floor' not in rd:
                rd['floor'] = 1
            rooms.append(Room(**rd))
        return rooms
    except Exception as e:
        logging.error(f"Failed to parse AI response: {e}")
        return [
            Room(name="Living Room", room_type="living_room", x=5, y=5, width=15, height=12, floor=1),
            Room(name="Master Bedroom", room_type="master_bedroom", x=project_input.plot_length-20, y=project_input.plot_width-15, width=15, height=12, floor=1),
            Room(name="Kitchen", room_type="kitchen", x=project_input.plot_length-15, y=5, width=10, height=10, floor=1),
        ]

# ===================== REVISION HELPER =====================
async def _save_revision(project_id: str, rooms: list, vastu_score: float, label: str = ""):
    count = await db.revisions.count_documents({"project_id": project_id})
    version = count + 1
    revision = Revision(
        project_id=project_id, version=version,
        label=label or f"Revision {version}",
        rooms=[Room(**r) if isinstance(r, dict) else r for r in rooms],
        vastu_overall_score=vastu_score
    )
    doc = revision.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['rooms'] = [r.model_dump() if hasattr(r, 'model_dump') else r for r in revision.rooms]
    await db.revisions.insert_one(doc)
    return revision

# ===================== AUTH ENDPOINTS =====================
@api_router.post("/auth/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    
    return {"id": user_id, "name": data.name, "email": email, "role": "user", "token": access_token}

@api_router.post("/auth/login")
async def login(data: UserLogin, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    
    return {"id": user_id, "name": user["name"], "email": email, "role": user.get("role", "user"), "token": access_token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"success": True}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {"id": user["_id"], "name": user["name"], "email": user["email"], "role": user.get("role", "user")}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
        return {"success": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ===================== PROJECT ENDPOINTS =====================
@api_router.get("/")
async def root():
    return {"message": "Vastu Blueprint Generator API"}

@api_router.post("/projects/generate")
async def generate_project(project_input: ProjectInput, request: Request):
    user = await get_current_user(request)
    try:
        rooms = await generate_layout_with_ai(project_input)
        total_score = 0.0
        for room in rooms:
            score, warnings = validate_vastu_for_room(room, project_input.plot_length, project_input.plot_width, project_input.facing_direction)
            room.vastu_score = score
            room.vastu_warnings = warnings
            total_score += score
        overall_score = total_score / len(rooms) if rooms else 0.0
        
        # Generate plumbing and electrical
        plumbing = generate_plumbing_for_rooms(rooms, project_input.plot_length, project_input.plot_width)
        electrical = generate_electrical_for_rooms(rooms, project_input.plot_length, project_input.plot_width)
        
        project = Project(
            name=f"{project_input.style.title()} House - {project_input.facing_direction.upper()} Facing",
            user_id=user["_id"],
            plot_length=project_input.plot_length, plot_width=project_input.plot_width,
            facing_direction=project_input.facing_direction, num_floors=project_input.num_floors,
            style=project_input.style, budget_range=project_input.budget_range,
            rooms=rooms, plumbing=plumbing, electrical=electrical,
            vastu_overall_score=overall_score
        )
        doc = project.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.projects.insert_one(doc)
        await _save_revision(project.id, [r.model_dump() for r in rooms], overall_score, "Initial layout")
        return project
    except Exception as e:
        logging.error(f"Error generating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects")
async def list_projects(request: Request):
    user = await get_current_user(request)
    projects = await db.projects.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    user = await get_current_user(request)
    doc = await db.projects.find_one({"id": project_id, "user_id": user["_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.projects.delete_one({"id": project_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.revisions.delete_many({"project_id": project_id})
    return {"success": True}

@api_router.put("/projects/{project_id}/rooms")
async def update_rooms(project_id: str, rooms: List[Room], request: Request):
    user = await get_current_user(request)
    doc = await db.projects.find_one({"id": project_id, "user_id": user["_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    total_score = 0.0
    for room in rooms:
        score, warnings = validate_vastu_for_room(room, doc['plot_length'], doc['plot_width'], doc['facing_direction'])
        room.vastu_score = score
        room.vastu_warnings = warnings
        total_score += score
    overall_score = total_score / len(rooms) if rooms else 0.0
    
    # Regenerate plumbing and electrical for new layout
    plumbing = generate_plumbing_for_rooms(rooms, doc['plot_length'], doc['plot_width'])
    electrical = generate_electrical_for_rooms(rooms, doc['plot_length'], doc['plot_width'])
    
    await db.projects.update_one({"id": project_id}, {"$set": {
        "rooms": [r.model_dump() for r in rooms],
        "vastu_overall_score": overall_score,
        "plumbing": [p.model_dump() for p in plumbing],
        "electrical": [e.model_dump() for e in electrical],
    }})
    await _save_revision(project_id, [r.model_dump() for r in rooms], overall_score, "Layout edit")
    return {"success": True, "overall_score": overall_score, "rooms": rooms, "plumbing": plumbing, "electrical": electrical}

# ===================== PLUMBING & ELECTRICAL UPDATE =====================
@api_router.put("/projects/{project_id}/plumbing")
async def update_plumbing(project_id: str, elements: List[PlumbingElement], request: Request):
    user = await get_current_user(request)
    doc = await db.projects.find_one({"id": project_id, "user_id": user["_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.projects.update_one({"id": project_id}, {"$set": {"plumbing": [e.model_dump() for e in elements]}})
    return {"success": True, "plumbing": elements}

@api_router.put("/projects/{project_id}/electrical")
async def update_electrical(project_id: str, elements: List[ElectricalElement], request: Request):
    user = await get_current_user(request)
    doc = await db.projects.find_one({"id": project_id, "user_id": user["_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.projects.update_one({"id": project_id}, {"$set": {"electrical": [e.model_dump() for e in elements]}})
    return {"success": True, "electrical": elements}

# ===================== COPILOT =====================
@api_router.post("/copilot")
async def copilot_chat(message: CopilotMessage, request: Request):
    user = await get_current_user(request)
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        doc = await db.projects.find_one({"id": message.project_id, "user_id": user["_id"]}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Project not found")
        current_rooms = json.dumps(doc.get('rooms', []), indent=2)
        prompt = f"""You are an AI architectural assistant specialized in Vastu-compliant designs.

Current Project: {doc['plot_length']}ft x {doc['plot_width']}ft, {doc['facing_direction']} facing
Current Vastu Score: {doc['vastu_overall_score']:.1f}/100
Current Layout:
{current_rooms}

User Request: {message.message}

Provide helpful advice. Be concise and professional."""
        
        chat = LlmChat(api_key=api_key, session_id=f"copilot_{message.project_id}",
            system_message="You are a helpful Vastu architecture assistant."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        response = await chat.send_message(UserMessage(text=prompt))
        return CopilotResponse(response=response, modified_layout=False)
    except Exception as e:
        logging.error(f"Copilot error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===================== COST ESTIMATE =====================
@api_router.get("/projects/{project_id}/cost-estimate")
async def get_cost_estimate(project_id: str, request: Request):
    user = await get_current_user(request)
    doc = await db.projects.find_one({"id": project_id, "user_id": user["_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    total_area = sum(r['width'] * r['height'] for r in doc['rooms'])
    rates = {"modern": 1800, "duplex": 2000, "villa": 2500, "apartment": 1500}
    rate = rates.get(doc['style'].lower(), 1800)
    cost = total_area * rate
    boq = [
        {"item": "Civil Work", "quantity": f"{total_area:.0f} sq.ft", "rate": rate * 0.4, "amount": cost * 0.4},
        {"item": "Electrical Work", "quantity": "1 lot", "rate": cost * 0.15, "amount": cost * 0.15},
        {"item": "Plumbing Work", "quantity": "1 lot", "rate": cost * 0.12, "amount": cost * 0.12},
        {"item": "Finishing Work", "quantity": f"{total_area:.0f} sq.ft", "rate": rate * 0.25, "amount": cost * 0.25},
        {"item": "Miscellaneous", "quantity": "1 lot", "rate": cost * 0.08, "amount": cost * 0.08},
    ]
    return {"total_area": total_area, "construction_cost": cost, "cost_per_sqft": rate, "boq": boq}

# ===================== REVISION ENDPOINTS =====================
@api_router.get("/projects/{project_id}/revisions")
async def get_revisions(project_id: str):
    revisions = await db.revisions.find({"project_id": project_id}, {"_id": 0}).sort("version", -1).to_list(100)
    for r in revisions:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return revisions

@api_router.post("/projects/{project_id}/revisions/{revision_id}/restore")
async def restore_revision(project_id: str, revision_id: str, request: Request):
    user = await get_current_user(request)
    rev = await db.revisions.find_one({"project_id": project_id, "id": revision_id}, {"_id": 0})
    if not rev:
        raise HTTPException(status_code=404, detail="Revision not found")
    await db.projects.update_one({"id": project_id, "user_id": user["_id"]}, {"$set": {"rooms": rev['rooms'], "vastu_overall_score": rev['vastu_overall_score']}})
    await _save_revision(project_id, rev['rooms'], rev['vastu_overall_score'], f"Restored from v{rev['version']}")
    return {"success": True, "rooms": rev['rooms'], "vastu_overall_score": rev['vastu_overall_score']}

@api_router.get("/projects/{project_id}/revisions/compare/{rev_id_a}/{rev_id_b}")
async def compare_revisions(project_id: str, rev_id_a: str, rev_id_b: str):
    rev_a = await db.revisions.find_one({"project_id": project_id, "id": rev_id_a}, {"_id": 0})
    rev_b = await db.revisions.find_one({"project_id": project_id, "id": rev_id_b}, {"_id": 0})
    if not rev_a or not rev_b:
        raise HTTPException(status_code=404, detail="Revisions not found")
    score_diff = rev_b.get('vastu_overall_score', 0) - rev_a.get('vastu_overall_score', 0)
    rooms_a = {r['name']: r for r in rev_a.get('rooms', [])}
    rooms_b = {r['name']: r for r in rev_b.get('rooms', [])}
    room_changes = []
    for name in set(list(rooms_a.keys()) + list(rooms_b.keys())):
        ra, rb = rooms_a.get(name), rooms_b.get(name)
        if ra and rb:
            room_changes.append({"name": name, "score_change": rb.get('vastu_score', 0) - ra.get('vastu_score', 0),
                "moved": abs(ra.get('x',0)-rb.get('x',0)) > 1 or abs(ra.get('y',0)-rb.get('y',0)) > 1,
                "resized": abs(ra.get('width',0)-rb.get('width',0)) > 0.5 or abs(ra.get('height',0)-rb.get('height',0)) > 0.5,
                "old_score": ra.get('vastu_score', 0), "new_score": rb.get('vastu_score', 0)})
        elif ra: room_changes.append({"name": name, "removed": True})
        elif rb: room_changes.append({"name": name, "added": True})
    return {"revision_a": rev_a, "revision_b": rev_b, "score_diff": score_diff, "room_changes": room_changes}

# ===================== APP SETUP =====================
app.include_router(api_router)

# CORS - support credentials for cookies
frontend_url = os.environ.get('CORS_ORIGINS', '*')
origins = [o.strip() for o in frontend_url.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup - seed admin and create indexes
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@vastuplan.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")
    
    # Write test credentials
    creds_dir = Path("/app/memory")
    creds_dir.mkdir(exist_ok=True)
    (creds_dir / "test_credentials.md").write_text(
        f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n"
        f"## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n"
    )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
