'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [usuario, setUsuario]   = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass]   = useState(false);
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !password) { setError('Completá usuario y contraseña'); return; }
    setCargando(true);
    setError('');
    const result = await signIn('credentials', { username: usuario, password, redirect: false });
    if (result?.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Usuario o contraseña incorrectos');
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-tierra-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-melocoton-600">
            <Image src="/logo.jpg" alt="Melocotón Cerámica" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
          <div className="text-center">
            <p className="font-serif text-2xl text-white">Panel Admin</p>
            <p className="font-sans text-xs text-tierra-400 tracking-widest uppercase mt-1">Melocotón Cerámica</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          <div>
            <label className="form-label">Usuario</label>
            <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)}
                   className="form-input" placeholder="admin" autoComplete="username" autoFocus required />
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <div className="relative">
              <input type={verPass ? 'text' : 'password'} value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="form-input pr-10" placeholder="••••••••"
                     autoComplete="current-password" required />
              <button type="button" onClick={() => setVerPass(!verPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tierra-400 hover:text-tierra-600">
                {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <Lock className="w-3 h-3 flex-shrink-0" />{error}
            </div>
          )}
          <button type="submit" disabled={cargando} className="btn-primary w-full py-3 text-base">
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : 'Ingresar al panel'}
          </button>
        </form>
        <p className="text-center font-sans text-xs text-tierra-600 mt-4">Solo para uso interno</p>
      </div>
    </div>
  );
}
