'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Droplet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  customerType: z.enum(['HOME', 'ORGANIZATION', 'INDUSTRY']),
  organizationName: z.string().optional(),
  gstin: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const [customerType, setCustomerType] = useState('HOME');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerType: 'HOME' }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister(data);
    } catch (error) {
      console.error('Registration failed', error);
      alert('Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Droplet className="h-12 w-12 text-blue-600 mb-2" />
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                {...register('customerType')}
                onChange={(e) => setCustomerType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="HOME">Home</option>
                <option value="ORGANIZATION">Organization</option>
                <option value="INDUSTRY">Industry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                {...register('fullName')}
                type="text"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            {customerType !== 'HOME' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <input
                    {...register('organizationName')}
                    type="text"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                  <input
                    {...register('gstin')}
                    type="text"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                {...register('mobile')}
                type="tel"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
