import React from 'react';
import { Mail, Phone, MapPin, Clock, CreditCard, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { Brand, Category } from '../types';

interface FooterProps {
  brands: Brand[];
  categories: Category[];
  onNavigate: (view: string, extra?: any) => void;
}

export default function Footer({ brands, categories, onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#111111] text-white pt-12 border-t border-[#222222]">
      {/* Brand values / Trust badges banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-[#222222]">
        <div className="flex items-start gap-3">
          <Truck className="text-[#F7E733] shrink-0 mt-1" size={28} />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Envíos Rápidos</h4>
            <p className="text-xs text-slate-400 mt-1">Recibí tus repuestos en tiempo récord en cualquier punto del país.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-[#F7E733] shrink-0 mt-1" size={28} />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Compra 100% Segura</h4>
            <p className="text-xs text-slate-400 mt-1">Transacciones totalmente protegidas y soporte inmediato de compra.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard className="text-[#F7E733] shrink-0 mt-1" size={28} />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Múltiples Pagos</h4>
            <p className="text-xs text-slate-400 mt-1">Efectivo, transferencia nacional o tarjetas de crédito/débito.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Headphones className="text-[#F7E733] shrink-0 mt-1" size={28} />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Soporte Calificado</h4>
            <p className="text-xs text-slate-400 mt-1">Personal experto en motos listo para asesorarte vía WhatsApp.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Company Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#F7E733] text-[#000000] px-2 py-1.5 rounded font-black italic tracking-tighter text-xl transform rotate-[-1deg]">
              IMPORMOT
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma dedicada a la comercialización mayorista y minorista de repuestos oficiales, accesorios tuning e indumentaria motera premium.
          </p>
          <div className="pt-2 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#F7E733]" />
              <span>Del Carmen 1073, Cañuelas, Buenos Aires</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#F7E733]" />
              <span>+54 9 2226524373</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[#F7E733]" />
              <span>impormot@hotmail.com</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-[#F7E733] shrink-0 mt-0.5" />
              <div className="leading-tight">
                <p>Lun a Vie: 08:30 a 12:00 y 14:30 a 20:00</p>
                <p>Sábados: 09:00 a 14:30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories navigation */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#F7E733] font-bold mb-4 font-mono">Categorías</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {categories.slice(0, 6).map(cat => (
              <li key={cat.id}>
                <button 
                  onClick={() => onNavigate('catalog', { categorySlug: cat.name })}
                  className="hover:text-white transition-colors text-left"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Brands navigation */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#F7E733] font-bold mb-4 font-mono">Marcas Moto</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {brands.slice(0, 6).map(brand => (
              <li key={brand.id}>
                <button 
                  onClick={() => onNavigate('catalog', { brandSlug: brand.name })}
                  className="hover:text-white transition-colors text-left"
                >
                  Repuestos para {brand.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Help & Legals */}
        <div className="space-y-4">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-[10px] text-[#F7E733] font-mono font-semibold">¿Necesitás Soporte Express?</p>
            <p className="text-[10px] text-slate-400 mt-1">Escribinos y coordinamos la compra de inmediato.</p>
            <a 
              href="https://wa.me/5492226524373"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold py-1 px-3.5 rounded block text-center uppercase tracking-wide transition-colors"
            >
              CHATEÁ EN VIVO
            </a>
          </div>


        </div>

      </div>

      {/* Footer bottom bar */}
      <div className="bg-white text-black py-4 border-t border-gray-200 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 uppercase">
          <div className="flex flex-wrap gap-6">
            <span className="flex items-center gap-1.5"><Mail size={12} className="text-black fill-[#F7E733]" /> impormot@hotmail.com</span>
            <span className="flex items-center gap-1.5"><Phone size={12} className="text-black fill-[#F7E733]" /> +54 9 2226524373</span>
            <span>&copy; {new Date().getFullYear()} IMPORMOT. ALL RIGHTS RESERVED</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400">SERVER STATUS: OPTIMAL</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
            <span className="text-[10px] font-black text-black italic tracking-widest uppercase">IMPORMOT {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
