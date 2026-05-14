import { Producto } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  productos: Producto[];
  columnas?: 2 | 3 | 4;
  emptyMessage?: string;
}

export default function ProductGrid({ productos, columnas = 3, emptyMessage = 'No hay productos disponibles.' }: Props) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columnas];

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🏺</span>
        <p className="font-serif text-xl text-tierra-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-6 md:gap-8`}>
      {productos.map(p => <ProductCard key={p.id} producto={p} />)}
    </div>
  );
}
