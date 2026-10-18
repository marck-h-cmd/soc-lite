import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, UserCheck, LogOut, CheckCircle, ChevronDown, Lock } from 'lucide-react';
import { HashVerificationModal } from '../widgets/HashVerificationModal';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const rolesList = [
    { key: 'admin', label: 'Super Admin (Full Access)' },
    { key: 'soc_lead', label: 'SOC Lead (Tier 3)' },
    { key: 'analyst_tier2', label: 'Analista Tier 2 (Investigación)' },
    { key: 'analyst_tier1', label: 'Analista Tier 1 (Operador)' },
    { key: 'auditor', label: 'Auditor (Solo Lectura/Auditoría)' }
  ];

  return (
    <>
      <header
        style={{
          height: '65px',
          backgroundColor: 'var(--bg-navbar)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyber-cyan)', letterSpacing: '0.05em' }}>
              TELEMETRÍA SOC ACTIVA 24/7
            </span>
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            NIST CSF DE.AE & ISO 27001 A.8.15
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Botón Verificador Criptográfico */}
          <button
            onClick={() => setShowVerifyModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            title="Verificar firma criptográfica SHA-256 de la bitácora"
          >
            <Lock size={14} color="var(--cyber-cyan)" />
            Verificar SHA-256
          </button>

          {/* Selector Rápido de Rol Demo para pruebas de RBAC */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', gap: '0.35rem' }}
            >
              <UserCheck size={14} color="var(--cyber-emerald)" />
              Rol: <b>{user?.role.toUpperCase()}</b>
              <ChevronDown size={14} />
            </button>

            {showRoleMenu && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '260px',
                  padding: '0.5rem',
                  zIndex: 50,
                  backgroundColor: '#0c1222',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Cambiar Rol de Simulación (RBAC):
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      switchDemoRole(r.key);
                      setShowRoleMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      background: user?.role === r.key ? 'rgba(0, 210, 255, 0.15)' : 'transparent',
                      color: user?.role === r.key ? 'var(--cyber-cyan)' : 'var(--text-main)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span>{r.label}</span>
                    {user?.role === r.key && <CheckCircle size={14} color="var(--cyber-cyan)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Perfil del Operador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 210, 255, 0.15)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyber-cyan)'
              }}
            >
              <Shield size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                {user?.full_name || 'Operador SOC'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </span>
            </div>
          </div>

          {/* Salir */}
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <HashVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </>
  );
};
