import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Trash, FolderOpen } from "@phosphor-icons/react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProjectList = ({ onProjectLoaded, onClose }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/projects`, { withCredentials: true });
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const loadProject = async (projectId) => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/projects/${projectId}`, { withCredentials: true });
      onProjectLoaded(data);
      toast.success("Project loaded");
    } catch (error) {
      toast.error("Failed to load project");
    }
  };

  const deleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/projects/${projectId}`, { withCredentials: true });
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const getScoreColor = (score) => score >= 85 ? "text-green-600" : score >= 70 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="border border-stone-200 bg-white">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} weight="regular" />
          <h4 className="text-sm font-semibold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Saved Projects
          </h4>
          <span className="text-xs font-mono text-stone-500">({projects.length})</span>
        </div>
        <Button variant="outline" size="sm" onClick={onClose} className="rounded-none text-xs h-7">
          Close
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-stone-500 font-mono">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center text-sm text-stone-400">No saved projects yet</div>
      ) : (
        <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              data-testid={`project-item-${project.id}`}
              className="px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between"
              onClick={() => loadProject(project.id)}
            >
              <div>
                <p className="text-sm font-medium">{project.name}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-stone-500">
                  <span>{project.plot_length}' x {project.plot_width}'</span>
                  <span>{project.facing_direction?.toUpperCase()}</span>
                  <span className={`font-semibold ${getScoreColor(project.vastu_overall_score)}`}>
                    {project.vastu_overall_score?.toFixed(0)}/100
                  </span>
                </div>
              </div>
              <Button
                data-testid={`delete-project-${project.id}`}
                variant="ghost"
                size="sm"
                onClick={(e) => deleteProject(project.id, e)}
                className="h-7 w-7 p-0 text-stone-400 hover:text-red-600"
              >
                <Trash size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
