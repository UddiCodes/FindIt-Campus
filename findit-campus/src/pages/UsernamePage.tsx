import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UsernamePage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    
    const trimEmail = email.trim();
    const trimPass = password.trim();
    
    if (!trimEmail || !trimPass) {
      setError('Email and password are required.');
      return;
    }

    if (trimPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const trimUser = username.trim().toLowerCase().replace(/\s+/g, '_');
        if (!trimUser) {
          setError('Username is required for sign up.');
          setLoading(false);
          return;
        }
        if (trimUser.length > 30) {
          setError('Username must be 30 characters or fewer.');
          setLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: trimEmail,
          password: trimPass,
          options: {
            data: {
              username: trimUser,
            }
          }
        });
        
        if (signUpError) {
          setError(signUpError.message);
        } else if (signUpData.user && !signUpData.session) {
          // Attempt immediate sign in if session wasn't returned automatically
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: trimEmail,
            password: trimPass,
          });

          if (signInErr) {
            setInfo('Account created! If email confirmation is enabled in your Supabase project, please check your email inbox to confirm your account, or turn off "Confirm email" in Supabase Dashboard -> Authentication -> Providers -> Email.');
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimEmail,
          password: trimPass,
        });

        if (signInError) {
          setError(signInError.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#DDDDD8] px-6 py-4">
        <p className="font-display font-bold text-lg text-[#171817]">
          FindIt<span className="text-[#C5F36B]">.</span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-3">Welcome</p>
          <h1 className="font-display font-bold text-3xl text-[#171817] mb-2">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-[#6B6C6A] mb-8">
            {isSignUp ? 'Enter your details to get started.' : 'Sign in to your account.'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-2">
                  Email
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setInfo(''); }}
                  placeholder="name@university.edu"
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    error ? 'border-red-400' : 'border-[#DDDDD8]'
                  } focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] transition-colors`}
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="username-input" className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-2">
                    Username
                  </label>
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); setInfo(''); }}
                    placeholder="e.g. priya_sharma"
                    maxLength={31}
                    className={`w-full px-4 py-3 text-sm bg-white border ${
                      error ? 'border-red-400' : 'border-[#DDDDD8]'
                    } focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] transition-colors`}
                  />
                </div>
              )}

              <div>
                <label htmlFor="password-input" className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-2">
                  Password
                </label>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); setInfo(''); }}
                  placeholder="•••••••• (min 6 characters)"
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    error ? 'border-red-400' : 'border-[#DDDDD8]'
                  } focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] transition-colors`}
                />
              </div>
            </div>

            {error && (
              <p id="auth-error" className="flex items-start gap-1.5 text-xs text-red-500 mt-4 leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> <span>{error}</span>
              </p>
            )}

            {info && (
              <p id="auth-info" className="flex items-start gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 p-3 mt-4 leading-relaxed">
                <CheckCircle size={14} className="shrink-0 mt-0.5 text-blue-600" /> <span>{info}</span>
              </p>
            )}
            
            <button
              id="auth-continue-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#171817] text-[#F5F5F0] text-sm font-semibold hover:bg-[#C5F36B] hover:text-[#171817] transition-colors mt-6 disabled:opacity-70"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <p className="text-sm text-center text-[#6B6C6A] mt-6">
            {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setInfo(''); }}
              className="font-semibold text-[#171817] hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
