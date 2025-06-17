'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/cookies';

interface EventItem {
  eventId: string;
  title: string;
  time: string;
  day: string;
  seatsRemaining: number; // updated property name
}

export default function Events() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const session = getSession();

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    const fetchEvents = async () => {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data);
      setLoading(false);
    };

    fetchEvents();
  }, [router, session]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const handleBookNow = async (eventId: string) => {
    const userId = JSON.parse(atob(session!.split('.')[1])).sub;

    const res = await fetch('/api/book', {
      method: 'POST',
      body: JSON.stringify({ eventId, userId }),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      setEvents(prev => prev.map(e => e.eventId === eventId ? { ...e, seatsRemaining: e.seatsRemaining - 1 } : e));
    } else {
      alert(result.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
      <p className="text-xl text-gray-700">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            AWS Weekend Workshop
          </h1>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Logout
          </button>
        </header>

        {['Friday', 'Saturday', 'Sunday'].map(day => {
          const daily = events.filter(e => e.day === day);
          if (daily.length === 0) return null;

          return (
            <section key={day} className="mb-8">
              <h2 className="text-2xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">{day}</h2>
              <div className="space-y-4">
                {daily.map(e => (
                  <div
                    key={e.eventId}
                    className="bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 gap-4"
                  >
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                      <span className="font-semibold text-black w-24">{e.time}</span>
                      <span className="flex-1 text-gray-900">{e.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleBookNow(e.eventId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                        disabled={e.seatsRemaining === 0}
                      >
                        {e.seatsRemaining === 0 ? 'Full' : 'Book Now'}
                      </button>
                      <span className="text-gray-500 text-sm min-w-[120px] text-right">
                        {typeof e.seatsRemaining === 'number' ? `${e.seatsRemaining} seats remaining` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
