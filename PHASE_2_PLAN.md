# 📐 Phase 2: 2D Floor Plan Generator - Implementation Plan

## 🎉 Phase 1 Complete! ✅

**What's Working:**
- ✅ Full-stack app deployed (Frontend + Backend + Database)
- ✅ User authentication (Register/Login/JWT)
- ✅ Project CRUD operations
- ✅ 195+ E2E tests passing
- ✅ Production URLs:
  - Frontend: https://plot2plan.vercel.app
  - Backend: https://plot2plan.onrender.com
  - Database: MongoDB Atlas

---

## 🎯 Phase 2 Goal: AI-Powered 2D Floor Plan Generation

Transform user inputs (plot size, rooms, preferences) into **professional 2D floor plans** with:
- Room layouts optimized for space
- Proper dimensions and measurements
- Door/window placements
- Furniture suggestions (optional)
- Vastu compliance (optional)
- Export to PDF/PNG/SVG

---

## 📋 Phase 2 Feature Breakdown

### **2.1 Floor Plan Input & Configuration**
**What:** Enhanced project form with floor plan specific inputs

**Components:**
- Plot dimensions input (length × width in feet/meters)
- Number of floors selector (1-3)
- Room requirements checklist:
  - Bedrooms (1-5)
  - Bathrooms (1-4)
  - Kitchen, Living Room, Dining Room
  - Balcony, Terrace, Parking, Garden
  - Study Room, Prayer Room, Store Room
- Preferences:
  - Vastu compliance toggle
  - Style: Modern, Traditional, Minimalist
  - Budget range
  - Special requirements (wheelchair access, etc.)

**Files to Create:**
```
frontend/src/components/projects/
├── FloorPlanInputForm.tsx        ← Main form component
├── RoomSelector.tsx              ← Room selection UI
├── PlotDimensionsInput.tsx       ← Plot size input with validation
└── PreferencesPanel.tsx          ← Vastu, style, budget options
```

**Backend Schema Update:**
```typescript
// backend/src/projects/schemas/project.schema.ts
{
  floorPlan: {
    plotDimensions: {
      length: Number,      // in feet
      width: Number,
      unit: String,        // 'feet' | 'meters'
    },
    floors: Number,
    rooms: {
      bedrooms: Number,
      bathrooms: Number,
      kitchen: Boolean,
      livingRoom: Boolean,
      diningRoom: Boolean,
      balcony: Number,
      parking: Boolean,
      // ... more
    },
    preferences: {
      vastuCompliant: Boolean,
      style: String,
      budget: { min: Number, max: Number },
      specialRequirements: [String],
    },
  },
}
```

**Time Estimate:** 2-3 days

---

### **2.2 Rule-Based Layout Engine**
**What:** Algorithm to generate optimal room layouts

**Approach:** Rule-based system (not AI initially for faster MVP)

**Algorithm Logic:**
1. **Calculate total area** = plot length × width
2. **Allocate room percentages:**
   - Bedrooms: 30-40%
   - Living room: 15-20%
   - Kitchen: 10-15%
   - Bathrooms: 5-10%
   - Circulation (hallways): 10-15%
   - Balcony/other: remaining
3. **Apply placement rules:**
   - Kitchen near dining area
   - Bathrooms near bedrooms
   - Living room near entrance
   - Vastu rules (if enabled):
     - Kitchen in SE
     - Master bedroom in SW
     - Living room in NE/NW
4. **Generate room coordinates** (x, y, width, height)

**Files to Create:**
```
backend/src/floor-plan/
├── floor-plan.module.ts
├── floor-plan.service.ts          ← Main generation logic
├── floor-plan.controller.ts
├── generators/
│   ├── layout-generator.ts        ← Room placement algorithm
│   ├── vastu-rules.ts             ← Vastu compliance logic
│   └── dimension-calculator.ts    ← Area calculations
└── dto/
    ├── generate-floor-plan.dto.ts
    └── floor-plan-response.dto.ts
```

**API Endpoint:**
```typescript
POST /api/v1/floor-plan/generate
Body: {
  projectId: string,
  plotDimensions: { length, width, unit },
  rooms: { bedrooms, bathrooms, ... },
  preferences: { vastuCompliant, style }
}

Response: {
  layout: [
    { 
      room: 'bedroom1',
      x: 0, y: 0, width: 12, height: 10,
      doors: [{ x: 6, y: 0, width: 3 }],
      windows: [{ x: 0, y: 5, width: 4 }]
    },
    // ... more rooms
  ],
  totalArea: 1200,
  vastu: { compliant: true, score: 85 }
}
```

**Time Estimate:** 4-5 days

---

### **2.3 2D Visualization (Canvas/SVG Rendering)**
**What:** Render the generated floor plan visually

**Technology Options:**

**Option A: SVG (Recommended)**
- ✅ Scalable vector graphics (sharp at any zoom)
- ✅ Easy to export (SVG/PNG/PDF)
- ✅ DOM-based (easy to add interactivity)
- ❌ Performance issues with very complex plans

