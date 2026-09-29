'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, IndianRupee, LogOut, Package } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/orders', label: 'Orders', icon: Package },
    { href: '/dashboard/pricing', label: 'Pricing Config', icon: IndianRupee },
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 flex flex-col text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-red-500 flex items-center">
          WaterCan <span className="text-white ml-2 text-sm">Admin</span>
        </h2>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
              <Icon className="mr-3 h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
