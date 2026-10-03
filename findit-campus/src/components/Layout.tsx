import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Settings, Menu, X, LogOut } from 'lucide-react';
import type { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  const navLinks = [
    { to: '/search', label: 'Browse Items' },
    { to: '/report', label: 'Report an Item' },
    { to: '/my-reports', label: 'My Reports' },
    ...(user.isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="bg-[#F5F5F0] border-b border-[#DDDDD8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Wordmark */}
            <Link
              to="/"
              className="font-display text-[#171817] font-bold text-lg tracking-tight leading-none"
            >
              FindIt<span className="text-[#C5F36B]">.</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'text-[#171817]'
                        : 'text-[#6B6C6A] hover:text-[#171817]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-[#6B6C6A]">
                @{user.username}
              </span>
              <Link
                to="/settings"
                className="w-8 h-8 rounded-full bg-[#171817] text-[#F5F5F0] flex items-center justify-center text-xs font-display font-bold uppercase hover:bg-[#C5F36B] hover:text-[#171817] transition-colors"
                aria-label="Settings"
              >
                {user.username.charAt(0).toUpperCase()}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[#171817]"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#DDDDD8] bg-[#F5F5F0] px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-sm font-medium ${
                    isActive ? 'text-[#171817]' : 'text-[#6B6C6A]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-[#DDDDD8] flex items-center justify-between">
              <span className="text-sm text-[#6B6C6A]">@{user.username}</span>
              <div className="flex gap-3">
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="text-[#6B6C6A] hover:text-[#171817]">
                  <Settings size={18} />
                </Link>
                <button onClick={handleLogout} className="text-[#6B6C6A] hover:text-[#171817]">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Page Content ─────────────────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-[#DDDDD8] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="font-display font-bold text-lg text-[#171817] mb-2">
                FindIt<span className="text-[#C5F36B]">.</span>
              </p>
              <p className="text-sm text-[#6B6C6A] leading-relaxed max-w-xs">
                The campus lost & found platform. Report, browse, and recover items — no login hassle.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-3">Navigate</p>
              <ul className="space-y-2">
                {[
                  { to: '/search', label: 'Browse Items' },
                  { to: '/report', label: 'Report an Item' },
                  { to: '/my-reports', label: 'My Reports' },
                  { to: '/settings', label: 'Settings' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-[#6B6C6A] hover:text-[#171817] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-3">Campus Community</p>
              <p className="text-sm text-[#6B6C6A] leading-relaxed">
                Data is stored locally on your device. Clearing your browser data will remove all records. FindIt Campus v1.0.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#DDDDD8]">
            <p className="text-xs text-[#6B6C6A]">© 2026 FindIt Campus. Student Council Initiative.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
