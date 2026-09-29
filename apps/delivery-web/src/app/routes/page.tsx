'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { MapPin, CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function RoutesPage() {
  const { logout } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/deliveries/today')
      .then(res => setDeliveries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string, status: 'DELIVERED' | 'FAILED', deliveredCans: number) => {
    try {
      await api.put(`/deliveries/${id}`, { status, deliveredCans });
      setDeliveries(deliveries.map(d => d.id === id ? { ...d, status, deliveredCans } : d));
    } catch (err) {
      alert('Failed to update delivery');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-10">
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Today's Route</h1>
          <button onClick={logout} className="p-2 bg-green-700 rounded-full hover:bg-green-800">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading route...</p>
        ) : (
          deliveries.map(delivery => (
            <div key={delivery.id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{delivery.customerName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  delivery.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                  delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {delivery.status}
                </span>
              </div>
              
              <div className="flex items-start text-gray-600 mb-4 text-sm">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-gray-400" />
                <p>{delivery.address}</p>
              </div>
              
              <div className="flex items-center justify-between mb-5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500">Cans to Deliver:</span>
                <span className="text-xl font-bold text-gray-900">{delivery.scheduledCans}</span>
              </div>

              {delivery.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleUpdate(delivery.id, 'FAILED', 0)}
                    className="flex justify-center items-center py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-bold hover:bg-red-50 active:bg-red-100"
                  >
                    <XCircle className="mr-2 h-5 w-5" /> Failed
                  </button>
                  <button 
                    onClick={() => handleUpdate(delivery.id, 'DELIVERED', delivery.scheduledCans)}
                    className="flex justify-center items-center py-3 bg-green-600 border-2 border-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 active:bg-green-800"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" /> Delivered
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
