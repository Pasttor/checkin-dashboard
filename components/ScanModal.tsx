// components/ScanModal.tsx
import { ReactNode } from 'react';
import { QrScanner } from '@/components/QrScanner/QrScanner';

interface ScanModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
}

export function ScanModal({ onClose, onScan }: ScanModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col"
      // clic fuera no cierra (salvo el botón)
    >
      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        className="self-end m-4 text-white text-3xl"
        aria-label="Cerrar escáner"
      >
        ×
      </button>

      {/* Contenedor del scanner ocupa todo lo que queda */}
      <div className="flex-1">
        <QrScanner onScan={onScan} />
      </div>
    </div>
  );
}
