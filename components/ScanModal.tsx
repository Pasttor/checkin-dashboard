// components/ScanModal.tsx

import { QrScanner } from '@/components/QrScanner';

interface ScanModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
}

export function ScanModal({ onClose, onScan }: ScanModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col"
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="self-end m-4 text-white text-3xl"
        aria-label="Cerrar escáner"
      >
        &times;
      </button>

      {/* Contenedor del scanner */}
      <div className="flex-1">
        <QrScanner onScan={onScan} />
      </div>
    </div>
  );
}
