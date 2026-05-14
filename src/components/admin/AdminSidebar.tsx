'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Package, ShoppingBag, Home, LogOut, LayoutDashboard, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/productos',  label: 'Productos',   icon: Package },
  { href: '/admin/pedidos',    label: 'Pedidos',     icon: ShoppingBag },
  { href: '/admin/promociones',label: 'Promociones', icon: Tag },
  { href: '/',                 label: 'Ver sitio ↗', icon: Home },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-tierra-900 text-white z-30 hidden md:flex flex-col">
      <div className="p-5 border-b border-tierra-700">
        <p className="font-serif text-xl text-white">Melocotón</p>
        <p className="font-sans text-xs text-tierra-400 tracking-widest uppercase mt-0.5">Panel Admin</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === href : pathname.startsWith(href) && href !== '/';
          return (
            <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors',
                    active ? 'bg-melocoton-500 text-white' : 'text-tierra-300 hover:bg-tierra-800 hover:text-white'
                  )}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-tierra-700">
        <button
          onClick={() => signOut({ callbackUrl: '/admin-login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans text-tierra-300 hover:bg-red-900/30 hover:text-red-300 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
