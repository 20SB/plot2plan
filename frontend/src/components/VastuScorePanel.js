import { Progress } from "@/components/ui/progress";
import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react";

const VastuScorePanel = ({ project }) => {
  const score = project.vastu_overall_score;

  const getScoreCategory = () => {
    if (score >= 85) return { label: "Excellent", color: "#059669", icon: CheckCircle };
    if (score >= 70) return { label: "Good", color: "#F59E0B", icon: Warning };
    return { label: "Needs Improvement", color: "#DC2626", icon: XCircle };
  };

  const category = getScoreCategory();
  const IconComponent = category.icon;

  // Collect all warnings
  const allWarnings = project.rooms.flatMap(room => 
    room.vastu_warnings.map(warning => ({
      room: room.name,
      warning,
      score: room.vastu_score
    }))
  );

  return (
    <div className="p-6">
      <h3 className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-4">Vastu Analysis</h3>
      
      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconComponent size={24} weight="fill" style={{ color: category.color }} />
            <span className="text-sm font-medium">{category.label}</span>
          </div>
          <span className="text-4xl font-mono font-medium tracking-tighter" style={{ color: category.color }}>
            {score.toFixed(0)}
          </span>
        </div>
        <Progress 
          data-testid="vastu-score-progress"
          value={score} 
          className="h-2 rounded-none"
          style={{
            backgroundColor: '#E4E4E7'
          }}
        />
        <p className="text-xs text-stone-500 mt-2 font-mono">Overall Vastu Compliance</p>
      </div>

      {/* Room-wise Scores */}
      <div className="mb-6">
        <h4 className="text-xs uppercase tracking-wider text-stone-600 font-mono mb-3">Room Scores</h4>
        <div className="space-y-2">
          {project.rooms.map((room) => {
            const roomScore = room.vastu_score;
            const roomColor = roomScore >= 85 ? '#059669' : roomScore >= 70 ? '#F59E0B' : '#DC2626';
            
            return (
              <div key={room.id} className="flex items-center justify-between text-xs">
                <span className="text-stone-700">{room.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-stone-200 rounded-none overflow-hidden">
                    <div 
                      className="h-full"
                      style={{ width: `${roomScore}%`, backgroundColor: roomColor }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-8 text-right" style={{ color: roomColor }}>
                    {roomScore.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warnings */}
      {allWarnings.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-stone-600 font-mono mb-3">Vastu Alerts</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allWarnings.map((item, idx) => {
              const isViolation = item.score < 60;
              return (
                <div 
                  key={idx}
                  data-testid={isViolation ? "vastu-violation" : "vastu-warning"}
                  className={`p-2 border text-xs ${
                    isViolation 
                      ? 'border-red-600 bg-red-50 text-red-900' 
                      : 'border-yellow-600 bg-yellow-50 text-yellow-900'
                  }`}
                >
                  <div className="font-semibold font-mono text-[10px] uppercase tracking-wider mb-1">
                    {item.room}
                  </div>
                  <div className="leading-relaxed">{item.warning}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allWarnings.length === 0 && (
        <div className="p-4 border border-green-600 bg-green-50">
          <div className="flex items-center gap-2 text-green-900">
            <CheckCircle size={20} weight="fill" />
            <span className="text-sm font-semibold">No Vastu violations detected!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VastuScorePanel;