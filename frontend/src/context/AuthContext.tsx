import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  switchDemoRole: (roleName: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  hasPermission: () => false,
  switchDemoRole: () => {}
});

const DEMO_USERS: Record<string, User> = {
  admin: {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "admin@soc-lite.internal",
    full_name: "Super Administrador SOC",
    role: "admin",
    permissions: [
      "alerts:read", "alerts:write", "alerts:triage", "alerts:delete",
      "incidents:read", "incidents:write", "incidents:escalate", "incidents:close",
      "reports:read", "reports:export", "users:read", "users:manage",
      "rbac:read", "rbac:manage", "audit:read", "audit:verify",
      "settings:read", "settings:manage"
    ]
  },
  soc_lead: {
    id: "a0000000-0000-0000-0000-000000000002",
    email: "lead@soc-lite.internal",
    full_name: "Carlos Mendoza (SOC Lead)",
    role: "soc_lead",
    permissions: [
      "alerts:read", "alerts:write", "alerts:triage",
      "incidents:read", "incidents:write", "incidents:escalate", "incidents:close",
      "reports:read", "reports:export", "users:read", "rbac:read",
      "audit:read", "audit:verify", "settings:read"
    ]
  },
  analyst_tier2: {
    id: "a0000000-0000-0000-0000-000000000003",
    email: "analyst2@soc-lite.internal",
    full_name: "Elena Rivas (Analista Tier 2)",
    role: "analyst_tier2",
    permissions: [
      "alerts:read", "alerts:write", "alerts:triage",
      "incidents:read", "incidents:write", "incidents:escalate", "incidents:close",
      "reports:read", "audit:read", "settings:read"
    ]
  },
  analyst_tier1: {
    id: "a0000000-0000-0000-0000-000000000004",
    email: "analyst1@soc-lite.internal",
    full_name: "Mateo Gómez (Analista Tier 1)",
    role: "analyst_tier1",
    permissions: [
      "alerts:read", "alerts:triage", "incidents:read", "reports:read", "audit:read"
    ]
  },
  auditor: {
    id: "a0000000-0000-0000-0000-000000000005",
    email: "auditor@soc-lite.internal",
    full_name: "Valeria Silva (Auditor ISO/NIST)",
    role: "auditor",
    permissions: [
      "alerts:read", "incidents:read", "reports:read", "reports:export",
      "users:read", "rbac:read", "audit:read", "audit:verify", "settings:read"
    ]
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('soc_user');
    const savedToken = localStorage.getItem('soc_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem('soc_user');
      }
    } else {
      // Iniciar sesión por defecto como Administrador para demo fluida
      const defaultUser = DEMO_USERS['admin'];
      setUser(defaultUser);
      setToken("demo-mock-jwt-token-admin");
      localStorage.setItem('soc_user', JSON.stringify(defaultUser));
      localStorage.setItem('soc_token', "demo-mock-jwt-token-admin");
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string = "Admin123!"): Promise<boolean> => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const resp = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

      if (resp.ok) {
        const data = await resp.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('soc_user', JSON.stringify(data.user));
        localStorage.setItem('soc_token', data.access_token);
        return true;
      }
    } catch {
      // Fallback a demo offline
    }

    // Si backend no responde, buscar en demo users
    const matched = Object.values(DEMO_USERS).find(u => u.email === email);
    if (matched) {
      setUser(matched);
      setToken(`demo-mock-${matched.role}`);
      localStorage.setItem('soc_user', JSON.stringify(matched));
      localStorage.setItem('soc_token', `demo-mock-${matched.role}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('soc_user');
    localStorage.removeItem('soc_token');
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(perm);
  };

  const switchDemoRole = (roleName: string) => {
    const demo = DEMO_USERS[roleName] || DEMO_USERS['admin'];
    setUser(demo);
    setToken(`demo-mock-${demo.role}`);
    localStorage.setItem('soc_user', JSON.stringify(demo));
    localStorage.setItem('soc_token', `demo-mock-${demo.role}`);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasPermission, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};
