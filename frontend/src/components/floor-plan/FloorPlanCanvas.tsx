'use client';

import { useRef, useState } from 'react';
import { Room, FloorPlanResponse } from '@/types/floor-plan';

interface FloorPlanCanvasProps {
  floorPlan: FloorPlanResponse;
  showGrid?: boolean;
  showDimensions?: boolean;
}

export default function FloorPlanCanvas({
  floorPlan,
  showGrid = true,
  showDimensions = true,
}: FloorPlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const scale = 10; // 1 foot = 10 pixels
  const padding = 50; // Padding around the floor plan
  
  const canvasWidth = floorPlan.plotDimensions.width * scale + padding * 2;
  const canvasHeight = floorPlan.plotDimensions.length * scale + padding * 2;

  // Room type colors
  const roomColors: Record<string, { fill: string; stroke: string }> = {
    bedroom: { fill: '#E3F2FD', stroke: '#1976D2' },
    living: { fill: '#FFF3E0', stroke: '#F57C00' },
    kitchen: { fill: '#FFF9C4', stroke: '#F9A825' },
    bathroom: { fill: '#F3E5F5', stroke: '#7B1FA2' },
    dining: { fill: '#E8F5E9', stroke: '#388E3C' },
    balcony: { fill: '#E0F2F1', stroke: '#00897B' },
    default: { fill: '#F5F5F5', stroke: '#757575' },
  };

  const getRoomColor = (roomType: string) => {
    return roomColors[roomType] || roomColors.default;
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const gridSize = 5 * scale; // 5 feet grid

    // Vertical lines
    for (let x = 0; x <= floorPlan.plotDimensions.width * scale; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={padding + x}
          y1={padding}
          x2={padding + x}
          y2={padding + floorPlan.plotDimensions.length * scale}
          stroke="#E0E0E0"
          strokeWidth="0.5"
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= floorPlan.plotDimensions.length * scale; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={padding}
          y1={padding + y}
          x2={padding + floorPlan.plotDimensions.width * scale}
          y2={padding + y}
          stroke="#E0E0E0"
          strokeWidth="0.5"
        />
      );
    }

    return <g className="grid">{gridLines}</g>;
  };

  const renderDoor = (room: Room, door: Room['doors'][0], index: number) => {
    const doorX = room.x * scale + door.x * scale + padding;
    const doorY = room.y * scale + door.y * scale + padding;
    const doorWidth = door.width * scale;

    // Door arc
    return (
      <g key={`door-${room.id}-${index}`}>
        <path
          d={`M ${doorX} ${doorY} Q ${doorX + doorWidth / 2} ${doorY - 15} ${doorX + doorWidth} ${doorY}`}
          fill="none"
          stroke="#795548"
          strokeWidth="2"
        />
        <line
          x1={doorX}
          y1={doorY}
          x2={doorX + doorWidth}
          y2={doorY}
          stroke="#795548"
          strokeWidth="3"
        />
      </g>
    );
  };

  const renderWindow = (room: Room, window: Room['windows'][0], index: number) => {
    const windowX = room.x * scale + window.x * scale + padding;
    const windowY = room.y * scale + window.y * scale + padding;
    const windowWidth = window.width * scale;
    const windowHeight = window.height * scale;

    return (
      <g key={`window-${room.id}-${index}`}>
        <rect
          x={windowX}
          y={windowY}
          width={windowWidth}
          height={windowHeight}
          fill="white"
          stroke="#2196F3"
          strokeWidth="2"
        />
        <line
          x1={windowX}
          y1={windowY}
          x2={windowX + windowWidth}
          y2={windowY + windowHeight}
          stroke="#2196F3"
          strokeWidth="1"
        />
        <line
          x1={windowX + windowWidth}
          y1={windowY}
          x2={windowX}
          y2={windowY + windowHeight}
          stroke="#2196F3"
          strokeWidth="1"
        />
      </g>
    );
  };

  const renderRoom = (room: Room) => {
    const colors = getRoomColor(room.type);
    const roomX = room.x * scale + padding;
    const roomY = room.y * scale + padding;
    const roomWidth = room.width * scale;
    const roomHeight = room.height * scale;

    return (
      <g key={room.id} className="room">
        {/* Room rectangle */}
        <rect
          x={roomX}
          y={roomY}
          width={roomWidth}
          height={roomHeight}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="2"
        />

        {/* Room label */}
        <text
          x={roomX + roomWidth / 2}
          y={roomY + roomHeight / 2 - 10}
          textAnchor="middle"
          className="text-sm font-semibold"
          fill="#333"
        >
          {room.name}
        </text>

        {/* Room dimensions */}
        {showDimensions && (
          <text
            x={roomX + roomWidth / 2}
            y={roomY + roomHeight / 2 + 10}
            textAnchor="middle"
            className="text-xs"
            fill="#666"
          >
            {room.width}' × {room.height}'
          </text>
        )}

        {/* Doors */}
        {room.doors.map((door, index) => renderDoor(room, door, index))}

        {/* Windows */}
        {room.windows.map((window, index) => renderWindow(room, window, index))}
      </g>
    );
  };

  return (
    <div className="floor-plan-canvas bg-white rounded-lg shadow-md p-4">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <strong>Total Area:</strong> {floorPlan.totalArea.toFixed(0)} {floorPlan.plotDimensions.unit === 'feet' ? 'sq ft' : 'sq m'}
          {floorPlan.vastuScore && (
            <span className="ml-4">
              <strong>Vastu Score:</strong> <span className={`font-bold ${floorPlan.vastuScore >= 80 ? 'text-green-600' : floorPlan.vastuScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{floorPlan.vastuScore}%</span>
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            title="Zoom In"
          >
            🔍+
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            title="Zoom Out"
          >
            🔍-
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            title="Reset View"
          >
            🔄
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-auto border border-gray-300 rounded-lg" style={{ maxHeight: '600px' }}>
        <svg
          ref={svgRef}
          width={canvasWidth * zoom}
          height={canvasHeight * zoom}
          viewBox={`${pan.x} ${pan.y} ${canvasWidth} ${canvasHeight}`}
          className="bg-white"
        >
          {/* Plot boundary */}
          <rect
            x={padding}
            y={padding}
            width={floorPlan.plotDimensions.width * scale}
            height={floorPlan.plotDimensions.length * scale}
            fill="none"
            stroke="#333"
            strokeWidth="3"
          />

          {/* Grid */}
          {renderGrid()}

          {/* Rooms */}
          {floorPlan.layout.map((room) => renderRoom(room))}

          {/* Plot dimensions labels */}
          {showDimensions && (
            <>
              {/* Width label (top) */}
              <text
                x={padding + (floorPlan.plotDimensions.width * scale) / 2}
                y={padding - 20}
                textAnchor="middle"
                className="text-sm font-semibold"
                fill="#333"
              >
                {floorPlan.plotDimensions.width} {floorPlan.plotDimensions.unit}
              </text>

              {/* Length label (left) */}
              <text
                x={padding - 20}
                y={padding + (floorPlan.plotDimensions.length * scale) / 2}
                textAnchor="middle"
                className="text-sm font-semibold"
                fill="#333"
                transform={`rotate(-90 ${padding - 20} ${padding + (floorPlan.plotDimensions.length * scale) / 2})`}
              >
                {floorPlan.plotDimensions.length} {floorPlan.plotDimensions.unit}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#E3F2FD] border-2 border-[#1976D2]"></div>
          <span>Bedroom</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#FFF3E0] border-2 border-[#F57C00]"></div>
          <span>Living Room</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#FFF9C4] border-2 border-[#F9A825]"></div>
          <span>Kitchen</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#F3E5F5] border-2 border-[#7B1FA2]"></div>
          <span>Bathroom</span>
        </div>
        <div className="flex items-center space-x-2">
          <line x1="0" y1="8" x2="16" y2="8" stroke="#795548" strokeWidth="3" className="inline-block" />
          <span>Door</span>
        </div>
        <div className="flex items-center space-x-2">
          <rect width="16" height="16" fill="white" stroke="#2196F3" strokeWidth="2" className="inline-block" />
          <span>Window</span>
        </div>
      </div>
    </div>
  );
}
