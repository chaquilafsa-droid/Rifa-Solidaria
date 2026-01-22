import React, { useState, useEffect, useCallback } from 'react';
import { RaffleNumber, RaffleStatus, RaffleStats } from './types';
import { dbService } from './services/dbService';
import NumberGrid from './components/NumberGrid';
import PaymentArea from './components/PaymentArea';
import { ADMIN_PASSWORD, BENEFICIARY_NAME, VAKINHA_LINK } from './constants';

const THEMES = [
  { id: 'default', name: 'Original', main: '#0d4a65', gold: '#f2a922', bordo: '#8a192a', btn: '#1e4e69' },
  { id: 'royal', name: 'Nobre Blue', main: '#1e3a8a', gold: '#fbbf24', bordo: '#7f1d1d', btn: '#1d4ed8' },
  { id: 'forest', name: 'Verde Floresta', main: '#064e3b', gold: '#facc15', bordo: '#450a0a', btn: '#065f46' },
  { id: 'crimson', name: 'Carmesim Real', main: '#450a0a', gold: '#fde047', bordo: '#7f1d1d', btn: '#991b1b' },
  { id: 'midnight', name: 'Meia Noite', main: '#020617', gold: '#38bdf8', bordo: '#1e1b4b', btn: '#0f172a' },
  { id: 'sunset', name: 'Pôr do Sol', main: '#7c2d12', gold: '#fb923c', bordo: '#9d174d', btn: '#ea580c' },
  { id: 'lavender', name: 'Lavanda Soft', main: '#4c1d95', gold: '#ddd6fe', bordo: '#701a75', btn: '#5b21b6' },
  { id: 'emerald', name: 'Esmeralda', main: '#064e3b', gold: '#10b981', bordo: '#064e3b', btn: '#059669' },
  { id: 'luxury', name: 'Luxo Black', main: '#111827', gold: '#d4af37', bordo: '#1f2937', btn: '#374151' },
  { id: 'ocean', name: 'Oceano Profundo', main: '#0c4a6e', gold: '#0ea5e9', bordo: '#1e3a8a', btn: '#0284c7' },
  { id: 'coffee', name: 'Café Expresso', main: '#451a03', gold: '#d97706', bordo: '#78350f', btn: '#92400e' },
  { id: 'cyber', name: 'Cyber Neon', main: '#0f172a', gold: '#22d3ee', bordo: '#701a75', btn: '#1e293b' },
  { id: 'minimal', name: 'Clean Gray', main: '#1f2937', gold: '#f3f4f6', bordo: '#111827', btn: '#374151' },
  { id: 'candy', name: 'Doce Rosa', main: '#831843', gold: '#f9a8d4', bordo: '#be185d', btn: '#9d174d' },
  { id: 'gold', name: 'Total Gold', main: '#422006', gold: '#fef08a', bordo: '#713f12', btn: '#a16207' }
];

