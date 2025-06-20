'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/cookies';

interface EventItem {
  eventId: string;
  title: string;
  time: string;
  day: string;
  seatsRemaining: number;
}

const API_BASE = 'https://ylmwuiuh6f.execute-api.us-east-1.amazonaws.com/dev';

export default function Events() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const session = getSession();

  // Helper to extract userId from JWT
  const getUserId = () => {
    try {
      return JSON.parse(atob(session!.split('.')[1])).sub;
    } catch {
      return '';
    }
  };

  // Helper to extract userEmail from JWT
  const getUserEmail = () => {
    try {
      return JSON.parse(atob(session!.split('.')[1])).email;
    } catch {
      return '';
    }
  };

  // Fetch events and registrations on initial load
  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch events
        const eventsRes = await fetch(`${API_BASE}/events`);
        if (!eventsRes.ok) throw new Error('Failed to fetch events');
        const eventsData = await eventsRes.json();
        setEvents(eventsData);

        // Fetch registrations
        const userId = getUserId();
        if (userId) {
          const regRes = await fetch(`${API_BASE}/registrations?userId=${userId}`);
          if (!regRes.ok) throw new Error('Failed to fetch registrations');
          const regData = await regRes.json();
          setRegisteredEventIds(regData.eventIds || []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, session]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const handleBookNow = async (eventId: string) => {
    setError(null);
    const userId = getUserId();
    const userEmail = getUserEmail();

    // Find the event details
    const event = events.find(e => e.eventId === eventId);

    try {
      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          userId,
          userEmail,
          title: event?.title,
          day: event?.day,
          time: event?.time,
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();
      if (res.ok) {
        setEvents(prev => prev.map(e => e.eventId === eventId ? { ...e, seatsRemaining: e.seatsRemaining - 1 } : e));
        setRegisteredEventIds(prev => [...prev, eventId]);
        setError(null);
      } else {
        setError(result.message || 'Booking failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch and display user's registered events
  const fetchMyEvents = async () => {
    setShowMyEvents(true);
    setError(null);
    const userId = getUserId();
    if (!userId) {
      router.push('/');
      return;
    }

    try {
      const regRes = await fetch(`${API_BASE}/registrations?userId=${userId}`);
      if (!regRes.ok) throw new Error('Failed to fetch registrations');
      const regData = await regRes.json();

      const registeredIds: string[] = regData.eventIds || [];
      setRegisteredEventIds(registeredIds);
      const registeredEvents = events.filter(e => registeredIds.includes(e.eventId));
      setMyEvents(registeredEvents);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Handler to go back to all events
  const handleBackToEvents = () => {
    setShowMyEvents(false);
    setError(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
      <p className="text-xl text-gray-700">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with title and buttons */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              AWS Weekend Workshop
            </h1>
            <div className="flex gap-4 ml-auto">
              <button
                onClick={fetchMyEvents}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                My Registrations
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* My Registrations View */}
        {showMyEvents ? (
          <section className="mb-8">
            <button
              onClick={handleBackToEvents}
              className="mb-4 text-blue-700 underline hover:text-blue-900 font-semibold"
            >
              &larr; Back To Events
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              {myEvents.length > 0
                ? 'You have registered for the following events:'
                : 'You have not registered for any events.'}
            </h2>
            {myEvents.length > 0 && (
              <div className="space-y-4">
                {myEvents.map(e => (
                  <div
                    key={e.eventId}
                    className="bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 gap-4"
                  >
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                      <span className="font-semibold text-black w-24">{e.time}</span>
                      <span className="flex-1 text-gray-900">{e.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          // All events view
          <>
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
                            className={`font-semibold px-4 py-2 rounded-lg transition ${
                              e.seatsRemaining === 0 || registeredEventIds.includes(e.eventId)
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            disabled={e.seatsRemaining === 0 || registeredEventIds.includes(e.eventId)}
                          >
                            {registeredEventIds.includes(e.eventId)
                              ? 'Registered'
                              : e.seatsRemaining === 0
                              ? 'Full'
                              : 'Book Now'}
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
          </>
        )}
      </div>
    </div>
  );
}
