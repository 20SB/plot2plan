import { useState } from "react";
import PlotInputForm from "@/components/PlotInputForm";
import FloorPlanCanvas from "@/components/FloorPlanCanvas";
import VastuScorePanel from "@/components/VastuScorePanel";
import AICopilot from "@/components/AICopilot";
import CostEstimate from "@/components/CostEstimate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "@phosphor-icons/react";
import { toast } from "sonner";

const Dashboard = () => {
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState("canvas");

  const handleProjectGenerated = (project) => {
    setCurrentProject(project);
    setActiveTab("canvas");
    toast.success("Floor plan generated successfully!");
  };

  const handleRoomsUpdated = (updatedRooms, newScore) => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        rooms: updatedRooms,
        vastu_overall_score: newScore
      });
    }
  };

  const handleExportPDF = () => {
    toast.info("PDF export will be implemented with proper rendering library");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter" style={{fontFamily: 'Cabinet Grotesk, sans-serif'}}>Vastu Blueprint</h1>
            <p className="text-sm text-stone-600 mt-1">AI-Powered Vastu-Compliant House Plans</p>
          </div>
          {currentProject && (
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">Project</p>
                <p className="text-sm font-medium">{currentProject.name}</p>
              </div>
              <Button
                data-testid="export-pdf-button"
                onClick={handleExportPDF}
                className="bg-stone-900 hover:bg-stone-800 text-white rounded-none"
              >
                <Download size={18} className="mr-2" weight="regular" />
                Export PDF
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left Sidebar - Input Form */}
        <div className="md:col-span-3 bg-white border-r border-stone-200 overflow-y-auto" style={{maxHeight: 'calc(100vh - 80px)'}}>
          <PlotInputForm onProjectGenerated={handleProjectGenerated} />
        </div>

        {/* Center Canvas */}
        <div className="md:col-span-6 bg-stone-50 p-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 80px)'}}>
          {!currentProject ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={64} className="mx-auto text-stone-300 mb-4" weight="light" />
                <p className="text-stone-500 text-lg">Enter plot details to generate your Vastu-compliant floor plan</p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-white border border-stone-200 rounded-none mb-4">
                <TabsTrigger data-testid="canvas-tab" value="canvas" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Floor Plan</TabsTrigger>
                <TabsTrigger data-testid="cost-tab" value="cost" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Cost Estimate</TabsTrigger>
              </TabsList>
              <TabsContent value="canvas" className="mt-0">
                <FloorPlanCanvas 
                  project={currentProject} 
                  onRoomsUpdated={handleRoomsUpdated}
                />
              </TabsContent>
              <TabsContent value="cost" className="mt-0">
                <CostEstimate projectId={currentProject.id} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Right Sidebar - Vastu Score & AI Copilot */}
        <div className="md:col-span-3 bg-white border-l border-stone-200 flex flex-col" style={{maxHeight: 'calc(100vh - 80px)'}}>
          {currentProject ? (
            <>
              <div className="border-b border-stone-200">
                <VastuScorePanel project={currentProject} />
              </div>
              <div className="flex-1 overflow-hidden">
                <AICopilot projectId={currentProject.id} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <p className="text-stone-400">Vastu insights and AI assistance will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;