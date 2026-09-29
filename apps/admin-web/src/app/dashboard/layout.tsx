import AdminNav from '@/components/layout/AdminNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav />
      <div className="flex-1 ml-64 p-8">
        {children}
      </div>
    </div>
  );
}
