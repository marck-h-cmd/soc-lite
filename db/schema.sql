-- ============================================================================
-- SOC-Lite: Esquema Principal PostgreSQL
-- Cumplimiento: NIST CSF DE.AE, ISO/IEC 27001 A.8.15 & A.5.24
-- 8 ENUMs, 12 Tablas, 4 Vistas Analíticas e Índices Avanzados
-- ============================================================================

-- Habilitar extensión para generación de identificadores UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMERACIONES NATIVAS (8 ENUMs)
-- ----------------------------------------------------------------------------

DROP TYPE IF EXISTS severity_level CASCADE;
CREATE TYPE severity_level AS ENUM ('critical', 'high', 'medium', 'low', 'info');

DROP TYPE IF EXISTS alert_status CASCADE;
CREATE TYPE alert_status AS ENUM ('pending', 'in_progress', 'triaged', 'escalated', 'closed', 'false_positive');

DROP TYPE IF EXISTS triage_verdict CASCADE;
CREATE TYPE triage_verdict AS ENUM ('malicious', 'suspicious', 'benign', 'false_positive', 'unknown');

DROP TYPE IF EXISTS incident_status CASCADE;
CREATE TYPE incident_status AS ENUM ('open', 'investigating', 'contained', 'resolved', 'closed');

DROP TYPE IF EXISTS report_type CASCADE;
CREATE TYPE report_type AS ENUM ('operational_daily', 'executive_monthly', 'compliance_audit');

DROP TYPE IF EXISTS report_format CASCADE;
CREATE TYPE report_format AS ENUM ('pdf', 'docx', 'xlsx', 'json');

DROP TYPE IF EXISTS audit_action CASCADE;
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'export', 'login', 'triage', 'escalate');

DROP TYPE IF EXISTS audit_result CASCADE;
CREATE TYPE audit_result AS ENUM ('success', 'failure', 'denied');

-- ----------------------------------------------------------------------------
-- 2. TABLAS DE GESTIÓN DE IDENTIDAD Y CONTROL DE ACCESO (RBAC)
-- ----------------------------------------------------------------------------

-- Tabla 1: Roles del sistema
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 2: Permisos granulares (modulo:accion)
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    CONSTRAINT uq_perm_module_action UNIQUE (module, action)
);

-- Tabla 3: Asignación de permisos a roles
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Tabla 4: Usuarios del SOC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. TABLAS DE ALERTAS, ENRIQUECIMIENTO Y TRIAJE
-- ----------------------------------------------------------------------------

-- Tabla 5: Alertas de seguridad
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100) NOT NULL,
    severity severity_level NOT NULL DEFAULT 'medium',
    status alert_status NOT NULL DEFAULT 'pending',
    source_ip INET,
    destination_ip INET,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 6: Enriquecimiento contextual (OSINT / Threat Intelligence)
CREATE TABLE IF NOT EXISTS enrichment_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID UNIQUE NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    virustotal JSONB DEFAULT '{}'::jsonb,
    abuseipdb JSONB DEFAULT '{}'::jsonb,
    geoip JSONB DEFAULT '{}'::jsonb,
    whois JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 7: Resultados del triaje (LangChain Agent o Heurístico Degraded)
CREATE TABLE IF NOT EXISTS triage_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID UNIQUE NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    verdict triage_verdict NOT NULL,
    severity severity_level NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    reasoning TEXT NOT NULL,
    recommended_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_model VARCHAR(100) NOT NULL,
    execution_mode VARCHAR(20) NOT NULL CHECK (execution_mode IN ('llm', 'degraded')),
    execution_time_ms INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. TABLAS DE INCIDENTES Y TICKETING
-- ----------------------------------------------------------------------------

-- Tabla 8: Incidentes de seguridad confirmados
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    severity severity_level NOT NULL,
    status incident_status NOT NULL DEFAULT 'open',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- Tabla 9: Tickets sincronizados en plataformas externas (osTicket, Redmine)
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    external_system VARCHAR(50) NOT NULL,
    ticket_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. TABLAS DE AUDITORÍA FORENSE, REPORTES Y PARÁMETROS
-- ----------------------------------------------------------------------------

-- Tabla 10: Bitácora inmutable con cadena criptográfica SHA-256
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(150) NOT NULL,
    ip_address INET,
    module VARCHAR(50) NOT NULL,
    action audit_action NOT NULL,
    target_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    result audit_result NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    curr_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 11: Histórico de reportes generados
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type report_type NOT NULL,
    format report_format NOT NULL,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 12: Configuración del sistema y umbrales
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. ÍNDICES DE RENDIMIENTO
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON alerts(source_ip);
CREATE INDEX IF NOT EXISTS idx_alerts_raw_payload ON alerts USING GIN (raw_payload);
CREATE INDEX IF NOT EXISTS idx_alerts_tags ON alerts USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_triage_verdict ON triage_results(verdict);
CREATE INDEX IF NOT EXISTS idx_triage_exec_mode ON triage_results(execution_mode);
CREATE INDEX IF NOT EXISTS idx_triage_created_at ON triage_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON audit_log(module);
CREATE INDEX IF NOT EXISTS idx_audit_log_username ON audit_log(username);
CREATE INDEX IF NOT EXISTS idx_audit_log_curr_hash ON audit_log(curr_hash);

