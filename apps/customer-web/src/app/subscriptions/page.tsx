'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { Calendar, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/subscriptions')
      .then(res => setSubscriptions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <Calendar className="mr-3 text-blue-600" /> My Subscriptions
          </h1>
          <Link href="/order" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm shadow">
            New Subscription
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading subscriptions...</p>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">You have no active subscriptions.</p>
            <Link href="/order" className="text-blue-600 hover:text-blue-500 font-medium">
              Start one today &rarr;
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <li key={sub.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {sub.planType} Plan - {sub.cansPerDay} Cans/Day
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sub.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex flex-col">
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          Started: {new Date(sub.startDate).toLocaleDateString()}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          Next Billing: {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 flex-col sm:items-end">
                        <p className="font-bold text-gray-900 mb-2">₹{sub.grandTotal} / cycle</p>
                        <div className="space-x-3">
                          <button className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                            <RefreshCw className="h-4 w-4 mr-1" /> Update Payment
                          </button>
                          <button className="text-red-600 hover:text-red-900 inline-flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
