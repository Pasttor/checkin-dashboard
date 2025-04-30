// pages/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Modal } from '@/components/Modal/Modal';
import { QrScanner } from '@/components/QrScanner/QrScanner';

interface Attendee {
  id: string;
  name: string;
  checked_in: boolean;
}

export default function HomePage() {
  const router = useRouter();

  // 1) Estados
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // 2) Cargar asistentes
  const fetchAttendees = async () => {
    try {
      const res = await fetch(`/api/attendees?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      setAttendees(json.attendees || []);
    } catch (err) {
      console.error('Error fetching attendees:', err);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  // 3) Escaneo de QR → check-in
  const handleScan = async (code: string) => {
    const parts = code.split('/');
    const id = parts[parts.length - 1];
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setIsScanning(false);
      fetchAttendees();
    } catch (err) {
      console.error('Error during check-in:', err);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nombre del Evento</h1>
        <button
          onClick={() => setIsScanning(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          Escanear QR
        </button>
      </header>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar asistentes..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyUp={e => e.key === 'Enter' && fetchAttendees()}
        />
      </div>

      {/* Lista de asistentes */}
      <ul className="space-y-3">
        {attendees.length === 0 && (
          <li className="text-center text-gray-500">No hay asistentes registrados.</li>
        )}
        {attendees.map(a => (
          <li
            key={a.id}
            className="flex items-center justify-between bg-white shadow-sm rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <span
                className={`h-3 w-3 rounded-full mr-3 ${
                  a.checked_in ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-800 font-medium">{a.name}</span>
            </div>
            <button
              onClick={() => router.push(`/attendees/${a.id}`)}
              className="text-gray-400 hover:text-gray-600"
            >
              →{/* o un ícono SVG */}
            </button>
          </li>
        ))}
      </ul>

      {/* Modal de escaneo */}
      {isScanning && (
        <Modal onClose={() => setIsScanning(false)}>
          <QrScanner onScan={handleScan} />
        </Modal>
      )}
    </main>
  );
}
