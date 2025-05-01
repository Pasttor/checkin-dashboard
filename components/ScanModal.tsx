// components/ScanModal.tsx
import { QrScanner } from '../components/QrScanner';

interface ScanModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
}

export function ScanModal({ onClose, onScan }: ScanModalProps) {
  console.log('🔴 ScanModal render');

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255,0,0,0.5)',  // rojo semitransparente
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
  };

  const buttonStyle: React.CSSProperties = {
    alignSelf: 'flex-end',
    margin: '1rem',
    fontSize: '2rem',
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const scannerContainerStyle: React.CSSProperties = {
    flex: 1,
  };

  return (
    <div style={overlayStyle}>
      <button onClick={onClose} style={buttonStyle} aria-label="Cerrar escáner">
        &times;
      </button>
      <div style={scannerContainerStyle}>
        <QrScanner onScan={onScan} />
      </div>
    </div>
  );
}
