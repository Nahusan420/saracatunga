import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface HomeViewProps {
  products: Product[];
  favorites: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
}

/**
 * Vista de Inicio (Home) - IMPORMOT
 * Muestra una selección destacada de repuestos y un llamado a la acción para explorar el catálogo.
 */
export default function HomeView({
  products,
  favorites,
  onNavigate,
  onAddToCart,
  onToggleFavorite
}: HomeViewProps) {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Encabezado Minimalista */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 p-1 px-2.5 rounded-full bg-[#F7E733]/12 border border-[#F7E733]/30 text-black text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={13} className="text-black" />
          <span>SELECCIÓN EXCLUSIVA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight leading-none mb-3">
          REPUESTOS DESTACADOS
        </h1>
        <p className="text-sm text-gray-600">
          La mejor selección de componentes de alto rendimiento, lubricantes premium y accesorios garantizados para tu motocicleta.
        </p>
      </div>

      {/* Grid del Catálogo de Productos Destacados (Primeros 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 12).map(prod => (
          <ProductCard
            key={prod.id}
            product={prod}
            onViewDetails={(id) => onNavigate('product-detail', { id })}
            onAddToCart={(p) => onAddToCart(p)}
            isFavorite={favorites.some(f => f.id === prod.id)}
            onToggleFavorite={(p) => onToggleFavorite(p)}
          />
        ))}
      </div>

      {/* Botón de Acción para ver el catálogo completo */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => onNavigate('catalog')}
          className="bg-black hover:bg-zinc-800 text-[#F7E733] font-extrabold text-xs uppercase px-8 py-4 rounded-xl flex items-center justify-center gap-2 tracking-wide hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-md"
        >
          <span>Ver Catálogo Completo</span>
          <ArrowRight size={15} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
