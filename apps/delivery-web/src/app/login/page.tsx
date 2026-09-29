'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Truck } from 'lucide-react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function DeliveryLoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto flex flex-col items-center mb-8">
        <div className="bg-green-600 p-4 rounded-full shadow-lg">
          <Truck className="h-10 w-10 text-white" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-green-900">
          Agent Login
        </h2>
      </div>

      <div className="max-w-md w-full mx-auto bg-white py-8 px-6 shadow-xl rounded-2xl">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-lg"
              placeholder="agent@watercan.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
