import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types';

const INITIAL_FALLBACK_METRICS: DashboardData = {
  kpis: {
    total_alerts: 1248,
    pending_alerts: 14,
    triaged_alerts: 1184,
    escalated_alerts: 50,
    false_positive_alerts: 842,
    critical_alerts: 38,
    high_alerts: 112,
    mttt_avg_sec: 42.5,
    mttt_avg: 42.5,
    mttt_p95_sec: 78.2,
    false_positive_rate_pct: 67.46,
    llm_availability_pct: 99.4
  },
  severity_distribution: [
    { name: "Crítico", key: "critical", value: 38, color: "#ef4444" },
    { name: "Alto", key: "high", value: 112, color: "#f97316" },
    { name: "Medio", key: "medium", value: 320, color: "#eab308" },
    { name: "Bajo", key: "low", value: 530, color: "#3b82f6" },
    { name: "Informativo", key: "info", value: 248, color: "#64748b" }
  ],
  daily_trend: [
    { date: "2026-10-12", period: "2026-10-12", total: 142, triaged: 139, false_positives: 98, mttt_avg_sec: 44.1, mttt_avg: 44.1 },
    { date: "2026-10-13", period: "2026-10-13", total: 165, triaged: 162, false_positives: 115, mttt_avg_sec: 39.8, mttt_avg: 39.8 },
    { date: "2026-10-14", period: "2026-10-14", total: 152, triaged: 150, false_positives: 104, mttt_avg_sec: 41.2, mttt_avg: 41.2 },
    { date: "2026-10-15", period: "2026-10-15", total: 189, triaged: 185, false_positives: 130, mttt_avg_sec: 45.0, mttt_avg: 45.0 },
    { date: "2026-10-16", period: "2026-10-16", total: 172, triaged: 169, false_positives: 118, mttt_avg_sec: 42.3, mttt_avg: 42.3 },
    { date: "2026-10-17", period: "2026-10-17", total: 210, triaged: 205, false_positives: 142, mttt_avg_sec: 38.6, mttt_avg: 38.6 },
    { date: "2026-10-18", period: "2026-10-18", total: 195, triaged: 191, false_positives: 135, mttt_avg_sec: 42.5, mttt_avg: 42.5 }
  ],
  top_attackers: [
    { ip: "185.220.101.5", attack_count: 78, country: "Rusia", country_code: "RU", abuse_score: 98, max_severity: "high" },
    { ip: "45.142.214.12", attack_count: 64, country: "Seychelles", country_code: "SC", abuse_score: 100, max_severity: "critical" },
    { ip: "103.203.57.18", attack_count: 42, country: "China", country_code: "CN", abuse_score: 88, max_severity: "high" },
    { ip: "194.26.29.112", attack_count: 31, country: "Países Bajos", country_code: "NL", abuse_score: 45, max_severity: "medium" },
    { ip: "91.240.118.23", attack_count: 27, country: "Alemania", country_code: "DE", abuse_score: 76, max_severity: "high" },
    { ip: "193.106.191.8", attack_count: 19, country: "Lituania", country_code: "LT", abuse_score: 62, max_severity: "medium" }
  ],
  verdict_distribution: [
    { name: "Falsos Positivos", key: "false_positive", value: 842, color: "#10b981" },
    { name: "Maliciosos Confirmados", key: "malicious", value: 150, color: "#ef4444" },
    { name: "Sospechosos", key: "suspicious", value: 124, color: "#f59e0b" },
    { name: "Benignos Verificados", key: "benign", value: 68, color: "#06b6d4" }
  ],
  execution_modes: [
    { name: "Agente LLM (Llama3)", key: "llm", value: 1120, color: "#00d2ff" },
    { name: "Motor Heurístico (Degraded)", key: "degraded", value: 64, color: "#f97316" }
  ],
  hourly_distribution: [
    { hour: "00:00", count: 24 }, { hour: "02:00", count: 18 }, { hour: "04:00", count: 15 },
    { hour: "06:00", count: 32 }, { hour: "08:00", count: 85 }, { hour: "10:00", count: 140 },
    { hour: "12:00", count: 110 }, { hour: "14:00", count: 165 }, { hour: "16:00", count: 175 },
    { hour: "18:00", count: 130 }, { hour: "20:00", count: 80 }, { hour: "22:00", count: 45 }
  ]
};

export const useMetrics = () => {
  const [data, setData] = useState<DashboardData>(INITIAL_FALLBACK_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const resp = await fetch('/api/v1/metrics/dashboard');
      if (resp.ok) {
        const json = await resp.json();
        setData(json);
        setError(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al conectar con métricas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000); // Polling suave cada 15 segundos
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { data, isLoading, error, refetch: fetchMetrics };
};
