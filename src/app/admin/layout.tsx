import AdminSidebar from '@/components/admin/AdminSidebar';

// El middleware en src/middleware.ts protege estas rutas automáticamente
// Si llegás acá, ya estás autenticado
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-60 p-6 pt-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
