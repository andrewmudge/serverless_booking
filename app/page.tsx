'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/lib/cookies';

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        saveSession(data.data.IdToken);
        router.push('/events');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      setError('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, givenName, familyName }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setStep('confirm');
        setError(null);
        alert('Check your email for confirmation code');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/confirm-signup', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        alert('Your email has been confirmed!');
        router.push('/events');
      } else {
        setError(data.error || 'Confirmation failed. Please try again.');
      }
    } catch (err: any) {
      setError('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center bg-white rounded-full px-6 py-2 shadow-lg">
              <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 15a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4M3 15V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6" />
              </svg>
              <span className="text-lg font-bold text-gray-900">AWS Weekend</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Elevate Your <span className="text-blue-600">Cloud Skills</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Join us for an intensive weekend of AWS learning. Three days of expert-led sessions covering serverless architecture, containers, security, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <svg className="h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <h3 className="text-lg font-semibold mb-1">3 Days</h3>
              <p className="text-gray-600 text-sm">Friday to Sunday intensive learning</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <svg className="h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
              </svg>
              <h3 className="text-lg font-semibold mb-1">Expert Speakers</h3>
              <p className="text-gray-600 text-sm">Learn from AWS certified professionals</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <svg className="h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 8v8M8 12h8" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <h3 className="text-lg font-semibold mb-1">Hands-on Learning</h3>
              <p className="text-gray-600 text-sm">Practical sessions and real-world examples</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="flex-1 flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reserve Your Spot</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create your account to browse sessions and book your preferred time slots. Limited seats available for each session.
          </p>
        </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Join AWS Weekend</h3>
          <p className="text-gray-600 text-sm mb-4">
            Sign in to your account or create a new one to book your sessions
          </p>
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 rounded-l-lg border ${mode === 'login' ? 'bg-blue-50 font-semibold border-blue-600 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
              onClick={() => { setMode('login'); setStep('register'); setError(null); }}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded-r-lg border-t border-b border-r ${mode === 'register' ? 'bg-blue-50 font-semibold border-blue-600 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
              onClick={() => { setMode('register'); setStep('register'); setError(null); }}
              disabled={loading}
            >
              Register
            </button>
          </div>

          {mode === 'login' && (
            <>
              <input
                type="email"
                placeholder="Email"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {error && <div className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{error}</div>}
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={handleLogin}
                disabled={loading || !email || !password}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </>
          )}

          {mode === 'register' && step === 'register' && (
            <>
              <input
                type="text"
                placeholder="First Name"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {error && <div className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{error}</div>}
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={handleRegister}
                disabled={loading || !email || !password || !givenName || !familyName}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </>
          )}

          {mode === 'register' && step === 'confirm' && (
            <>
              <input
                type="text"
                placeholder="Confirmation Code"
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />
              {error && <div className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{error}</div>}
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={handleConfirm}
                disabled={loading || !code}
              >
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
