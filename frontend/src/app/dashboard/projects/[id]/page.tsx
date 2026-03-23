'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await projectsApi.getById(params.id as string);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setDeleting(true);
    try {
      await projectsApi.delete(params.id as string);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Project not found</h3>
        <Link href="/dashboard" className="btn btn-primary inline-block mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plot Details */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Plot Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Dimensions</p>
                <p className="font-semibold">
                  {project.plotDetails.length} × {project.plotDetails.width} feet
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="font-semibold">{project.plotDetails.area} sq ft</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Facing Direction</p>
                <p className="font-semibold">{project.plotDetails.facingDirection}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shape</p>
                <p className="font-semibold capitalize">{project.plotDetails.shape}</p>
              </div>
            </div>
          </div>

          {/* Room Requirements */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Room Requirements</h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(project.roomRequirements).map(([key, value]) => {
                if (value === 0 || key === 'others') return null;
                return (
                  <div key={key}>
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="font-semibold">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design Preferences */}
          {project.designPreferences && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Design Preferences</h2>
              <div className="space-y-3">
                {project.designPreferences.floorCount && (
                  <div>
                    <p className="text-sm text-gray-600">Number of Floors</p>
                    <p className="font-semibold">{project.designPreferences.floorCount}</p>
                  </div>
                )}
                
                {project.designPreferences.vastuCompliant && (
                  <div>
                    <p className="text-sm text-gray-600">Vastu Compliant</p>
                    <p className="font-semibold">Yes</p>
                  </div>
                )}
                
                {(project.designPreferences.budgetMin || project.designPreferences.budgetMax) && (
                  <div>
                    <p className="text-sm text-gray-600">Budget Range</p>
                    <p className="font-semibold">
                      ₹{project.designPreferences.budgetMin || 0}L - ₹{project.designPreferences.budgetMax || 0}L
                    </p>
                  </div>
                )}
                
                {project.designPreferences.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Additional Notes</p>
                    <p className="text-gray-800">{project.designPreferences.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generated Outputs - Coming in Phase 2 */}
          {project.status === 'completed' && project.generatedOutputs && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Generated Designs</h2>
              <div className="text-center py-8">
                <p className="text-gray-600">Design outputs will appear here once generated</p>
                <p className="text-sm text-gray-500 mt-2">(Coming in Phase 2)</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              {project.status === 'draft' && (
                <button className="w-full btn btn-primary">
                  Generate Design
                </button>
              )}
              
              <button className="w-full btn btn-secondary">
                Edit Details
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full btn bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>

          {/* Project Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Project Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {new Date(project.updatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Project ID</p>
                <p className="font-mono text-xs break-all">{project._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
