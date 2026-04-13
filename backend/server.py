from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Pydantic Models
class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    room_type: str
    x: float
    y: float
    width: float
    height: float
    direction: str = ""
    vastu_score: float = 0.0
    vastu_warnings: List[str] = []

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
    plot_length: float
    plot_width: float
    facing_direction: str
    num_floors: int
    style: str
    budget_range: Optional[str] = None
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


# Vastu Rules Database
VASTU_RULES = {
    "kitchen": {
        "ideal_direction": "southeast",
        "acceptable_directions": ["southeast", "south", "east"],
        "avoid_directions": ["north", "northeast", "northwest"]
    },
    "master_bedroom": {
        "ideal_direction": "southwest",
        "acceptable_directions": ["southwest", "south", "west"],
        "avoid_directions": ["northeast", "north", "east"]
    },
    "bedroom": {
        "ideal_direction": "southwest",
        "acceptable_directions": ["southwest", "west", "south", "northwest"],
        "avoid_directions": ["northeast"]
    },
    "pooja_room": {
        "ideal_direction": "northeast",
        "acceptable_directions": ["northeast", "north", "east"],
        "avoid_directions": ["south", "southwest", "west"]
    },
    "bathroom": {
        "ideal_direction": "northwest",
        "acceptable_directions": ["northwest", "west", "south"],
        "avoid_directions": ["northeast", "north", "east", "southwest"]
    },
    "living_room": {
        "ideal_direction": "northeast",
        "acceptable_directions": ["northeast", "north", "east"],
        "avoid_directions": ["southwest"]
    },
    "parking": {
        "ideal_direction": "northwest",
        "acceptable_directions": ["northwest", "north", "southeast"],
        "avoid_directions": ["northeast", "southwest"]
    },
    "staircase": {
        "ideal_direction": "south",
        "acceptable_directions": ["south", "west", "southwest"],
        "avoid_directions": ["northeast", "north", "east"]
    }
}


def calculate_room_direction(room: Room, plot_width: float, plot_height: float, facing: str) -> str:
    """Calculate which direction a room is in based on its position"""
    center_x = plot_width / 2
    center_y = plot_height / 2
    room_center_x = room.x + room.width / 2
    room_center_y = room.y + room.height / 2
    
    # Determine quadrant
    if room_center_x < center_x / 2:
        if room_center_y < center_y / 2:
            return "northeast"
        elif room_center_y > center_y * 1.5:
            return "southeast"
        else:
            return "east"
    elif room_center_x > center_x * 1.5:
        if room_center_y < center_y / 2:
            return "northwest"
        elif room_center_y > center_y * 1.5:
            return "southwest"
        else:
            return "west"
    else:
        if room_center_y < center_y:
            return "north"
        else:
            return "south"


def validate_vastu_for_room(room: Room, plot_width: float, plot_height: float, facing: str) -> tuple:
    """Validate room against Vastu rules and return score and warnings"""
    room_type = room.room_type.lower().replace(" ", "_")
    
    # Get the actual direction of the room
    actual_direction = calculate_room_direction(room, plot_width, plot_height, facing)
    room.direction = actual_direction
    
    if room_type not in VASTU_RULES:
        return 70.0, []  # Default score for unknown room types
    
    rules = VASTU_RULES[room_type]
    warnings = []
    score = 100.0
    
    if actual_direction == rules["ideal_direction"]:
        score = 100.0
    elif actual_direction in rules["acceptable_directions"]:
        score = 75.0
        warnings.append(f"{room.name} is in {actual_direction}, better in {rules['ideal_direction']} for optimal Vastu")
    elif actual_direction in rules["avoid_directions"]:
        score = 40.0
        warnings.append(f"⚠️ {room.name} in {actual_direction} violates Vastu! Should be in {rules['ideal_direction']}")
    else:
        score = 60.0
        warnings.append(f"{room.name} placement needs review - consider {rules['ideal_direction']}")
    
    return score, warnings


async def generate_layout_with_ai(project_input: ProjectInput) -> List[Room]:
    """Generate floor plan layout using Claude AI"""
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    
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

Vastu Guidelines:
- Kitchen: Southeast (ideal), South or East (acceptable)
- Master Bedroom: Southwest (ideal)
- Pooja Room: Northeast (ideal)
- Bathrooms: Northwest or West
- Living Room: Northeast or North
- Parking: Northwest or Southeast
- Staircase: South or West

Provide the layout as a JSON array of rooms with:
- name (e.g., "Master Bedroom", "Kitchen")
- room_type (e.g., "master_bedroom", "kitchen", "bedroom", "bathroom", "living_room", "pooja_room", "parking")
- x, y (position in feet from top-left, use 5ft setback from boundaries)
- width, height (dimensions in feet)

Make sure rooms fit within the plot with proper spacing, doors, and circulation.

