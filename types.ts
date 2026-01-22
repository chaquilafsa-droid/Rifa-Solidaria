
export enum RaffleStatus {
  DISPONIVEL = 'Disponível',
  RESERVADO = 'Reservado',
  PAGO = 'Pago'
}

export interface RaffleNumber {
  id: number;
  number: string;
  status: RaffleStatus;
  name?: string;
  whatsapp?: string;
  reserved_at?: string;
  session_id?: string;
}

export interface RaffleStats {
  available: number;
  reserved: number;
  paid: number;
  totalRevenue: number;
}
