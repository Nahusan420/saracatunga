import React from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';

interface FavoritesViewProps {
  favorites: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product, quantity?: number, silent?: boolean) => void;
  onToggleFavorite: (product: Product) => void;
}

/**
 * Vista de Favoritos (FavoritesView) - IMPORMOT
 * Permite al cliente visualizar todos los repuestos que ha marcado como favoritos, con opción de compra directa.
 */
export default function FavoritesView({
  favorites,
  onNavigate,
  onAddToCart,
  onToggleFavorite
}: FavoritesViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-black font-sans">
      <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-sm">
        <h2 className="text-lg uppercase font-black text-black tracking-widest mb-6 flex items-center gap-2 border-l-4 border-[#F7E733] pl-2">
          <Heart size={18} className="text-red-500 fill-red-500" /> Repuestos Guardados ({favorites.length})
        </h2>

        {favorites.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aún no guardaste repuestos predilectos. Navegá el catálogo y marcá el ícono de corazón.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map(prod => (
              <div key={prod.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex gap-3 hover:border-black transition-colors">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain p-1 rounded bg-white border border-gray-200 shrink-0 cursor-pointer"
                  onClick={() => onNavigate('product-detail', { id: prod.id })}
                />
                <div className="flex-grow min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 
                      onClick={() => onNavigate('product-detail', { id: prod.id })}
                      className="text-xs font-black truncate text-black hover:text-[#FFD500] leading-snug cursor-pointer uppercase"
                    >
                      {prod.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">SKU: {prod.sku} • {prod.brand}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-black text-black">${(prod.offerPrice || prod.price).toLocaleString('es-AR')}</span>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => { onAddToCart(prod, 1, true); onToggleFavorite(prod); }}
                        className="bg-[#F7E733] hover:bg-black hover:text-[#F7E733] text-black font-black text-[10px] px-3 py-1 rounded transition-colors uppercase tracking-widest cursor-pointer"
                      >
                        COMPRAR
                      </button>
                      <button
                        onClick={() => onToggleFavorite(prod)}
                        className="text-gray-400 text-[10px] hover:text-red-500 font-bold transition-colors cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
