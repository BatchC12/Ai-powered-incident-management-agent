import React, { createContext, useContext, useState, useEffect } from 'react';
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
    // Sync session state from storage
    const saved = localStorage.getItem('ma_ims_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_USER);
      }
    }
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

    const updatedUser: User = {
      id: Date.now(),
      name,
      email,
      role,
      support_category: category,
      department: category ? `${category.toUpperCase()} Support` : 'IT Operations',
    };

    setUser(updatedUser);
    localStorage.setItem('ma_ims_user', JSON.stringify(updatedUser));
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
