'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { Package, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrderPage() {
  const router = useRouter();
  const [cansPerDay, setCansPerDay] = useState(1);
  const [durationDays, setDurationDays] = useState(1);
  const [planType, setPlanType] = useState('ONE_TIME');
  const [startDate, setStartDate] = useState('');
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch live quote from Backend whenever inputs change
  useEffect(() => {
    const fetchQuote = async () => {
      if (cansPerDay > 0 && durationDays > 0) {
        try {
          const res = await api.post('/orders/quote', { cansPerDay, durationDays });
          setQuote(res.data);
          setError('');
        } catch (err) {
          setError('Failed to calculate pricing.');
        }
      }
    };
    
    const timeoutId = setTimeout(fetchQuote, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [cansPerDay, durationDays]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        planType,
        cansPerDay,
        durationDays,
        startDate,
        addressId: 'ADDR_123', // In a real app, this is selected from a dropdown of the user's addresses
      });
      
      const paymentRes = await api.post(`/payments/initiate/${orderRes.data.id}`);
      
      // Load Razorpay Checkout Script...
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Razorpay Key ID
        amount: paymentRes.data.amount,
        currency: "INR",
        name: "WaterCan Delivery",
        description: `Order ${orderRes.data.id}`,
        order_id: paymentRes.data.id,
        handler: async function (response: any) {
          alert('Payment Successful!');
          router.push('/dashboard');
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: { color: "#2563EB" }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
          <Package className="mr-3 text-blue-600" /> Place a New Order
        </h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Configuration Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Type</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="ONE_TIME">One Time Delivery (1-6 days)</option>
                  <option value="WEEKLY">Weekly Subscription</option>
                  <option value="MONTHLY">Monthly Subscription</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cans per Day</label>
                <input
                  type="number"
                  min="1"
                  value={cansPerDay}
                  onChange={(e) => setCansPerDay(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Live Pricing Quote */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg leading-6 font-medium text-blue-900 mb-4">Order Summary</h3>
              
              {quote ? (
                <dl className="space-y-3 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <dt>Total Cans ({quote.cansPerDay} x {quote.durationDays} days)</dt>
                    <dd className="font-semibold">{quote.totalCans}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Price per Can</dt>
                    <dd>₹{quote.canPrice}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Water Charge</dt>
                    <dd>₹{quote.waterCharge}</dd>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-3">
                    <dt>Delivery Fee (Flat)</dt>
                    <dd>₹{quote.deliveryFee}</dd>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                    <dt>Grand Total</dt>
                    <dd>₹{quote.grandTotal}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-gray-500">Calculating...</p>
              )}
              
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !startDate}
                className="mt-8 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" /> Proceed to Payment
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
