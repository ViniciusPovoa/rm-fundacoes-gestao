import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; username: string; nome: string | null } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: number; username: string; nome: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthenticatedUser = (authenticatedUser: { id: number; username: string; nome: string | null } | null) => {
    setUser(authenticatedUser);
    setIsAuthenticated(Boolean(authenticatedUser));
  };

  const clearAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    const loadCurrentSession = async () => {
      try {
        const response = await api.getCurrentUser();
        applyAuthenticatedUser(response.data?.user ?? null);
      } catch (error) {
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    void loadCurrentSession();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await api.login(username, password);
    const authenticatedUser = response.data?.user ?? null;

    if (!authenticatedUser) {
      throw new Error('Não foi possível iniciar a sessão');
    }

    applyAuthenticatedUser(authenticatedUser);
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Hook para esperar carregamento da autenticação
export const useAuthLoading = () => {
  const { isLoading } = useAuth();
  return isLoading;
};
