import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClockCounterClockwise, ArrowCounterClockwise, GitDiff } from "@phosphor-icons/react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RevisionHistory = ({ projectId, onRestore, onCompare }) => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedRevisions, setSelectedRevisions] = useState([]);

  const fetchRevisions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects/${projectId}/revisions`);
      setRevisions(response.data);
    } catch (error) {
      console.error("Error fetching revisions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, [projectId]);

  // Refresh revisions when projectId stays the same but layout changes
  useEffect(() => {
    const interval = setInterval(fetchRevisions, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleRestore = async (revisionId) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/projects/${projectId}/revisions/${revisionId}/restore`
      );
      onRestore(response.data.rooms, response.data.vastu_overall_score);
      toast.success("Revision restored successfully");
      fetchRevisions();
    } catch (error) {
      console.error("Error restoring revision:", error);
      toast.error("Failed to restore revision");
    }
  };

  const toggleCompareSelection = (revisionId) => {
    setSelectedRevisions(prev => {
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId);
      }
      if (prev.length >= 2) {
        return [prev[1], revisionId];
      }
      return [...prev, revisionId];
    });
  };

  const handleCompare = async () => {
    if (selectedRevisions.length !== 2) return;
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/projects/${projectId}/revisions/compare/${selectedRevisions[0]}/${selectedRevisions[1]}`
      );
      onCompare(response.data);
      setCompareMode(false);
      setSelectedRevisions([]);
    } catch (error) {
      console.error("Error comparing revisions:", error);
      toast.error("Failed to compare revisions");
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-stone-500 font-mono">Loading revisions...</p>
      </div>
    );
  }

  return (
    <div className="border border-stone-200 bg-white">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={18} weight="regular" />
          <h4 className="text-sm font-semibold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Revisions
          </h4>
          <span className="text-xs font-mono text-stone-500">({revisions.length})</span>
        </div>
        <Button
          data-testid="toggle-compare-mode"
          variant="outline"
          size="sm"
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedRevisions([]);
          }}
          className={`rounded-none text-xs h-7 ${compareMode ? 'bg-blue-50 border-blue-600 text-blue-700' : ''}`}
        >
          <GitDiff size={14} className="mr-1" />
          Compare
        </Button>
      </div>

      {compareMode && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-800">
          Select 2 revisions to compare ({selectedRevisions.length}/2)
          {selectedRevisions.length === 2 && (
            <Button
              data-testid="run-compare-button"
              size="sm"
              onClick={handleCompare}
              className="ml-3 rounded-none h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Compare Now
            </Button>
          )}
        </div>
      )}

      <ScrollArea className="max-h-60">
        <div className="divide-y divide-stone-100">
          {revisions.map((rev, idx) => (
            <div
              key={rev.id}
              data-testid={`revision-item-${rev.version}`}
              className={`px-4 py-3 hover:bg-stone-50 transition-colors ${
                compareMode && selectedRevisions.includes(rev.id) ? 'bg-blue-50 border-l-2 border-blue-600' : ''
              }`}
              onClick={compareMode ? () => toggleCompareSelection(rev.id) : undefined}
              style={{ cursor: compareMode ? 'pointer' : 'default' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-stone-700">v{rev.version}</span>
                    <span className="text-xs text-stone-600">{rev.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono text-stone-400">
                      {formatTime(rev.created_at)}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold ${
                      rev.vastu_overall_score >= 85 ? 'text-green-600' :
                      rev.vastu_overall_score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {rev.vastu_overall_score.toFixed(0)}/100
                    </span>
                  </div>
                </div>
                {!compareMode && idx > 0 && (
                  <Button
                    data-testid={`restore-revision-${rev.version}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(rev.id)}
                    className="rounded-none h-7 text-xs"
                  >
                    <ArrowCounterClockwise size={12} className="mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
          {revisions.length === 0 && (
            <div className="p-4 text-center text-xs text-stone-400">No revisions yet</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RevisionHistory;
