'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, getMe, logout as apiLogout } from '@/lib/api/auth';
import { parseApiError } from '@/lib/api/errors';
import { clearSession, getToken } from '@/lib/session';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  /** `true` quando não foi possível carregar a sessão (API fora do ar), diferente de não estar logado. */
  hasError: boolean;
  /** `true` depois do logout, até a rota mudar (evita redirecionar ao login enquanto a ida para a home acontece). */
  sessionEnded: boolean;
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
  const [sessionEnded, setSessionEnded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // O logout só vale para a página de onde a pessoa saiu. Se a rota mudou (ida para a home, ou o Voltar do
  // navegador de volta para uma página logada), a sessão encerrada deixa de "segurar" a tela em branco e
  // o RequireSession volta a mandar para o login. Ajuste durante a renderização, sem useEffect.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setSessionEnded(false);
  }

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setSessionEnded(false);
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
    setSessionEnded(false);
    setUser(userData);
  };

  const logoutState = async () => {
    await apiLogout();
    setSessionEnded(true);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, hasError, sessionEnded, loginState, updateUserState: setUser, refreshUser, logoutState }}
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
