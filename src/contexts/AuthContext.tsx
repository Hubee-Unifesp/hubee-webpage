'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, getMe, logout as apiLogout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginState: (userData: User) => void;
  logoutState: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
        } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loginState = (userData: User) => {
    setUser(userData);
  };

  const logoutState = async () => {
    await apiLogout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginState, logoutState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}