**Option B: HTML5 Canvas**
- ✅ Better performance for complex scenes
- ✅ Good for animations
- ❌ Harder to make interactive
- ❌ Export requires extra libraries

**Option C: Konva.js (React + Canvas)**
- ✅ Best of both worlds
- ✅ React-friendly
- ✅ Great for drag-drop editing (future)
- ❌ Larger bundle size

**Recommendation:** Start with **SVG**, migrate to **Konva.js** if needed.

**Components:**
```
frontend/src/components/floor-plan/
├── FloorPlanCanvas.tsx           ← Main canvas component
├── Room.tsx                      ← Individual room SVG element
├── Door.tsx                      ← Door SVG element
├── Window.tsx                    ← Window SVG element
├── DimensionLabel.tsx            ← Measurement annotations
├── Grid.tsx                      ← Background grid
└── controls/
    ├── ZoomControls.tsx          ← Zoom in/out
    ├── PanControls.tsx           ← Pan around canvas
    └── ExportButton.tsx          ← Export to PDF/PNG/SVG
```

**Rendering Logic:**
```typescript
// FloorPlanCanvas.tsx
const FloorPlanCanvas = ({ layout }) => {
  const scale = 10; // 1 foot = 10px
  
  return (
    <svg width={layout.plotWidth * scale} height={layout.plotLength * scale}>
      <Grid />
      {layout.rooms.map(room => (
        <g key={room.id}>
          <rect 
            x={room.x * scale} 
            y={room.y * scale}
            width={room.width * scale}
            height={room.height * scale}
            fill="#f0f0f0"
            stroke="#333"
          />
          <text x={...} y={...}>{room.name}</text>
          {room.doors.map(door => <Door {...door} />)}
          {room.windows.map(window => <Window {...window} />)}
        </g>
      ))}
    </svg>
  );
};
```

**Time Estimate:** 3-4 days

---

### **2.4 Export & Download (PDF/PNG/SVG)**
**What:** Allow users to download generated floor plans

**Libraries:**
- **jsPDF** - PDF generation
- **html2canvas** - SVG to PNG conversion
- **SVG native** - Direct SVG download

**Export Options:**
1. **SVG** - Vector format (editable in Adobe Illustrator, Inkscape)
2. **PNG** - Raster image (high resolution for printing)
3. **PDF** - Standard document format with dimensions

**Implementation:**
```typescript
// frontend/src/lib/export/floor-plan-export.ts

export const exportToPDF = (svgElement: SVGElement, projectName: string) => {
  const pdf = new jsPDF('landscape', 'pt', 'a4');
  
  // Convert SVG to canvas
  html2canvas(svgElement).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 580, 400);
    pdf.save(`${projectName}-floor-plan.pdf`);
  });
};

export const exportToPNG = (svgElement: SVGElement, projectName: string) => {
  html2canvas(svgElement).then(canvas => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}-floor-plan.png`;
      link.click();
    });
  });
};

export const exportToSVG = (svgElement: SVGElement, projectName: string) => {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}-floor-plan.svg`;
  link.click();
};
```

**Time Estimate:** 1-2 days

---

### **2.5 Save Generated Floor Plans**
**What:** Persist generated layouts to database

**Backend Updates:**
```typescript
// backend/src/projects/schemas/project.schema.ts
{
  generatedFloorPlan: {
    layout: [{
      room: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      doors: [{ x: Number, y: Number, width: Number }],
      windows: [{ x: Number, y: Number, width: Number }],
    }],
    generatedAt: Date,
    version: Number,      // Track regenerations
    vastuScore: Number,
    totalArea: Number,
    metadata: {
      algorithm: String,  // 'rule-based-v1'
      processingTime: Number,
    }
  }
}
```

**API Endpoints:**
```typescript
// Save generated floor plan
PATCH /api/v1/projects/:id/floor-plan
Body: { layout: [...], vastuScore: 85, totalArea: 1200 }

// Get floor plan history (versions)
GET /api/v1/projects/:id/floor-plan/history
Response: [{ version: 1, layout: [...], generatedAt: '...' }]

// Regenerate floor plan
POST /api/v1/projects/:id/floor-plan/regenerate
Body: { preferences: {...} }
```

**Time Estimate:** 1-2 days

---

### **2.6 UI Polish & Interactions**
**What:** Make the floor plan viewer professional

**Features:**
- Pan & Zoom controls
- Room labels (name + dimensions)
- Color coding by room type
- Measurement annotations
- Toggle grid on/off
- Toggle Vastu indicators
- Responsive design (mobile-friendly)

**Components:**
```
frontend/src/components/floor-plan/
├── viewer/
│   ├── FloorPlanViewer.tsx       ← Main viewer wrapper
│   ├── Toolbar.tsx               ← Top toolbar (zoom, export, etc.)
│   ├── LayerControls.tsx         ← Toggle layers (grid, labels, etc.)
│   └── InfoPanel.tsx             ← Show room details on hover
└── styles/
    └── floor-plan.module.css
```

