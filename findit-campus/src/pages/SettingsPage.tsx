import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface SettingsPageProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

export default function SettingsPage({ user, onUpdate, onLogout }: SettingsPageProps) {
  const [username, setUsername] = useState(user.username);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmed) { setError('Username cannot be empty.'); return; }
    if (trimmed.length > 30) { setError('Must be 30 characters or fewer.'); return; }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const updated: User = { ...user, username: trimmed };
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setError('');
  }

  function handleLogout() {
    onLogout();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#DDDDD8]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Account</p>
        <h1 className="font-display font-bold text-3xl text-[#171817]">Settings</h1>
      </div>

      {/* Username */}
      <div className="mb-10">
        <h2 className="font-display font-semibold text-lg text-[#171817] mb-4">Username</h2>
        <form onSubmit={handleSave} noValidate>
          <label htmlFor="settings-username" className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5">
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              id="settings-username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); setSaved(false); }}
              maxLength={31}
              className={`flex-1 px-4 py-2.5 text-sm bg-white border ${error ? 'border-red-400' : 'border-[#DDDDD8]'} focus:border-[#171817] outline-none text-[#171817] transition-colors`}
            />
            <button
              id="save-username-btn"
              type="submit"
              className="px-5 py-2.5 bg-[#171817] text-[#F5F5F0] text-sm font-medium hover:bg-[#C5F36B] hover:text-[#171817] transition-colors"
            >
              Save
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5 flex gap-1 items-center"><AlertCircle size={11} />{error}</p>}
          {saved && <p className="text-xs text-green-600 mt-1.5 flex gap-1 items-center"><CheckCircle size={11} />Username updated.</p>}
        </form>
      </div>

      {/* About */}
      <div className="mb-10 py-6 border-t border-b border-[#DDDDD8]">
        <h2 className="font-display font-semibold text-lg text-[#171817] mb-3">About</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-4">
            <dt className="text-[#6B6C6A] w-28 shrink-0">Version</dt>
            <dd className="text-[#171817]">1.0.0</dd>
          </div>
          <div className="flex gap-4">
            <dt className="text-[#6B6C6A] w-28 shrink-0">Platform</dt>
            <dd className="text-[#171817]">Web (Supabase)</dd>
          </div>
          <div className="flex gap-4">
            <dt className="text-[#6B6C6A] w-28 shrink-0">Data</dt>
            <dd className="text-[#171817]">Stored securely in the cloud via Supabase.</dd>
          </div>
        </dl>
      </div>

      {/* Logout */}
      <div>
        <h2 className="font-display font-semibold text-lg text-[#171817] mb-3">Session</h2>
        <p className="text-sm text-[#6B6C6A] mb-4">Logging out will clear your session. Your reports remain saved.</p>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="px-5 py-2.5 border border-[#DDDDD8] text-sm font-medium text-[#6B6C6A] hover:border-red-400 hover:text-red-500 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
