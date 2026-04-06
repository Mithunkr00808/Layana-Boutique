'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onIdTokenChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check for admin claim
          const tokenResult = await getIdTokenResult(currentUser);

          // Get the ID token from Firebase Client SDK
          const idToken = await currentUser.getIdToken();
          
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

          setIsAdmin(!!tokenResult.claims.admin);
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to sync session cookie:", error);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        // User is logged out, clear the session cookie
        await fetch('/api/auth/logout', { method: 'POST' });
      }
      
      setLoading(false);
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
    <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
