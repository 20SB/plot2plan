import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PlotInputForm from "@/components/PlotInputForm";
import FloorPlanCanvas from "@/components/FloorPlanCanvas";
import FloorSelector from "@/components/FloorSelector";
import VastuScorePanel from "@/components/VastuScorePanel";
import AICopilot from "@/components/AICopilot";
import CostEstimate from "@/components/CostEstimate";
import RevisionHistory from "@/components/RevisionHistory";
import CompareView from "@/components/CompareView";
import ProjectList from "@/components/ProjectList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { FileText, Download, ClockCounterClockwise, FolderOpen, SignOut, User, FileDxf, Printer, CaretDown } from "@phosphor-icons/react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfExport";
import { generateDXF, generatePrintA3 } from "@/utils/dxfExport";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState("canvas");
  const [showRevisions, setShowRevisions] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [activeLayers, setActiveLayers] = useState({ architecture: true, plumbing: false, electrical: false });
  const [currentFloor, setCurrentFloor] = useState(1);

  const handleProjectGenerated = (project) => {
    setCurrentProject(project);
    setActiveTab("canvas");
    setCompareData(null);
    setShowProjects(false);
    setCurrentFloor(1);
    toast.success("Floor plan generated successfully!");
  };

  const handleRoomsUpdated = useCallback((updatedRooms, newScore, plumbing, electrical) => {
    setCurrentProject(prev => prev ? {
      ...prev,
      rooms: updatedRooms,
      vastu_overall_score: newScore,
      ...(plumbing && { plumbing }),
      ...(electrical && { electrical }),
    } : null);
  }, []);

  const handlePlumbingUpdated = (plumbing) => {
    setCurrentProject(prev => prev ? { ...prev, plumbing } : null);
  };

  const handleElectricalUpdated = (electrical) => {
    setCurrentProject(prev => prev ? { ...prev, electrical } : null);
  };

  const handleRevisionRestore = (rooms, vastuScore) => {
    setCurrentProject(prev => prev ? { ...prev, rooms, vastu_overall_score: vastuScore } : null);
  };

  const handleCompare = (data) => {
    setCompareData(data);
    setActiveTab("compare");
  };

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleExportPDF = async () => {
    if (!currentProject) return;
    toast.info("Generating PDF...");
    try {
      await generatePDF(currentProject);
      toast.success("PDF exported!");
    } catch (e) {
      toast.error("PDF export failed");
    }
  };

  const handleExportDXF = () => {
    if (!currentProject) return;
    toast.info("Generating DXF...");
    try {
      generateDXF(currentProject);
      toast.success("DXF exported for AutoCAD!");
    } catch (e) {
      toast.error("DXF export failed");
    }
  };

  const handlePrintA3 = () => {
    if (!currentProject) return;
    generatePrintA3(currentProject);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Vastu Blueprint</h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">AI Architecture</p>
            </div>
            {currentProject && (
              <div className="hidden md:flex items-center gap-1 text-xs font-mono text-stone-600 border-l border-stone-200 pl-6">
                <span>{currentProject.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentProject && (
              <>
                {/* Layer Toggles */}
                <div className="hidden md:flex items-center gap-1 mr-2 border border-stone-200 p-1">
                  <button
                    data-testid="toggle-layer-architecture"
                    onClick={() => toggleLayer('architecture')}
                    className={`text-[10px] font-mono px-2 py-1 transition-colors ${activeLayers.architecture ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  >ARCH</button>
                  <button
                    data-testid="toggle-layer-plumbing"
                    onClick={() => toggleLayer('plumbing')}
                    className={`text-[10px] font-mono px-2 py-1 transition-colors ${activeLayers.plumbing ? 'bg-blue-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  >PLMB</button>
                  <button
                    data-testid="toggle-layer-electrical"
                    onClick={() => toggleLayer('electrical')}
                    className={`text-[10px] font-mono px-2 py-1 transition-colors ${activeLayers.electrical ? 'bg-red-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  >ELEC</button>
                </div>

                <Button
                  data-testid="toggle-projects-button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowProjects(!showProjects); setShowRevisions(false); }}
                  className="rounded-none text-xs h-8"
                >
                  <FolderOpen size={14} className="mr-1" />Projects
                </Button>

                <Button
                  data-testid="toggle-revisions-button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowRevisions(!showRevisions); setShowProjects(false); }}
                  className={`rounded-none text-xs h-8 ${showRevisions ? 'bg-stone-100 border-stone-900' : ''}`}
                >
                  <ClockCounterClockwise size={14} className="mr-1" />Revisions
                </Button>

                {/* Export Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button data-testid="export-menu-button" className="bg-stone-900 hover:bg-stone-800 text-white rounded-none text-xs h-8">
                      <Download size={14} className="mr-1" />Export
                      <CaretDown size={12} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-none" align="end">
                    <DropdownMenuItem data-testid="export-pdf-button" onClick={handleExportPDF} className="text-xs font-mono cursor-pointer">
                      PDF Blueprint
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="export-dxf-button" onClick={handleExportDXF} className="text-xs font-mono cursor-pointer">
                      DXF (AutoCAD)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="print-a3-button" onClick={handlePrintA3} className="text-xs font-mono cursor-pointer">
                      Print A3 Sheet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!currentProject && (
              <Button
                data-testid="open-projects-button"
                variant="outline"
                size="sm"
                onClick={() => setShowProjects(!showProjects)}
                className="rounded-none text-xs h-8"
              >
                <FolderOpen size={14} className="mr-1" />My Projects
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-testid="user-menu-button" variant="outline" size="sm" className="rounded-none text-xs h-8 ml-1">
                  <User size={14} className="mr-1" />{user?.name?.split(' ')[0] || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none" align="end">
                <div className="px-3 py-2 text-xs">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-stone-500 font-mono">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="logout-button" onClick={logout} className="text-xs cursor-pointer text-red-600">
                  <SignOut size={14} className="mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left Sidebar */}
        <div className="md:col-span-3 bg-white border-r border-stone-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <PlotInputForm onProjectGenerated={handleProjectGenerated} />
        </div>

        {/* Center Canvas */}
        <div className="md:col-span-6 bg-stone-50 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {showProjects && (
            <div className="mb-4">
              <ProjectList onProjectLoaded={handleProjectGenerated} onClose={() => setShowProjects(false)} />
            </div>
          )}

          {!currentProject && !showProjects ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={64} className="mx-auto text-stone-300 mb-4" weight="light" />
                <p className="text-stone-500 text-lg">Enter plot details to generate your Vastu-compliant floor plan</p>
                <Button
                  data-testid="browse-projects-empty"
                  variant="outline"
                  className="mt-4 rounded-none"
                  onClick={() => setShowProjects(true)}
                >
                  <FolderOpen size={16} className="mr-2" />Browse Saved Projects
                </Button>
              </div>
            </div>
          ) : currentProject && (
            <>
              {/* Floor Selector */}
              {currentProject.num_floors > 1 && (
                <FloorSelector
                  project={currentProject}
                  currentFloor={currentFloor}
                  onFloorChange={setCurrentFloor}
                />
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-white border border-stone-200 rounded-none mb-4">
                  <TabsTrigger data-testid="canvas-tab" value="canvas" className="rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Floor Plan</TabsTrigger>
                  <TabsTrigger data-testid="cost-tab" value="cost" className="rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Cost Estimate</TabsTrigger>
                  {compareData && (
                    <TabsTrigger data-testid="compare-tab" value="compare" className="rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-stone-900">Compare</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="canvas" className="mt-0">
                  <FloorPlanCanvas
                    project={currentProject}
                    onRoomsUpdated={handleRoomsUpdated}
                    activeLayers={activeLayers}
                    onPlumbingUpdated={handlePlumbingUpdated}
                    onElectricalUpdated={handleElectricalUpdated}
                    currentFloor={currentFloor}
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

              {showRevisions && (
                <div className="mt-4">
                  <RevisionHistory projectId={currentProject.id} onRestore={handleRevisionRestore} onCompare={handleCompare} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-3 bg-white border-l border-stone-200 flex flex-col" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {currentProject ? (
            <>
              <div className="border-b border-stone-200 overflow-y-auto" style={{ maxHeight: '50%' }}>
                <VastuScorePanel project={currentProject} />
              </div>
              <div className="flex-1 overflow-hidden">
                <AICopilot projectId={currentProject.id} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <p className="text-stone-400 text-sm">Vastu insights and AI assistance will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
