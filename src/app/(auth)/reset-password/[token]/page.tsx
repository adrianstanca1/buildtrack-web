'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// /reset-password/[token]
//
// Step 2 of the password-recovery flow. User arrives here from the
// email link with a single-use token. POST to /auth/reset-password
// validates the token (SHA-256 compared to refresh_tokens-style hash
// in the password_reset_tokens table) and sets the new password.
//
// Backend always validates password strength BEFORE checking token
// validity (see src/routes/auth.ts comment) so weak-password 4xx
// responses don't leak whether a token is valid. We surface
// validation errors verbatim — they're not enumeration-sensitive.

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      // Redirect to login after a short pause so the user reads the success state.
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'This reset link is no longer valid. Request a new one.',
      );
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
            {done ? 'Password updated' : 'Choose a new password'}
          </p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              Your password has been updated. Redirecting you to sign in…
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-blue-600 hover:underline"
            >
              Sign in now
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                label="New password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                minLength={8}
              />
              <Input
                type="password"
                label="Confirm new password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Update password
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
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