Return ONLY valid JSON array, no other text."""
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"layout_{uuid.uuid4()}",
        system_message="You are a Vastu-compliant architecture AI. Respond only with valid JSON."
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    
    # Parse the JSON response
    try:
        # Extract JSON from response
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        rooms_data = json.loads(response_text)
        rooms = [Room(**room_data) for room_data in rooms_data]
        return rooms
    except Exception as e:
        logging.error(f"Failed to parse AI response: {e}, Response: {response}")
        # Return a basic fallback layout
        return [
            Room(name="Living Room", room_type="living_room", x=5, y=5, width=15, height=12),
            Room(name="Master Bedroom", room_type="master_bedroom", x=project_input.plot_length-20, y=project_input.plot_width-15, width=15, height=12),
            Room(name="Kitchen", room_type="kitchen", x=project_input.plot_length-15, y=5, width=10, height=10)
        ]


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Vastu Blueprint Generator API"}


@api_router.post("/projects/generate", response_model=Project)
async def generate_project(project_input: ProjectInput):
    """Generate a new project with AI-generated Vastu-compliant layout"""
    try:
        # Generate layout using AI
        rooms = await generate_layout_with_ai(project_input)
        
        # Calculate Vastu scores for all rooms
        total_score = 0.0
        for room in rooms:
            score, warnings = validate_vastu_for_room(
                room, 
                project_input.plot_length, 
                project_input.plot_width,
                project_input.facing_direction
            )
            room.vastu_score = score
            room.vastu_warnings = warnings
            total_score += score
        
        overall_score = total_score / len(rooms) if rooms else 0.0
        
        # Create project
        project = Project(
            name=f"{project_input.style.title()} House - {project_input.facing_direction.upper()} Facing",
            plot_length=project_input.plot_length,
            plot_width=project_input.plot_width,
            facing_direction=project_input.facing_direction,
            num_floors=project_input.num_floors,
            style=project_input.style,
            budget_range=project_input.budget_range,
            rooms=rooms,
            vastu_overall_score=overall_score
        )
        
        # Save to database
        doc = project.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.projects.insert_one(doc)
        
        return project
    except Exception as e:
        logging.error(f"Error generating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get project by ID"""
    project_doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if isinstance(project_doc['created_at'], str):
        project_doc['created_at'] = datetime.fromisoformat(project_doc['created_at'])
    
    return Project(**project_doc)


@api_router.put("/projects/{project_id}/rooms")
async def update_rooms(project_id: str, rooms: List[Room]):
    """Update room positions and recalculate Vastu scores"""
    project_doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Recalculate Vastu scores
    total_score = 0.0
    for room in rooms:
        score, warnings = validate_vastu_for_room(
            room,
            project_doc['plot_length'],
            project_doc['plot_width'],
            project_doc['facing_direction']
        )
        room.vastu_score = score
        room.vastu_warnings = warnings
        total_score += score
    
    overall_score = total_score / len(rooms) if rooms else 0.0
    
    # Update in database
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "rooms": [room.model_dump() for room in rooms],
            "vastu_overall_score": overall_score
        }}
    )
    
    return {"success": True, "overall_score": overall_score, "rooms": rooms}


@api_router.post("/copilot", response_model=CopilotResponse)
async def copilot_chat(message: CopilotMessage):
    """AI Copilot for architectural assistance"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Get current project
        project_doc = await db.projects.find_one({"id": message.project_id}, {"_id": 0})
        if not project_doc:
            raise HTTPException(status_code=404, detail="Project not found")
        
        current_rooms = json.dumps(project_doc.get('rooms', []), indent=2)
        
        prompt = f"""You are an AI architectural assistant specialized in Vastu-compliant designs.

Current Project:
- Plot: {project_doc['plot_length']}ft x {project_doc['plot_width']}ft
- Facing: {project_doc['facing_direction']}
- Current Vastu Score: {project_doc['vastu_overall_score']:.1f}/100

Current Layout:
{current_rooms}

User Request: {message.message}

Vastu Rules:
- Kitchen: Southeast (ideal)
- Master Bedroom: Southwest (ideal)
- Pooja Room: Northeast (ideal)
- Bathrooms: Northwest/West
- Living Room: Northeast/North

Provide helpful advice. If the user wants layout changes, suggest modifications clearly.
Be concise and professional."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"copilot_{message.project_id}",
            system_message="You are a helpful Vastu architecture assistant."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return CopilotResponse(response=response, modified_layout=False)
    except Exception as e:
        logging.error(f"Copilot error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/projects/{project_id}/cost-estimate")
async def get_cost_estimate(project_id: str):
    """Generate cost estimation and BOQ"""
    project_doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    total_area = sum(room['width'] * room['height'] for room in project_doc['rooms'])
    
    # Basic cost estimation (₹ per sq ft varies by style)
    cost_per_sqft = {
        "modern": 1800,
        "duplex": 2000,
        "villa": 2500,
        "apartment": 1500
    }
    
    rate = cost_per_sqft.get(project_doc['style'].lower(), 1800)
    construction_cost = total_area * rate
    
    boq = [
        {"item": "Civil Work", "quantity": f"{total_area:.0f} sq.ft", "rate": rate * 0.4, "amount": construction_cost * 0.4},
        {"item": "Electrical Work", "quantity": "1 lot", "rate": construction_cost * 0.15, "amount": construction_cost * 0.15},
        {"item": "Plumbing Work", "quantity": "1 lot", "rate": construction_cost * 0.12, "amount": construction_cost * 0.12},
        {"item": "Finishing Work", "quantity": f"{total_area:.0f} sq.ft", "rate": rate * 0.25, "amount": construction_cost * 0.25},
        {"item": "Miscellaneous", "quantity": "1 lot", "rate": construction_cost * 0.08, "amount": construction_cost * 0.08}
    ]
    
    return {
        "total_area": total_area,
        "construction_cost": construction_cost,
        "cost_per_sqft": rate,
        "boq": boq
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()