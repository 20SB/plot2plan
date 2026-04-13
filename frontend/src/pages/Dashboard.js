import { useState, useCallback } from "react";
import PlotInputForm from "@/components/PlotInputForm";
import FloorPlanCanvas from "@/components/FloorPlanCanvas";
import VastuScorePanel from "@/components/VastuScorePanel";
import AICopilot from "@/components/AICopilot";
import CostEstimate from "@/components/CostEstimate";
import RevisionHistory from "@/components/RevisionHistory";
import CompareView from "@/components/CompareView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, ClockCounterClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfExport";

const Dashboard = () => {
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState("canvas");
  const [showRevisions, setShowRevisions] = useState(false);
  const [compareData, setCompareData] = useState(null);

  const handleProjectGenerated = (project) => {
    setCurrentProject(project);
    setActiveTab("canvas");
    setCompareData(null);
    toast.success("Floor plan generated successfully!");
  };

  const handleRoomsUpdated = useCallback((updatedRooms, newScore) => {
    if (currentProject) {
      setCurrentProject(prev => ({
        ...prev,
        rooms: updatedRooms,
        vastu_overall_score: newScore
      }));
    }
  }, [currentProject]);

  const handleRevisionRestore = (rooms, vastuScore) => {
    if (currentProject) {
      setCurrentProject(prev => ({
        ...prev,
        rooms,
        vastu_overall_score: vastuScore
      }));
    }
  };

  const handleCompare = (data) => {
    setCompareData(data);
    setActiveTab("compare");
  };

  const handleExportPDF = async () => {
    if (!currentProject) return;
    toast.info("Generating PDF...");
    try {
      await generatePDF(currentProject);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
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
                data-testid="toggle-revisions-button"
                variant="outline"
                onClick={() => setShowRevisions(!showRevisions)}
                className={`rounded-none ${showRevisions ? 'bg-stone-100 border-stone-900' : ''}`}
              >
                <ClockCounterClockwise size={18} className="mr-2" weight="regular" />
                Revisions
              </Button>
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
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-white border border-stone-200 rounded-none mb-4">
                  <TabsTrigger data-testid="canvas-tab" value="canvas" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Floor Plan</TabsTrigger>
                  <TabsTrigger data-testid="cost-tab" value="cost" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Cost Estimate</TabsTrigger>
                  {compareData && (
                    <TabsTrigger data-testid="compare-tab" value="compare" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Compare</TabsTrigger>
                  )}
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
                {compareData && (
                  <TabsContent value="compare" className="mt-0">
                    <CompareView data={compareData} onClose={() => { setCompareData(null); setActiveTab("canvas"); }} />
                  </TabsContent>
                )}
              </Tabs>

              {/* Revision History below canvas */}
              {showRevisions && (
                <div className="mt-4">
                  <RevisionHistory
                    projectId={currentProject.id}
                    onRestore={handleRevisionRestore}
                    onCompare={handleCompare}
                  />
                </div>
              )}
            </>
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