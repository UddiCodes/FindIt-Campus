import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile, seedDataIfEmpty } from './store';
import { supabase } from './lib/supabase';
import type { User } from './types';

import UsernamePage from './pages/UsernamePage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportPage from './pages/ReportPage';
import MyReportsPage from './pages/MyReportsPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    seedDataIfEmpty();
    
    // Initial profile fetch
    getCurrentUserProfile().then(profile => {
      if (isMounted) {
        setUser(profile);
        setReady(true);
      }
    }).catch(err => {
      console.error('Error initializing user profile:', err);
      if (isMounted) {
        setReady(true);
      }
    });

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const profile = await getCurrentUserProfile();
        if (isMounted) {
          setUser(profile);
          setReady(true);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setReady(true);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-bold text-2xl text-[#171817] mb-3">
            FindIt<span className="text-[#C5F36B]">.</span>
          </p>
          <div className="w-5 h-5 border-2 border-[#171817] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<UsernamePage />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<Layout user={user} onLogout={() => supabase.auth.signOut()} />}>
            <Route index element={<HomePage user={user} />} />
            <Route path="/search" element={<SearchPage user={user} />} />
            <Route path="/item/:id" element={<ItemDetailPage user={user} />} />
            <Route path="/report" element={<ReportPage user={user} />} />
            <Route path="/my-reports" element={<MyReportsPage user={user} />} />
            <Route
              path="/admin"
              element={user.isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  user={user}
                  onUpdate={setUser}
                  onLogout={() => supabase.auth.signOut()}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}
