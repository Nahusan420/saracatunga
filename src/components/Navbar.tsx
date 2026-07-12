import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  User as UserIcon, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';
import { Product, Category, User, Notification, CartItem } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  cart: CartItem[];
  favorites: Product[];
  categories: Category[];
  onNavigate: (view: string, extra?: any) => void;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  currentView: string;
}

export default function Navbar({
  user,
  onLogout,
  cart,
  favorites,
  categories,
  onNavigate,
  onOpenCart,
  searchTerm,
  onSearchChange,
  currentView
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Calculate cart counts
  const totalItems = cart.reduce((tot, item) => tot + item.quantity, 0);

  // Fetch instant search previews dynamically
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then((data: Product[]) => {
          setSearchResults(data.slice(0, 5));
        })
        .catch(err => console.error('Error fetching search results', err));
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch live notifications
  const fetchNotifications = () => {
    const token = localStorage.getItem('impormot_token');
    const headers: Record<string, string> = {};
    if (token && token !== 'undefined' && token !== 'null' && /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+=/]*$/.test(token)) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/notifications', { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError('Response is not JSON format');
        }
        return res.json();
      })
      .then((data: Notification[]) => {
        setNotifications(data);
        setUnreadNotifications(data.filter(n => !n.read).length);
      })
      .catch(err => console.error('Error getting notifications', err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/notifications/read/${id}`, { method: 'POST' })
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      })
      .catch(err => console.error(err));
  };

  const handleResultClick = (productId: string) => {
    setSearchFocused(false);
    onSearchChange('');
    onNavigate('product-detail', { id: productId });
  };

  const executeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    onNavigate('catalog');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000] text-white border-b-4 border-[#F7E733] shadow-lg">
      {/* Upper promo banner */}
      <div className="bg-[#F7E733] text-[#000000] text-[11px] font-black py-1.5 px-4 text-center tracking-wider flex justify-center items-center gap-1.5 font-sans leading-none uppercase">
        <Sparkles size={12} className="animate-pulse" />
        <span>¡ENVÍOS A TODO EL PAÍS! COORDINÁ TU COMPRA POR WHATSAPP Y RECIBÍ AL INSTANTE</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => { onNavigate('home'); onSearchChange(''); }}>
            <span className="text-white font-black italic text-2xl sm:text-3xl lg:text-4xl tracking-tighter uppercase font-sans">
              <span className="text-[#F7E733]">IMPOR</span>MOT
            </span>
            <span className="hidden lg:inline text-[10px] tracking-widest text-[#F7E733] font-mono font-bold uppercase mt-1 select-none border-l border-zinc-800 pl-3">
              REPUESTOS MOTO
            </span>
          </div>

          {/* Search bar with instant results */}
          <form onSubmit={executeSearch} className="hidden md:flex flex-1 max-w-lg relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscá por nombre, código SKU, marca o compatibilidad..."
                className="w-full bg-[#222222] text-white text-sm pl-10 pr-10 py-2.5 rounded-full border border-transparent focus:border-[#F7E733] outline-none transition-all placeholder:text-gray-400 focus:bg-[#111111]"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              <Search className="absolute left-3.5 top-3 text-gray-400" size={17} />
              
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => onSearchChange('')} 
                  className="absolute right-12 top-3 text-gray-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}

              <button 
                type="button"
                onClick={() => onNavigate('catalog')}
                className="absolute right-3.5 top-3 text-[#F7E733] hover:text-[#FFD500]"
                title="Filtros avanzados"
              >
                <SlidersHorizontal size={17} />
              </button>
            </div>

            {/* Live Search Popup Dropdown */}
            {searchFocused && (searchTerm.trim().length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#111111] border border-[#222222] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-[#222222]">
                <div className="p-2 py-1 bg-[#1a1a1a] text-[10px] uppercase tracking-wider text-gray-400 flex justify-between items-center">
                  <span>Productos recomendados</span>
                  <span className="font-mono">{searchResults.length} resultados</span>
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => handleResultClick(prod.id)}
                      className="p-3 flex items-center gap-3 cursor-pointer hover:bg-[#222222] transition-colors"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 object-contain p-0.5 rounded bg-zinc-900 border border-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-[#F7E733]">{prod.brand} <span className="text-white">{prod.name}</span></p>
                        <p className="text-[10px] text-gray-400 truncate font-mono">SKU: {prod.sku} • {prod.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {prod.offerPrice ? (
                          <>
                            <p className="text-xs font-bold text-[#F7E733]">${prod.offerPrice.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] line-through text-gray-500">${prod.price.toLocaleString('es-AR')}</p>
                          </>
                        ) : (
                          <p className="text-xs font-bold text-white">${prod.price.toLocaleString('es-AR')}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No encontramos compatibilidades con "{searchTerm}". Intentá otra búsqueda.
                  </div>
                )}
                <div 
                  onClick={() => { setSearchFocused(false); onNavigate('catalog'); }}
                  className="p-2.5 text-center text-xs font-medium text-[#F7E733] hover:bg-[#222222] cursor-pointer transition-colors block"
                >
                  Ver todos los resultados del catálogo →
                </div>
              </div>
            )}
          </form>

          {/* Action buttons (Favorites, Notifications, User Profile, Cart) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Catalog quick access link */}
            <button 
              onClick={() => onNavigate('catalog')}
              className={`hidden sm:inline-flex text-xs uppercase tracking-wider font-bold py-1.5 px-3 rounded hover:bg-[#222222] transition-colors ${currentView === 'catalog' ? 'text-[#F7E733]' : 'text-slate-200'}`}
            >
              Catálogo
            </button>

            {/* Favorites Icon */}
            <button 
              onClick={() => onNavigate('favorites')}
              className="hidden md:inline-flex p-2 text-gray-300 hover:text-[#F7E733] transition-colors relative"
              title="Favoritos"
            >
              <Heart size={20} className={favorites.length > 0 ? "fill-[#F7E733] text-[#F7E733]" : ""} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F7E733] text-[#000000] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Notifications Hub */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-300 hover:text-[#F7E733] transition-colors relative"
                title="Notificaciones"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F7E733] text-[#000000] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown overlay */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 bg-[#111111] border border-[#222222] rounded-xl shadow-2xl w-80 text-white overflow-hidden z-50">
                  <div className="p-3 bg-[#1a1a1a] border-b border-[#222222] flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Bell size={14} className="text-[#F7E733]" /> Notificaciones
                    </span>
                    <button 
                      onClick={() => setNotificationsOpen(false)} 
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#222222]">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 text-xs transition-colors hover:bg-[#1c1c1c] ${!notif.read ? 'bg-[#181812]' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`font-semibold ${notif.type === 'order' ? 'text-amber-400' : 'text-[#F7E733]'}`}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="text-[10px] text-[#F7E733] hover:underline flex items-center gap-0.5"
                                title="Marcar como leída"
                              >
                                <Check size={10} /> Leído
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 leading-relaxed">{notif.content}</p>
                          <span className="block text-[9px] text-gray-500 mt-1 font-mono">
                            {new Date(notif.date).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-500">
                        No hay alertas por el momento.
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 bg-[#161616] border-t border-[#222222] text-center text-[11px]">
                    <span className="text-gray-400">Receptáculo de Promociones IMPORMOT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile trigger / Login Menu */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <button 
                      onClick={() => onNavigate('admin-panel')}
                      className="p-1 px-2 text-[10px] font-bold bg-[#F7E733] text-[#000000] hover:bg-[#e2d42d] rounded flex items-center gap-1 transition-colors self-center mr-1"
                      title="Panel de Control"
                    >
                      <ShieldCheck size={12} />
                      PANEL ADMIN
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('my-account')}
                      className="p-1 px-2 text-[11px] font-semibold text-gray-200 bg-[#222222] hover:bg-[#333333] rounded hidden sm:inline-block"
                    >
                      Hola, <span className="font-bold text-[#F7E733]">{user.name}</span>
                    </button>
                  )}

                  <button 
                    onClick={() => onNavigate('my-account')}
                    className="p-2 text-gray-300 hover:text-[#F7E733] transition-colors"
                    title="Mi Cuenta"
                  >
                    <UserIcon size={20} />
                  </button>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1 p-1.5 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-xs font-bold transition-all border border-zinc-700"
                >
                  <UserIcon size={14} className="text-[#F7E733]" />
                  <span>Ingresar</span>
                </button>
              )}
            </div>

            {/* Divider line */}
            <span className="hidden md:inline-block w-px h-6 bg-zinc-800"></span>

            {/* Cart Icon Drawer Trigger */}
            <button 
              onClick={onOpenCart}
              className="p-2 bg-[#F7E733] text-[#000000] hover:bg-[#FFD500] rounded-full flex items-center justify-center relative transition-transform hover:scale-105 shadow-md shrink-0"
              title="Carrito de Compras"
            >
              <ShoppingBag size={18} className="stroke-[2.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-[#F7E733] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-[#F7E733]">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile hamburger menu */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile search input and slider link (only on mobile) */}
      <div className="p-3 bg-[#111111] md:hidden border-t border-[#222222] relative">
        <form onSubmit={executeSearch} className="relative">
          <input
            type="text"
            placeholder="¿Qué repuesto buscás para tu moto?"
            className="w-full bg-[#222222] text-white text-xs pl-9 pr-8 py-2 rounded-lg border border-transparent focus:border-[#F7E733] outline-none"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setMobileSearchFocused(true)}
            onBlur={() => setTimeout(() => setMobileSearchFocused(false), 250)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => onSearchChange('')} 
              className="absolute right-9 top-2.5 text-gray-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
          <button 
            type="button" 
            onClick={() => onNavigate('catalog')}
            className="absolute right-3 top-2.5 text-[#F7E733]"
          >
            <SlidersHorizontal size={14} />
          </button>
        </form>

        {/* Mobile Search Results dropdown */}
        {mobileSearchFocused && (searchTerm.trim().length > 0) && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-[#1a1a1a] border border-[#222222] rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-[#2a2a2a]">
            {searchResults.length > 0 ? (
              searchResults.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => handleResultClick(prod.id)}
                  className="p-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-[#252525] active:bg-[#2a2a2a] transition-colors"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 object-contain p-0.5 rounded bg-zinc-900 border border-zinc-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate text-[#F7E733]">{prod.brand} <span className="text-white">{prod.name}</span></p>
                    <p className="text-[9px] text-gray-400 truncate font-mono">SKU: {prod.sku}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-bold text-white">${(prod.offerPrice || prod.price).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-[11px] text-gray-400">
                Sin resultados para "{searchTerm}"
              </div>
            )}
            <div 
              onClick={() => { setMobileSearchFocused(false); onNavigate('catalog'); }}
              className="p-2 text-center text-[10px] font-bold text-[#F7E733] hover:bg-[#252525] cursor-pointer animate-pulse"
            >
              Ver todos los productos en Catálogo
            </div>
          </div>
        )}
      </div>

      {/* Mobile categories & pages menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c0c] border-t border-[#222222] py-4 px-4 space-y-4 animate-fade-in divide-y divide-[#1e1e1e] max-h-[calc(100vh-140px)] overflow-y-auto">
          
          {/* 1. User Account Header or Login */}
          <div className="pb-3">
            {user ? (
              <div className="space-y-3">
                <div className="bg-[#141414] p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="bg-[#F7E733] text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-white">{user.name} {user.lastName}</p>
                      <p className="text-[10px] text-zinc-400 truncate font-mono">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <span className="text-[9px] bg-[#F7E733] text-black font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-tight shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onNavigate('my-account'); }} 
                    className="py-2 px-3 text-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    Mi Cuenta
                  </button>
                  {user.role === 'admin' ? (
                    <button 
                      onClick={() => { setMobileMenuOpen(false); onNavigate('admin-panel'); }} 
                      className="py-2 px-3 text-center bg-[#F7E733] hover:bg-[#e2d42d] rounded-lg text-xs font-bold text-black transition-colors"
                    >
                      Panel Admin 🔑
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setMobileMenuOpen(false); onNavigate('favorites'); }} 
                      className="py-2 px-3 text-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Heart size={12} className="text-[#F7E733] fill-[#F7E733]" /> Favoritos ({favorites.length})
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#141414] p-4 rounded-xl border border-zinc-800 text-center space-y-2.5">
                <p className="text-xs text-zinc-300 font-medium">Iniciá sesión para realizar pedidos y guardar tus repuestos favoritos.</p>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                  className="w-full py-2 bg-[#F7E733] hover:bg-[#FFD500] text-black rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                >
                  Ingresar a Mi Cuenta
                </button>
              </div>
            )}
          </div>

          {/* 2. Primary Navigation Section */}
          <div className="pt-3 pb-3 space-y-1">
            <span className="block text-[10px] font-mono tracking-widest text-[#F7E733] uppercase mb-1.5">Secciones principales</span>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }} 
              className={`w-full py-2.5 px-2.5 text-left text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${currentView === 'home' ? 'bg-[#F7E733]/10 text-[#F7E733]' : 'text-zinc-200 hover:bg-zinc-900'}`}
            >
              <span>Inicio</span>
              <ChevronRight size={14} className="opacity-60" />
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('catalog'); }} 
              className={`w-full py-2.5 px-2.5 text-left text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${currentView === 'catalog' ? 'bg-[#F7E733]/10 text-[#F7E733]' : 'text-zinc-200 hover:bg-zinc-900'}`}
            >
              <span>Catálogo completo</span>
              <ChevronRight size={14} className="opacity-60" />
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('favorites'); }} 
              className={`w-full py-2.5 px-2.5 text-left text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${currentView === 'favorites' ? 'bg-[#F7E733]/10 text-[#F7E733]' : 'text-zinc-200 hover:bg-zinc-900'}`}
            >
              <span className="flex items-center gap-1.5">
                Mis Favoritos <span className="bg-zinc-800 text-zinc-400 font-mono text-[10px] py-0.5 px-2 rounded-full font-bold">{favorites.length}</span>
              </span>
              <ChevronRight size={14} className="opacity-60" />
            </button>
          </div>

          {/* 3. Collapsible Notifications Hub on mobile */}
          <div className="pt-3 pb-3 space-y-1">
            <button
              onClick={() => setMobileNotificationsOpen(!mobileNotificationsOpen)}
              className="w-full py-1.5 px-1 text-left flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-400 uppercase hover:text-white outline-none"
            >
              <span className="flex items-center gap-1.5">
                Notificaciones 
                {unreadNotifications > 0 && (
                  <span className="bg-[#F7E733] text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </span>
              <ChevronRight size={12} className={`transform transition-transform ${mobileNotificationsOpen ? 'rotate-90' : ''}`} />
            </button>

            {mobileNotificationsOpen && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-2.5 rounded-lg text-[11px] border leading-normal transition-colors ${!notif.read ? 'bg-[#181812] border-[#F7E733]/20' : 'bg-[#121212] border-zinc-900'}`}
                    >
                      <div className="flex justify-between items-start gap-1 pb-1">
                        <span className={`font-bold ${notif.type === 'order' ? 'text-amber-400' : 'text-[#F7E733]'}`}>{notif.title}</span>
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[9px] text-[#F7E733] hover:underline"
                          >
                            Leído
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-300">{notif.content}</p>
                      <span className="block text-[8px] text-zinc-500 mt-1 font-mono">{new Date(notif.date).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-xs text-zinc-500">No hay alertas recientes.</div>
                )}
              </div>
            )}
          </div>

          {/* 4. Categories list */}
          <div className="pt-3 pb-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#F7E733] uppercase mb-1">Categorías de repuestos</span>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.slice(0, 8).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSearchChange('');
                    onNavigate('catalog', { categorySlug: c.name });
                  }}
                  className="text-[11px] py-1.5 px-2 text-left bg-zinc-900/60 hover:bg-zinc-900 font-medium text-zinc-300 hover:text-white rounded border border-zinc-950 truncate transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Support / Phone Detail & Sign out */}
          <div className="pt-3">
            {user ? (
              <button 
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-1 bg-red-950/30 border border-red-900 hover:bg-red-950/50 text-red-400 w-full py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <LogOut size={12} /> Cerrar Sesión ({user.name})
              </button>
            ) : (
              <div className="text-center text-[10px] text-zinc-500 py-1 uppercase font-mono tracking-widest">
                Importación Directa & Soporte Express
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
