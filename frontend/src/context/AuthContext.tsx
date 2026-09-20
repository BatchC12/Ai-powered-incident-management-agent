import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User;
  isLoaded: boolean;
  switchRole: (role: User['role'], category?: string) => Promise<void>;
  logout: () => void;
}

const DEFAULT_USER: User = {
  id: 1,
  name: 'System Administrator',
  email: 'admin@itil.org',
  role: 'system_admin',
  department: 'IT Infrastructure',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ma_ims_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const isLoaded = true;

  useEffect(() => {
    // Initial login sync with backend
    api.login(user.email, 'password')
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('ma_ims_user', JSON.stringify(data.user));
        }
      })
      .catch((e) => console.warn('Local auth sync info:', e));
  }, []);

  const switchRole = async (role: User['role'], category?: string) => {
    let email = 'admin@itil.org';
    let name = 'System Administrator';

    if (role === 'end_user') {
      email = 'alex.user@enterprise.org';
      name = 'Alex Vance (End User)';
    } else if (role === 'support_staff') {
      email = category === 'network' ? 'gordon.net@enterprise.org' : 'sarah.soft@enterprise.org';
      name = category === 'network' ? 'Gordon Freeman (Network)' : 'Sarah Connor (Software)';
    } else if (role === 'problem_manager') {
      email = 'ellen.problem@enterprise.org';
      name = 'Ellen Ripley (Problem Manager)';
    } else if (role === 'it_service_manager') {
      email = 'marcus.manager@enterprise.org';
      name = 'Marcus Brody (Service Manager)';
    }

    try {
      const res = await api.login(email, 'password');
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser({ id: Date.now(), name, email, role, support_category: category });
      }
    } catch {
      setUser({ id: Date.now(), name, email, role, support_category: category });
    }
  };

  const logout = () => {
    localStorage.removeItem('ma_ims_token');
    localStorage.removeItem('ma_ims_user');
    switchRole('end_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
