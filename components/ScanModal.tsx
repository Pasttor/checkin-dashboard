// components/ScanModal.tsx

import { QrScanner } from './QrScanner';
import styles from './ScanModal.module.css';

interface ScanModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
}

export function ScanModal({ onClose, onScan }: ScanModalProps) {
  console.log('🔴 ScanModal render');
  return (
    <div className={styles.overlay}>
      <button onClick={onClose} className={styles.close} aria-label="Cerrar escáner">
        &times;
      </button>
      <div className={styles.scanner}>
        <QrScanner onScan={onScan} />
      </div>
    </div>
  );
}
