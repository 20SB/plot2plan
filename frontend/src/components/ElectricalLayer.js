import { useState } from "react";

const SCALE = 8;

const ELEMENT_ICONS = {
  socket: { color: "#DC2626", symbol: "S" },
  switch: { color: "#F59E0B", symbol: "SW" },
  light: { color: "#EAB308", symbol: "L" },
  fan: { color: "#22C55E", symbol: "F" },
  ac: { color: "#06B6D4", symbol: "AC" },
  db_panel: { color: "#7C3AED", symbol: "DB" },
  earthing: { color: "#854D0E", symbol: "E" },
};

const ElectricalLayer = ({ elements, plotLength, plotWidth, onElementsUpdated }) => {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, elem) => {
    e.stopPropagation();
    const rect = e.currentTarget.closest("[data-layer-container]").getBoundingClientRect();
    setDraggingId(elem.id);
    setDragOffset({
      x: e.clientX - rect.left - elem.x * SCALE,
      y: e.clientY - rect.top - elem.y * SCALE,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(0, Math.min((e.clientX - rect.left - dragOffset.x) / SCALE, plotLength - 3));
    const newY = Math.max(0, Math.min((e.clientY - rect.top - dragOffset.y) / SCALE, plotWidth - 3));
    const updated = elements.map(el =>
      el.id === draggingId ? { ...el, x: newX, y: newY } : el
    );
    onElementsUpdated(updated);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <svg
      data-layer-container
      data-testid="electrical-layer"
      className="absolute inset-0"
      style={{ width: plotLength * SCALE, height: plotWidth * SCALE, pointerEvents: 'none' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {elements.map((elem) => {
        const config = ELEMENT_ICONS[elem.element_type] || { color: "#DC2626", symbol: "?" };

        return (
          <g
            key={elem.id}
            data-testid={`electrical-${elem.element_type}-${elem.id}`}
            style={{ cursor: "move", pointerEvents: "auto" }}
            onMouseDown={(e) => handleMouseDown(e, elem)}
          >
            <rect
              x={elem.x * SCALE - 9} y={elem.y * SCALE - 9}
              width={18} height={18}
              fill={config.color} fillOpacity={0.15}
              stroke={config.color} strokeWidth={1.5}
            />
            <text
              x={elem.x * SCALE} y={elem.y * SCALE + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={config.color} fontSize={7} fontWeight="bold" fontFamily="JetBrains Mono, monospace"
            >
              {config.symbol}
            </text>
            <title>{elem.label}</title>
          </g>
        );
      })}
    </svg>
  );
};

export default ElectricalLayer;