-- ----------------------------------------------------------------------------
-- 7. VISTAS ANALÍTICAS (4 VISTAS)
-- ----------------------------------------------------------------------------

-- Vista 1: Métricas de alertas y cálculo del MTTT (Promedio y P95 con percentile_cont)
CREATE OR REPLACE VIEW vw_alert_metrics AS
SELECT 
    COUNT(*)::INT AS total_alerts,
    COUNT(*) FILTER (WHERE a.status = 'pending')::INT AS pending_alerts,
    COUNT(*) FILTER (WHERE a.status = 'triaged')::INT AS triaged_alerts,
    COUNT(*) FILTER (WHERE a.status = 'escalated')::INT AS escalated_alerts,
    COUNT(*) FILTER (WHERE a.status = 'false_positive')::INT AS false_positive_alerts,
    COUNT(*) FILTER (WHERE a.severity = 'critical')::INT AS critical_alerts,
    COUNT(*) FILTER (WHERE a.severity = 'high')::INT AS high_alerts,
    ROUND(COALESCE(AVG(t.execution_time_ms) / 1000.0, 0), 2)::FLOAT AS mttt_avg_sec,
    ROUND(
        COALESCE(
            (percentile_cont(0.95) WITHIN GROUP (ORDER BY t.execution_time_ms))::numeric / 1000.0, 
            0
        ), 2
    )::FLOAT AS mttt_p95_sec,
    ROUND(
        COALESCE(
            (COUNT(*) FILTER (WHERE a.status = 'false_positive')::numeric / NULLIF(COUNT(*), 0)::numeric) * 100.0, 
            0
        ), 2
    )::FLOAT AS false_positive_rate_pct
FROM alerts a
LEFT JOIN triage_results t ON a.id = t.alert_id;

-- Vista 2: Top atacantes y orígenes recurrentes
CREATE OR REPLACE VIEW vw_top_attackers AS
SELECT 
    a.source_ip::TEXT AS source_ip,
    COUNT(a.id)::INT AS attack_count,
    MAX(a.severity::TEXT) AS max_severity,
    COALESCE(e.geoip->>'country_name', 'Desconocido') AS country,
    COALESCE(e.geoip->>'country_code', 'XX') AS country_code,
    COALESCE((e.abuseipdb->>'abuseConfidenceScore')::INT, 0) AS abuse_score,
    MAX(a.created_at) AS last_seen
FROM alerts a
LEFT JOIN enrichment_data e ON a.id = e.alert_id
WHERE a.source_ip IS NOT NULL
GROUP BY a.source_ip, e.geoip->>'country_name', e.geoip->>'country_code', e.abuseipdb->>'abuseConfidenceScore'
ORDER BY attack_count DESC
LIMIT 20;

-- Vista 3: Tendencia diaria de triaje
CREATE OR REPLACE VIEW vw_daily_triage_trend AS
SELECT 
    DATE(a.created_at) AS triage_date,
    COUNT(a.id)::INT AS total_received,
    COUNT(t.id)::INT AS total_triaged,
    COUNT(*) FILTER (WHERE t.execution_mode = 'llm')::INT AS triaged_by_llm,
    COUNT(*) FILTER (WHERE t.execution_mode = 'degraded')::INT AS triaged_by_heuristic,
    COUNT(*) FILTER (WHERE t.verdict = 'false_positive')::INT AS false_positives,
    ROUND(COALESCE(AVG(t.execution_time_ms) / 1000.0, 0), 2)::FLOAT AS avg_duration_sec
FROM alerts a
LEFT JOIN triage_results t ON a.id = t.alert_id
GROUP BY DATE(a.created_at)
ORDER BY triage_date ASC;

-- Vista 4: Resumen de incidentes y tiempos de contención
CREATE OR REPLACE VIEW vw_incident_summary AS
SELECT 
    i.id AS incident_id,
    i.title,
    i.severity::TEXT AS severity,
    i.status::TEXT AS status,
    i.ticket_reference,
    COALESCE(u.full_name, 'No asignado') AS assigned_analyst,
    COALESCE(u.email, 'N/A') AS analyst_email,
    a.id AS original_alert_id,
    a.source AS alert_source,
    a.source_ip::TEXT AS source_ip,
    COALESCE(tk.external_system, 'N/A') AS external_system,
    COALESCE(tk.status, 'N/A') AS external_ticket_status,
    i.created_at,
    i.resolved_at,
    CASE 
        WHEN i.resolved_at IS NOT NULL THEN 
            ROUND(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at)) / 60.0, 2)::FLOAT
        ELSE NULL 
    END AS duration_minutes
FROM incidents i
JOIN alerts a ON i.alert_id = a.id
LEFT JOIN users u ON i.assigned_to = u.id
LEFT JOIN tickets tk ON i.id = tk.incident_id;
