import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  ChevronLeft, 
  Wrench, 
  Sparkles, 
  Phone
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  related: Product[];
  onBack: () => void;
  onAddToCart: (prod: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (prod: Product) => void;
  onNavigateToProduct: (id: string) => void;
  favorites: Product[];
}

export default function ProductDetail({
  product,
  related,
  onBack,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onNavigateToProduct,
  favorites
}: ProductDetailProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  const hasOffer = product.offerPrice !== undefined && product.offerPrice < product.price;
  const currentPrice = hasOffer ? product.offerPrice! : product.price;

  // Zoom magnifier effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' });
    setIsZoomed(false);
  };

  const handleShareProduct = () => {
    const textMsg = `🏍️ *Repuestos IMPORMOT* 🏍️\n\n` +
      `Mirá este repuesto oficial: *${product.brand} - ${product.name}*\n` +
      `SKU: ${product.sku} • Precio: $${currentPrice.toLocaleString('es-AR')}\n\n` +
      `🔗 Consulta o coordiná tu compra directa por acá en IMPORMOT!`;

    const url = `https://wa.me/5492226524373?text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank');
  };

  const isFavoriteDetail = favorites.some(f => f.id === product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-black">
      {/* Back navigation bar */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-6 uppercase tracking-widest font-black cursor-pointer"
      >
        <ChevronLeft size={16} /> Volver al Catálogo Central
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-xl border border-gray-250 shadow-sm text-black">
        
        {/* Left Side: Images Gallery and Zoom Lens */}
        <div className="space-y-4">
          <div 
            className="aspect-[4/3] bg-white border border-gray-200 rounded-lg overflow-hidden relative cursor-crosshair flex items-center justify-center p-4"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={product.images[activeImgIdx]}
              alt={product.name}
              referrerPolicy="no-referrer"
              style={isZoomed ? zoomStyle : {}}
              className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-100 ease-out"
            />
            
            {hasOffer && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase tracking-wide">
                -{Math.round(((product.price - product.offerPrice!) / product.price) * 100)}% de Descuento
              </span>
            )}
          </div>

          {/* Alternate gallery thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-20 h-16 rounded overflow-hidden border bg-white p-1.5 flex items-center justify-center ${idx === activeImgIdx ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="max-w-full max-h-full w-auto h-auto object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Information Matrix */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-2">
              <span>Marca: <strong className="text-black font-extrabold">{product.brand}</strong></span>
              <span className="text-black font-mono font-black tracking-widest border-l-2 border-[#F7E733] pl-1.5">{product.category}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-black leading-tight mb-2 uppercase">
              {product.name}
            </h1>

            <p className="text-xs text-gray-400 font-mono mb-6">SKU Identificación: {product.sku}</p>

            {/* Pricing Section */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold">Precio IMPORMOT</span>
              <div className="flex items-baseline gap-3 mt-1.5">
                {hasOffer ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-black">${product.offerPrice!.toLocaleString('es-AR')}</span>
                    <span className="text-sm text-gray-400 line-through">${product.price.toLocaleString('es-AR')}</span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-black">${product.price.toLocaleString('es-AR')}</span>
                )}
              </div>

            </div>

            {/* Availability details */}
            <div className="flex gap-6 text-xs mb-6 font-semibold">
              <div>
                <span className="text-gray-400 block font-mono text-[10px] uppercase">Stock Disponible</span>
                <span className={`inline-block mt-1 font-black ${product.stock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock <= 0 ? 'Sin Stock Inmediato' : `${product.stock} unidades en depósito`}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono text-[10px] uppercase">Despacho</span>
                <span className="inline-block text-black font-bold mt-1">Físico Inmediato (Cañuelas)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {product.description}
            </p>

            {/* Compatibility specifications listing */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase font-extrabold text-black font-mono flex items-center gap-1.5 tracking-wider border-l-4 border-[#F7E733] pl-2">
                <Wrench size={14} /> Ficha de Compatibilidad Oficial
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Modelo de Moto</span>
                  <p className="text-[11px] font-black mt-0.5 leading-tight text-black">{product.compatibleModels?.join(', ') || 'Todo tipo'}</p>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Cilindrada Motor</span>
                  <p className="text-[11px] font-black mt-0.5 leading-tight text-black">{product.compatibleDisplacements?.join(', ') || 'Universal'}</p>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Marcas Toleradas</span>
                  <p className="text-[11px] font-black mt-0.5 leading-tight text-black">{product.compatibleMotos?.join(', ') || 'Universal'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-150 w-full">
            <button
              disabled={product.stock <= 0}
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-[#F7E733] hover:bg-[#FFD500] text-black font-black text-xs uppercase py-3.5 px-6 rounded flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={15} className="stroke-[2.5]" />
              <span>{product.stock <= 0 ? 'Sin stock disponible' : 'Agregar al Carrito'}</span>
            </button>

            <button
              onClick={() => onToggleFavorite(product)}
              className="bg-white hover:bg-gray-100 text-black p-3.5 px-4 rounded flex justify-center items-center gap-1.5 select-none transition-colors border border-gray-300 font-black text-xs uppercase cursor-pointer shadow-xs"
            >
              <Heart size={15} className={isFavoriteDetail ? "fill-red-500 text-red-500 stroke-red-500" : ""} />
              <span>{isFavoriteDetail ? 'Guardado' : 'Favoritos'}</span>
            </button>

            <button
              onClick={handleShareProduct}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 px-4 rounded flex justify-center items-center gap-1.5 transition-colors font-black text-xs uppercase cursor-pointer"
              title="Consultar compatibilidad por WhatsApp"
            >
              <Phone size={15} className="stroke-[2.5]" />
              <span>Asesorar Moto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specifications list (Full key-value detail table) */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-xl border border-gray-250 shadow-sm text-black">
          <h3 className="text-xs uppercase font-extrabold text-black tracking-widest mb-4 font-mono border-l-4 border-[#F7E733] pl-2">Ficha Técnica Completa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 divide-gray-100">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-2.5 border-b border-gray-100 text-xs">
                <span className="text-gray-500 font-medium">{key}</span>
                <span className="text-black font-mono font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-sm uppercase font-black tracking-widest text-black mb-6 font-mono flex items-center gap-1 border-l-4 border-[#F7E733] pl-2">
            <Sparkles size={16} /> Productos Relacionados
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(prod => {
              const offer = prod.offerPrice !== undefined;
              return (
                <div 
                  key={prod.id} 
                  onClick={() => onNavigateToProduct(prod.id)}
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-black transition-colors group h-full flex flex-col justify-between shadow-xs"
                >
                  <div className="aspect-[4/3] w-full rounded overflow-hidden bg-white p-2 border border-gray-100 mb-2 relative flex items-center justify-center">
                    <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">{prod.brand}</span>
                    <h4 className="text-[11px] font-black text-black group-hover:text-[#FFD500] truncate leading-tight uppercase">{prod.name}</h4>
                  </div>
                  <div className="mt-2 pt-1 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-mono font-black text-black">
                      ${(offer ? prod.offerPrice! : prod.price).toLocaleString('es-AR')}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Ver repuesto</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
