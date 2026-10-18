import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ShieldAlert,
  LayoutDashboard,
  BellRing,
  BarChart2,
  Flame,
  FileSpreadsheet,
  UserCog,
  FileText,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasPermission } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard Central',
      icon: LayoutDashboard,
      perm: null
    },
    {
      to: '/alerts',
      label: 'Cola de Alertas',
      icon: BellRing,
      perm: 'alerts:read'
    },
    {
      to: '/triage-stats',
      label: 'Estadísticas de Triaje',
      icon: BarChart2,
      perm: 'alerts:read'
    },
    {
      to: '/incidents',
      label: 'Gestión de Incidentes',
      icon: Flame,
      perm: 'incidents:read'
    },
    {
      to: '/reports',
      label: 'Centro de Reportes',
      icon: FileSpreadsheet,
      perm: 'reports:read'
    },
    {
      to: '/rbac',
      label: 'Matriz de Roles (RBAC)',
      icon: UserCog,
      perm: 'rbac:read'
    },
    {
      to: '/audit',
      label: 'Bitácora Forense',
      icon: FileText,
      perm: 'audit:read'
    }
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00d2ff 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)'
          }}
        >
          <ShieldAlert size={22} color="#041020" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            SOC-Lite <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.2)', color: 'var(--cyber-cyan)' }}>SOAR</span>
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>
            Triaje Autónomo & IA Agéntica
          </span>
        </div>
      </div>

      {/* Navegación Principal */}
      <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Módulos Operacionales
        </div>

        {navItems.map((item) => {
          const allowed = !item.perm || hasPermission(item.perm);
          if (!allowed) {
            return null; // Ocultación dinámica exigida por R5
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(0, 210, 255, 0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--cyber-cyan)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', margin: '0 0.5rem 1rem' }}>
        <div
          className="glass-panel"
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Cpu size={14} color="var(--cyber-cyan)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Agente Cognitivo</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
            Llama3 Local + Fallback Heurístico Activo (Degraded Mode).
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--cyber-emerald)', fontWeight: 600 }}>
            ● Operación 24/7 sin caídas
          </div>
        </div>
      </div>
    </aside>
  );
};
