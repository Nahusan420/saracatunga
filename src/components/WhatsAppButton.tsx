import React, { useState } from 'react';
import { MessageSquare, X, Send, CornerDownRight, ShieldQuestion } from 'lucide-react';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [option, setOption] = useState<'general' | 'order' | 'support'>('general');

  const handleSend = () => {
    let finalMessage = '';
    if (option === 'order') {
      finalMessage = `🏍️ Hola IMPORMOT, quiero consultar por el estado de mi pedido: ${text}`;
    } else if (option === 'support') {
      finalMessage = `🔧 Hola IMPORMOT, tengo una consulta de compatibilidad para mi moto: ${text}`;
    } else {
      finalMessage = text ? text : 'Hola IMPORMOT! Quisiera consultar por repuestos en stock para mi moto.';
    }

    const encoded = encodeURIComponent(finalMessage);
    const url = `https://wa.me/5492226524373?text=${encoded}`;
    window.open(url, '_blank');
    setText('');
    setIsOpen(false);
  };

  const selectOptionMessage = (opt: 'general' | 'order' | 'support', placeholderText: string) => {
    setOption(opt);
    setText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Dynamic Popover Menu */}
      {isOpen ? (
        <div className="bg-[#111111] text-white border border-[#222222] rounded-2xl shadow-2xl p-4 w-76 sm:w-80 mb-3 animate-fade-in transition-all">
          <div className="flex justify-between items-center pb-2 border-b border-[#222222] mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full absolute"></span>
              <p className="text-xs font-bold uppercase tracking-wider text-green-400">Soporte IMPORMOT</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">
            🏎️ ¡Hola! Nuestro equipo de asesores de motocicletas está en línea. Seleccioná el tipo de consulta:
          </p>

          <div className="space-y-1.5 mb-3">
            <button
              onClick={() => selectOptionMessage('general', '')}
              className={`w-full text-left text-xs p-2 rounded-lg transition-colors flex items-center justify-between ${option === 'general' ? 'bg-[#F7E733] text-black font-semibold' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'}`}
            >
              <span>Consultar Stock / Ventas</span>
              <CornerDownRight size={12} />
            </button>
            <button
              onClick={() => selectOptionMessage('order', '')}
              className={`w-full text-left text-xs p-2 rounded-lg transition-colors flex items-center justify-between ${option === 'order' ? 'bg-[#F7E733] text-black font-semibold' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'}`}
            >
              <span>Estado de mi pedido (Nº Orden)</span>
              <CornerDownRight size={12} />
            </button>
            <button
              onClick={() => selectOptionMessage('support', '')}
              className={`w-full text-left text-xs p-2 rounded-lg transition-colors flex items-center justify-between ${option === 'support' ? 'bg-[#F7E733] text-black font-semibold' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'}`}
            >
              <span>Preguntas y compatibilidad</span>
              <CornerDownRight size={12} />
            </button>
          </div>

          <div className="relative">
            <textarea
              className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg p-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F7E733] h-16 resize-none"
              placeholder={
                option === 'order' 
                  ? 'Escribí tu número de orden (Ej: ORD-1001)...' 
                  : option === 'support'
                  ? 'Anotá tu cilindrada y modelo de moto (Ej: Duke 200)...'
                  : 'Escribinos tus dudas...'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={handleSend}
              className="absolute bottom-2.5 right-2.5 bg-[#25D366] hover:bg-[#21ba59] text-black p-1.5 rounded-full shadow transition-all cursor-pointer"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#25D366] hover:bg-[#1ebd53] text-[#ffffff] p-3.5 sm:p-4 rounded-full shadow-[0px_4px_16px_rgba(37,211,102,0.4)] transition-all hover:scale-110 active:scale-95 duration-200 z-40 relative group"
        title="Consultas por WhatsApp"
      >
        <MessageSquare size={24} className="stroke-[2.2] animate-pulse" />
        <span className="absolute right-full mr-3 top-3.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1.2 rounded-lg border border-[#222222] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:inline-block pointer-events-none">
          ¿Dudas de compatibilidad? Chatea 🏍️
        </span>
      </button>
    </div>
  );
}
