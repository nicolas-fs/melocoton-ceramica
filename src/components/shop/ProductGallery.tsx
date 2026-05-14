'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ imagenes, titulo }: { imagenes: string[]; titulo: string }) {
  const [idx, setIdx] = useState(0);
  const imgs = imagenes.length > 0 ? imagenes : ['https://placehold.co/800x800/faecd8/b07040?text=🏺'];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-crema-100 group">
        <Image src={imgs[idx]} alt={`${titulo} ${idx + 1}`} fill className="object-cover transition-opacity duration-300" priority sizes="(max-width: 768px) 100vw, 50vw" />
        {imgs.length > 1 && (
          <>
            <button onClick={() => setIdx(i => i === 0 ? imgs.length - 1 : i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow">
              <ChevronLeft className="w-5 h-5 text-tierra-700" />
            </button>
            <button onClick={() => setIdx(i => i === imgs.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow">
              <ChevronRight className="w-5 h-5 text-tierra-700" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {idx + 1} / {imgs.length}
            </div>
          </>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {imgs.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-melocoton-400 shadow-md' : 'border-transparent hover:border-melocoton-200'}`}>
              <Image src={img} alt={`${titulo} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
