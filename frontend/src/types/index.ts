export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'pending' | 'in_progress' | 'triaged' | 'escalated' | 'closed' | 'false_positive';
export type TriageVerdict = 'malicious' | 'suspicious' | 'benign' | 'false_positive' | 'unknown';
export type ExecutionMode = 'llm' | 'degraded';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  slug: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
}

export interface TriageResult {
  verdict: TriageVerdict;
  severity: SeverityLevel;
  confidence: number;
  reasoning: string;
  recommended_actions: string[];
  ai_model: string;
  execution_mode: ExecutionMode;
  execution_time_ms: number;
  created_at?: string;
}

export interface EnrichmentData {
  virustotal?: {
    malicious_votes?: number;
    harmless_votes?: number;
    community_score?: number;
    tags?: string[];
  };
  abuseipdb?: {
    abuseConfidenceScore?: number;
    totalReports?: number;
    isWhitelisted?: boolean;
    usageType?: string;
  };
  geoip?: {
    country_name?: string;
    country_code?: string;
    city?: string;
    isp?: string;
  };
  whois?: {
    network_name?: string;
    organization?: string;
    cidr?: string;
  };
}

export interface AlertItem {
  id: string;
  external_id?: string;
  title: string;
  description?: string;
  source: string;
  severity: SeverityLevel;
  status: AlertStatus;
  source_ip?: string;
  destination_ip?: string;
  raw_payload?: Record<string, unknown>;
  tags?: string[];
  created_at?: string;
  has_triage?: boolean;
  triage_verdict?: TriageVerdict;
  confidence?: number;
  triage?: TriageResult;
  enrichment?: EnrichmentData;
}

export interface IncidentItem {
  id: string;
  alert_id: string;
  title: string;
  severity: SeverityLevel;
  status: string;
  assigned_analyst: string;
  assigned_email?: string;
  ticket_reference?: string;
  notes?: string;
  created_at?: string;
  resolved_at?: string;
  alert_source?: string;
  source_ip?: string;
  tickets?: Array<{
    system: string;
    ticket_id: string;
    status: string;
  }>;
}

export interface AuditLogItem {
  id: number;
  username: string;
  ip_address?: string;
  module: string;
  action: string;
  target_id?: string;
  details?: Record<string, unknown>;
  result: string;
  prev_hash: string;
  curr_hash: string;
  timestamp: string;
}

export interface DashboardKPIs {
  total_alerts: number;
  pending_alerts: number;
  triaged_alerts: number;
  escalated_alerts: number;
  false_positive_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  mttt_avg_sec: number;
  mttt_avg: number;
  mttt_p95_sec: number;
  false_positive_rate_pct: number;
  llm_availability_pct: number;
}

export interface SeverityDistributionItem {
  name: string;
  key: string;
  value: number;
  color: string;
}

export interface DailyTrendItem {
  date: string;
  period: string;
  total: number;
  triaged: number;
  false_positives: number;
  mttt_avg_sec: number;
  mttt_avg: number;
}

export interface TopAttackerItem {
  ip: string;
  attack_count: number;
  country: string;
  country_code: string;
  abuse_score: number;
  max_severity: string;
}

export interface MetricDistributionItem {
  name: string;
  key: string;
  value: number;
  color: string;
}

export interface HourlyDistributionItem {
  hour: string;
  count: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  severity_distribution: SeverityDistributionItem[];
  daily_trend: DailyTrendItem[];
  top_attackers: TopAttackerItem[];
  verdict_distribution: MetricDistributionItem[];
  execution_modes: MetricDistributionItem[];
  hourly_distribution: HourlyDistributionItem[];
}
