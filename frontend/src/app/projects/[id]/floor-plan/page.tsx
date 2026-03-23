'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import FloorPlanInputForm from '@/components/floor-plan/FloorPlanInputForm';
import FloorPlanCanvas from '@/components/floor-plan/FloorPlanCanvas';
import { floorPlanApi, projectsApi } from '@/lib/api';
import { FloorPlanGenerateRequest, FloorPlanResponse } from '@/types/floor-plan';

export default function FloorPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [floorPlan, setFloorPlan] = useState<FloorPlanResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch project details and existing floor plan on mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectsApi.getById(resolvedParams.id);
        setProjectName(response.data.name);

        // Try to load existing floor plan
        try {
          const floorPlanResponse = await floorPlanApi.get(resolvedParams.id);
          setFloorPlan(floorPlanResponse.data);
        } catch (err) {
          // No floor plan exists yet - that's okay
          console.log('No existing floor plan');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project');
      }
    };

    fetchProject();
  }, [resolvedParams.id]);

  const handleGenerate = async (data: FloorPlanGenerateRequest) => {
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await floorPlanApi.generate(data);
      setFloorPlan(response.data);
      setSuccess('Floor plan generated successfully!');
      
      // Scroll to canvas
      setTimeout(() => {
        document.getElementById('floor-plan-canvas')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate floor plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!floorPlan) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await floorPlanApi.save(resolvedParams.id, floorPlan);
      setSuccess('Floor plan saved to project!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save floor plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!floorPlan) return;

    try {
      // Dynamic import to avoid SSR issues
      const { exportFloorPlanToPDF } = await import('@/lib/export/floor-plan-export');
      await exportFloorPlanToPDF(floorPlan, projectName || 'floor-plan');
      setSuccess('Floor plan exported to PDF!');
    } catch (err: any) {
      setError('Failed to export PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Floor Plan Generator
          </h1>
          {projectName && (
            <p className="text-gray-600 mt-2">
              Project: <strong>{projectName}</strong>
            </p>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
            ✅ {success}
          </div>
        )}

        {/* Input Form */}
        <div className="mb-8">
          <FloorPlanInputForm
            projectId={resolvedParams.id}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Generated Floor Plan */}
        {floorPlan && (
          <div id="floor-plan-canvas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Generated Floor Plan
              </h2>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isSaving ? '💾 Saving...' : '💾 Save'}
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>

            <FloorPlanCanvas
              floorPlan={floorPlan}
              showGrid={true}
              showDimensions={true}
            />

            {/* Metadata */}
            <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700">
              <strong>Generated:</strong> {new Date(floorPlan.metadata.generatedAt).toLocaleString()} | 
              <strong className="ml-4">Algorithm:</strong> {floorPlan.metadata.algorithm} | 
              <strong className="ml-4">Processing Time:</strong> {floorPlan.metadata.processingTime}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
