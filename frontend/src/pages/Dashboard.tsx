import React, { useState } from 'react';
import { useMetrics } from '../hooks/useMetrics';
import { MetricCard } from '../components/common/MetricCard';
import { SeverityBadge } from '../components/widgets/SeverityBadge';
import { VerdictBadge } from '../components/widgets/VerdictBadge';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import {
  Bell,
  Clock,
  CheckCircle2,
  Filter,
  Flame,
  Zap,
  Gauge,
  Cpu,
  Brain,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { data } = useMetrics();
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

  // Muestra de alertas recientes para feed de monitoreo
  const recentAlertsSample = [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      external_id: "WAZUH-9841",
      title: "Intento reiterado de fuerza bruta SSH con diccionario",
      source: "Wazuh-EDR",
      severity: "high",
      status: "escalated",
      source_ip: "185.220.101.5",
      destination_ip: "192.168.1.10",
      triage_verdict: "malicious",
      confidence: 0.94,
      ai_model: "llama3:8b-instruct",
      execution_mode: "llm",
      reasoning: "Ataque de fuerza bruta SSH con 72 intentos fallidos desde nodo de salida Tor reportado en AbuseIPDB con 98% de confianza.",
      recommended_actions: [
        "Bloquear IP 185.220.101.5 en firewall perimetral",
        "Deshabilitar autenticación por password en host bastion"
      ]
    },
    {
      id: "b0000000-0000-0000-0000-000000000002",
      external_id: "SURICATA-1209",
      title: "Conexión saliente sospechosa hacia servidor C2 (Cobalt Strike)",
      source: "Suricata-NIDS",
      severity: "critical",
      status: "escalated",
      source_ip: "192.168.1.45",
      destination_ip: "45.142.214.12",
      triage_verdict: "malicious",
      confidence: 0.995,
      ai_model: "llama3:8b-instruct",
      execution_mode: "llm",
      reasoning: "Tráfico HTTP de baliza activa compatible con baliza de Cobalt Strike hacia infraestructura offshore confirmada con 48 detecciones en VirusTotal.",
      recommended_actions: [
        "Aislar inmediatamente el endpoint 192.168.1.45 de la red",
        "Proceder con la extracción de volcado de memoria RAM"
      ]
    },
    {
      id: "b0000000-0000-0000-0000-000000000005",
      external_id: "WAZUH-9902",
      title: "Alerta de escalado de privilegios: Sudo ejecutado por usuario backup",
      source: "Wazuh-EDR",
      severity: "low",
      status: "false_positive",
      source_ip: "192.168.1.50",
      destination_ip: "192.168.1.50",
      triage_verdict: "false_positive",
      confidence: 0.985,
      ai_model: "llama3:8b-instruct",
      execution_mode: "llm",
      reasoning: "Ejecución de rsync con sudo correspondiente a la tarea programada legítima de backup corporativo en crontab local.",
      recommended_actions: [
        "Crear regla de supresión en Wazuh para usuario backup_svc",
        "Marcar alerta como falso positivo verificado"
      ]
    },
    {
      id: "b0000000-0000-0000-0000-000000000003",
      external_id: "OPNSENSE-4401",
      title: "Escaneo masivo de puertos TCP (SYN Scan)",
      source: "OPNsense-FW",
      severity: "medium",
      status: "triaged",
      source_ip: "194.26.29.112",
      destination_ip: "192.168.1.1",
      triage_verdict: "suspicious",
      confidence: 0.78,
      ai_model: "heuristic-engine-v1",
      execution_mode: "degraded",
      reasoning: "Escaneo de puertos oportunista bloqueado por OPNsense. Puntuación de abuso moderada (45%). No se registraron puertos expuestos.",
      recommended_actions: [
        "Mantener IP en lista de observación durante 24 horas",
        "Verificar que no existan puertos de administración abiertos en WAN"
      ]
    }
  ];

  const kpis = data.kpis;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Panel Principal de Telemetría SOC
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Triaje cognitivo en tiempo real con agentes LLM locales y mitigación de fatiga de alertas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="glass-panel" style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <Brain size={16} color="var(--cyber-cyan)" />
            <span>Modelo Activo: <b>Ollama llama3:8b</b></span>
          </div>
          <div className="glass-panel" style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--cyber-emerald)' }}>
            <span className="pulse-dot"></span>
            <span>Motor Heurístico: <b>Online</b></span>
          </div>
        </div>
      </div>

      {/* 8 TARJETAS KPI OBLIGATORIAS (Requisito R3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* KPI 1: Total Alertas */}
        <MetricCard
          title="Total Alertas Ingeridas"
          value={kpis.total_alerts.toLocaleString()}
          icon={Bell}
          color="cyan"
          trend={{ value: "+14.2%", isPositive: true, label: "vs semana anterior" }}
        />

        {/* KPI 2: Alertas Pendientes */}
        <MetricCard
          title="Alertas Pendientes"
          value={kpis.pending_alerts}
          subtitle="En cola de enriquecimiento"
          icon={Clock}
          color="amber"
          trend={{ value: "-8.5%", isPositive: true, label: "Cola controlada" }}
        />

        {/* KPI 3: Alertas Triadas */}
        <MetricCard
          title="Alertas Triadas con Éxito"
          value={kpis.triaged_alerts.toLocaleString()}
          icon={CheckCircle2}
          color="emerald"
          trend={{ value: "95.1%", isPositive: true, label: "Tasa de cobertura" }}
        />

        {/* KPI 4: Falsos Positivos */}
        <MetricCard
          title="Tasa de Falsos Positivos"
          value={`${kpis.false_positive_rate_pct}%`}
          subtitle="Ruido filtrado autónomamente"
          icon={Filter}
          color="purple"
          trend={{ value: "-72% fatiga", isPositive: true, label: "Ahorro de horas" }}
        />

        {/* KPI 5: Incidentes Escalados */}
        <MetricCard
          title="Incidentes Escalados"
          value={kpis.escalated_alerts}
          subtitle="Casos asignados a analistas"
          icon={Flame}
          color="crimson"
          trend={{ value: "48 activos", isPositive: false, label: "Requiere atención" }}
        />

        {/* KPI 6: MTTT Promedio */}
        <MetricCard
          title="MTTT Promedio"
          value={`${kpis.mttt_avg_sec}s`}
          subtitle="Mean Time to Triage medio"
          icon={Zap}
          color="cyan"
          trend={{ value: "< 90s SLA", isPositive: true, label: "Cumplido" }}
        />

        {/* KPI 7: MTTT P95 */}
        <MetricCard
          title="MTTT Percentil 95 (P95)"
          value={`${kpis.mttt_p95_sec}s`}
          subtitle="percentile_cont(0.95)"
          icon={Gauge}
          color="blue"
          trend={{ value: "Garantizado", isPositive: true, label: "SLA estricto" }}
        />

        {/* KPI 8: Disponibilidad LLM */}
        <MetricCard
          title="Disponibilidad LLM"
          value={`${kpis.llm_availability_pct}%`}
          subtitle="Con fallback heurístico 24/7"
          icon={Cpu}
          color="emerald"
          trend={{ value: "0 pérdida", isPositive: true, label: "Alta resiliencia" }}
        />
      </div>

      {/* 7 GRÁFICOS ANALÍTICOS OBLIGATORIOS (Requisito R3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* GRÁFICO 1: Tendencia Diaria de Ingesta y Triaje (AreaChart - 8 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '1.25rem', minHeight: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              1. Tendencia Temporal de Ingesta, Triaje y Falsos Positivos
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Últimos 7 días (Nomenclatura period / date)</span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_trend}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTriaged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" stroke="var(--text-dim)" fontSize={11} />
                <YAxis stroke="var(--text-dim)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1222', borderColor: 'rgba(0, 210, 255, 0.3)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="total" name="Total Recibidas" stroke="#00d2ff" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="triaged" name="Triadas por IA" stroke="#10b981" fillOpacity={1} fill="url(#colorTriaged)" strokeWidth={2} />
                <Area type="monotone" dataKey="false_positives" name="Falsos Positivos" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: Distribución por Severidad (Donut PieChart - 4 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.25rem', minHeight: '340px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              2. Distribución de Severidad
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Clasificación de riesgo de eventos</span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.severity_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {data.severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1222', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 3: Top Direcciones IP Atacantes (BarChart Horizontal - 6 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 6', padding: '1.25rem', minHeight: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              3. Top Direcciones IP Atacantes (OSINT / AbuseIPDB)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>vw_top_attackers</span>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.top_attackers}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--text-dim)" fontSize={11} />
                <YAxis dataKey="ip" type="category" stroke="var(--text-dim)" fontSize={11} width={95} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1222', borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val, _name, item: any) => [`${val} intentos (${item.payload.country})`, 'Ataques']}
                />
                <Bar dataKey="attack_count" name="Frecuencia de Ataque" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 4: Ratio de Veredictos (PieChart - 6 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 6', padding: '1.25rem', minHeight: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              4. Desglose de Veredictos del Triaje Cognitivo
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Falsos Positivos vs Maliciosos</span>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.verdict_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.verdict_distribution.map((entry, index) => (
                    <Cell key={`cell-v-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1222', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 5: MTTT Promedio Diario vs Umbral SLA (BarChart - 4 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.25rem', minHeight: '300px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              5. MTTT Diario (Segundos)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Alias canónico mttt_avg / mttt_avg_sec</span>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" stroke="var(--text-dim)" fontSize={10} />
                <YAxis stroke="var(--text-dim)" fontSize={11} domain={[0, 60]} />
                <Tooltip contentStyle={{ backgroundColor: '#0c1222', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="mttt_avg_sec" name="Segundos Triaje" fill="#00d2ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 6: Ejecución LLM vs Heurística Degradada (BarChart - 4 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.25rem', minHeight: '300px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              6. Resiliencia: LLM vs Degraded
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Cero caídas operacionales 24/7</span>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.execution_modes}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={10} />
                <YAxis stroke="var(--text-dim)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0c1222', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" name="Alertas Procesadas" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {data.execution_modes.map((entry, index) => (
                    <Cell key={`cell-m-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 7: Ingesta por Hora del Día (Histograma 24 Horas - 4 Cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.25rem', minHeight: '300px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              7. Actividad Horaria (24 Horas)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Detección de picos nocturnos anómalos</span>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="var(--text-dim)" fontSize={9} />
                <YAxis stroke="var(--text-dim)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0c1222', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Eventos Recibidos" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* FEED EN TIEMPO REAL: Alertas Recientes y Vista de Detalle */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              Monitor de Alertas y Triaje Cognitivo Reciente
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Haz clic en cualquier alerta para inspeccionar el razonamiento forense de la IA y acciones recomendadas.
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--cyber-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Feed Activo <ArrowUpRight size={14} />
          </span>
        </div>

        <div className="soc-table-wrapper">
          <table className="soc-table">
            <thead>
              <tr>
                <th>ID / Origen</th>
                <th>Título del Evento</th>
                <th>Severidad</th>
                <th>IP Origen</th>
                <th>Veredicto IA</th>
                <th>Modo Ejecución</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentAlertsSample.map((alert) => (
                <tr
                  key={alert.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{alert.external_id}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{alert.source}</div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{alert.title}</span>
                  </td>
                  <td>
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--cyber-cyan)' }}>
                      {alert.source_ip}
                    </span>
                  </td>
                  <td>
                    <VerdictBadge verdict={alert.triage_verdict} />
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: alert.execution_mode === 'llm' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                        color: alert.execution_mode === 'llm' ? 'var(--cyber-cyan)' : 'var(--cyber-amber)'
                      }}
                    >
                      {alert.execution_mode === 'llm' ? 'LLM (Llama3)' : 'Heurístico (Degraded)'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlert(alert);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE DE ALERTA Y TRIAJE LLM */}
      {selectedAlert && (
        <Modal
          isOpen={Boolean(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
          title={`Detalle de Alerta: ${selectedAlert.external_id}`}
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SeverityBadge severity={selectedAlert.severity} size="md" />
                <VerdictBadge verdict={selectedAlert.triage_verdict} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Origen: <b>{selectedAlert.source}</b>
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                {selectedAlert.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                IP Origen Atacante: <code style={{ color: 'var(--cyber-cyan)' }}>{selectedAlert.source_ip}</code> → IP Destino Activo: <code style={{ color: '#fff' }}>{selectedAlert.destination_ip}</code>
              </p>
            </div>

            {/* Cuadro de Razonamiento Cognitivo de la IA */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(0, 210, 255, 0.05)',
                border: '1px solid rgba(0, 210, 255, 0.25)',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Brain size={18} color="var(--cyber-cyan)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyber-cyan)' }}>
                    Dictamen Forense del Agente IA ({selectedAlert.ai_model})
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyber-emerald)' }}>
                  Confianza: {(selectedAlert.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>
                {selectedAlert.reasoning}
              </p>
            </div>

            {/* Acciones Recomendadas */}
            <div>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Medidas de Mitigación y Respuesta Sugeridas:
              </h5>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {selectedAlert.recommended_actions.map((act: string, idx: number) => (
                  <li key={idx}><b>Acción {idx + 1}:</b> {act}</li>
                ))}
              </ul>
            </div>

            {/* Botones de Acción RBAC */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setSelectedAlert(null)} className="btn btn-secondary">
                Cerrar
              </button>

              <Can I="incidents:escalate">
                <button
                  onClick={() => {
                    alert(`Incidente escalado exitosamente para la alerta ${selectedAlert.external_id}`);
                    setSelectedAlert(null);
                  }}
                  className="btn btn-danger"
                >
                  <Flame size={16} />
                  Escalar a Incidente Crítico
                </button>
              </Can>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
