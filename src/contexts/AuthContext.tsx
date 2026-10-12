'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, getMe, logout as apiLogout } from '@/lib/api/auth';
import { parseApiError } from '@/lib/api/errors';
import { clearSession, getToken } from '@/lib/session';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  /** `true` quando não foi possível carregar a sessão (API fora do ar), diferente de não estar logado. */
  hasError: boolean;
  loginState: (userData: User) => void;
  /** Atualiza o usuário em memória depois de editar o perfil, sem nova chamada à API. */
  updateUserState: (userData: User) => void;
  /** Busca o usuário de novo (ex.: botão "Tentar novamente"). */
  refreshUser: () => Promise<void>;
  logoutState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      // Sem token não há sessão: evita um GET que só devolveria 401.
      setUser(getToken() ? await getMe() : null);
    } catch (error) {
      setUser(null);
      if (parseApiError(error).status === 401) {
        clearSession();
      } else {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da sessão
    refreshUser();
  }, [refreshUser]);

  const loginState = (userData: User) => {
    setUser(userData);
  };

  const logoutState = async () => {
    await apiLogout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, hasError, loginState, updateUserState: setUser, refreshUser, logoutState }}
    >
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
