import type { Metadata } from 'next';

// Server component wrapper so the route can export `metadata` while
// the form below stays a client component. Renders as a transparent
// pass-through.
export const metadata: Metadata = {
  title: 'Reset your password',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
