import type { Metadata } from 'next';

// Server component wrapping the client form so the route can export its
// own `metadata`. Renders as a transparent pass-through — no DOM
// wrapper — so it doesn't affect the form's styling.
export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
