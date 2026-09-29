'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { IndianRupee, Save } from 'lucide-react';

export default function PricingConfigPage() {
  const [canPrice, setCanPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/pricing/current')
      .then(res => {
        setCanPrice(res.data.canPrice);
        setDeliveryFee(res.data.deliveryFee);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.post('/pricing', { canPrice, deliveryFee });
      setMessage('Pricing updated successfully! Snapshot saved.');
    } catch (err) {
      setMessage('Error updating pricing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading configuration...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <IndianRupee className="mr-2 text-red-600" /> Pricing Engine Configuration
      </h1>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Global Pricing Constants
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 mb-5">
            <p>
              Updating these values will immediately affect all new quotes. Existing orders are protected by their database snapshots.
            </p>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Price per Water Can (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={canPrice}
                onChange={(e) => setCanPrice(parseFloat(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Flat Delivery Fee per Cycle (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
