import React, { useState } from 'react';
import { ShoppingBag, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { CartItem, User, Order } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  user: User | null;
  onClearCart: () => void;
  onNavigate: (view: string) => void;
}

export default function CheckoutView({
  cart,
  user,
  onClearCart,
  onNavigate
}: CheckoutViewProps) {
  // Personal shipping details state initialized with logged in profile if present
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || 'Buenos Aires',
    zipCode: user?.zipCode || '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<Order | null>(null);
  const [coordinationUrl, setCoordinationUrl] = useState('');

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product.offerPrice !== undefined ? item.product.offerPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleFieldChange = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    const itemsPayload = cart.map(item => ({
      productId: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      price: item.product.offerPrice !== undefined ? item.product.offerPrice : item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]
    }));

    const orderPayload = {
      userId: user ? user.id : undefined,
      isGuest: !user,
      customerName: formData.name,
      customerLastName: formData.lastName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      items: itemsPayload,
      total: cartTotal,
      notes: formData.notes
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
      .then(async res => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Ocurrió un error al procesar el pedido.');
        return body;
      })
      .then(data => {
        setLoading(false);
        setOrderCompleted(data.order);
        setCoordinationUrl(data.whatsappUrl);
        onClearCart(); // empty cart on success
      })
      .catch(err => {
        setLoading(false);
        alert(err.message);
      });
  };

  // If order was created, show final success view
  if (orderCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans text-black">
        <div className="bg-white border border-gray-250 p-8 rounded-xl shadow-sm space-y-6">
          <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="stroke-[2.2]" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-gray-500">Orden Registrada</span>
            <h2 className="text-xl sm:text-2xl font-black text-black mt-1 uppercase">¡PEDIDO RECIBIDO CON ÉXITO!</h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Se ha asignado el código de pedido: <strong className="text-black font-mono font-black">{orderCompleted.id}</strong>. 
              El inventario de repuestos fue debitado y respaldado de manera segura.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-3.5 text-left text-xs border border-gray-200">
            <h3 className="font-mono font-black text-black uppercase border-b border-gray-200 pb-1 flex items-center gap-1.5">📋 Resumen del despacho</h3>
            <div className="space-y-1.5 text-gray-700">
              <p>👤 <strong>Cliente:</strong> {orderCompleted.customerName} {orderCompleted.customerLastName}</p>
              <p>📞 <strong>Teléfono de contacto:</strong> {orderCompleted.customerPhone}</p>
              <p className="leading-snug">📍 <strong>Lugar de Entrega:</strong> {orderCompleted.address}, {orderCompleted.city}, {orderCompleted.state}</p>
              <p>💰 <strong>Monto de Compra:</strong> <strong className="text-black">${orderCompleted.total.toLocaleString('es-AR')}</strong></p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs text-left leading-relaxed rounded-lg font-bold">
            🏍️ <strong>ÚLTIMO PASO OBLIGATORIO:</strong> Coordiná el método de pago (transferencia o efectivo) y confirmá los detalles del envío abriendo el chat oficial de <strong>WhatsApp</strong> de IMPORMOT con el botón a continuación.
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={coordinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase py-3.5 rounded flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Phone size={15} className="stroke-[2.5]" />
              <span>Coordinar Despacho en WhatsApp</span>
            </a>

            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-gray-500 hover:text-black font-black py-2 transition-colors uppercase tracking-widest"
            >
              Volver al inicio de la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-black">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-black text-gray-500 mb-2">
        <MapPin size={12} className="text-black" />
        <span>Paso final</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-8">
        CHECKOUT Y <span className="border-b-4 border-[#F7E733] pb-0.5">COORDINACIÓN EXPRESS</span>
      </h1>

      {cart.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-250 shadow-sm">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-black text-black">Tu carrito se encuentra vacío de repuestos.</p>
          <button 
            onClick={() => onNavigate('catalog')}
            className="mt-4 bg-[#F7E733] hover:bg-[#FFD500] text-black px-5 py-2.5 rounded text-xs font-black uppercase transition-colors shadow-sm cursor-pointer"
          >
            Buscar productos
          </button>
        </div>
      ) : (
        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Info forms */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-black tracking-widest font-mono border-b border-gray-200 pb-2 border-l-4 border-[#F7E733] pl-2 mb-4">
                📂 Detalles de Envío {user ? '(Sincronizado)' : '(Checkout Rápido Sin Registro)'}
              </h3>

              {!user && (
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 leading-snug font-bold mb-4">
                  ✨ No requerís registrarte para comprar. Rellená este formulario rápido y coordina el envío de inmediato por <strong>WhatsApp</strong>.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Nahuel"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Apellido</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Santos"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: +54 9 11 1234-5678"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Mail de contacto</label>
                  <input
                    type="email"
                    required
                    placeholder="Ej: cliente@correo.com"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Dirección de Entrega</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Av. del Libertador 4500, Piso 3"
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Ciudad / Localidad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CABA"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Provincia</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Código Postal</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 1426"
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider mb-1 font-bold">Comentarios / Aclaraciones del pedido</label>
                <textarea
                  placeholder="Ej: Horario de entrega recomendado o detalles especiales de la moto..."
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded p-2.5 text-xs h-20 text-black outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right panel: Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-black tracking-widest font-mono border-b border-gray-200 pb-2 border-l-4 border-[#F7E733] pl-2 flex items-center justify-between">
                <span>🛒 Resumen de Compra</span>
                <span className="text-xs font-mono font-bold text-gray-500">({cart.length} repuestos)</span>
              </h3>

              {/* Items listing */}
              <div className="divide-y divide-gray-100 border border-gray-200 bg-gray-50 rounded max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => {
                  const itemPrice = item.product.offerPrice !== undefined ? item.product.offerPrice : item.product.price;
                  return (
                    <div key={idx} className="p-3 flex gap-3 text-xs text-black">
                      <img
                        src={item.product.images[0]}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-contain p-0.5 rounded bg-white border border-gray-200 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-black truncate uppercase">{item.product.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 font-bold">Cant: {item.quantity} • SKU: {item.product.sku}</p>
                      </div>
                      <span className="font-mono font-black shrink-0 text-black">${(itemPrice * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total rows */}
              <div className="pt-2 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal Compra</span>
                  <span>${cartTotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-black text-black">
                  <span>MONTO FINAL</span>
                  <span className="text-black text-base">${cartTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Absolute trust badge */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[10px] text-gray-500 leading-relaxed font-bold">
                <ShieldCheck className="text-black shrink-0 inline-block mr-1.5" size={15} />
                <span>Presionando el botón final se reconfirmara tu orden descontándose del stock físico central. Serás redirigido para coordinar el método de abono inmediato por WhatsApp.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F7E733] hover:bg-[#FFD500] text-black font-black text-xs uppercase py-3.5 rounded flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer shadow-md mt-4"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black inline-block"></span>
                ) : (
                  <>
                    <span>Confirmar Pedido &amp; Chatear</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </>
                )}
              </button>

            </div>
          </div>

        </form>
      )}
    </div>
  );
}
