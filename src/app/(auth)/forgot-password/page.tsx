'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// /forgot-password
//
// Step 1 of the password-recovery flow. User enters their email; we POST
// to buildtrack-api's `/auth/forgot-password` which (a) always returns
// 200 regardless of whether the email exists — to prevent account
// enumeration — and (b) for real accounts, generates a hashed
// single-use reset token + sends a reset link via Brevo/nodemailer.
//
// We mirror that behaviour client-side: once the request resolves
// successfully we show a generic "check your email" confirmation
// regardless of whether the email was registered. Don't surface the
// underlying account-exists/doesn't-exist signal to the user.

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      // Network or 5xx — the API itself always 200s for forgot-password
      // (see backend route at src/routes/auth.ts:539), so anything we
      // see here is transport-level.
      setError(err.response?.data?.error?.message || 'Could not send reset email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">BuildTrack</h1>
          <p className="mt-2 text-sm text-gray-500">
            {submitted ? 'Check your email' : 'Reset your password'}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              If an account exists for <strong>{email}</strong>, a password reset
              link has been sent. The link expires in 1 hour.
            </div>
            <p className="text-center text-sm text-gray-500">
              Didn&apos;t receive it?{' '}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="font-medium text-blue-600 hover:underline"
              >
                Try a different email
              </button>
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-blue-600 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
              Remembered it?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