**Time Estimate:** 2-3 days

---

## 📊 Phase 2 Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| 2.1 Input Form | 2-3 days | None |
| 2.2 Layout Engine | 4-5 days | 2.1 |
| 2.3 Visualization | 3-4 days | 2.2 |
| 2.4 Export | 1-2 days | 2.3 |
| 2.5 Save to DB | 1-2 days | 2.2, 2.3 |
| 2.6 UI Polish | 2-3 days | 2.3, 2.4, 2.5 |
| **Testing & Bug Fixes** | 2-3 days | All |

**Total Estimate:** **15-22 days** (3-4 weeks)

---

## 🎨 Tech Stack for Phase 2

**Frontend:**
- React + TypeScript
- SVG for rendering (or Konva.js)
- jsPDF + html2canvas (export)
- Zustand (state management)
- Tailwind CSS (styling)

**Backend:**
- NestJS
- Custom algorithm (rule-based layout generation)
- MongoDB (store generated layouts)

**Future (Phase 3+):**
- AI/ML model for smarter layouts (TensorFlow.js, OpenAI API)
- 3D visualization (Three.js, React Three Fiber)
- Drag-and-drop editor (Konva.js, Fabric.js)

---

## 🚀 Quick Start (Phase 2 Kickoff)

### **Step 1: Create Feature Branch**
```bash
cd house-design-platform
git checkout -b feature/floor-plan-generator
```

### **Step 2: Setup Backend Module**
```bash
cd backend
npx nest g module floor-plan
npx nest g service floor-plan
npx nest g controller floor-plan
```

### **Step 3: Update Project Schema**
Add `floorPlan` and `generatedFloorPlan` fields to `project.schema.ts`

### **Step 4: Create Frontend Components**
```bash
cd ../frontend/src/components
mkdir floor-plan
touch floor-plan/FloorPlanInputForm.tsx
touch floor-plan/FloorPlanCanvas.tsx
```

### **Step 5: Install Dependencies**
```bash
# Frontend
cd frontend
npm install jspdf html2canvas

# Backend (if using external libraries for calculations)
cd ../backend
npm install mathjs  # For geometry calculations
```

---

## 🎯 Phase 2 Success Criteria

**Must Have:**
- ✅ User can input plot dimensions + room requirements
- ✅ System generates valid 2D floor plan layout
- ✅ Floor plan displays in browser with rooms, doors, windows
- ✅ User can export to PDF/PNG/SVG
- ✅ Generated plans saved to database
- ✅ Basic Vastu compliance (optional toggle)

**Nice to Have:**
- Multiple layout variations (user can choose)
- Furniture placement suggestions
- Cost estimation based on floor plan
- Share floor plan via public link

**Future (Phase 3):**
- AI-powered layout optimization
- 3D elevation view
- Interactive drag-drop editor
- Building code compliance checks

---

## 📚 Resources & References

**Floor Plan Libraries:**
- [Floorplanner.js](https://github.com/cvdlab/react-planner) - Open source floor plan editor
- [react-floor-plan](https://github.com/crizant/react-floor-plan) - React component
- [OpenCAD.js](https://github.com/ghemingway/cad.js) - CAD rendering in browser

**Algorithm Inspiration:**
- [Evolutionary Floor Plan Design](https://github.com/chongyan11/ridgebackphd) - Research paper implementation
- [Procedural House Generation](https://github.com/martinRenou/procedural_city_generation)

**Vastu Resources:**
- [Vastu Shastra Guidelines](https://en.wikipedia.org/wiki/Vastu_shastra)
- Compass directions mapping
- Room placement rules

---

## 🐛 Known Challenges & Solutions

### **Challenge 1: Complex Layout Algorithm**
**Problem:** Room placement with constraints is NP-hard  
**Solution:** Use greedy algorithm + pre-defined templates for common layouts (2BHK, 3BHK, etc.)

### **Challenge 2: Vastu Compliance**
**Problem:** Strict Vastu rules can make layouts impossible  
**Solution:** Provide "Vastu score" instead of strict compliance, show trade-offs

### **Challenge 3: Export Quality**
**Problem:** SVG to PDF conversion can lose quality  
**Solution:** Render at 300 DPI, use vector-based PDF generation

### **Challenge 4: Performance**
**Problem:** Large/complex floor plans slow down browser  
**Solution:** Use canvas for rendering, SVG only for export

---

## 📝 Notes

- Start simple: 1-floor, rectangular plots only
- Add complexity gradually (L-shaped plots, multi-floor, etc.)
- Focus on 2-3 common house types (2BHK, 3BHK)
- User testing early and often
- Mobile-first design (many users on phones in India)

---

**Ready to start Phase 2?** Let's build the floor plan generator! 🏗️