const App: React.FC = () => {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reservationName, setReservationName] = useState('');
  const [reservationWhatsapp, setReservationWhatsapp] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [paymentNumbers, setPaymentNumbers] = useState<string[] | null>(null);
  const [isPaymentMinimized, setIsPaymentMinimized] = useState(false);
  const [confirmedBuyer, setConfirmedBuyer] = useState({ name: '', phone: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [adminTab, setAdminTab] = useState<'pending' | 'paid' | 'config' | 'draw'>('pending');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [raffleName, setRaffleName] = useState('');
  const [raffleNameInput, setRaffleNameInput] = useState('');
  const [raffleDescription, setRaffleDescription] = useState('');
  const [raffleDescriptionInput, setRaffleDescriptionInput] = useState('');
  const [drawDescription, setDrawDescription] = useState('');
  const [drawDescriptionInput, setDrawDescriptionInput] = useState('');
  const [badgeText, setBadgeText] = useState('PRÊMIO ESPECIAL');
  const [badgeTextInput, setBadgeTextInput] = useState('PRÊMIO ESPECIAL');
  const [rafflePrice, setRafflePrice] = useState(10);
  const [rafflePriceInput, setRafflePriceInput] = useState('10.00');
  const [currentThemeId, setCurrentThemeId] = useState('default');
  const [prizeImages, setPrizeImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [winnerNumber, setWinnerNumber] = useState<string | null>(null);
  const [winnerInput, setWinnerInput] = useState('');

  const [isImageLinkModalOpen, setIsImageLinkModalOpen] = useState(false);
  const [imageLinkInput, setImageLinkInput] = useState('');
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const applyTheme = useCallback((themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--color-main', theme.main);
    root.style.setProperty('--color-gold', theme.gold);
    root.style.setProperty('--color-bordo', theme.bordo);
    root.style.setProperty('--color-btn-blue', theme.btn);
    setCurrentThemeId(themeId);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [nums, currentStats, name, desc, drawDesc, bText, price, imgs, layout, winner] = await Promise.all([
        dbService.getNumbers(),
        dbService.getStats(),
        dbService.getRaffleName(),
        dbService.getRaffleDescription(),
        dbService.getDrawDescription(),
        dbService.getBadgeText(),
        dbService.getRafflePrice(),
        dbService.getImages(),
        dbService.getLayout(),
        dbService.getWinner()
      ]);

      const updatedNums = nums || [];
      setNumbers(updatedNums);
      setStats(currentStats);
      setRaffleName(name || 'RIFA SOLIDÁRIA!');
      setRaffleNameInput(name || 'RIFA SOLIDÁRIA!');
      setRaffleDescription(desc || '');
      setRaffleDescriptionInput(desc || '');
      setDrawDescription(drawDesc || '');
      setDrawDescriptionInput(drawDesc || '');
      setBadgeText(bText || 'PRÊMIO ESPECIAL');
      setBadgeTextInput(bText || 'PRÊMIO ESPECIAL');
      setRafflePrice(price || 10);
      setRafflePriceInput((price || 10).toFixed(2));
      setPrizeImages(imgs || []);
      applyTheme(layout || 'default');
      setWinnerNumber(winner);
      if (winner) setWinnerInput(winner);

      const storedSession = localStorage.getItem('raffle_session');
      if (storedSession && !paymentNumbers) {
        const myReservations = updatedNums.filter(n => n.session_id === storedSession && n.status === RaffleStatus.RESERVADO);
        if (myReservations.length > 0) {
          setConfirmedBuyer({ name: myReservations[0].name || '', phone: myReservations[0].whatsapp || '' });
          setPaymentNumbers(myReservations.map(r => r.number));
        }
      } else if (storedSession && paymentNumbers) {
          const myReservations = updatedNums.filter(n => n.session_id === storedSession && n.status === RaffleStatus.RESERVADO);
          if (myReservations.length === 0) {
              setPaymentNumbers(null);
              localStorage.removeItem('raffle_session');
          }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, [applyTheme, paymentNumbers]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); 
    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    if (prizeImages.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex(prev => (prev + 1) % prizeImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [prizeImages]);

  const toggleNumberSelection = (n: RaffleNumber) => {
    if (n.status !== RaffleStatus.DISPONIVEL || winnerNumber) return;
    setSelectedIds(prev => 
      prev.includes(n.id) 
        ? prev.filter(id => id !== n.id) 
        : [...prev, n.id]
    );
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !reservationName || !reservationWhatsapp) return;

    const sessionId = Math.random().toString(36).substring(7);
    const success = await dbService.reserveNumbers(selectedIds, reservationName, reservationWhatsapp, sessionId);

    if (success) {
      localStorage.setItem('raffle_session', sessionId);
      const nums = numbers.filter(n => selectedIds.includes(n.id)).map(n => n.number);
      setConfirmedBuyer({ name: reservationName, phone: reservationWhatsapp });
      setPaymentNumbers(nums);
      setIsPaymentMinimized(false);
      setIsReserving(false);
      setSelectedIds([]);
      setReservationName('');
      setReservationWhatsapp('');
      await refreshData();
    } else {
      alert("Alguns números selecionados não estão mais disponíveis.");
      setIsReserving(false);
      setSelectedIds([]);
      await refreshData();
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) setIsAdmin(true);
    else alert("Senha incorreta");
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Participe da minha ${raffleName} por apenas R$ ${rafflePrice.toFixed(2).replace('.', ',')}! 🎫🍀\n\nConfira os números disponíveis aqui:\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copiado com sucesso!");
  };

  const openImageLinkModal = (slot: number) => {
    setActiveSlot(slot);
    setImageLinkInput(prizeImages[slot] || '');
    setIsImageLinkModalOpen(true);
  };

  const saveImageLink = async () => {
    if (activeSlot !== null) {
      const newImages = [...prizeImages];
      if (imageLinkInput.trim()) {
        newImages[activeSlot] = imageLinkInput.trim();
      } else {
        newImages.splice(activeSlot, 1);
      }
      const filtered = newImages.filter(img => img);
      await dbService.setImages(filtered);
      setPrizeImages(filtered);
      setIsImageLinkModalOpen(false);
      setImageLinkInput('');
      setActiveSlot(null);
    }
  };

  const removeImage = async (index: number) => {
    const newImages = prizeImages.filter((_, i) => i !== index);
    await dbService.setImages(newImages);
    setPrizeImages(newImages);
  };

  const handleFinishRaffle = async () => {
    if (!winnerInput || winnerInput.trim().length === 0) {
      alert("Digite o número vencedor (00-99)");
      return;
    }
    const formattedWinner = winnerInput.trim().padStart(2, '0');
    if (confirm(`Confirmar o número ${formattedWinner} como vencedor e encerrar a rifa?`)) {
      await dbService.setWinner(formattedWinner);
      await refreshData();
    }
  };

  const handleResetWinner = async () => {
    if (confirm("Remover o vencedor e reabrir a rifa?")) {
      await dbService.setWinner(null);
      await refreshData();
    }
  };

  const contactWinner = () => {
    if (!winnerNumber) return;
    const winnerData = numbers.find(n => n.number === winnerNumber);
    if (!winnerData || !winnerData.whatsapp) {
      alert("Informações de contato não encontradas para este número.");
      return;
    }
    const cleanPhone = winnerData.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${winnerData.name}! 🎉 Parabéns! Você foi o grande vencedor da ${raffleName} com o número ${winnerNumber}. Entre em contato para receber seu prêmio!`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const copySoldReport = () => {
    const paidNumbers = numbers.filter(n => n.status === RaffleStatus.PAGO);
    if (paidNumbers.length === 0) {
      alert("Não há números vendidos para gerar o relatório.");
      return;
    }

    const report = paidNumbers
      .sort((a, b) => parseInt(a.number) - parseInt(b.number))
      .map(n => `🎟️ #${n.number} - ${n.name} (${n.whatsapp})`)
      .join('\n');
    
    const fullReport = `📊 RELATÓRIO DE VENDAS - ${raffleName}\n\n${report}\n\nTotal: ${paidNumbers.length} números pagos.`;
    
    navigator.clipboard.writeText(fullReport);
    alert("Relatório copiado para a área de transferência!");
  };

  if (view === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen bg-teal-main flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[30px] w-full max-sm shadow-2xl">
          <h2 className="text-xl font-black mb-6 text-center text-teal-main uppercase italic">Painel Restrito</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Digite a senha" 
              className="w-full p-4 bg-slate-100 rounded-xl text-slate-900 outline-none font-bold shadow-inner"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button className="w-full bg-teal-main text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform">Entrar</button>
            <button type="button" onClick={() => setView('home')} className="w-full text-slate-400 text-[10px] font-bold uppercase hover:text-teal-main transition-colors">Voltar</button>
          </form>
        </div>
      </div>
    );
  }

  const winnerData = winnerNumber ? numbers.find(n => n.number === winnerNumber) : null;

  return (
    <div className={`min-h-screen ${view === 'admin' ? 'bg-[#f8fafc]' : 'bg-teal-main'} pb-20 overflow-x-hidden`}>
      {paymentNumbers && !isPaymentMinimized && (
        <PaymentArea 
          numbers={paymentNumbers} 
          userName={confirmedBuyer.name}
          userPhone={confirmedBuyer.phone}
          price={rafflePrice}
          onDone={() => { setPaymentNumbers(null); localStorage.removeItem('raffle_session'); }}
          onMinimize={() => setIsPaymentMinimized(true)}
        />
      )}

      {paymentNumbers && isPaymentMinimized && (
        <button 
          onClick={() => setIsPaymentMinimized(false)}
          className="fixed bottom-24 right-6 z-[60] bg-gold text-white p-4 rounded-full shadow-2xl border-2 border-white animate-bounce flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>
          PAGAMENTO PENDENTE
        </button>
      )}

      <header className={`px-6 py-3 flex justify-between items-center max-w-lg mx-auto ${view === 'admin' ? 'bg-teal-main rounded-b-[40px] mb-6' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[10px] font-bold text-white uppercase italic tracking-wider">{winnerNumber ? 'RIFA ENCERRADA' : 'VENDAS ABERTAS'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsShareModalOpen(true)} className="w-8 h-8 bg-white/10 rounded-lg text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
          </button>
          <button 
            onClick={() => { if (view === 'admin') { setView('home'); setIsAdmin(false); } else { setView('admin'); } }}
            className="px-4 py-1.5 glass-header-btn rounded-lg text-[9px] font-black uppercase tracking-widest text-white active:bg-white/10"
          >
            {view === 'admin' ? 'VOLTAR' : 'PAINEL'}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">
        {view === 'home' ? (
          <div className="flex flex-col items-center">
            <h1 className="text-[32px] font-black italic text-gold tracking-tight leading-none text-center mb-0.5 uppercase">{raffleName}</h1>
            <p className="font-script text-[18px] text-white/90 text-center mb-3 leading-none">{raffleDescription}</p>

            {winnerNumber && (
              <div className="w-full bg-gold/20 border-2 border-gold rounded-[24px] p-6 mb-6 text-center animate-pulse">
                <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] block mb-2">🎉 TEMOS UM VENCEDOR! 🎉</span>
                <p className="text-3xl font-black text-white italic">O NÚMERO SORTEADO FOI: <span className="text-gold underline">{winnerNumber}</span></p>
                <p className="text-[9px] font-bold text-white/60 uppercase mt-3">CONFIRA O RESULTADO NA FEDERAL</p>
              </div>
            )}

            <div className="relative mt-8 mb-6 w-full max-w-[240px]">
              <div className="bg-white p-1 rounded-[36px] shadow-2xl overflow-hidden relative aspect-square">
                {prizeImages.length > 0 ? (
                  prizeImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Prêmio ${idx + 1}`} className={`absolute inset-0 w-full h-full object-cover rounded-[34px] transition-opacity duration-1000 ${idx === activeImageIndex ? 'opacity-100' : 'opacity-0'}`} />
                  ))
                ) : (
                  <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600" alt="Default" className="w-full h-full object-cover rounded-[34px]" />
                )}
              </div>
              <div className="absolute -top-3 -right-1 bg-gold text-teal-main border-[2px] border-white px-4 py-2 rounded-[18px] font-black text-[10px] shadow-xl z-10 uppercase italic transform rotate-[4deg] flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {badgeText}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-3 mb-4">
              <button onClick={() => setIsRulesModalOpen(true)} className="w-full max-w-[180px] py-2 bg-btn-blue rounded-full border border-white/10 flex items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-transform">
                <span className="bg-gold w-4 h-4 rounded-full text-teal-main flex items-center justify-center text-[9px] font-black">?</span> REGRAS DA RIFA
              </button>
              <div className="bg-gold px-5 py-2 rounded-[18px] shadow-xl shadow-black/20 flex flex-col items-center border-[1.5px] border-white/20">
                <span className="text-[7px] font-black text-white uppercase tracking-[0.2em] mb-0.5 opacity-90">VALOR DO NÚMERO</span>
                <p className="text-[22px] font-black text-white leading-none flex items-center"><span className="text-xs font-bold mr-0.5 italic">R$</span> {rafflePrice.toFixed(2).replace('.', ',')}</p>
              </div>
              <button className="w-full max-w-[300px] py-2 glass-header-btn rounded-full flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-white shadow-lg">🍀 SORTEIO PELA LOTERIA FEDERAL</button>
              <p className="text-[10px] text-white font-medium text-center leading-tight max-w-[280px] opacity-80">{drawDescription}</p>
            </div>

            <div className="w-full bg-black/10 rounded-t-[36px] rounded-b-[48px] p-5 pb-10 border border-white/5 shadow-inner flex flex-col items-center">
                <div className="w-full text-center">
                    <h2 className="text-[20px] font-black text-white tracking-tight uppercase leading-none">{winnerNumber ? 'NÚMEROS DA SORTE' : 'ESCOLHA SEUS NÚMEROS'}</h2>
                    <p className="text-[8px] font-bold text-white/50 tracking-widest uppercase mt-1">{winnerNumber ? 'A RIFA FOI FINALIZADA' : 'SELECIONE E CLIQUE EM CONFIRMAR'}</p>
                </div>
                <div className="w-full mt-5">
                  <NumberGrid numbers={numbers} selectedIds={selectedIds} onSelect={toggleNumberSelection} />
                </div>
                <p className="mt-8 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">Desenvolvido por Fábio Carneiro</p>
            </div>

            <div className="mt-6 w-full max-w-sm px-4 flex flex-col items-center gap-5">
              <button 
                onClick={() => window.open(VAKINHA_LINK, '_blank')}
                className="w-full py-5 bg-gold rounded-[24px] shadow-lg flex flex-col items-center justify-center text-center active:scale-95 transition-all"
              >
                <div className="text-white mb-1.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-[0.05em] mb-0.5">VOCÊ JÁ CONHECE A MINHA VAKINHA?</span>
                <span className="text-[14px] font-black text-white uppercase italic tracking-tight">FAÇA SUA DOAÇÃO AQUI →</span>
              </button>

              <div 
                onClick={() => window.open(VAKINHA_LINK, '_blank')}
                className="w-full bg-bordo rounded-[32px] p-6 flex flex-col items-center text-center shadow-xl border border-white/5 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
                <p className="relative z-10 font-script text-[28px] text-white leading-none mb-4">Conto com sua ajuda!</p>
                <div className="relative z-10 text-gold mb-3">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <p className="relative z-10 text-[10px] font-black text-gold uppercase tracking-[0.2em] leading-relaxed">QUE DEUS TE ABENÇOE <br/> RICAMENTE!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[40px] -mt-4 min-h-[80vh] shadow-xl p-6 relative">
            <div className="grid grid-cols-3 gap-2 mb-8 mt-2">
              <div className="bg-emerald-50 rounded-[24px] p-4 text-center border border-emerald-100 flex flex-col justify-center">
                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.1em]">ARRECADADO</span>
                <p className="text-sm font-black text-emerald-700 mt-0.5 leading-tight">R$ {stats?.totalRevenue?.toFixed(2) || '0,00'}</p>
              </div>
              <div className="bg-blue-50 rounded-[24px] p-4 text-center border border-blue-100 flex flex-col justify-center">
                <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.1em]">VENDIDOS</span>
                <p className="text-sm font-black text-blue-700 mt-0.5 leading-tight">{stats?.paid || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-[24px] p-4 text-center border border-orange-100 flex flex-col justify-center">
                <span className="text-[7px] font-black text-orange-500 uppercase tracking-[0.1em]">FALTAM</span>
                <p className="text-sm font-black text-orange-700 mt-0.5 leading-tight">{stats?.available || 0}</p>
              </div>
            </div>
            
            <div className="bg-slate-100 p-1.5 rounded-[22px] flex mb-6 shadow-inner">
              <button onClick={() => setAdminTab('pending')} className={`flex-1 py-3 rounded-[18px] text-[8px] font-black uppercase transition-all ${adminTab === 'pending' ? 'bg-teal-main text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>PENDENTES ({numbers.filter(n => n.status === RaffleStatus.RESERVADO).length})</button>
              <button onClick={() => setAdminTab('paid')} className={`flex-1 py-3 rounded-[18px] text-[8px] font-black uppercase transition-all ${adminTab === 'paid' ? 'bg-teal-main text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>VENDIDOS ({numbers.filter(n => n.status === RaffleStatus.PAGO).length})</button>
              <button onClick={() => setAdminTab('config')} className={`flex-1 py-3 rounded-[18px] text-[8px] font-black uppercase transition-all ${adminTab === 'config' ? 'bg-teal-main text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>CONFIG</button>
              <button onClick={() => setAdminTab('draw')} className={`flex-1 py-3 rounded-[18px] text-[8px] font-black uppercase transition-all ${adminTab === 'draw' ? 'bg-teal-main text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>SORTEIO</button>
            </div>

            <div className="space-y-4">
              {adminTab === 'pending' && (
                <div className="space-y-4">
                  {numbers.filter(n => n.status === RaffleStatus.RESERVADO).length === 0 ? <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Sem reservas pendentes</p> : 
                    numbers.filter(n => n.status === RaffleStatus.RESERVADO).map(n => (
                      <div key={n.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                         <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-800 uppercase">#{n.number} - {n.name}</span>
                           <span className="text-[9px] font-bold text-slate-400">{n.whatsapp}</span>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={async () => { await dbService.confirmPayment(n.id); await refreshData(); }} className="bg-green-500 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all">ACEITAR</button>
                           <button onClick={async () => { await dbService.cancelReservation(n.id); await refreshData(); }} className="bg-red-500 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all">RECUSAR</button>
                         </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {adminTab === 'paid' && (
                <div className="space-y-4">
                  {numbers.filter(n => n.status === RaffleStatus.PAGO).length > 0 && (
                    <div className="mb-4">
                      <button 
                        onClick={copySoldReport}
                        className="w-full bg-teal-main text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        COPIAR RELATÓRIO
                      </button>
                    </div>
                  )}
                  {numbers.filter(n => n.status === RaffleStatus.PAGO).length === 0 ? <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Nenhuma venda confirmada</p> : 
                    numbers.filter(n => n.status === RaffleStatus.PAGO).map(n => (
                      <div key={n.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                         <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-800 uppercase">#{n.number} - {n.name}</span>
                           <span className="text-[9px] font-bold text-slate-400">{n.whatsapp}</span>
                         </div>
                         <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">PAGO</div>
                      </div>
                    ))
                  }
                </div>
              )}

              {adminTab === 'config' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                    <h3 className="text-[11px] font-black text-teal-main uppercase mb-4 tracking-widest">IMAGENS DO PRÊMIO</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="relative aspect-square">
                          {prizeImages[i] ? (
                            <div className="w-full h-full relative">
                              <img src={prizeImages[i]} className="w-full h-full object-cover rounded-xl shadow-inner border border-slate-200" alt="Slot" />
                              <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg">×</button>
                            </div>
                          ) : (
                            <button onClick={() => openImageLinkModal(i)} className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-300 hover:text-teal-main hover:border-teal-main transition-all">+</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 space-y-5">
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NOME DA RIFA</label>
                          <div className="flex gap-2">
                            <input className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-main transition-all" value={raffleNameInput} onChange={(e) => setRaffleNameInput(e.target.value)} />
                            <button onClick={async () => { await dbService.setRaffleName(raffleNameInput); await refreshData(); alert('Nome salvo!'); }} className="bg-teal-main text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95">SALVAR</button>
                          </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DESCRIÇÃO DA RIFA (SUBTÍTULO)</label>
                          <div className="flex gap-2">
                            <input className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-main transition-all" value={raffleDescriptionInput} onChange={(e) => setRaffleDescriptionInput(e.target.value)} />
                            <button onClick={async () => { await dbService.setRaffleDescription(raffleDescriptionInput); await refreshData(); alert('Descrição salva!'); }} className="bg-teal-main text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95">SALVAR</button>
                          </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TEXTO DO SELO (PRÊMIO ESPECIAL)</label>
                          <div className="flex gap-2">
                            <input className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-main transition-all" value={badgeTextInput} onChange={(e) => setBadgeTextInput(e.target.value)} />
                            <button onClick={async () => { await dbService.setBadgeText(badgeTextInput); await refreshData(); alert('Texto do selo salvo!'); }} className="bg-teal-main text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95">SALVAR</button>
                          </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">INFO DO SORTEIO</label>
                          <div className="flex gap-2">
                            <input className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-main transition-all" value={drawDescriptionInput} onChange={(e) => setDrawDescriptionInput(e.target.value)} />
                            <button onClick={async () => { await dbService.setDrawDescription(drawDescriptionInput); await refreshData(); alert('Info salva!'); }} className="bg-teal-main text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95">SALVAR</button>
                          </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VALOR POR NÚMERO (R$)</label>
                          <div className="flex gap-2">
                            <input type="number" step="0.01" className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-main transition-all" value={rafflePriceInput} onChange={(e) => setRafflePriceInput(e.target.value)} />
                            <button onClick={async () => { await dbService.setRafflePrice(parseFloat(rafflePriceInput)); await refreshData(); alert('Preço salvo!'); }} className="bg-teal-main text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95">SALVAR</button>
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                    <h3 className="text-[11px] font-black text-teal-main uppercase mb-4 tracking-widest">TEMAS DISPONÍVEIS</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {THEMES.map(t => (
                          <button 
                            key={t.id}
                            onClick={async () => { await dbService.setLayout(t.id); applyTheme(t.id); }}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${currentThemeId === t.id ? 'border-teal-main bg-white shadow-md scale-95' : 'border-transparent bg-slate-100 opacity-60'}`}
                          >
                            <div className="flex gap-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.main }}></div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.gold }}></div>
                            </div>
                            <span className="text-[8px] font-black uppercase truncate w-full text-center">{t.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'draw' && (
                <div className="flex flex-col items-center pt-2">
                   <h2 className="text-[26px] font-black text-teal-main italic uppercase tracking-tighter mb-4">FINALIZAR RIFA</h2>
                   <div className="bg-rose-50 border border-rose-100 px-6 py-2 rounded-full mb-8">
                     <span className="text-[10px] font-black text-rose-800 uppercase tracking-[0.1em]">RESULTADO OFICIAL: LOTERIA FEDERAL</span>
                   </div>

                   {winnerNumber ? (
                     <div className="w-full max-w-sm bg-gold rounded-[48px] p-8 shadow-[0_20px_60px_rgba(242,169,34,0.3)] relative overflow-hidden border-4 border-white/20">
                        <div className="absolute right-[-20px] top-[40px] opacity-10 rotate-12 pointer-events-none">
                          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6v2H1v7c0 2.21 1.79 4 4 4h1.23c.89 2.5 3.03 4.41 5.77 4.9V22h-4v2h10v-2h-4v-2.1c2.74-.49 4.88-2.4 5.77-4.9H19c2.21 0 4-1.79 4-4V4h-5V2zM3 11V6h3v7.38C4.31 12.87 3 11.97 3 11zm18 0c0 .97-1.31 1.87-3 2.38V6h3v5z"/></svg>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                           <div className="bg-white rounded-[32px] w-28 h-28 flex items-center justify-center shadow-xl mb-6">
                             <span className="text-6xl font-black text-gold tracking-tighter">{winnerNumber}</span>
                           </div>
                           <span className="text-[11px] font-black text-teal-main/60 uppercase tracking-[0.15em] mb-1">O GANHADOR É:</span>
                           <h3 className="text-[40px] font-black text-teal-main italic tracking-tighter uppercase leading-none mb-10">{winnerData?.name || '---'}</h3>
                           <button 
                             onClick={contactWinner}
                             className="w-full bg-teal-main text-white py-5 rounded-[24px] flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
                           >
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                             CONTATAR VENCEDOR
                           </button>
                           <button 
                             onClick={handleResetWinner}
                             className="mt-8 text-[10px] font-black text-teal-main/40 uppercase tracking-[0.2em] hover:text-teal-main transition-colors font-bold"
                           >
                             REINICIAR SORTEIO
                           </button>
                        </div>
                     </div>
                   ) : (
                     <div className="w-full max-w-sm bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px] p-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-[24px] shadow-inner flex items-center justify-center mb-6">
                          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        <input 
                          type="text" 
                          maxLength={2}
                          placeholder="EX: 09"
                          className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-4xl text-slate-800 outline-none focus:border-teal-main mb-6 shadow-sm transition-all"
                          value={winnerInput}
                          onChange={(e) => setWinnerInput(e.target.value.replace(/\D/g, ''))}
                        />
                        <button 
                          onClick={handleFinishRaffle}
                          className="w-full py-5 bg-teal-main text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform"
                        >
                          FINALIZAR SORTEIO 🎉
                        </button>
                     </div>
                   )}
                </div>
              )}
            </div>
            
            <div className="mt-12 text-center pb-8">
               <button onClick={async () => { if (confirm("Isso irá apagar todos os dados da rifa permanentemente. Confirmar?")) { await dbService.resetRaffle(); await refreshData(); } }} className="text-[10px] font-black text-rose-300 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]">ZERAR TODOS OS DADOS</button>
            </div>
          </div>
        )}
      </main>

      {isImageLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="text-lg font-black text-teal-main uppercase mb-6 text-center italic tracking-tight">LINK DA IMAGEM</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-4 tracking-widest">Cole a URL direta da imagem abaixo</p>
            <input 
              autoFocus 
              type="text" 
              placeholder="https://exemplo.com/imagem.jpg" 
              className="w-full p-4 bg-slate-100 rounded-2xl text-slate-900 outline-none font-bold text-xs mb-6 border-2 border-transparent focus:border-teal-main transition-all" 
              value={imageLinkInput} 
              onChange={(e) => setImageLinkInput(e.target.value)} 
            />
            <div className="flex gap-2">
              <button onClick={() => setIsImageLinkModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
              <button onClick={saveImageLink} className="flex-1 py-4 bg-teal-main text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">SALVAR</button>
            </div>
          </div>
        </div>
      )}

      {isRulesModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="bg-teal-main w-full max-w-sm rounded-[40px] p-8 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight text-center mb-6">REGRAS DA RIFA</h3>
            <div className="space-y-4 text-[11px] font-bold text-white/80 uppercase italic leading-relaxed">
              <p>1. A rifa é composta de 100 números (00-99).</p>
              <p>2. O sorteio baseia-se no resultado oficial da Loteria Federal.</p>
              <p>3. O GANHADOR SERÁ DEFINIDO PELOS 2 ÚLTIMOS NÚMEROS DO PRIMEIRO PRÊMIO (DEZENA).</p>
              <p>4. RESERVAS TÊM VALIDADE DE 15 MINUTOS. REALIZE O PAGAMENTO, O NÃO PAGAMENTO RESULTARÁ NO CANCELAMENTO AUTOMÁTICO.</p>
              <p>5. ENVIAR COMPROVANTE PARA O ORGANIZADOR PARA CONFIRMAÇÃO DE PAGAMENTO.</p>
            </div>
            <button onClick={() => setIsRulesModalOpen(false)} className="w-full py-4 bg-gold text-white font-black text-xs rounded-2xl shadow-xl uppercase tracking-widest mt-10 active:scale-95 transition-all">ENTENDI!</button>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="bg-white rounded-[40px] w-full max-sm p-8 shadow-2xl text-center">
            <h3 className="text-xl font-black text-teal-main italic uppercase mb-2">COMPARTILHAR</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">DIVULGUE PARA SEUS AMIGOS!</p>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={shareViaWhatsApp}
                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button 
                onClick={shareViaFacebook}
                className="w-full py-4 bg-[#1877F2] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
              <button 
                onClick={copyToClipboard}
                className="w-full py-4 bg-slate-100 text-slate-800 rounded-2xl font-black flex items-center justify-center gap-3 shadow-inner active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                Copiar Link
              </button>
            </div>
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="mt-6 pt-4 w-full text-slate-400 font-black text-[10px] uppercase tracking-widest"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && view === 'home' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-6 pb-10 flex justify-center pointer-events-none">
          <div className="w-full max-w-lg pointer-events-auto">
            <button onClick={() => setIsReserving(true)} className="w-full py-5 bg-gold text-white rounded-full font-black uppercase text-sm tracking-[0.1em] shadow-2xl border-4 border-white active:scale-95 transition-transform">CONFIRMAR RESERVA ({selectedIds.length})</button>
          </div>
        </div>
      )}

      {isReserving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-teal-main rounded-[40px] w-full max-sm p-8 shadow-2xl border border-white/10 text-center">
            <h3 className="text-xl font-black text-white italic uppercase mb-6">FINALIZAR RESERVA</h3>
            <form onSubmit={handleReserve} className="space-y-4">
              <input required type="text" placeholder="SEU NOME COMPLETO" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none font-bold text-xs shadow-inner" value={reservationName} onChange={(e) => setReservationName(e.target.value)} />
              <input required type="tel" placeholder="WHATSAPP (COM DDD)" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none font-bold text-xs shadow-inner" value={reservationWhatsapp} onChange={(e) => setReservationWhatsapp(e.target.value)} />
              <button className="w-full py-5 bg-gold text-white font-black text-xs rounded-2xl shadow-xl uppercase tracking-widest mt-4 shadow-black/40 active:scale-95 transition-all">RESERVAR NÚMEROS 🎫</button>
              <button type="button" onClick={() => setIsReserving(false)} className="w-full pt-4 text-white/30 font-bold text-[10px] uppercase hover:text-white transition-colors">CANCELAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;