
import React from 'react';
import { RaffleNumber, RaffleStatus } from '../types';

interface NumberGridProps {
  numbers: RaffleNumber[];
  selectedIds: number[];
  onSelect: (n: RaffleNumber) => void;
}

const NumberGrid: React.FC<NumberGridProps> = ({ numbers, selectedIds, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-x-2 gap-y-3 px-2">
      {numbers.map((n) => {
        const isSelected = selectedIds.includes(n.id);
        
        let style = "bg-gold text-white number-btn-shadow";
        
        if (n.status === RaffleStatus.RESERVADO) {
          style = "bg-white/10 text-white/20 cursor-not-allowed opacity-50";
        } else if (n.status === RaffleStatus.PAGO) {
          style = "bg-black/20 text-white/10 cursor-not-allowed";
        } else if (isSelected) {
          style = "bg-white text-gold scale-105 z-10 shadow-lg ring-2 ring-white/40";
        }

        return (
          <button
            key={n.id}
            disabled={n.status !== RaffleStatus.DISPONIVEL}
            onClick={() => onSelect(n)}
            className={`${style} h-12 w-full rounded-xl flex items-center justify-center font-black text-lg transition-all active:scale-95`}
          >
            {n.number}
          </button>
        );
      })}
    </div>
  );
};

export default NumberGrid;
