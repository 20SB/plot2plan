import { ArrowUp, ArrowDown, Minus, ArrowsLeftRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const CompareView = ({ data, onClose }) => {
  if (!data) return null;

  const { revision_a, revision_b, score_diff, room_changes } = data;

  const getScoreColor = (score) => {
    if (score >= 85) return "#059669";
    if (score >= 70) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <div className="bg-white border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowsLeftRight size={20} weight="regular" />
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Layout Comparison
          </h3>
        </div>
        <Button
          data-testid="close-compare-view"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="rounded-none text-xs"
        >
          Close
        </Button>
      </div>

      {/* Score Comparison Header */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-stone-200 p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-2">
            v{revision_a.version} - {revision_a.label}
          </p>
          <p className="text-3xl font-mono font-semibold" style={{ color: getScoreColor(revision_a.vastu_overall_score) }}>
            {revision_a.vastu_overall_score.toFixed(0)}
          </p>
        </div>

        <div className="border border-stone-900 p-4 text-center bg-stone-50 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-2">Difference</p>
          <div className="flex items-center justify-center gap-1">
            {score_diff > 0 ? (
              <ArrowUp size={20} weight="bold" className="text-green-600" />
            ) : score_diff < 0 ? (
              <ArrowDown size={20} weight="bold" className="text-red-600" />
            ) : (
              <Minus size={20} weight="bold" className="text-stone-500" />
            )}
            <p className={`text-2xl font-mono font-semibold ${
              score_diff > 0 ? 'text-green-600' : score_diff < 0 ? 'text-red-600' : 'text-stone-500'
            }`}>
              {score_diff > 0 ? '+' : ''}{score_diff.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="border border-stone-200 p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-2">
            v{revision_b.version} - {revision_b.label}
          </p>
          <p className="text-3xl font-mono font-semibold" style={{ color: getScoreColor(revision_b.vastu_overall_score) }}>
            {revision_b.vastu_overall_score.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Room-level Changes */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-600 font-mono mb-3">Room Changes</h4>
        <div className="space-y-2">
          {room_changes.map((change, idx) => (
            <div
              key={idx}
              data-testid={`compare-room-${change.name}`}
              className={`p-3 border text-sm flex items-center justify-between ${
                change.added ? 'border-green-300 bg-green-50' :
                change.removed ? 'border-red-300 bg-red-50' :
                change.score_change > 0 ? 'border-green-200 bg-green-50' :
                change.score_change < 0 ? 'border-red-200 bg-red-50' :
                'border-stone-200 bg-stone-50'
              }`}
            >
              <div>
                <span className="font-medium">{change.name}</span>
                <div className="flex items-center gap-3 mt-1 text-xs text-stone-600">
                  {change.moved && <span className="font-mono">Repositioned</span>}
                  {change.resized && <span className="font-mono">Resized</span>}
                  {change.added && <span className="font-mono text-green-700">Added</span>}
                  {change.removed && <span className="font-mono text-red-700">Removed</span>}
                </div>
              </div>
              {change.score_change !== undefined && !change.added && !change.removed && (
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-stone-500">{change.old_score?.toFixed(0)}</span>
                    <span className="text-stone-400">&rarr;</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: getScoreColor(change.new_score) }}>
                      {change.new_score?.toFixed(0)}
                    </span>
                  </div>
                  {change.score_change !== 0 && (
                    <span className={`text-[10px] font-mono ${
                      change.score_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change.score_change > 0 ? '+' : ''}{change.score_change.toFixed(0)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareView;
