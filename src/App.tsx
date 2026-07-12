import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Layers, 
  SlidersHorizontal, 
  Trash2, 
  Plus, 
  Minus,
  X,
  Compass,
  ArrowRight,
  Sliders,
  Store,
  PhoneCall,
  User as UserIcon,
  ShoppingBag as CartIcon,
  ShieldCheck,
  CheckCircle,
  Undo2
} from 'lucide-react';

// Core structural sub-components imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProductCard from './components/ProductCard';

// Page / View imports
import HomeView from './pages/HomeView';
import CatalogView from './pages/CatalogView';
import FavoritesView from './pages/FavoritesView';
import UserAccount from './pages/UserAccount';
import AdminDashboard from './pages/AdminDashboard';
import AuthView from './pages/AuthView';
import ProductDetail from './pages/ProductDetail';
import CheckoutView from './pages/CheckoutView';

import { 
  Product, 
  Brand, 
  Category, 
  User, 
  CartItem, 
  FilterState,
  MotoModel
} from './types';

export default function App() {
  // Navigation Router states: 'home' | 'catalog' | 'product-detail' | 'login' | 'my-account' | 'admin-panel' | 'checkout' | 'favorites'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<string>('');
  const [currentBrandFilter, setCurrentBrandFilter] = useState<string>('');

  // Primary data storage
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [motoModels, setMotoModels] = useState<MotoModel[]>([]);
  
  // Shopping Cart & Favorites session states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  // Authenticated Profile
  const [user, setUser] = useState<User | null>(null);

  // Dynamic Free Text searching state matches
  const [searchTerm, setSearchTerm] = useState('');

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brand: '',
    displacement: '',
    motoModel: '',
    category: '',
    minPrice: 0,
    maxPrice: 400000,
    availability: 'all'
  });

  // Fetch central collections from full-stack api
  const fetchBases = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch(e => console.error('Error fetching catalog', e));

    fetch('/api/brands')
      .then(res => res.json())
      .then((data: Brand[]) => setBrands(data))
      .catch(e => console.error('Error fetching brands', e));

    fetch('/api/categories')
      .then(res => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(e => console.error('Error fetching categories', e));

    fetch('/api/moto-models')
      .then(res => res.json())
      .then((data: MotoModel[]) => setMotoModels(data))
      .catch(e => console.error('Error fetching moto models', e));
  };

  useEffect(() => {
    fetchBases();

    // Recover logged-in user profile if JWT exists
    const token = localStorage.getItem('impormot_token');
    if (token && token !== 'undefined' && token !== 'null' && /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+=/]*$/.test(token)) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            localStorage.removeItem('impormot_token');
            return null;
          }
          return res.json();
        })
        .then((profile: User | null) => {
          if (profile) setUser(profile);
        })
        .catch(() => localStorage.removeItem('impormot_token'));
    }

    // Recover cart from locale
    const storedCart = localStorage.getItem('impormot_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        setCart([]);
      }
    }

    // Recover favorites from locale
    const storedFavorites = localStorage.getItem('impormot_favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        setFavorites([]);
      }
    }
  }, []);

  const saveCartToLocale = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('impormot_cart', JSON.stringify(newCart));
  };

  const saveFavoritesToLocale = (newFavs: Product[]) => {
    setFavorites(newFavs);
    localStorage.setItem('impormot_favorites', JSON.stringify(newFavs));
  };

  // ----------------------------------------------------
  // INTERACTION DIRECT METHODS
  // ----------------------------------------------------
  const handleAddToCart = (product: Product, quantity = 1, silent = false) => {
    if (product.stock <= 0) return;
    const existingIdx = cart.findIndex(it => it.product.id === product.id);
    let updated = [...cart];

    if (existingIdx > -1) {
      const newQty = updated[existingIdx].quantity + quantity;
      if (newQty <= product.stock) {
        updated[existingIdx].quantity = newQty;
      } else {
        updated[existingIdx].quantity = product.stock;
      }
    } else {
      updated.push({ product, quantity });
    }

    saveCartToLocale(updated);
    if (!silent) {
      setIsCartOpen(true); // Open drawer instantly
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = cart.filter(it => it.product.id !== productId);
    saveCartToLocale(updated);
  };

  const handleUpdateCartQuantity = (productId: string, diff: number) => {
    const idx = cart.findIndex(it => it.product.id === productId);
    if (idx === -1) return;

    let updated = [...cart];
    const target = updated[idx];
    const nextQty = target.quantity + diff;

    if (nextQty <= 0) {
      updated = updated.filter(it => it.product.id !== productId);
    } else if (nextQty <= target.product.stock) {
      target.quantity = nextQty;
    }

    saveCartToLocale(updated);
  };

  const handleToggleFavorite = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existingIdx = favorites.findIndex(f => f.id === product.id);
    let updated = [...favorites];

    if (existingIdx > -1) {
      updated = updated.filter(f => f.id !== product.id);
    } else {
      updated.push(product);
    }

    saveFavoritesToLocale(updated);
  };

  const handleAuthSuccess = (token: string, loadedUser: User) => {
    localStorage.setItem('impormot_token', token);
    setUser(loadedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('impormot_token');
    setUser(null);
    setCurrentView('home');
    setCart([]);
    localStorage.removeItem('impormot_cart');
  };

  // Route Navigator Router Wrapper
  const handleNavigate = (view: string, extra?: any) => {
    setCurrentView(view);
    if (view === 'product-detail' && extra?.id) {
      setSelectedProductId(extra.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'catalog') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Category quick filter handling
      if (extra?.categorySlug) {
        setFilters(prev => ({ ...prev, category: extra.categorySlug, brand: '', displacement: '', motoModel: '' }));
      } else if (extra?.brandSlug) {
        setFilters(prev => ({ ...prev, brand: extra.brandSlug, category: '', displacement: '', motoModel: '' }));
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter Catalog matches
  const resetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      displacement: '',
      motoModel: '',
      category: '',
      minPrice: 0,
      maxPrice: 400000,
      availability: 'all'
    });
    setSearchTerm('');
  };

  // Products filters evaluator
  const activeFilteredProducts = products.filter(p => {
    const currentPrice = p.offerPrice !== undefined ? p.offerPrice : p.price;
    
    // Brand logic
    if (filters.brand && p.brand.toLowerCase() !== filters.brand.toLowerCase() && !p.compatibleMotos.some(m => m.toLowerCase() === filters.brand.toLowerCase())) {
      return false;
    }

    // Category logic
    if (filters.category && p.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }

    // Displacements logic
    if (filters.displacement && !p.compatibleDisplacements.some(disp => disp.toLowerCase().includes(filters.displacement.toLowerCase()))) {
      return false;
    }

    // Model logic
    if (filters.motoModel && !p.compatibleModels.some(model => model.toLowerCase().includes(filters.motoModel.toLowerCase()))) {
      return false;
    }

    // Price range
    if (currentPrice < filters.minPrice || currentPrice > filters.maxPrice) {
      return false;
    }

    // Availability
    if (filters.availability === 'in_stock' && p.stock <= 0) {
      return false;
    }
    if (filters.availability === 'out_of_stock' && p.stock > 0) {
      return false;
    }

    // Text Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inTitle = p.name.toLowerCase().includes(q);
      const inSKU = p.sku.toLowerCase().includes(q);
      const inDesc = p.description.toLowerCase().includes(q);
      const inBrand = p.brand.toLowerCase().includes(q);
      const inCategory = p.category.toLowerCase().includes(q);
      const inModels = p.compatibleModels.some(m => m.toLowerCase().includes(q));
      if (!inTitle && !inSKU && !inDesc && !inBrand && !inCategory && !inModels) {
        return false;
      }
    }

    return true;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product.offerPrice !== undefined ? item.product.offerPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="bg-[#EAEAEA] min-h-screen text-black font-sans flex flex-col justify-between selection:bg-[#F7E733] selection:text-black">
      
      {/* Dynamic Header */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        cart={cart}
        favorites={favorites}
        categories={categories}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); if (currentView !== 'catalog') setCurrentView('catalog'); }}
        currentView={currentView}
      />

      {/* Main Views Container Router */}
      <main className="flex-grow">
        
        {/* VIEW: HOME VIEW (Inicio) */}
        {currentView === 'home' && (
          <HomeView
            products={products}
            favorites={favorites}
            onNavigate={handleNavigate}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* VIEW: CATALOG VIEW WITH COMPREHENSIVE FILTER SIDEBAR */}
        {currentView === 'catalog' && (
          <CatalogView
            products={products}
            activeFilteredProducts={activeFilteredProducts}
            brands={brands}
            categories={categories}
            motoModels={motoModels}
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            favorites={favorites}
            onNavigate={handleNavigate}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleFavorite={handleToggleFavorite}
            resetFilters={resetFilters}
            filtersDrawerOpen={filtersDrawerOpen}
            setFiltersDrawerOpen={setFiltersDrawerOpen}
          />
        )}

        {/* VIEW: SINGLE PRODUCT DETAIL */}
        {currentView === 'product-detail' && selectedProductId && (
          (() => {
            const prod = products.find(p => p.id === selectedProductId);
            if (!prod) return <div className="text-center py-20 text-xs">Cargando datos del repuesto...</div>;
            
            // Related items calculations
            const related = products
              .filter(p => p.id !== prod.id && (p.category === prod.category || p.brand === prod.brand))
              .slice(0, 4);

            return (
              <ProductDetail
                product={prod}
                related={related}
                onBack={() => handleNavigate('catalog')}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                isFavorite={favorites.some(f => f.id === prod.id)}
                onToggleFavorite={handleToggleFavorite}
                onNavigateToProduct={(id) => handleNavigate('product-detail', { id })}
                favorites={favorites}
              />
            );
          })()
        )}

        {/* VIEW: AUTHENTICATION (Login / Registry) */}
        {currentView === 'login' && (
          <AuthView 
            onAuthSuccess={handleAuthSuccess} 
            onNavigate={(view) => handleNavigate(view)} 
          />
        )}

        {/* VIEW: CUSTOMER WORKSPACE ACCOUNT PORTAL */}
        {currentView === 'my-account' && user && (
          <UserAccount
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            favorites={favorites}
            onRemoveFavorite={(p) => handleToggleFavorite(p)}
            onNavigate={handleNavigate}
            onAddToCart={(p) => handleAddToCart(p, 1)}
          />
        )}

        {/* VIEW: UNIFIED CHECKOUT GUEST OR MEMBER SCREEN */}
        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            user={user}
            onClearCart={() => saveCartToLocale([])}
            onNavigate={handleNavigate}
          />
        )}

        {/* VIEW: ADMIN CONSOLE CONTROLS */}
        {currentView === 'admin-panel' && (
          <AdminDashboard onNavigate={handleNavigate} currentUser={user} />
        )}

        {/* VIEW: FAVORITES SHORTCUT HUB */}
        {currentView === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

      </main>

      {/* Floating sliding Shopping Cart Panel (Drawer style) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-gray-300 text-black flex flex-col shadow-2xl">
              
              {/* Header drawer */}
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                <span className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5 border-l-4 border-[#F7E733] pl-2">
                  <CartIcon size={14} className="stroke-[2.5]" /> Carrito de Compras
                </span>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black p-1 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Items loops */}
              <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-450 space-y-3">
                    <CartIcon size={36} className="text-gray-300 block mx-auto" />
                    <p className="text-xs uppercase tracking-widest font-black text-gray-400">Tu carrito está vacío</p>
                    <p className="text-[11px] text-gray-550 max-w-xs leading-normal">Sumá repuestos del catálogo para coordinar tu envío oficial por WhatsApp.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const priceUnit = item.product.offerPrice !== undefined ? item.product.offerPrice : item.product.price;
                    return (
                      <div key={idx} className="py-4 flex gap-3 text-xs leading-none">
                        <img
                          src={item.product.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain p-1 rounded bg-white border border-gray-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-[#222222] truncate leading-tight uppercase text-[11px]">{item.product.name}</h4>
                            <p className="text-[10px] text-gray-450 font-mono leading-none mt-1">SKU ID: {item.product.sku}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center rounded bg-gray-105 bg-gray-100 border border-gray-200 p-0.5 text-xs text-black">
                              <button 
                                onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                                className="p-1 px-1.5 text-gray-500 hover:text-black font-bold"
                              >
                                <Minus size={9} />
                              </button>
                              <span className="px-2 font-mono text-[11px] min-w-4 text-center font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                                className="p-1 px-1.5 text-gray-500 hover:text-black font-bold disabled:text-gray-300"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus size={9} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-650 text-[10px] font-bold"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap shrink-0 flex flex-col justify-between">
                          <span className="font-mono font-black text-black">${(priceUnit * item.quantity).toLocaleString('es-AR')}</span>
                          <span className="text-[9px] text-gray-400 font-mono">${priceUnit.toLocaleString('es-AR')} u.</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total calculations drawer footer */}
              {cart.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 shrink-0 text-xs">
                  <div className="flex justify-between items-center text-gray-500 font-bold">
                    <span>Subtotal pedido</span>
                    <span className="font-mono">${cartTotal.toLocaleString('es-AR')}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-black uppercase">
                    <span className="text-black">Total Final:</span>
                    <span className="text-black font-black text-base font-mono">${cartTotal.toLocaleString('es-AR')}</span>
                  </div>

                  <button
                    onClick={() => { setIsCartOpen(false); handleNavigate('checkout'); }}
                    className="w-full bg-black hover:bg-[#F7E733] text-[#F7E733] hover:text-black font-black py-3 rounded flex items-center justify-center gap-1.5 uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md mt-3"
                  >
                    <span>Iniciar Coordinación de Entrega</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Floating dynamic Mobile/Tablet Cart shortcut - optimized for single-hand usage */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 md:hidden z-40 bg-[#F7E733] text-black p-4 rounded-full shadow-[0px_4px_16px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all text-xs font-black flex items-center justify-center gap-2 select-none border-2 border-black cursor-pointer"
          title="Ver Carrito Flotante"
        >
          <div className="relative">
            <ShoppingBag size={18} className="stroke-[2.5]" />
            <span className="absolute -top-2.5 -right-2.5 bg-black text-[#F7E733] text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#F7E733] animate-pulse">
              {cart.reduce((count, item) => count + item.quantity, 0)}
            </span>
          </div>
          <span className="font-extrabold tracking-tight">${cartTotal.toLocaleString('es-AR')}</span>
        </button>
      )}

      {/* Floating dynamic WhatsApp bubble */}
      <WhatsAppButton />

      {/* Dynamic Footer */}
      <Footer 
        brands={brands} 
        categories={categories} 
        onNavigate={handleNavigate} 
      />

    </div>
  );
}
