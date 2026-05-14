'use client';

import { useRouter, usePathname } from 'next/navigation';
import { CATEGORIAS } from '../../../data/productos';
import { cn } from '@/lib/utils';
import { Search, X, Tag } from 'lucide-react';
import { useState, useTransition } from 'react';

interface Props {
  categoriaActiva?: string;
  ordenActivo?: string;
  busquedaActiva?: string;
  promoActiva?: boolean;
}

export default function CatalogoFiltros({
  categoriaActiva,
  ordenActivo,
  busquedaActiva,
  promoActiva,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(busquedaActiva || '');

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    value ? params.set(key, value) : params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function togglePromo() {
    const params = new URLSearchParams(window.location.search);
    if (promoActiva) {
      params.delete('promo');
    } else {
      params.set('promo', 'true');
      params.delete('categoria'); // limpiar categoría al ver promos
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function limpiar() {
    setBusqueda('');
    startTransition(() => router.push(pathname));
  }

  const hayFiltros = categoriaActiva || ordenActivo || busquedaActiva || promoActiva;

  return (
    <div className="space-y-6">

      {/* Toggle de promociones */}
      <button
        onClick={togglePromo}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-sans font-medium transition-all',
          promoActiva
            ? 'bg-melocoton-400 text-white border-melocoton-400 shadow-md'
            : 'bg-white text-tierra-700 border-melocoton-200 hover:border-melocoton-300'
        )}
      >
        <Tag className="w-4 h-4" />
        {promoActiva ? '✓ Solo ofertas activo' : 'Ver solo ofertas'}
      </button>

      {/* Búsqueda */}
      <div>
        <p className="font-sans text-xs font-semibold text-tierra-600 uppercase tracking-widest mb-3">Buscar</p>
        <form
          onSubmit={e => { e.preventDefault(); setParam('busqueda', busqueda); }}
          className="relative"
        >
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Taza, bowl..."
            className="form-input pr-10 text-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-tierra-400 hover:text-melocoton-500">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Categorías */}
      <div>
        <p className="font-sans text-xs font-semibold text-tierra-600 uppercase tracking-widest mb-3">Categoría</p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam('categoria', '')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm font-sans transition-colors',
                !categoriaActiva && !promoActiva
                  ? 'bg-melocoton-100 text-melocoton-700 font-medium'
                  : 'text-tierra-600 hover:bg-melocoton-50'
              )}
            >
              Todas las piezas
            </button>
          </li>
          {CATEGORIAS.map(cat => (
            <li key={cat.id}>
              <button
                onClick={() => setParam('categoria', cat.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-sans transition-colors flex items-center gap-2',
                  categoriaActiva === cat.id
                    ? 'bg-melocoton-100 text-melocoton-700 font-medium'
                    : 'text-tierra-600 hover:bg-melocoton-50'
                )}
              >
                <span>{cat.emoji}</span>{cat.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Ordenar */}
      <div>
        <p className="font-sans text-xs font-semibold text-tierra-600 uppercase tracking-widest mb-3">Ordenar por</p>
        <select
          value={ordenActivo || ''}
          onChange={e => setParam('orden', e.target.value)}
          className="form-input text-sm"
        >
          <option value="">Relevancia</option>
          <option value="destacados">Destacados primero</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
          <option value="descuento">Mayor descuento</option>
        </select>
      </div>

      {/* Limpiar */}
      {hayFiltros && (
        <button
          onClick={limpiar}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 font-sans transition-colors"
        >
          <X className="w-3 h-3" /> Limpiar filtros
        </button>
      )}
    </div>
  );
}
