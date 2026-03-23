'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  href="/dashboard"
                  className="flex items-center px-2 text-xl font-bold text-primary-600"
                >
                  🏠 House Design
                </Link>
                
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/projects/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    New Project
                  </Link>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
