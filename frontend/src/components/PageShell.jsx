import { Link } from 'react-router-dom';
import Logo from './Logo';

// Shared top bar for public/marketing pages
export default function PageShell({ children, footer = true }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/team" className="btn-ghost text-sm">Participants</Link>
        </nav>
      </header>

      <main className="flex-1 py-8 sm:py-12">{children}</main>

      {footer && (
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          AI Quiz Time · College Tech Competition · Phase 1 Demo
        </footer>
      )}
    </div>
  );
}
