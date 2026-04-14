import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import PlumbingLayer from "@/components/PlumbingLayer";
import ElectricalLayer from "@/components/ElectricalLayer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SCALE = 8;
const MIN_SIZE = 5;

const FloorPlanCanvas = ({ project, onRoomsUpdated, activeLayers = {}, onPlumbingUpdated, onElectricalUpdated }) => {
  const [rooms, setRooms] = useState(project.rooms || []);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const canvasRef = useRef(null);
  const latestRoomsRef = useRef(rooms);

  useEffect(() => {
    setRooms(project.rooms || []);
  }, [project]);

  useEffect(() => {
    latestRoomsRef.current = rooms;
  }, [rooms]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;

  useEffect(() => {
    setRooms(project.rooms || []);
  }, [project]);

  const getVastuColor = (score) => {
    if (score >= 90) return "#059669";
    if (score >= 70) return "#F59E0B";
    return "#DC2626";
  };

  const saveRooms = useCallback(async (updatedRooms) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/projects/${project.id}/rooms`,
        updatedRooms,
        { withCredentials: true }
      );
      onRoomsUpdated(response.data.rooms, response.data.overall_score, response.data.plumbing, response.data.electrical);
    } catch (error) {
      console.error("Error updating rooms:", error);
      toast.error("Failed to update layout");
    }
  }, [project.id, onRoomsUpdated]);

  const handleRoomMouseDown = (e, room) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedRoomId(room.id);
    setDragging({ roomId: room.id, type: 'move' });
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragOrigin({ x: room.x, y: room.y, w: room.width, h: room.height });
  };

  const handleResizeMouseDown = (e, room, handle) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedRoomId(room.id);
    setDragging({ roomId: room.id, type: 'resize', handle });
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragOrigin({ x: room.x, y: room.y, w: room.width, h: room.height });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = (mouseX - dragStart.x) / SCALE;
    const dy = (mouseY - dragStart.y) / SCALE;

    setRooms(prevRooms =>
      prevRooms.map(r => {
        if (r.id !== dragging.roomId) return r;

        if (dragging.type === 'move') {
          const newX = Math.max(0, Math.min(dragOrigin.x + dx, project.plot_length - r.width));
          const newY = Math.max(0, Math.min(dragOrigin.y + dy, project.plot_width - r.height));
          return { ...r, x: newX, y: newY };
        }

        if (dragging.type === 'resize') {
          let newX = dragOrigin.x;
          let newY = dragOrigin.y;
          let newW = dragOrigin.w;
          let newH = dragOrigin.h;

          const handle = dragging.handle;

          if (handle.includes('e')) {
            newW = Math.max(MIN_SIZE, dragOrigin.w + dx);
            newW = Math.min(newW, project.plot_length - newX);
          }
          if (handle.includes('w')) {
            const shift = Math.min(dx, dragOrigin.w - MIN_SIZE);
            newX = Math.max(0, dragOrigin.x + shift);
            newW = dragOrigin.w - (newX - dragOrigin.x);
          }
          if (handle.includes('s')) {
            newH = Math.max(MIN_SIZE, dragOrigin.h + dy);
            newH = Math.min(newH, project.plot_width - newY);
          }
          if (handle.includes('n')) {
            const shift = Math.min(dy, dragOrigin.h - MIN_SIZE);
            newY = Math.max(0, dragOrigin.y + shift);
            newH = dragOrigin.h - (newY - dragOrigin.y);
          }

          return { ...r, x: newX, y: newY, width: newW, height: newH };
        }
        return r;
      })
    );
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(null);
      // Use ref to get latest rooms state
      saveRooms(latestRoomsRef.current);
    }
  };

  const resizeHandles = ['nw', 'ne', 'sw', 'se'];

  const handleCursorStyle = (handle) => {
    const cursors = { nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize' };
    return cursors[handle] || 'pointer';
  };

  const handlePosition = (handle, w, h) => {
    const size = 10;
    const half = size / 2;
    switch (handle) {
      case 'nw': return { left: -half, top: -half };
      case 'ne': return { right: -half, top: -half };
      case 'sw': return { left: -half, bottom: -half };
      case 'se': return { right: -half, bottom: -half };
      default: return {};
    }
  };

  return (
    <div className="bg-white border border-stone-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{fontFamily: 'Cabinet Grotesk, sans-serif'}}>2D Floor Plan</h3>
          <p className="text-xs text-stone-500 font-mono">
            {project.plot_length}' x {project.plot_width}' | {project.facing_direction.toUpperCase()} facing
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
        className="blueprint-bg relative border-2 border-stone-900 mx-auto overflow-hidden"
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
        {/* North arrow */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono text-stone-500 pointer-events-none">
          &uarr; N
        </div>

        {/* Room blocks */}
        {rooms.map((room) => {
          const isSelected = selectedRoom?.id === room.id;
          const isDragging = dragging?.roomId === room.id;
          return (
            <div
              key={room.id}
              data-testid={`room-block-${room.room_type}`}
              className={`room-block ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{
                left: room.x * SCALE,
                top: room.y * SCALE,
                width: room.width * SCALE,
                height: room.height * SCALE,
                borderColor: getVastuColor(room.vastu_score),
                borderWidth: isSelected ? '3px' : '2px'
              }}
              onMouseDown={(e) => handleRoomMouseDown(e, room)}
            >
              <div className="p-2 h-full flex flex-col justify-between select-none" style={{ fontSize: '11px' }}>
                <div>
                  <div className="font-semibold truncate">{room.name}</div>
                  <div className="text-stone-600 font-mono text-[9px]">
                    {room.width.toFixed(0)}' x {room.height.toFixed(0)}'
                  </div>
                </div>
                <div className="font-mono font-semibold text-[10px]" style={{ color: getVastuColor(room.vastu_score) }}>
                  {room.vastu_score.toFixed(0)}/100
                </div>
              </div>

              {/* Resize handles */}
              {isSelected && resizeHandles.map((handle) => (
                <div
                  key={handle}
                  data-testid={`resize-handle-${handle}`}
                  className="absolute z-10"
                  style={{
                    ...handlePosition(handle),
                    width: 10,
                    height: 10,
                    backgroundColor: '#0055FF',
                    border: '1px solid white',
                    cursor: handleCursorStyle(handle)
                  }}
                  onMouseDown={(e) => handleResizeMouseDown(e, room, handle)}
                />
              ))}
            </div>
          );
        })}

        {/* Plumbing Layer */}
        {activeLayers?.plumbing && project.plumbing && (
          <PlumbingLayer
            elements={project.plumbing}
            plotLength={project.plot_length}
            plotWidth={project.plot_width}
            onElementsUpdated={onPlumbingUpdated}
          />
        )}

        {/* Electrical Layer */}
        {activeLayers?.electrical && project.electrical && (
          <ElectricalLayer
            elements={project.electrical}
            plotLength={project.plot_length}
            plotWidth={project.plot_width}
            onElementsUpdated={onElectricalUpdated}
          />
        )}
      </div>

      {/* Selected room details */}
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
            <p>Dimensions: <span className="font-mono">{selectedRoom.width?.toFixed(1)}' x {selectedRoom.height?.toFixed(1)}' ({(selectedRoom.width * selectedRoom.height).toFixed(0)} sq.ft)</span></p>
            {selectedRoom.vastu_warnings?.length > 0 && (
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

      <div className="mt-3 text-xs text-stone-500 font-mono flex items-center gap-4">
        <span>Drag rooms to reposition</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-blue-600"></span> Drag corners to resize
        </span>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;