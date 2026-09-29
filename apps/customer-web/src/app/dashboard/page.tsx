'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Droplet, Package, Calendar, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setProfile(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WaterCan</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {profile?.fullName}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Order Water Cans</dt>
                      <dd className="mt-1">
                        <Link href="/order" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                          Place a new order &rarr;
                        </Link>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">My Subscriptions</dt>
                      <dd className="mt-1">
                        <Link href="/subscriptions" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                          View details &rarr;
                        </Link>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
