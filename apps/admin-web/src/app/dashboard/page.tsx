'use client';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(console.error);
  }, []);

  const stats = [
    { name: 'Total Active Orders', stat: orders.length, icon: Package, color: 'text-blue-500' },
    { name: 'Deliveries Today', stat: '450', icon: CheckCircle, color: 'text-green-500' }, // Would come from a dedicated stats endpoint
    { name: 'Pending Deliveries', stat: '12', icon: Clock, color: 'text-yellow-500' },
    { name: 'Failed Deliveries', stat: '3', icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Operations Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{item.stat}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-600 truncate">
                    Order #{order.id.slice(0, 8)} ({order.customerProfile?.fullName})
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Plan: {order.planType} | {order.cansPerDay} Cans/Day
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Total: ₹{order.grandTotal}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
