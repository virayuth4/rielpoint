'use client'
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import authenticatedFetch from './authenticatedFetch';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { auth } from '../firebase/config';



export const AuthContext = createContext({
  currentUser: null,
  currentSession: null,
  loading: true,
  anonId: null,
  login: async () => {},
  logout: async () => {}
});

// Function to generate random integer anonymous ID
const generateAnonId = () => {
  // Generate a random integer between 100000 and 999999999
  return Math.floor(100000 + Math.random() * 900000000);
};

const sendUniqueAnonIdToServer = async (anonId) => {
 try{
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/anonId`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ anonId })
  });
 } catch (error) {
    console.error('Failed to send anonymous ID to server:', error);
 }
 
};
  

let cachedUserSessionPromise = null;

export const invalidateUserSessionCache = () => {
  cachedUserSessionPromise = null;
};

export const getUserId = (user) => user?.id ?? null;

export const checkUserSession = async (forceRefresh = false) => {
  // 1. Check in-memory promise
  if (cachedUserSessionPromise && !forceRefresh) {
    return cachedUserSessionPromise;
  }

  // 2. Check sessionStorage if not forcing a refresh
  if (!forceRefresh && typeof window !== 'undefined') {
    const cachedData = sessionStorage.getItem('user_session_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Ensure cache isn't older than 5 minutes
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          return parsed.data;
        }
      } catch (e) {
        sessionStorage.removeItem('user_session_cache');
      }
    }
  }

  // 3. Fetch from server and store in both places
  cachedUserSessionPromise = (async () => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/user/profile`,
        { method: 'GET', credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Save to sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'user_session_cache',
            JSON.stringify({ data, timestamp: Date.now() })
          );
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      return null;
    }
  })();

  return cachedUserSessionPromise;
};

export const clearUserData = () => {
  try {
    clearUserSessionCache();
    localStorage.removeItem('anonId');
    localStorage.removeItem('event_tracker_history');
    sessionStorage.removeItem('user_session_cache');
    fetch('/api/session', { method: 'DELETE' }).catch(() => {}); // ← add
    console.log('User data cleared');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Helper function to clear cache on logout
export const clearUserSessionCache = () => {
  cachedUserSessionPromise = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('user_session_cache');
  }
};

export const getUserPrefrences = async () => {
  try {
    const eventHistory = localStorage.getItem('event_tracker_history');
     // Return empty preferences if no history exists
    if (!eventHistory) {
      console.log('No event tracking history found in localStorage');
      return {
        tagPreferences: {},
        categoryPreferences: {},
        priceRanges: {
          min: 0,
          max: 0,
          preferred: 0
        },
        recentlyViewed: []
      };
    }
    // Parse the event history from JSON
    const events = JSON.parse(eventHistory);
    console.log('Event history loaded from localStorage:', events);
  } catch (e) {
    console.error('Failed to fetch user preferences:', e);
  }
}


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anonId, setAnonId] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const fetchInitialSession = async () => {
      console.log("AuthProvider Mounted")
      const userData = await checkUserSession();
      setCurrentUser(userData?.user ?? null);
      setCurrentSession(userData?.session ?? null);

      if (!userData) {
        let storedAnonId = localStorage.getItem('anonId');
        if (!storedAnonId) {
          storedAnonId = generateAnonId();
          localStorage.setItem('anonId', storedAnonId);
        }
        setAnonId(storedAnonId);
      }

      setLoading(false);
    };

    fetchInitialSession();
  }, []);

useEffect(() => {
  
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
        } else {
          await fetch('/api/session', { method: 'DELETE' });
        }
      } catch (err) {
        console.error('Failed to sync session cookie:', err);
      }
    });
    return () => unsubscribe();
  }, []);


  const createAndSetCurrentUserManually = async (result) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/create-user-profile`, {
        method: "POST",
        credential: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: result.email })
      })
      
      const userData = await response.json();
      if (userData) {
        setCurrentUser(userData);
        // Clear anonId from state when user logs in
        setAnonId(null);
        setLoading(false);
        return userData;
      }
      return null;
    
    } catch (e) {
      console.error(`Unexpected Error with while create and set current user manually ${e}`)
    }
  }

 const setCurrentUserManually = async () => {
  try {
    const userData = await checkUserSession(true); // { user, session } or null
    
    if (userData) {
      setCurrentUser(userData.user);
      setCurrentSession(userData.session);
      setAnonId(null);
      setLoading(false);
      return userData.user; // return just the user, matching what callers expect
    }

    if (!anonId) {
      let storedAnonId = localStorage.getItem('anonId');
      if (!storedAnonId) {
        storedAnonId = generateAnonId();
        localStorage.setItem('anonId', storedAnonId);
      }
      setAnonId(storedAnonId);
    }

    return null;
  } catch (error) {
    console.error('Error in setCurrentUserManually', error);
    return null;
  }
};



  const getAnonId = () => {
  try {
    // Try to get existing anonId from localStorage
    let storedAnonId = localStorage.getItem('anonId');
    
    // If no anonId exists in localStorage, generate and store a new one
    if (!storedAnonId) {
      storedAnonId = generateAnonId().toString();
      localStorage.setItem('anonId', storedAnonId);
    }
    
    // Convert to number if it's a string
    return parseInt(storedAnonId, 10);
  } catch (error) {
    console.error('Error getting anonymous ID:', error);
    // Fallback: generate a new ID without storing it
    return generateAnonId();
  }
};

  // Function to clear anonId (can be used during logout)
  const clearAnonId = () => {
    localStorage.removeItem('anonId');
    setAnonId(null);
  };

  // Function to regenerate anonId
  const regenerateAnonId = () => {
    const newAnonId = generateAnonId();
    localStorage.setItem('anonId', newAnonId);
    setAnonId(newAnonId);
    return newAnonId;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      currentSession,
      loading,
      anonId,
      getAnonId,
      setCurrentUserManually,
      createAndSetCurrentUserManually,
      clearAnonId,
      regenerateAnonId,
      getUserPrefrences,
      getUserId,
      clearUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};