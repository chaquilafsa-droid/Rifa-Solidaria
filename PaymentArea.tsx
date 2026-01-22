
import React, { useState, useEffect } from 'react';
import { BENEFICIARY_NAME, PIX_KEY, VAKINHA_LINK, RESERVATION_LIMIT_MINUTES } from '../constants';

interface PaymentAreaProps {
  numbers: string[];
  userName: string;
  userPhone: string;
  price: number;
  onDone: () => void;
  onMinimize: () => void;
}

const PaymentArea: React.FC<PaymentAreaProps> = ({ numbers, userName, userPhone, price, onDone, onMinimize }) => {
  // Inicializando com o limite real de 15 minutos (ou conforme constante)
  const [timeLeft, setTimeLeft] = useState(RESERVATION_LIMIT_MINUTES * 60); 
  const totalAmount = numbers.length * price;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    alert("Chave PIX copiada!");
  };

  const shareWhatsApp = () => {
    const numbersList = numbers.join(', ');
    const formattedTotal = totalAmount.toFixed(2).replace('.', ',');
    
    const message = encodeURIComponent(
`Olá! 👋

Acabei de realizar o pagamento da rifa: *RIFA SOLIDÁRIA!*

👤 *Nome:* ${userName}
📱 *Telefone:* ${userPhone}

🎟️ *Números:* ${numbersList}
💰 *Valor Total:* R$ ${formattedTotal}

Segue o comprovante em anexo! 👇`
    );

    window.open(`https://wa.me/55${PIX_KEY}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-teal-main z-[200] flex flex-col items-center overflow-y-auto pb-10">
      {/* Controles do Modal */}
      <div className="w-full max-w-md flex justify-end gap-3 px-6 pt-6">
        <button 
          onClick={onMinimize}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
          title="Minimizar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <button 
          onClick={onDone}
          className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 border border-red-500/30 active:scale-90 transition-transform"
          title="Fechar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Banner Superior - Link Externo (Vakinha) */}
      <div className="w-full max-w-md mt-4 px-4">
        <div 
          onClick={() => window.open(VAKINHA_LINK, '_blank')}
          className="bg-white/10 rounded-[24px] p-4 flex items-center justify-between shadow-lg border border-white/10 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gold p-2 rounded-xl">
              <svg className="w-5 h-5 text-teal-main" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.1em] leading-none mb-1">CONHEÇA A NOSSA CAUSA</span>
              <span className="text-xs font-black text-white italic tracking-tight uppercase leading-none">CLIQUE AQUI E FAÇA A SUA DOAÇÃO</span>
            </div>
          </div>
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
        </div>
      </div>

      {/* Card Principal de Pagamento */}
      <div className="w-full max-w-md mt-6 px-4">
        <div className="bg-bordo rounded-[40px] border-4 border-gold/30 p-6 shadow-2xl relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex justify-between items-center mb-6">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gold uppercase tracking-[0.15em] mb-1">SISTEMA DE RIFA</span>
               <h2 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">PAGAMENTO</h2>
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-2xl flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <span className="text-xs font-black text-white tabular-nums tracking-widest">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="relative z-10 mb-8 space-y-3 max-h-48 overflow-y-auto pr-1">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-2">SEUS NÚMEROS RESERVADOS:</p>
            {numbers.map((num) => (
              <div key={num} className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="bg-gold w-10 h-10 rounded-xl flex items-center justify-center text-teal-main font-black text-lg shadow-lg">
                    {num}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white italic uppercase leading-none">NÚMERO CONFIRMADO</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">RESERVA ATIVA</p>
                  </div>
                </div>
                <div className="text-gold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 bg-black/30 rounded-[32px] p-6 text-center border-2 border-gold/10 shadow-xl shadow-black/20">
            <div className="mb-6">
               <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">VALOR TOTAL A PAGAR</span>
               <p className="text-[34px] font-black text-white leading-none mt-1">
                 <span className="text-sm font-bold opacity-60 mr-1 italic">R$</span>
                 {totalAmount.toFixed(2).replace('.', ',')}
               </p>
            </div>

            <div className="w-full h-px bg-white/10 mb-6"></div>

            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">CHAVE PIX (CELULAR)</p>
            
            <div 
              onClick={copyPix}
              className="bg-white/5 rounded-[20px] p-5 mb-6 cursor-pointer active:scale-95 transition-transform border border-white/5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
              <span className="text-2xl font-black text-gold tracking-tighter block mb-1">
                {PIX_KEY}
              </span>
              <span className="text-[8px] text-white/20 uppercase font-black tracking-[0.15em] flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                TOQUE PARA COPIAR CHAVE
              </span>
            </div>

            <button 
              onClick={shareWhatsApp}
              className="w-full py-4 bg-gold rounded-2xl flex items-center justify-center gap-3 text-teal-main font-black uppercase text-xs tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              ENVIAR COMPROVANTE
            </button>
          </div>

          <div className="relative z-10 mt-8 flex flex-col items-center gap-4">
            <p className="text-[10px] text-white font-bold text-center max-w-[240px] uppercase tracking-wider">
              Realize o pagamento e aguarde a confirmação
            </p>
            <button 
              onClick={onDone}
              className="px-8 py-3 rounded-xl border border-white/10 text-white/40 font-black uppercase text-[9px] tracking-[0.2em] hover:text-white transition-colors active:scale-95"
            >
              VOLTAR AO INÍCIO
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 opacity-20 flex flex-col items-center gap-2">
        <div className="w-8 h-px bg-white"></div>
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">SISTEMA SEGURO</span>
      </div>
    </div>
  );
};

export default PaymentArea;
