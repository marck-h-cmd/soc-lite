import React, { useState, useEffect } from 'react';
import { IncidentItem } from '../types';
import { SeverityBadge } from '../components/widgets/SeverityBadge';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import {
  Shield,
  Ticket,
  User,
  Filter,
  RefreshCw
} from 'lucide-react';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/v1/incidents/');
      if (resp.ok) {
        const data = await resp.json();
        setIncidents(data.items);
      } else {
        throw new Error();
      }
    } catch {
      setIncidents([
        {
          id: "e0000000-0000-0000-0000-000000000001",
          alert_id: "b0000000-0000-0000-0000-000000000001",
          title: "Incidente SSH: Ataque distribuido de fuerza bruta sobre Bastion",
          severity: "high",
          status: "investigating",
          assigned_analyst: "Elena Rivas (Analista Tier 2)",
          assigned_email: "analyst2@soc-lite.internal",
          ticket_reference: "OST-2026-0812",
          notes: "Se aplicó lista negra en cortafuegos perimetral. Analista Elena revisando logs de acceso SSH.",
          created_at: new Date(Date.now() - 9900000).toISOString(),
          alert_source: "Wazuh-EDR",
          source_ip: "185.220.101.5",
          tickets: [{ system: "osTicket", ticket_id: "OST-2026-0812", status: "Open" }]
        },
        {
          id: "e0000000-0000-0000-0000-000000000002",
          alert_id: "b0000000-0000-0000-0000-000000000002",
          title: "Incidente Crítico: Posible compromiso por malware Cobalt Strike en Host 192.168.1.45",
          severity: "critical",
          status: "contained",
          assigned_analyst: "Carlos Mendoza (SOC Lead)",
          assigned_email: "lead@soc-lite.internal",
          ticket_reference: "OST-2026-0813",
          notes: "Host desconectado de red de producción a las 14:22. Equipo forense realizando volcado de RAM.",
          created_at: new Date(Date.now() - 6300000).toISOString(),
          alert_source: "Suricata-NIDS",
          source_ip: "192.168.1.45",
          tickets: [{ system: "osTicket", ticket_id: "OST-2026-0813", status: "In Progress" }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    setUpdatingStatus(newStatus);
    try {
      await fetch(`/api/v1/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: `Estado actualizado a ${newStatus}` })
      });
    } catch {
      // Simular cambio
    } finally {
      setIncidents((prev) =>
        prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i))
      );
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setUpdatingStatus(null);
    }
  };

  const filtered = incidents.filter(
    (i) => statusFilter === 'all' || i.status === statusFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            Gestión y Respuesta a Incidentes (ISO 27001 A.5.24)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Casos críticos escalados para contención, erradicación y seguimiento con sistemas de ticketing externos.
          </p>
        </div>

        <button onClick={loadIncidents} className="btn btn-secondary">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar Incidentes
        </button>
      </div>

      {/* Filtro de Estado */}
      <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Filter size={16} color="var(--text-dim)" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Filtrar por Estado de Contención:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto' }}
        >
          <option value="all">Todos los incidentes</option>
          <option value="open">Abierto (Open)</option>
          <option value="investigating">En Investigación</option>
          <option value="contained">Contenido (Aislado)</option>
          <option value="resolved">Resuelto / Cerrado</option>
        </select>
      </div>

      {/* Listado de Incidentes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderLeft: inc.severity === 'critical' ? '4px solid var(--cyber-crimson)' : '4px solid var(--cyber-amber)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <SeverityBadge severity={inc.severity} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--cyber-cyan)'
                    }}
                  >
                    ESTADO: {inc.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Creado: {new Date(inc.created_at || '').toLocaleString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  {inc.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedIncident(inc)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                  Ver Detalle y Acciones
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <User size={16} color="var(--cyber-cyan)" />
                <span>Analista Asignado: <b style={{ color: '#fff' }}>{inc.assigned_analyst}</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Ticket size={16} color="var(--cyber-emerald)" />
                <span>Ticket de Mesa: <b style={{ color: 'var(--cyber-emerald)' }}>{inc.ticket_reference || 'N/A'}</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Shield size={16} color="var(--cyber-purple)" />
                <span>Sensor SIEM: <b style={{ color: '#fff' }}>{inc.alert_source}</b></span>
              </div>
            </div>

            {inc.notes && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                <b>Bitácora de Respuesta:</b> {inc.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Actualización de Incidente */}
      {selectedIncident && (
        <Modal
          isOpen={Boolean(selectedIncident)}
          onClose={() => setSelectedIncident(null)}
          title={`Expediente de Incidente: ${selectedIncident.title}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Ticket Referenciado:</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cyber-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Ticket size={18} /> {selectedIncident.ticket_reference} (osTicket Sync)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Estado Actual del Incidente:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                {selectedIncident.status.toUpperCase()}
              </div>
            </div>

            {/* Transición de Estado RBAC */}
            <Can I="incidents:write">
              <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyber-cyan)', display: 'block', marginBottom: '0.65rem' }}>
                  Modificar Estado de Contención:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['investigating', 'contained', 'resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedIncident.id, st)}
                      disabled={updatingStatus !== null || selectedIncident.status === st}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.45rem 0.75rem',
                        backgroundColor: selectedIncident.status === st ? 'rgba(0, 210, 255, 0.2)' : undefined,
                        borderColor: selectedIncident.status === st ? 'var(--cyber-cyan)' : undefined
                      }}
                    >
                      Marcar como {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </Can>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setSelectedIncident(null)} className="btn btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
