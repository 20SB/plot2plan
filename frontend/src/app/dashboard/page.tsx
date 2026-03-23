'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll(1, 10);
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
          </div>
          
          <div className="card">
            <p className="text-sm text-gray-600">Draft</p>
            <p className="text-3xl font-bold text-gray-600">{stats?.byStatus?.draft || 0}</p>
          </div>
          
          <div className="card">
            <p className="text-sm text-gray-600">Processing</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.byStatus?.processing || 0}</p>
          </div>
          
          <div className="card">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats?.byStatus?.completed || 0}</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
        <Link
          href="/dashboard/projects/new"
          className="btn btn-primary"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first project to get started with AI-powered house design
          </p>
          <Link
            href="/dashboard/projects/new"
            className="btn btn-primary inline-block"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="card hover:shadow-lg transition-shadow"
            >
              <Link href={`/dashboard/projects/${project._id}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
              </Link>
              
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  📐 Plot: {project.plotDetails.length} x {project.plotDetails.width} ft
                  ({project.plotDetails.area} sq ft)
                </p>
                <p>
                  🛏️ {project.roomRequirements.bedrooms} BHK
                </p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Floor Plan Button */}
              <Link
                href={`/projects/${project._id}/floor-plan`}
                className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🎨 Generate Floor Plan
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
