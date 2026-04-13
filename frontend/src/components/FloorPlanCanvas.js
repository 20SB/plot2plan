import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FloorPlanCanvas = ({ project, onRoomsUpdated }) => {
  const [rooms, setRooms] = useState(project.rooms || []);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [draggingRoom, setDraggingRoom] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    setRooms(project.rooms || []);
  }, [project]);

  const SCALE = 8; // pixels per foot

  const handleMouseDown = (e, room) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDraggingRoom(room);
    setSelectedRoom(room);
    setDragOffset({
      x: mouseX - room.x * SCALE,
      y: mouseY - room.y * SCALE
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingRoom) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newX = Math.max(0, Math.min((mouseX - dragOffset.x) / SCALE, project.plot_length - draggingRoom.width));
    const newY = Math.max(0, Math.min((mouseY - dragOffset.y) / SCALE, project.plot_width - draggingRoom.height));
    
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === draggingRoom.id ? { ...r, x: newX, y: newY } : r
      )
    );
  };

  const handleMouseUp = async () => {
    if (draggingRoom) {
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/projects/${project.id}/rooms`,
          rooms
        );
        onRoomsUpdated(response.data.rooms, response.data.overall_score);
        toast.success("Layout updated");
      } catch (error) {
        console.error("Error updating rooms:", error);
        toast.error("Failed to update layout");
      }
      setDraggingRoom(null);
    }
  };

  const getVastuColor = (score) => {
    if (score >= 90) return "#059669";
    if (score >= 70) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <div className="bg-white border border-stone-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{fontFamily: 'Cabinet Grotesk, sans-serif'}}>2D Floor Plan</h3>
          <p className="text-xs text-stone-500 font-mono">
            {project.plot_length}' × {project.plot_width}' | {project.facing_direction.toUpperCase()} facing
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">Total Area</p>
          <p className="text-lg font-semibold font-mono">
            {rooms.reduce((sum, room) => sum + (room.width * room.height), 0).toFixed(0)} sq.ft
          </p>
        </div>
      </div>

      <div
        ref={canvasRef}
        data-testid="floor-plan-canvas"
        className="blueprint-bg relative border-2 border-stone-900 mx-auto"
        style={{
          width: project.plot_length * SCALE,
          height: project.plot_width * SCALE,
          maxWidth: '100%',
          aspectRatio: `${project.plot_length} / ${project.plot_width}`
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Plot boundary markers */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* North arrow */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono text-stone-500">
            ↑ N
          </div>
        </div>

        {/* Room blocks */}
        {rooms.map((room) => (
          <div
            key={room.id}
            data-testid={`room-block-${room.room_type}`}
            className={`room-block ${
              selectedRoom?.id === room.id ? 'selected' : ''
            } ${
              draggingRoom?.id === room.id ? 'dragging' : ''
            }`}
            style={{
              left: room.x * SCALE,
              top: room.y * SCALE,
              width: room.width * SCALE,
              height: room.height * SCALE,
              borderColor: getVastuColor(room.vastu_score),
              borderWidth: selectedRoom?.id === room.id ? '3px' : '2px'
            }}
            onMouseDown={(e) => handleMouseDown(e, room)}
          >
            <div className="p-2 h-full flex flex-col justify-between" style={{ fontSize: '11px' }}>
              <div>
                <div className="font-semibold">{room.name}</div>
                <div className="text-stone-600 font-mono text-[9px]">
                  {room.width}' × {room.height}'
                </div>
              </div>
              <div className="font-mono font-semibold text-[10px]" style={{ color: getVastuColor(room.vastu_score) }}>
                {room.vastu_score.toFixed(0)}/100
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div className="mt-4 p-4 border border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">{selectedRoom.name}</h4>
            <span
              className="text-xs font-mono font-semibold px-2 py-1 border"
              style={{
                color: getVastuColor(selectedRoom.vastu_score),
                borderColor: getVastuColor(selectedRoom.vastu_score)
              }}
            >
              {selectedRoom.vastu_score.toFixed(0)}/100
            </span>
          </div>
          <div className="text-xs text-stone-600 space-y-1">
            <p>Direction: <span className="font-mono font-semibold">{selectedRoom.direction}</span></p>
            <p>Dimensions: <span className="font-mono">{selectedRoom.width}' × {selectedRoom.height}' ({(selectedRoom.width * selectedRoom.height).toFixed(0)} sq.ft)</span></p>
            {selectedRoom.vastu_warnings.length > 0 && (
              <div className="mt-2 pt-2 border-t border-stone-200">
                <p className="font-semibold mb-1">Vastu Feedback:</p>
                {selectedRoom.vastu_warnings.map((warning, idx) => (
                  <p key={idx} className="text-stone-700 text-[11px] leading-relaxed">{warning}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-stone-500 font-mono">
        💡 Tip: Drag rooms to reposition and update Vastu scores in real-time
      </div>
    </div>
  );
};

export default FloorPlanCanvas;