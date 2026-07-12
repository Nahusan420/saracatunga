import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Heart, 
  Bell, 
  Save, 
  MapPinned, 
  CircleCheck, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { User, Order, Product, Notification, OrderStatus } from '../types';

interface UserAccountProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  favorites: Product[];
  onRemoveFavorite: (prod: Product) => void;
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (prod: Product) => void;
}

export default function UserAccount({
  user,
  onUpdateUser,
  favorites,
  onRemoveFavorite,
  onNavigate,
  onAddToCart
}: UserAccountProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'notifications'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: user.name || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    password: ''
  });

  // Fetch client orders and notifications on load
  useEffect(() => {
    const token = localStorage.getItem('impormot_token');
    if (!token || token === 'undefined' || token === 'null' || !/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+=/]*$/.test(token)) {
      return;
    }

    setLoading(true);
    // Fetch orders
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: Order[]) => {
        setOrders(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .catch(err => console.error('Error loading orders', err));

    // Fetch alerts
    fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
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
      .then((notifs: Notification[]) => {
        setNotifications(notifs);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, activeTab]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    setMessage(null);
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar el perfil.');
        return res.json();
      })
      .then((updatedUser: User) => {
        onUpdateUser(updatedUser);
        setMessage({ text: 'Perfil guardado con éxito y respaldado en db.json.', type: 'success' });
        setFormData(prev => ({ ...prev, password: '' })); // reset pwd
      })
      .catch(err => {
        setMessage({ text: err.message, type: 'error' });
      });
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Confirmado': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Preparando pedido': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Enviado': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Entregado': return 'bg-green-50 text-green-800 border-green-200';
      case 'Cancelado': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusSteps = (currentStatus: OrderStatus) => {
    const steps: { name: string; label: string }[] = [
      { name: 'Pendiente', label: 'Pendiente' },
      { name: 'Confirmado', label: 'Confirmado' },
      { name: 'Preparando pedido', label: 'Preparación' },
      { name: 'Enviado', label: 'Enviado' },
      { name: 'Entregado', label: 'Entregado' }
    ];

    if (currentStatus === 'Cancelado') {
      return [{ name: 'Cancelado', label: 'Cancelado con Éxito' }];
    }

    const currentIndex = steps.findIndex(s => s.name === currentStatus);
    return steps.map((s, idx) => ({
      ...s,
      completed: idx <= currentIndex,
      active: idx === currentIndex
    }));
  };

  const openWhatsAppCoordination = (order: Order) => {
    const itemStrings = order.items.map(i => `• ${i.name} (x${i.quantity})`).join('\n');
    const msg = `🏍️ *Consulta de Envío IMPORMOT* 🏍️\n\n` +
      `📌 *Nº Orden:* ${order.id}\n` +
      `📦 *Productos:* \n${itemStrings}\n\n` +
      `💰 *Total:* $${order.total.toLocaleString('es-AR')}\n` +
      `📍 *Ubicación:* ${order.address}, ${order.city}\n\n` +
      `Quiero coordinar la entrega física de mi pedido y reconfirmar el tiempo del envío.`;
    const url = `https://wa.me/5492226524373?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black">
      {/* Upper Brand Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#222222]">Panel de Cliente</span>
            <span className="bg-[#F7E733]/15 text-black border border-black/10 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Motos Aficionado</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-black mt-1">
            Mi Cuenta: <span className="border-b-4 border-[#F7E733] pb-0.5">{user.name} {user.lastName}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2.5 font-mono font-bold">Mail registrado: {user.email} • Rol: {user.role === 'admin' ? 'Administrador' : 'Cliente IMPORMOT'}</p>
        </div>

        {/* Rapid tabs navigation */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`p-2 px-3 text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'orders' ? 'bg-black text-[#F7E733]' : 'text-gray-500 hover:text-black'}`}
          >
            Mis Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 px-3 text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-black text-[#F7E733]' : 'text-gray-500 hover:text-black'}`}
          >
            Mis Datos
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`p-2 px-3 text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'favorites' ? 'bg-black text-[#F7E733]' : 'text-gray-500 hover:text-black'}`}
          >
            Favoritos ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2 px-4 text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'notifications' ? 'bg-black text-[#F7E733]' : 'text-gray-500 hover:text-black'}`}
          >
            Alertas ({notifications.length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-xs text-gray-400">Estableciendo conexión y recuperando información...</p>
        </div>
      )}

      {/* Profile editor tab view */}
      {!loading && activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-250 shadow-sm">
            <h3 className="text-xs uppercase font-extrabold text-black tracking-widest font-mono border-l-4 border-[#F7E733] pl-2 mb-6">
              <MapPinned size={16} className="inline-block mr-1" /> Modificar Dirección y Contacto
            </h3>

            {message && (
              <div className={`p-4 rounded text-xs mb-6 border font-bold ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#text-black bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: +54 9 11 1234-5678"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Calle y Altura (Envío)</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Ciudad / Localidad</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Provincia</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1">Código Postal</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                    value={formData.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-[10px] text-gray-550 uppercase tracking-wider font-mono font-bold mb-1 flex items-center gap-1.5">
                  <Lock size={12} /> Nueva Contraseña (Dejar en blanco si no querés cambiarla)
                </label>
                <input
                  type="password"
                  placeholder="Escribí una nueva clave segura..."
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#F7E733] hover:bg-[#FFD500] text-black font-black text-xs uppercase px-5 py-2.5 rounded transform active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <Save size={14} className="inline mr-1" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm space-y-4">
            <h4 className="text-xs uppercase font-extrabold text-black tracking-widest font-mono border-l-4 border-[#F7E733] pl-2 pb-0.5">Detalle del Registro</h4>
            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-3.5 text-gray-700 text-xs">
              <div className="flex gap-2 items-center">
                <Mail size={14} className="text-black shrink-0" />
                <span className="font-bold">{user.email}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone size={14} className="text-black shrink-0" />
                <span className="font-bold">{user.phone || 'Sín cargar'}</span>
              </div>
              <div className="flex gap-2 items-center">
                <MapPin size={14} className="text-black shrink-0" />
                <span className="leading-tight font-bold">
                  {user.address ? `${user.address}, ${user.city}, CP ${user.zipCode}` : 'Dirección sin cargar'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded border border-gray-150 text-gray-500 text-[11px] leading-relaxed font-bold">
              ⭐ Tu dirección se cargará automáticamente como default en nuestro <strong>Checkout Rápido</strong> para que reconfirmes tus compras de repuestos con un solo clic.
            </div>
          </div>
        </div>
      )}

      {/* Orders list with delivery state steps tracking */}
      {!loading && activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white border border-gray-250 p-12 text-center rounded-xl shadow-sm">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-black font-black">Aún no registraste ninguna orden de repuestos.</p>
              <p className="text-xs text-gray-500 mt-1">¡Navegá nuestro catálogo de marcas y sumá repuestos al carrito!</p>
              <button
                onClick={() => onNavigate('catalog')}
                className="mt-4 bg-[#F7E733] hover:bg-[#FFD500] text-black font-black text-xs uppercase px-4 py-2.5 rounded shadow-sm transition-colors cursor-pointer"
              >
                Explorar repuestos
              </button>
            </div>
          ) : (
            orders.map(order => {
              const steps = getOrderStatusSteps(order.status);
              return (
                <div 
                  key={order.id} 
                  className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-sm text-black"
                >
                  {/* Order header */}
                  <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-black font-mono text-black">PEDIDO #{order.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-405 text-gray-400 mt-1 font-mono font-bold">
                        Realizado el {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}hs
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-550 block font-mono font-bold uppercase">Monto Total</span>
                      <span className="text-sm sm:text-base font-black text-black">${order.total.toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  {/* Shipment Tracking Timeline */}
                  <div className="px-5 py-6 border-b border-gray-150 bg-gray-50/50">
                    <div className="max-w-xl mx-auto">
                      <p className="text-[10px] uppercase font-mono font-black tracking-wider text-gray-500 mb-4 text-center">Seguimiento logístico</p>
                      
                      {order.status === 'Cancelado' ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-center text-red-600 text-xs flex items-center justify-center gap-1.5 font-bold">
                          <AlertTriangle size={15} />
                          <span>Esta orden fue cancelada. Comunicáte con nosotros si necesitas soporte.</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center relative">
                          {/* Horizontal progression bar */}
                          <div className="absolute left-[8%] right-[8%] top-3.5 h-0.5 bg-gray-200 -z-10">
                            <div 
                              className="h-full bg-green-500 transition-all duration-500" 
                              style={{ 
                                width: `${
                                  order.status === 'Pendiente' ? 0 :
                                  order.status === 'Confirmado' ? 25 :
                                  order.status === 'Preparando pedido' ? 50 :
                                  order.status === 'Enviado' ? 75 : 100
                                }%` 
                              }}
                            />
                          </div>

                          {steps.map((st, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                  st.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : st.active 
                                    ? 'bg-black border-black text-[#F7E733]' 
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}
                              >
                                {st.completed ? (
                                  <CircleCheck size={16} className="stroke-[2.5]" />
                                ) : (
                                  <span className="text-[10px] font-black">{i+1}</span>
                                )}
                              </div>
                              <span className={`text-[9px] uppercase tracking-wider mt-1 font-black ${st.completed || st.active ? 'text-black' : 'text-gray-400'}`}>
                                {st.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items detail lists */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs bg-white">
                    <div className="md:col-span-2 space-y-3.5">
                      <p className="text-[10px] uppercase font-mono font-black tracking-wider text-gray-500">Artículos Comprados</p>
                      
                      <div className="divide-y divide-gray-100 border border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded bg-white border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-extrabold text-black truncate leading-tight uppercase">{item.name}</h5>
                              <p className="text-[9px] text-gray-400 font-mono font-bold">SKU ID: {item.sku}</p>
                            </div>
                            <div className="text-right whitespace-nowrap text-black">
                              <p className="font-black">${item.price.toLocaleString('es-AR')}</p>
                              <p className="text-[10px] text-gray-400 font-bold">Cant: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                      <p className="text-[10px] uppercase font-mono font-black tracking-wider text-gray-500 border-b border-gray-200 pb-1">Dirección de Despacho</p>
                      <div className="space-y-1.5 text-gray-700 font-bold">
                        <p><strong className="text-black text-[10px] uppercase tracking-wide">Destinatario:</strong> {order.customerName} {order.customerLastName}</p>
                        <p><strong className="text-black text-[10px] uppercase tracking-wide">Teléfono:</strong> {order.customerPhone}</p>
                        <p className="leading-snug"><strong className="text-black text-[10px] uppercase tracking-wide">Destino:</strong> {order.address}, {order.city}, {order.state}</p>
                        {order.notes && <p className="text-emerald-600 font-black italic">" {order.notes} "</p>}
                      </div>
                      
                      {/* WhatsApp coordinate trigger */}
                      <button
                        onClick={() => openWhatsAppCoordination(order)}
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-2.5 px-3 rounded flex items-center justify-center gap-1.5 mt-4 text-[10px] uppercase tracking-widest cursor-pointer transition-colors"
                      >
                        <Phone size={12} className="stroke-[2.5]" /> Coordinar Entrega
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Favorites list layout view within User Account */}
      {!loading && activeTab === 'favorites' && (
        <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm">
          <h3 className="text-xs uppercase font-extrabold text-black tracking-widest mb-6 font-mono border-l-4 border-[#F7E733] pl-2 flex items-center gap-1.5">
            <Heart size={16} className="fill-red-500 text-red-500" /> Mis Repuestos Guardados ({favorites.length})
          </h3>

          {favorites.length === 0 ? (
            <div className="text-center py-10 font-sans">
              <Heart size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">No agendaste ningún repuesto favorito todavía.</p>
              <button
                onClick={() => onNavigate('catalog')}
                className="mt-3 inline-block bg-[#F7E733] text-black hover:bg-[#FFD500] text-[10px] uppercase tracking-widest font-black py-2 px-4 rounded cursor-pointer shadow-xs"
              >
                Buscar Repuestos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(prod => (
                <div 
                  key={prod.id} 
                  className="bg-[#F9F9F9] border border-gray-200 rounded-lg p-3 flex gap-3 transition-colors hover:border-black shadow-xs"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain p-1 rounded shrink-0 cursor-pointer bg-white border border-gray-205"
                    onClick={() => onNavigate('product-detail', { id: prod.id })}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 
                        onClick={() => onNavigate('product-detail', { id: prod.id })}
                        className="text-xs font-black text-black hover:text-[#FFD500] truncate cursor-pointer uppercase"
                      >
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono font-bold">SKU: {prod.sku}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-black text-black">${(prod.offerPrice || prod.price).toLocaleString('es-AR')}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onAddToCart(prod)}
                          className="bg-[#F7E733] hover:bg-[#FFD500] text-black font-black py-1 px-2.5 text-[10px] rounded cursor-pointer transition-all uppercase"
                        >
                          Sumar
                        </button>
                        <button
                          onClick={() => onRemoveFavorite(prod)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded font-black text-[10px] uppercase cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications history tab view */}
      {!loading && activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm">
          <h3 className="text-xs uppercase font-extrabold text-black tracking-widest mb-6 font-mono border-l-4 border-[#F7E733] pl-2">
            <Bell size={16} className="inline mr-1" /> Centro de Avisos y Notificaciones
          </h3>

          <div className="space-y-3.5">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-bold">
                No hay alertas de promociones ni de pedidos asociados a tu cuenta.
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div 
                  key={notif.id || idx} 
                  className={`p-4 rounded border transition-colors ${notif.read ? 'bg-gray-50 border-gray-150' : 'bg-gray-50/50 border-black ring-1 ring-black'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wide">
                      <span className={`w-2 h-2 rounded-full ${notif.type === 'order' ? 'bg-amber-400' : 'bg-green-500'}`}></span>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">
                      {new Date(notif.date).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pl-3.5">{notif.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
