import { useState } from "react";

const SCALE = 8;

const ELEMENT_ICONS = {
  pipe: { color: "#2563EB", symbol: "---" },
  overhead_tank: { color: "#2563EB", symbol: "OT" },
  sump: { color: "#1E40AF", symbol: "UG" },
  tap: { color: "#0EA5E9", symbol: "T" },
  shower: { color: "#06B6D4", symbol: "SH" },
  drain: { color: "#64748B", symbol: "D" },
  septic: { color: "#7C3AED", symbol: "SP" },
};

const PlumbingLayer = ({ elements, plotLength, plotWidth, onElementsUpdated }) => {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, elem) => {
    if (elem.element_type === "pipe") return;
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
      data-testid="plumbing-layer"
      className="absolute inset-0 pointer-events-auto"
      style={{ width: plotLength * SCALE, height: plotWidth * SCALE }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {elements.map((elem) => {
        const config = ELEMENT_ICONS[elem.element_type] || { color: "#2563EB", symbol: "?" };

        if (elem.element_type === "pipe" && elem.x2 != null && elem.y2 != null) {
          return (
            <g key={elem.id}>
              <line
                x1={elem.x * SCALE} y1={elem.y * SCALE}
                x2={elem.x2 * SCALE} y2={elem.y2 * SCALE}
                stroke={config.color} strokeWidth={2} strokeDasharray="6,3" opacity={0.7}
              />
            </g>
          );
        }

        return (
          <g
            key={elem.id}
            data-testid={`plumbing-${elem.element_type}-${elem.id}`}
            style={{ cursor: "move" }}
            onMouseDown={(e) => handleMouseDown(e, elem)}
          >
            <circle
              cx={elem.x * SCALE} cy={elem.y * SCALE}
              r={10} fill={config.color} fillOpacity={0.2}
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

export default PlumbingLayer;
