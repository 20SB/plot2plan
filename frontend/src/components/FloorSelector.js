import { Stairs, House } from "@phosphor-icons/react";

const MINI_SCALE = 1.5;

const FLOOR_LABELS = {
  1: "Ground Floor",
  2: "First Floor",
  3: "Second Floor",
  4: "Third Floor",
  5: "Fourth Floor",
};

const FloorSelector = ({ project, currentFloor, onFloorChange }) => {
  const numFloors = project.num_floors || 1;
  const allRooms = project.rooms || [];

  const floors = [];
  for (let i = 1; i <= numFloors; i++) {
    floors.push(i);
  }

  const getRoomsForFloor = (floor) => allRooms.filter(r => (r.floor || 1) === floor);

  const getFloorScore = (floor) => {
    const floorRooms = getRoomsForFloor(floor);
    if (floorRooms.length === 0) return 0;
    return floorRooms.reduce((s, r) => s + (r.vastu_score || 0), 0) / floorRooms.length;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#059669";
    if (score >= 70) return "#F59E0B";
    return "#DC2626";
  };

  if (numFloors <= 1) return null;

  return (
    <div className="border border-stone-200 bg-white mb-4">
      <div className="p-3 border-b border-stone-200 flex items-center gap-2">
        <Stairs size={16} weight="regular" />
        <span className="text-xs font-semibold uppercase tracking-wider font-mono text-stone-600">
          Floors ({numFloors})
        </span>
      </div>

      <div className="flex gap-0 divide-x divide-stone-200">
        {floors.map((floor) => {
          const floorRooms = getRoomsForFloor(floor);
          const score = getFloorScore(floor);
          const isActive = currentFloor === floor;
          const hasStaircase = floorRooms.some(r => r.room_type === "staircase");

          return (
            <button
              key={floor}
              data-testid={`floor-selector-${floor}`}
              onClick={() => onFloorChange(floor)}
              className={`flex-1 p-3 transition-colors text-left ${
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'hover:bg-stone-50 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  {FLOOR_LABELS[floor] || `Floor ${floor}`}
                </span>
                {hasStaircase && (
                  <Stairs
                    size={12}
                    weight="bold"
                    className={isActive ? 'text-blue-300' : 'text-blue-600'}
                  />
                )}
              </div>

              {/* Mini floor preview */}
              <div
                className={`relative border ${isActive ? 'border-stone-600' : 'border-stone-300'} mb-2`}
                style={{
                  width: project.plot_length * MINI_SCALE,
                  height: project.plot_width * MINI_SCALE,
                  maxWidth: '100%',
                  backgroundColor: isActive ? '#1a1a1a' : '#F5F5F4',
                }}
              >
                {floorRooms.map((room) => {
                  const isStair = room.room_type === "staircase";
                  return (
                    <div
                      key={room.id}
                      className="absolute"
                      style={{
                        left: room.x * MINI_SCALE,
                        top: room.y * MINI_SCALE,
                        width: room.width * MINI_SCALE,
                        height: room.height * MINI_SCALE,
                        border: `1px solid ${isStair ? '#0055FF' : (isActive ? '#555' : '#999')}`,
                        backgroundColor: isStair
                          ? 'rgba(0,85,255,0.3)'
                          : (isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)'),
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono ${isActive ? 'text-stone-400' : 'text-stone-500'}`}>
                  {floorRooms.length} rooms
                </span>
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{ color: isActive ? (score >= 70 ? '#86efac' : '#fca5a5') : getScoreColor(score) }}
                >
                  {score.toFixed(0)}/100
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FloorSelector;
