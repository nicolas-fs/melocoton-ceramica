export default function Loading() {
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-melocoton-200 border-t-melocoton-500 animate-spin" />
        <p className="font-serif italic text-tierra-400 text-lg">Cargando...</p>
      </div>
    </div>
  );
}
