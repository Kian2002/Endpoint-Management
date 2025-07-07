'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import EndpointDashboard from '../components/EndpointDashboard';
import UserProfile from '../components/UserProfile';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [status, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <Navbar currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Sidebar */}
            <div className="lg:col-span-1">
              <UserProfile />
            </div>
            
            {/* Main Dashboard Content */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Endpoint Dashboard
                  </h1>
                  <EndpointDashboard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 