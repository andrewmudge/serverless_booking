'use client';
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, givenName, familyName }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setStep('confirm');
        alert('Check your email for confirmation code');
      } else {
        alert('Signup error: ' + data.error);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Unexpected error: ' + err.message);
      } else {
        alert('Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/confirm-signup', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        alert('Your email has been confirmed');
        window.location.href = '/events';
      } else {
        alert('Confirmation error: ' + data.error);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Unexpected error: ' + err.message);
      } else {
        alert('Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {step === 'register' ? (
        <>
          <input
            type="text"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            placeholder="First Name"
            disabled={loading}
          />
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Last Name"
            disabled={loading}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
          />
          <button
            onClick={handleRegister}
            disabled={
              loading ||
              !email ||
              !password ||
              !givenName ||
              !familyName
            }
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Confirmation Code"
            disabled={loading}
          />
          <button onClick={handleConfirm} disabled={loading || !code}>
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </>
      )}
    </div>
  );
}
