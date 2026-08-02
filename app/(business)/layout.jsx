'use client';



import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/app/firebase/config'
import { checkUserSession, clearUserData } from '../auth/authContext';


// Context for child pages and EmployeeNavigationBar
const BusinessContext = createContext(null);

function BusinessProvider({ value, children }) {
  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessUser() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessUser must be used within app/(business)/layout.jsx');
  }
  return context;
}

const EmployeeNavigationBar = () => {
  const router = useRouter();
  const currentUser = useBusinessUser();

  const handleSwitchAccount = () => {
    // Add any session cleanup logic here if needed (e.g. clearUserSessionCache())
    router.push('/login');
  };


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      clearUserData(); // clears session cache, anonId, and tracked history
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = currentUser?.fullname || currentUser?.name || "Staff Member";
  const userRole = currentUser?.role || "Staff";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="w-full border-b border-white/10 px-6 py-4 flex justify-center">
      <div className="w-full max-w-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center justify-center font-medium">
            {userInitial}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-emerald-100">
              {displayName}
            </span>
            <span className="text-[10px] text-emerald-400/70 capitalize">
              {userRole}
            </span>
          </div>
        </div>

        <button 
          onClick={handleSwitchAccount}
          className="text-xs text-stone-300 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
        >
          Switch account
        </button>
          <button 
          onClick={handleSignOut}
          className="text-xs text-stone-300 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
        >
          Signout
        </button>
      </div>
    </header>
  );
};

export default function BusinessLayout({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'denied'
  const [businessUser, setBusinessUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const userData = await checkUserSession(true); // force a fresh server check

      if (cancelled) return;

      const role = userData?.user?.role;
      const allowedRoles = ['owner', 'manager', 'staff', 'merchant'];

      if (!userData?.user || !allowedRoles.includes(role)) {
        setStatus('denied');
        router.replace(`/login?callback=${encodeURIComponent('/merchant')}`);
        return;
      }

      setBusinessUser(userData.user);
      setStatus('ok');
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === 'checking') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#10231F' }}
      >
        <p style={{ color: '#B9C4BE' }}>Checking session…</p>
      </div>
    );
  }

  if (status === 'denied') {
    return null; // redirect is already in flight
  }

  return (
    <BusinessProvider value={businessUser}>
      <div style={{ backgroundColor: '#10231F' }} className="min-h-screen flex flex-col">
        {/* Render employee navigation bar at the top of every page under app/(business)/ */}
        <EmployeeNavigationBar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}