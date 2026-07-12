import React from 'react';
import { Heart, ShoppingCart, CircleAlert, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (id: string) => void;
  onAddToCart: (prod: Product, e?: React.MouseEvent) => void;
  isFavorite: boolean;
  onToggleFavorite: (prod: Product, e?: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  isFavorite,
  onToggleFavorite
}: ProductCardProps) {
  const hasOffer = product.offerPrice !== undefined && product.offerPrice < product.price;
  const priceToDisplay = hasOffer ? product.offerPrice! : product.price;
  
  // Calculate discount percentage
  const discountPercent = hasOffer 
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100) 
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      onClick={() => onViewDetails(product.id)}
      className="bg-white rounded shadow-sm border border-transparent hover:border-[#F7E733] hover:shadow-md transition-all group duration-205 cursor-pointer flex flex-col h-full relative"
    >
      {/* Discount badge */}
      {hasOffer && (
        <div className="absolute top-2 left-2 bg-[#F7E733] text-black text-[10px] font-black px-2 py-1 uppercase rounded-sm z-10 tracking-widest shadow-sm">
          <span>-{discountPercent}% OFF</span>
        </div>
      )}

      {/* Favorites Toggle Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product, e); }}
        className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-full border border-gray-200 hover:scale-110 text-gray-500 hover:text-red-500 transition-all cursor-pointer shadow-sm"
        title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <Heart size={14} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
      </button>

      {/* Image container with strict referrerPolicy */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-white p-3 flex items-center justify-center border-b border-gray-200 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-2 z-10">
            <span className="bg-white text-black px-3 py-1 font-black text-[10px] rounded tracking-wider uppercase">SIN STOCK</span>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="p-4 flex flex-col flex-grow gap-1">
        {/* Category & Brand row */}
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
          <span>{product.brand}</span>
          <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-[9px]">{product.category}</span>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-xs font-black text-[#222222] group-hover:text-black transition-colors leading-tight line-clamp-2 mb-2 cursor-pointer uppercase tracking-tight">
          {product.name}
        </h3>

        {/* Moto Compatibility Pills (showing up to 3) */}
        {product.compatibleModels && product.compatibleModels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.compatibleModels.slice(0, 3).map((moto, i) => (
              <span 
                key={i} 
                className="text-[9px] bg-gray-50 text-gray-500 font-bold px-1.5 py-0.5 rounded border border-gray-200"
              >
                🏍️ {moto}
              </span>
            ))}
            {product.compatibleModels.length > 3 && (
              <span className="text-[9px] text-gray-400 font-bold self-center">
                +{product.compatibleModels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Stock row */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-end justify-between gap-2">
          <div>
            {hasOffer ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-red-500 line-through leading-none">${product.price.toLocaleString('es-AR')}</span>
                <span className="text-lg font-black text-black mt-0.5">${product.offerPrice!.toLocaleString('es-AR')}</span>
              </div>
            ) : (
              <span className="text-lg font-black text-black leading-none">${product.price.toLocaleString('es-AR')}</span>
            )}
          </div>

          {/* Add to cart icon button */}
          <button
            disabled={isOutOfStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product, e); }}
            className={`p-2 rounded flex items-center justify-center transition-all ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-[#F7E733] hover:bg-[#F7E733] hover:text-black cursor-pointer hover:scale-105 active:scale-95'
            }`}
            title="Agregar al carrito"
          >
            <ShoppingCart size={14} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
