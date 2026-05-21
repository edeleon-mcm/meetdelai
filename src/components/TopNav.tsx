import { Link, NavLink } from 'react-router-dom';

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bg/90 backdrop-blur px-5 sm:px-8 py-4">
      <Link to="/" className="font-display text-xl text-ink tracking-tight">
        DELAI<span className="text-ink-faint">.</span>
      </Link>
      <div className="hidden sm:flex items-center gap-8 font-body text-sm">
        <NavTab to="/">Home</NavTab>
        <NavTab to="/intelligence">Writing</NavTab>
        <a href="mailto:hello@meetdelai.com" className="text-ink-muted hover:text-ink transition-colors">
          Contact
        </a>
      </div>
      <Link to="/?contact=1" className="btn-primary text-xs">
        Start a conversation
      </Link>
    </nav>
  );
}

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
      }
    >
      {children}
    </NavLink>
  );
}
