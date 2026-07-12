import React, { useState } from 'react';
import { Mail, Lock, Phone, MapPin, ShieldAlert, Sparkles, LogIn } from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onAuthSuccess: (token: string, user: User) => void;
  onNavigate: (view: string) => void;
}

export default function AuthView({ onAuthSuccess, onNavigate }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration extras
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state] = useState('Buenos Aires');
  const [zipCode, setZipCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { email, password, name, lastName, phone, address, city, state, zipCode };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Ocurrió un error en la autenticación.');
        }
        return data;
      })
      .then(data => {
        setLoading(false);
        onAuthSuccess(data.token, data.user);
        if (data.user.role === 'admin') {
          onNavigate('admin-panel');
        } else {
          onNavigate('home');
        }
      })
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 font-sans md:py-20 text-black">
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-250 shadow-sm relative text-black">
        
        {/* Decorative corner tag */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black text-[#F7E733] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded shadow">
          {isLogin ? 'Iniciar Sesión' : 'Registro de Clientes'}
        </div>

        <div className="text-center mb-6 pt-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            ACCESO <span className="border-b-4 border-[#F7E733] pb-0.5">IMPORMOT</span>
          </h2>
          <p className="text-xs text-gray-400 mt-2.5">Ingresá tus credenciales para registrar repuestos favoritos, comprar y seguir tus pedidos.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded flex items-start gap-2 mb-4 font-bold">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p className="leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Apellido</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F9F9F9] border border-gray-200 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Teléfono Móvil (WhatsApp)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+54 9 11 1234-5678"
                    className="w-full bg-[#F9F9F9] border border-gray-200 pl-8 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone className="absolute left-2.5 top-3.5 text-gray-400" size={13} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Calle y Altura (Envío)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Av. del Libertador 4500"
                    className="w-full bg-[#F9F9F9] border border-gray-200 pl-8 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <MapPin className="absolute left-2.5 top-3.5 text-gray-400" size={13} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Ciudad / Localidad</label>
                  <input
                    type="text"
                    required
                    placeholder="CABA"
                    className="w-full bg-[#F9F9F9] border border-gray-200 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Código Postal</label>
                  <input
                    type="text"
                    required
                    placeholder="1426"
                    className="w-full bg-[#F9F9F9] border border-gray-200 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full bg-[#F9F9F9] border border-gray-200 pl-8 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-2.5 top-3.5 text-gray-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 font-bold">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full bg-[#F9F9F9] border border-gray-200 pl-8 p-2.5 rounded text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-2.5 top-3.5 text-gray-400" size={13} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-[#F7E733] text-[#F7E733] hover:text-black font-black text-xs uppercase py-3 rounded flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-98 transition-all shadow mt-4"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black inline-block"></span>
            ) : isLogin ? (
              <>
                <LogIn size={15} className="stroke-[2.5]" /> Iniciar Sesión Seguro
              </>
            ) : (
              <>
                <Sparkles size={15} /> Confirmar Registro
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-200 text-xs">
          {isLogin ? (
            <p className="text-gray-500 font-bold">
              ¿No tenés cuenta de cliente?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-black font-black hover:text-[#FFD500] hover:underline"
              >
                Registrate ahora
              </button>
            </p>
          ) : (
            <p className="text-gray-500 font-bold">
              ¿Ya tenés un usuario?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-black font-black hover:text-[#FFD500] hover:underline"
              >
                Iniciá sesión
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
