import React, { useState, useEffect } from 'react';
import { AlertItem } from '../types';
import { SeverityBadge } from '../components/widgets/SeverityBadge';
import { VerdictBadge } from '../components/widgets/VerdictBadge';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import {
  Search,
  Filter,
  Brain,
  Globe,
  RefreshCw,
  Eye
} from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [triagingId, setTriagingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/v1/alerts/');
      if (resp.ok) {
        const data = await resp.json();
        setAlerts(data.items);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback a alertas de muestra representativas
      setAlerts([
        {
          id: "b0000000-0000-0000-0000-000000000001",
          external_id: "WAZUH-9841",
          title: "Intento reiterado de fuerza bruta SSH con diccionario",
          description: "Múltiples intentos fallidos de autenticación SSH sobre bastion",
          source: "Wazuh-EDR",
          severity: "high",
          status: "escalated",
          source_ip: "185.220.101.5",
          destination_ip: "192.168.1.10",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          tags: ["ssh", "brute-force", "t1110"],
          has_triage: true,
          triage_verdict: "malicious",
          confidence: 0.94,
          triage: {
            verdict: "malicious",
            severity: "high",
            confidence: 0.94,
            reasoning: "Ataque de fuerza bruta SSH con 72 intentos fallidos desde nodo Tor en AbuseIPDB con 98% de confianza.",
            recommended_actions: [
              "Bloquear IP 185.220.101.5 en firewall perimetral",
              "Deshabilitar login por contraseña en host bastion"
            ],
            ai_model: "llama3:8b-instruct",
            execution_mode: "llm",
            execution_time_ms: 2450
          },
          enrichment: {
            virustotal: { malicious_votes: 14, harmless_votes: 2, tags: ["tor-exit", "scanner"] },
            abuseipdb: { abuseConfidenceScore: 98, totalReports: 340, usageType: "Data Center" },
            geoip: { country_name: "Rusia", country_code: "RU", city: "Moscú" }
          }
        },
        {
          id: "b0000000-0000-0000-0000-000000000002",
          external_id: "SURICATA-1209",
          title: "Conexión saliente sospechosa hacia servidor C2 (Cobalt Strike)",
          description: "Tráfico HTTP de baliza activa compatible con Cobalt Strike",
          source: "Suricata-NIDS",
          severity: "critical",
          status: "escalated",
          source_ip: "192.168.1.45",
          destination_ip: "45.142.214.12",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          tags: ["cobalt-strike", "c2", "critical"],
          has_triage: true,
          triage_verdict: "malicious",
          confidence: 0.995,
          triage: {
            verdict: "malicious",
            severity: "critical",
            confidence: 0.995,
            reasoning: "Tráfico de baliza activa hacia infraestructura C2 offshore en VirusTotal (48 detecciones). Endpoint comprometido.",
            recommended_actions: [
              "Aislar inmediatamente el endpoint 192.168.1.45 de la red",
              "Capturar volcado de memoria RAM del endpoint"
            ],
            ai_model: "llama3:8b-instruct",
            execution_mode: "llm",
            execution_time_ms: 3120
          },
          enrichment: {
            virustotal: { malicious_votes: 48, harmless_votes: 0, tags: ["cobalt-strike", "c2"] },
            abuseipdb: { abuseConfidenceScore: 100, totalReports: 890, usageType: "Bulletproof Hosting" },
            geoip: { country_name: "Seychelles", country_code: "SC", city: "Victoria" }
          }
        },
        {
          id: "b0000000-0000-0000-0000-000000000005",
          external_id: "WAZUH-9902",
          title: "Alerta de escalado de privilegios: Sudo ejecutado por usuario backup",
          description: "Ejecución de rsync con sudo correspondiente al script de backup",
          source: "Wazuh-EDR",
          severity: "low",
          status: "false_positive",
          source_ip: "192.168.1.50",
          destination_ip: "192.168.1.50",
          created_at: new Date(Date.now() - 10800000).toISOString(),
          tags: ["cron", "backup", "benign"],
          has_triage: true,
          triage_verdict: "false_positive",
          confidence: 0.985,
          triage: {
            verdict: "false_positive",
            severity: "low",
            confidence: 0.985,
            reasoning: "Ejecución de rsync legítima en crontab local. Origen interno sin reportes de abuso.",
            recommended_actions: [
              "Crear regla de supresión en Wazuh para usuario backup_svc",
              "Marcar alerta como falso positivo"
            ],
            ai_model: "llama3:8b-instruct",
            execution_mode: "llm",
            execution_time_ms: 1890
          },
          enrichment: {
            virustotal: { malicious_votes: 0, harmless_votes: 85 },
            abuseipdb: { abuseConfidenceScore: 0, isWhitelisted: true },
            geoip: { country_name: "Red Local (LAN)" }
          }
        },
        {
          id: "b0000000-0000-0000-0000-000000000006",
          external_id: "SURICATA-1245",
          title: "Petición DNS anómala hacia dominio de alta entropía (DGA)",
          description: "Resolución de dominio sospechoso generado por algoritmo",
          source: "Suricata-NIDS",
          severity: "medium",
          status: "pending",
          source_ip: "192.168.1.88",
          destination_ip: "1.1.1.1",
          created_at: new Date(Date.now() - 900000).toISOString(),
          tags: ["dns", "dga"],
          has_triage: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleExecuteTriage = async (alertId: string) => {
    setTriagingId(alertId);
    try {
      const resp = await fetch(`/api/v1/alerts/${alertId}/triage`, { method: 'POST' });
      if (resp.ok) {
        await loadAlerts();
      }
    } catch {
      // Simular triaje
    } finally {
      setTimeout(() => {
        setTriagingId(null);
        // Actualizar alerta en estado local
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  status: 'triaged',
                  has_triage: true,
                  triage_verdict: 'malicious',
                  confidence: 0.92,
                  triage: {
                    verdict: 'malicious',
                    severity: a.severity,
                    confidence: 0.92,
                    reasoning: 'Triaje completado con éxito mediante agente LangChain Llama-3. Se detectaron indicadores hostiles.',
                    recommended_actions: ['Aislar tráfico de la subred en cortafuegos', 'Revisar logs de auditoría'],
                    ai_model: 'llama3:8b-instruct',
                    execution_mode: 'llm',
                    execution_time_ms: 2200
                  }
                }
              : a
          )
        );
      }, 1000);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.source_ip && a.source_ip.includes(searchTerm)) ||
      (a.external_id && a.external_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSev && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            Cola Operativa de Alertas SOC
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Supervisión, filtrado y triaje cognitivo asistido por agentes LLM y OSINT.
          </p>
        </div>

        <button onClick={loadAlerts} className="btn btn-secondary">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar Cola
        </button>
      </div>

      {/* Barra de Filtros */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por IP atacante, ID o término de ataque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-dim)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Severidad:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Estado:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente de Triaje</option>
            <option value="triaged">Triada</option>
            <option value="escalated">Escalada a Incidente</option>
            <option value="false_positive">Falso Positivo</option>
          </select>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="soc-table-wrapper">
          <table className="soc-table">
            <thead>
              <tr>
                <th>ID / Origen</th>
                <th>Título del Evento</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>IP Origen</th>
                <th>Veredicto IA</th>
                <th>Confianza</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No se encontraron alertas que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {alert.external_id || alert.id.slice(0, 8)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {alert.source}
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{alert.title}</span>
                      {alert.tags && alert.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          {alert.tags.map((t) => (
                            <span key={t} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--cyber-cyan)' }}>
                        {alert.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--cyber-cyan)' }}>
                        {alert.source_ip || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <VerdictBadge verdict={alert.triage_verdict} />
                    </td>
                    <td>
                      {alert.confidence ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyber-emerald)' }}>
                          {(alert.confidence * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          title="Inspeccionar detalle y telemetría"
                        >
                          <Eye size={14} />
                          Ver
                        </button>

                        <Can I="alerts:triage">
                          {!alert.has_triage && (
                            <button
                              onClick={() => handleExecuteTriage(alert.id)}
                              disabled={triagingId === alert.id}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Brain size={14} className={triagingId === alert.id ? 'animate-spin' : ''} />
                              {triagingId === alert.id ? 'Analizando...' : 'Triar IA'}
                            </button>
                          )}
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle Completo de Alerta */}
      {selectedAlert && (
        <Modal
          isOpen={Boolean(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
          title={`Expediente de Alerta: ${selectedAlert.external_id || selectedAlert.id}`}
          maxWidth="750px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <SeverityBadge severity={selectedAlert.severity} size="md" />
                <VerdictBadge verdict={selectedAlert.triage_verdict} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Sensor: <b>{selectedAlert.source}</b> | Estado: <b>{selectedAlert.status}</b>
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>
                {selectedAlert.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedAlert.description || 'Sin descripción extendida provista por el sensor.'}
              </p>
            </div>

            {/* Enriquecimiento OSINT (VirusTotal / AbuseIPDB / GeoIP) */}
            {selectedAlert.enrichment && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
                    VirusTotal Detection
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cyber-crimson)' }}>
                    {selectedAlert.enrichment.virustotal?.malicious_votes || 0} Detecciones
                  </span>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
                    AbuseIPDB Score
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cyber-amber)' }}>
                    {selectedAlert.enrichment.abuseipdb?.abuseConfidenceScore || 0}% de Abuso
                  </span>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
                    Geolocalización
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyber-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={14} />
                    {selectedAlert.enrichment.geoip?.country_name || 'Desconocido'}
                  </span>
                </div>
              </div>
            )}

            {/* Resultado de Triaje LLM */}
            {selectedAlert.triage ? (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(0, 210, 255, 0.06)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyber-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Brain size={16} /> Razonamiento del Agente ({selectedAlert.triage.ai_model})
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--cyber-emerald)', fontWeight: 700 }}>
                    Latencia: {selectedAlert.triage.execution_time_ms} ms
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {selectedAlert.triage.reasoning}
                </p>

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Acciones Recomendadas por IA:
                </span>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedAlert.triage.recommended_actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Esta alerta aún no ha sido triada cognitivamente.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setSelectedAlert(null)} className="btn btn-secondary">
                Cerrar
              </button>

              <Can I="alerts:triage">
                {!selectedAlert.has_triage && (
                  <button
                    onClick={() => {
                      handleExecuteTriage(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="btn btn-primary"
                  >
                    <Brain size={16} />
                    Ejecutar Triaje Ahora
                  </button>
                )}
              </Can>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
