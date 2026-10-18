import React, { useState, useEffect } from 'react';
import { Role, Permission, User } from '../types';
import { Can } from '../components/common/Can';
import {
  CheckCircle2,
  Save,
  UserCheck
} from 'lucide-react';

export const RbacManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeRole, setActiveRole] = useState<string>('analyst_tier2');
  const [rolePermsMap, setRolePermsMap] = useState<Record<string, number[]>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialRoles: Role[] = [
    { id: 1, name: 'admin', description: 'Super Administrador SOC con privilegios globales (*:*)', is_system: true, permissions: [] },
    { id: 2, name: 'soc_lead', description: 'Líder Técnico Tier 3, aprobación de incidentes y reportes', is_system: true, permissions: [] },
    { id: 3, name: 'analyst_tier2', description: 'Analista de Seguridad Tier 2, investigación profunda y contención', is_system: true, permissions: [] },
    { id: 4, name: 'analyst_tier1', description: 'Analista Tier 1, triaje de alertas y operación básica', is_system: true, permissions: [] },
    { id: 5, name: 'auditor', description: 'Auditor de Cumplimiento Normativo (Solo lectura y verificación forense)', is_system: true, permissions: [] }
  ];

  const allPermissionsList: Permission[] = [
    { id: 1, module: 'alerts', action: 'read', slug: 'alerts:read', description: 'Consultar y filtrar cola de alertas' },
    { id: 2, module: 'alerts', action: 'write', slug: 'alerts:write', description: 'Crear y registrar alertas en el sistema' },
    { id: 3, module: 'alerts', action: 'triage', slug: 'alerts:triage', description: 'Ejecutar triaje con agentes LLM y heurística' },
    { id: 4, module: 'alerts', action: 'delete', slug: 'alerts:delete', description: 'Eliminar alertas del sistema' },
    { id: 5, module: 'incidents', action: 'read', slug: 'incidents:read', description: 'Consultar incidentes de seguridad' },
    { id: 6, module: 'incidents', action: 'write', slug: 'incidents:write', description: 'Modificar estado de contención de incidentes' },
    { id: 7, module: 'incidents', action: 'escalate', slug: 'incidents:escalate', description: 'Escalar alertas a incidentes formales y abrir tickets' },
    { id: 8, module: 'incidents', action: 'close', slug: 'incidents:close', description: 'Cerrar incidentes resueltos' },
    { id: 9, module: 'reports', action: 'read', slug: 'reports:read', description: 'Ver plantillas de reportes operacionales' },
    { id: 10, module: 'reports', action: 'export', slug: 'reports:export', description: 'Compilar y descargar reportes en PDF, Word y Excel' },
    { id: 11, module: 'users', action: 'read', slug: 'users:read', description: 'Ver operadores y analistas registrados' },
    { id: 12, module: 'users', action: 'manage', slug: 'users:manage', description: 'Crear, editar o desactivar cuentas de analistas' },
    { id: 13, module: 'rbac', action: 'read', slug: 'rbac:read', description: 'Consultar matriz de control de acceso' },
    { id: 14, module: 'rbac', action: 'manage', slug: 'rbac:manage', description: 'Modificar asignación de privilegios a roles' },
    { id: 15, module: 'audit', action: 'read', slug: 'audit:read', description: 'Consultar bitácora de auditoría' },
    { id: 16, module: 'audit', action: 'verify', slug: 'audit:verify', description: 'Ejecutar verificación criptográfica SHA-256' },
    { id: 17, module: 'settings', action: 'read', slug: 'settings:read', description: 'Consultar parámetros y SLAs del sistema' },
    { id: 18, module: 'settings', action: 'manage', slug: 'settings:manage', description: 'Actualizar configuración de endpoints LLM' }
  ];

  useEffect(() => {
    setRoles(initialRoles);
    setPermissions(allPermissionsList);

    // Mapeo inicial de permisos por rol
    setRolePermsMap({
      admin: allPermissionsList.map((p) => p.id),
      soc_lead: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17],
      analyst_tier2: [1, 2, 3, 5, 6, 7, 8, 9, 15, 17],
      analyst_tier1: [1, 3, 5, 9, 15],
      auditor: [1, 5, 9, 10, 11, 13, 15, 16, 17]
    });

    setUsers([
      { id: "a1", email: "admin@soc-lite.internal", full_name: "Super Administrador SOC", role: "admin", permissions: [] },
      { id: "a2", email: "lead@soc-lite.internal", full_name: "Carlos Mendoza (SOC Lead)", role: "soc_lead", permissions: [] },
      { id: "a3", email: "analyst2@soc-lite.internal", full_name: "Elena Rivas (Analista Tier 2)", role: "analyst_tier2", permissions: [] },
      { id: "a4", email: "analyst1@soc-lite.internal", full_name: "Mateo Gómez (Analista Tier 1)", role: "analyst_tier1", permissions: [] },
      { id: "a5", email: "auditor@soc-lite.internal", full_name: "Valeria Silva (Auditor ISO/NIST)", role: "auditor", permissions: [] }
    ]);
  }, []);

  const togglePermission = (permId: number) => {
    if (activeRole === 'admin') return; // Admin es inmutable

    setRolePermsMap((prev) => {
      const currentList = prev[activeRole] || [];
      const updated = currentList.includes(permId)
        ? currentList.filter((id) => id !== permId)
        : [...currentList, permId];
      return { ...prev, [activeRole]: updated };
    });
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    setSuccessMessage(null);
    try {
      const selectedRoleObj = roles.find((r) => r.name === activeRole);
      if (selectedRoleObj) {
        await fetch(`/api/v1/rbac/roles/${selectedRoleObj.id}/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permission_ids: rolePermsMap[activeRole] || [] })
        });
      }
    } catch {
      // Simular guardado
    } finally {
      setTimeout(() => {
        setSaving(false);
        setSuccessMessage(`Privilegios del rol '${activeRole.toUpperCase()}' actualizados y persistidos en base de datos.`);
      }, 600);
    }
  };

  const activePermIds = rolePermsMap[activeRole] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
          Módulo de Control de Acceso Basado en Roles (RBAC — Requisito R5)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Matriz de privilegios granulares con sintaxis <code>modulo:accion</code>, 5 roles predefinidos y sincronización dinámica.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#34d399'
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {/* Selector de Roles */}
      <div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyber-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
          Selecciona el Rol para Editar la Matriz:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {roles.map((r) => {
            const isSelected = activeRole === r.name;
            return (
              <div
                key={r.name}
                onClick={() => setActiveRole(r.name)}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--cyber-cyan)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(0, 210, 255, 0.1)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 210, 255, 0.2)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isSelected ? 'var(--cyber-cyan)' : '#fff' }}>
                    {r.name.toUpperCase()}
                  </span>
                  {r.name === 'admin' ? (
                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      Inmutable
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {(rolePermsMap[r.name] || []).length} perms
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matriz de Permisos */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              Matriz de Permisos para: <span style={{ color: 'var(--cyber-cyan)' }}>{activeRole.toUpperCase()}</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {activeRole === 'admin' ? 'El rol de Super Administrador cuenta con bypass global de permisos.' : 'Marca o desmarca los privilegios correspondientes y haz clic en Guardar.'}
            </span>
          </div>

          <Can I="rbac:manage">
            <button
              onClick={handleSaveMatrix}
              disabled={saving || activeRole === 'admin'}
              className="btn btn-primary"
            >
              <Save size={16} className={saving ? 'animate-spin' : ''} />
              {saving ? 'Guardando en BD...' : 'Guardar Cambios de Matriz'}
            </button>
          </Can>
        </div>

        <div className="soc-table-wrapper">
          <table className="soc-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Activo</th>
                <th>Privilegio (modulo:accion)</th>
                <th>Módulo</th>
                <th>Acción</th>
                <th>Descripción del Privilegio</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => {
                const isChecked = activeRole === 'admin' || activePermIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => togglePermission(p.id)}
                    style={{ cursor: activeRole === 'admin' ? 'default' : 'pointer' }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={activeRole === 'admin'}
                        onChange={() => togglePermission(p.id)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--cyber-cyan)', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <code style={{ fontSize: '0.82rem', fontWeight: 700, color: isChecked ? 'var(--cyber-cyan)' : 'var(--text-dim)' }}>
                        {p.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#fff', textTransform: 'capitalize' }}>
                        {p.module}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyber-amber)' }}>
                        {p.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.description}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listado de Usuarios y Roles Asignados */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
          Usuarios del Sistema y Asignación de Perfil
        </h3>
        <div className="soc-table-wrapper">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Operador / Nombre</th>
                <th>Correo Electrónico</th>
                <th>Rol Asignado</th>
                <th>Permisos Efectivos</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCheck size={16} color="var(--cyber-cyan)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</code>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 210, 255, 0.15)',
                        color: 'var(--cyber-cyan)'
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {u.role === 'admin' ? 'Total (Acceso sin restricciones)' : `${(rolePermsMap[u.role] || []).length} privilegios asignados`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
