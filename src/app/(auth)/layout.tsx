// Bare auth-segment layout — per-page titles are set by each route's
// own layout.tsx (server component) so /login and /register can have
// distinct tab titles even though the page bodies are client components.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
