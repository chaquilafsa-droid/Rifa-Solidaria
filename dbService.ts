
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { RaffleNumber, RaffleStatus, RaffleStats } from '../types';
import { RESERVATION_LIMIT_MINUTES, RAFFLE_PRICE } from '../constants';

const supabaseUrl = 'https://kfyeunlygouatvjipcie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeWV1bmx5Z291YXR2amlwY2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzEyMzIsImV4cCI6MjA4MzY0NzIzMn0.6bpEvORrFee6dXyfDcDurGuuiKRDwkm1fqpnRkw2kfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dbService = {
  getNumbers: async (): Promise<RaffleNumber[]> => {
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data) {
      console.error("Erro Supabase:", error);
      return [];
    }

    if (data.length === 0) {
      return dbService.initializeRaffle();
    }

    const now = new Date();
    const expiredIds: number[] = [];

    // Lógica de expiração rigorosa de 15 minutos
    const numbers: RaffleNumber[] = data.map(n => {
      // Somente números RESERVADOS podem expirar. Números PAGOS são protegidos.
      if (n.status === RaffleStatus.RESERVADO && n.reserved_at) {
        const reservedAt = new Date(n.reserved_at);
        const diffMinutes = (now.getTime() - reservedAt.getTime()) / (1000 * 60);

        if (diffMinutes >= RESERVATION_LIMIT_MINUTES) {
          expiredIds.push(n.id);
          return {
            ...n,
            status: RaffleStatus.DISPONIVEL,
            name: null,
            whatsapp: null,
            reserved_at: null,
            session_id: null
          };
        }
      }
      return n;
    });

    // Sincroniza expirações de volta para o banco de dados
    if (expiredIds.length > 0) {
      await supabase
        .from('raffle_numbers')
        .update({
          status: RaffleStatus.DISPONIVEL,
          name: null,
          whatsapp: null,
          reserved_at: null,
          session_id: null
        })
        .in('id', expiredIds)
        .eq('status', RaffleStatus.RESERVADO); // Proteção extra: só limpa se ainda for reservado
    }

    return numbers;
  },

  getSetting: async (key: string, defaultValue: string): Promise<string> => {
    const { data, error } = await supabase
      .from('raffle_settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error || !data) return defaultValue;
    return data.value;
  },

  setSetting: async (key: string, value: string) => {
    await supabase.from('raffle_settings').upsert({ key, value });
  },

  getRaffleName: async (): Promise<string> => dbService.getSetting('name', 'RIFA SOLIDÁRIA!'),
  setRaffleName: async (name: string) => dbService.setSetting('name', name),

  getRaffleDescription: async (): Promise<string> => dbService.getSetting('description', 'Me ajude a custear as despesas de casa!'),
  setRaffleDescription: async (desc: string) => dbService.setSetting('description', desc),

  getDrawDescription: async (): Promise<string> => dbService.getSetting('draw_description', 'O sorteio será realizado quando todos os números forem preenchidos.'),
  setDrawDescription: async (desc: string) => dbService.setSetting('draw_description', desc),

  getBadgeText: async (): Promise<string> => dbService.getSetting('badge_text', 'PRÊMIO ESPECIAL'),
  setBadgeText: async (text: string) => dbService.setSetting('badge_text', text),

  getRafflePrice: async (): Promise<number> => {
    const val = await dbService.getSetting('price', RAFFLE_PRICE.toString());
    return parseFloat(val);
  },
  setRafflePrice: async (price: number) => dbService.setSetting('price', price.toString()),

  getLayout: async (): Promise<string> => dbService.getSetting('layout', 'default'),
  setLayout: async (themeId: string) => dbService.setSetting('layout', themeId),

  getImages: async (): Promise<string[]> => {
    const val = await dbService.getSetting('images', JSON.stringify(["https://i.postimg.cc/850khYcC/IMG_20260107_014001.png"]));
    return JSON.parse(val);
  },
  setImages: async (images: string[]) => dbService.setSetting('images', JSON.stringify(images)),

  getWinner: async (): Promise<string | null> => {
    const val = await dbService.getSetting('winner', '');
    return val || null;
  },
  setWinner: async (number: string | null) => dbService.setSetting('winner', number || ''),

  initializeRaffle: async (): Promise<RaffleNumber[]> => {
    const numbers: any[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      number: i.toString().padStart(2, '0'),
      status: RaffleStatus.DISPONIVEL,
      name: null,
      whatsapp: null,
      reserved_at: null,
      session_id: null
    }));
    
    // Deleta tudo e recria
    await supabase.from('raffle_numbers').delete().neq('id', -999);
    const { data } = await supabase.from('raffle_numbers').insert(numbers).select();
    await dbService.setWinner(null);
    return data || numbers;
  },

  reserveNumbers: async (ids: number[], name: string, whatsapp: string, sessionId: string): Promise<boolean> => {
    // Checagem atômica para evitar reservas duplicadas (double booking)
    const { data: current } = await supabase
      .from('raffle_numbers')
      .select('id, status')
      .in('id', ids);

    if (!current || current.some(n => n.status !== RaffleStatus.DISPONIVEL)) {
      return false;
    }

    const { error } = await supabase
      .from('raffle_numbers')
      .update({
        status: RaffleStatus.RESERVADO,
        name,
        whatsapp,
        reserved_at: new Date().toISOString(),
        session_id: sessionId
      })
      .in('id', ids)
      .eq('status', RaffleStatus.DISPONIVEL); // Só atualiza se ainda estiver disponível

    return !error;
  },

  confirmPayment: async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from('raffle_numbers')
      .update({
        status: RaffleStatus.PAGO,
        reserved_at: null,
        session_id: null
      })
      .eq('id', id)
      .eq('status', RaffleStatus.RESERVADO);
    
    return !error;
  },

  cancelReservation: async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from('raffle_numbers')
      .update({
        status: RaffleStatus.DISPONIVEL,
        name: null,
        whatsapp: null,
        reserved_at: null,
        session_id: null
      })
      .eq('id', id)
      .eq('status', RaffleStatus.RESERVADO);
    
    return !error;
  },

  getStats: async (): Promise<RaffleStats> => {
    // Sincroniza primeiro para garantir que estatísticas reflitam números expirados
    const numbers = await dbService.getNumbers();
    const paid = numbers.filter(n => n.status === RaffleStatus.PAGO).length;
    const reserved = numbers.filter(n => n.status === RaffleStatus.RESERVADO).length;
    const available = numbers.filter(n => n.status === RaffleStatus.DISPONIVEL).length;
    const price = await dbService.getRafflePrice();
    
    return {
      available,
      reserved,
      paid,
      totalRevenue: paid * price
    };
  },

  resetRaffle: async () => {
    await dbService.initializeRaffle();
  }
};
