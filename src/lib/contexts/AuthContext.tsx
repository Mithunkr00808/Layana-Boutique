'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        try {
          // Get the ID token from Firebase Client SDK
          const idToken = await user.getIdToken();
          
          // Send it to our API Route to set the HTTP-only session cookie
          await fetch('/api/auth/session', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          // Migrate any guest cart to this user
          await fetch('/api/cart/migrate', { method: 'POST' });
        } catch (error) {
          console.error("Failed to sync session cookie:", error);
        }
      } else {
        // User is logged out, clear the session cookie
        await fetch('/api/auth/logout', { method: 'POST' });
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
