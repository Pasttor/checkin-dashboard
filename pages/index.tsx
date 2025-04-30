// pages/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ScanModal } from '../components/ScanModal';

interface Attendee {
  id: string;
  name: string;
  checked_in: boolean;
}

export default function HomePage() {
  const router = useRouter();

  // Estados
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Carga de asistentes
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

  // Manejo del escaneo
  const handleScan = async (code: string) => {
    const id = code.split('/').pop()!;
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
    <>
      <main className="bg-white h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h1 className="text-lg font-bold uppercase text-gray-800">Nombre del Evento</h1>
          <button
            onClick={() => setIsScanning(true)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Escanear QR"
          >

          </button>
        </header>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-200 relative">
          <input
            type="text"
            placeholder="Buscar asistentes..."
            className="w-full pr-10 text-gray-700 placeholder-gray-400 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && fetchAttendees()}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-4 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Lista de asistentes */}
        <ul className="flex-1 overflow-auto">
          {attendees.length === 0 && (
            <li className="px-4 py-3 text-center text-gray-500">
              No hay asistentes registrados.
            </li>
          )}
          {attendees.map(a => (
            <li
              key={a.id}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-200"
            >
              <div className="flex items-center">
                <span
                  className={`h-2 w-2 rounded-full mr-3 ${
                    a.checked_in ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                />
                <span className="text-gray-900">{a.name}</span>
              </div>
              <button
                onClick={() => router.push(`/attendees/${a.id}`)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Ver detalle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {/* Modal de escaneo full-screen */}
      {isScanning && (
        <ScanModal onClose={() => setIsScanning(false)} onScan={handleScan} />
      )}
    </>
  );
}
