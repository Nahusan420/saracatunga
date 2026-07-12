import React from 'react';
import { Sliders, Search, Undo2, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Brand, Category, FilterState, MotoModel } from '../types';

interface CatalogViewProps {
  products: Product[];
  activeFilteredProducts: Product[];
  brands: Brand[];
  categories: Category[];
  motoModels: MotoModel[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  favorites: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  resetFilters: () => void;
  filtersDrawerOpen: boolean;
  setFiltersDrawerOpen: (open: boolean) => void;
}

/**
 * Vista de Catálogo (CatalogView) - IMPORMOT
 * Ofrece un motor de búsqueda avanzado con filtrado por marca, categoría, modelo de moto, cilindrada, precio y disponibilidad.
 */
export default function CatalogView({
  products,
  activeFilteredProducts,
  brands,
  categories,
  motoModels,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  favorites,
  onNavigate,
  onAddToCart,
  onToggleFavorite,
  resetFilters,
  filtersDrawerOpen,
  setFiltersDrawerOpen
}: CatalogViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono font-black tracking-widest text-gray-500">Tienda IMPORMOT</span>
          <h1 className="text-xl sm:text-2xl font-black text-black uppercase mt-0.5 border-l-4 border-[#F7E733] pl-2">
            Catálogo de Repuestos y Accesorios
          </h1>
          <p className="text-xs text-gray-600 mt-1">Sujeto a stock físico. Utilizá los selectores laterales para afinar compatibilidades.</p>
        </div>

        {/* Indicador de cantidad de resultados */}
        <div className="flex items-center gap-3 text-xs select-none">
          <button
            type="button"
            onClick={() => setFiltersDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 bg-[#F7E733] hover:bg-[#FFD500] text-black font-extrabold px-3.5 py-2 rounded-lg border border-black shadow-sm transition-transform active:scale-95 leading-none cursor-pointer"
          >
            <Sliders size={12} className="stroke-[2.5]" />
            <span>Configurar Filtros</span>
          </button>
          <span className="text-gray-500 font-mono hidden sm:inline">
            Mostrando <strong className="text-black font-black">{activeFilteredProducts.length}</strong> de {products.length} productos
          </span>
          <span className="text-gray-500 font-mono sm:hidden">
            <strong className="text-black font-black">{activeFilteredProducts.length}</strong> u.
          </span>
          <button 
            onClick={resetFilters} 
            className="text-gray-500 font-bold hover:text-black uppercase flex items-center gap-0.5 transition-colors"
          >
            <Undo2 size={12} /> <span className="hidden sm:inline">Limpiar Filtros</span><span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Panel lateral de filtros (Desktop) */}
        <div className="hidden lg:block bg-white p-5 rounded-xl border border-gray-250 shadow-sm h-fit lg:sticky lg:top-24 space-y-5">
          <h3 className="text-xs uppercase font-extrabold text-black tracking-widest font-mono border-b border-gray-150 pb-2 flex items-center gap-1.5 mb-2 border-l-4 border-[#F7E733] pl-2">
            <Sliders size={13} /> Buscador de Compatibilidad
          </h3>

          {/* Búsqueda por palabra clave */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Palabra Clave</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 pl-8 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-[#F7E733]"
                placeholder="Ej: pastillas, cadena, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 text-gray-400" size={13} />
            </div>
          </div>

          {/* Selector de categorías */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Categorías</label>
            <select
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">-- Ver todas --</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de marca de moto o repuesto */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Marca Moto / Repuesto</label>
            <select
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none"
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
            >
              <option value="">-- Ver todas --</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Cilindrada de motor */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Cilindrada Motor</label>
            <select
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none"
              value={filters.displacement}
              onChange={(e) => setFilters(prev => ({ ...prev, displacement: e.target.value }))}
            >
              <option value="">-- Todas --</option>
              <option value="110cc">110cc</option>
              <option value="125cc">125cc</option>
              <option value="150cc">150cc</option>
              <option value="200cc">200cc</option>
              <option value="250cc">250cc</option>
              <option value="300cc">300cc</option>
              <option value="400cc">400cc</option>
              <option value="650cc">650cc</option>
              <option value="1000cc">1000cc</option>
            </select>
          </div>

          {/* Modelo específico de moto */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Filtrar por Moto</label>
            <select
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-[#F7E733] cursor-pointer"
              value={filters.motoModel}
              onChange={(e) => setFilters(prev => ({ ...prev, motoModel: e.target.value }))}
            >
              <option value="">-- Todos los modelos --</option>
              {motoModels.map(mm => (
                <option key={mm.id} value={mm.name}>{mm.name}</option>
              ))}
            </select>
          </div>

          {/* Rango de precios */}
          <div>
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
              <span className="font-bold">Precio Máx</span>
              <span className="text-black font-extrabold">${filters.maxPrice.toLocaleString('es-AR')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="400000"
              step="5000"
              className="w-full accent-black bg-gray-200 h-1.5 rounded appearance-none cursor-pointer"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            />
          </div>

          {/* Filtro de disponibilidad en stock */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Disponibilidad</label>
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-gray-100 rounded border border-gray-200 text-center text-[10px] font-bold text-gray-500">
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, availability: 'all' }))}
                className={`p-1 rounded ${filters.availability === 'all' ? 'bg-black text-[#F7E733]' : 'hover:text-black'}`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, availability: 'in_stock' }))}
                className={`p-1 rounded ${filters.availability === 'in_stock' ? 'bg-black text-[#F7E733]' : 'hover:text-black'}`}
              >
                Stock
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, availability: 'out_of_stock' }))}
                className={`p-1 rounded ${filters.availability === 'out_of_stock' ? 'bg-black text-[#F7E733]' : 'hover:text-black'}`}
              >
                Faltantes
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="lg:col-span-3">
          {activeFilteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm min-h-60 flex flex-col items-center justify-center">
              <Search size={36} className="text-gray-300 mb-3" />
              <p className="text-sm font-black text-black">No encontramos resultados con esa exacta coincidencia.</p>
              <p className="text-xs text-gray-500 mt-1 leading-normal max-w-sm">
                Intentá afinar tus filtros de búsqueda (removiendo una marca o rebajando los modelos compatibles) o consultale directamente a un operador calificado.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 bg-black text-[#F7E733] font-black text-[11px] uppercase py-2.5 px-6 rounded hover:bg-[#F7E733] hover:text-black transition-all cursor-pointer"
              >
                Reestablecer Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {activeFilteredProducts.map(prod => (
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
          )}
        </div>

      </div>

      {/* Drawer de filtros desplegable para Mobile/Tablet */}
      {filtersDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden font-sans">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setFiltersDrawerOpen(false)}
          />
          
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white p-5 shadow-2xl transition-all animate-slide-in">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4 shrink-0">
              <h3 className="text-xs uppercase font-extrabold text-black tracking-widest font-mono flex items-center gap-1.5 border-l-4 border-[#F7E733] pl-2">
                <Sliders size={13} /> Buscador Compatibilidad
              </h3>
              <button 
                type="button"
                onClick={() => setFiltersDrawerOpen(false)}
                className="p-1 px-2 text-xs font-semibold text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Palabra clave */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Palabra Clave</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 pl-8 text-xs text-black focus:outline-none"
                    placeholder="Ej: pastillas, cadena..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-2.5 top-2.5 text-gray-400" size={13} />
                </div>
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Categorías</label>
                <select
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">-- Ver todas --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Marcas */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Marca Moto / Repuesto</label>
                <select
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none"
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                >
                  <option value="">-- Ver todas --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Cilindrada */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Cilindrada Motor</label>
                <select
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none"
                  value={filters.displacement}
                  onChange={(e) => setFilters(prev => ({ ...prev, displacement: e.target.value }))}
                >
                  <option value="">-- Todas --</option>
                  <option value="110cc">110cc</option>
                  <option value="125cc">125cc</option>
                  <option value="150cc">150cc</option>
                  <option value="200cc">200cc</option>
                  <option value="250cc">250cc</option>
                  <option value="300cc">300cc</option>
                  <option value="400cc">400cc</option>
                  <option value="650cc">650cc</option>
                  <option value="1000cc">1000cc</option>
                </select>
              </div>

              {/* Modelo de moto */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Filtrar por Moto</label>
                <select
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg p-2 text-xs text-black focus:outline-none cursor-pointer"
                  value={filters.motoModel}
                  onChange={(e) => setFilters(prev => ({ ...prev, motoModel: e.target.value }))}
                >
                  <option value="">-- Todos los modelos --</option>
                  {motoModels.map(mm => (
                    <option key={mm.id} value={mm.name}>{mm.name}</option>
                  ))}
                </select>
              </div>

              {/* Rango de precios */}
              <div>
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                  <span className="font-bold">Precio Máx</span>
                  <span className="text-black font-extrabold">${filters.maxPrice.toLocaleString('es-AR')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400000"
                  step="5000"
                  className="w-full accent-black bg-gray-200 h-1.5 rounded appearance-none cursor-pointer"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                />
              </div>

              {/* Disponibilidad */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1 font-bold">Disponibilidad</label>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-gray-100 rounded border border-gray-200 text-center text-[9px] font-bold text-gray-500">
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, availability: 'all' }))}
                    className={`p-1 rounded ${filters.availability === 'all' ? 'bg-black text-[#F7E733]' : 'hover:text-black'}`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, availability: 'in_stock' }))}
                    className={`p-1 rounded ${filters.availability === 'in_stock' ? 'bg-black text-[#F7E733]' : 'hover:text-black'}`}
                  >
                    Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, availability: 'out_of_stock' }))}
                    className={`p-1 rounded ${filters.availability === 'out_of_stock' ? 'bg-black text-[#F7E733]' : 'hover:text-black'}`}
                  >
                    Fallas
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFiltersDrawerOpen(false)}
                className="w-full mt-4 bg-black text-[#F7E733] font-bold text-xs uppercase py-3 rounded-xl border border-black hover:bg-zinc-800 transition-all cursor-pointer text-center"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
