// components/ScanModal.tsx

import { useEffect } from 'react';
import { QrScanner }  from './QrScanner';
import styles         from './ScanModal.module.css';

interface ScanModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
  eventName: string;
}

export function ScanModal({
  onClose,
  onScan,
  eventName,
}: ScanModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      {/* Barra superior */}
      <div className={styles.header}>
        <div className={styles.title}>{eventName}</div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Cerrar escáner"
        >
          &times;
        </button>
      </div>

      {/* Contenedor del scanner */}
      <div className={styles.scannerContainer}>
        {/* Texto guía */}
        <p className={styles.guideText}>Place QR code inside this area</p>

        {/* Guía de esquinas */}
        <div className={styles.guide}>
          <span className={`${styles.corner} ${styles.topLeft}`} />
          <span className={`${styles.corner} ${styles.topRight}`} />
          <span className={`${styles.corner} ${styles.bottomLeft}`} />
          <span className={`${styles.corner} ${styles.bottomRight}`} />
        </div>

        {/* Cámara / lector */}
        <QrScanner onScan={onScan} />
      </div>
    </div>
  );
}

