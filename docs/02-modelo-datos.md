# 02. Modelo de Datos PostgreSQL — SOC-Lite

## 1. Visión General del Modelo

El modelo de datos de **SOC-Lite** está diseñado para garantizar alta integridad referencial, trazabilidad inmutable y soporte analítico en tiempo real sin sacrificar rendimiento. Hace uso extensivo de las capacidades avanzadas de PostgreSQL 16:
- **`INET`:** Para almacenamiento eficiente, indexación GiST/B-tree y cálculo de subredes de IPs origen/destino.
- **`JSONB`:** Para almacenar cargas útiles no estructuradas de telemetría (payloads de Wazuh/Suricata, enriquecimientos de VirusTotal, AbuseIPDB, GeoIP) con soporte de índices GIN.
- **`TEXT[] / VARCHAR[]`:** Para etiquetas MITRE ATT&CK, listas de IOCs y acciones recomendadas.
- **`ENUM`:** 8 tipos enumerados estrictos para evitar valores anómalos en el ciclo de vida del triaje y respuesta.
- **Cadena de hashes SHA-256:** En la tabla `audit_log` para certificar la inmutabilidad de la bitácora según los estándares forenses ISO 27001 A.8.15.

---

## 2. Enumeraciones Nativas (8 ENUMs)

1. `severity_level`: `'critical'`, `'high'`, `'medium'`, `'low'`, `'info'`
2. `alert_status`: `'pending'`, `'in_progress'`, `'triaged'`, `'escalated'`, `'closed'`, `'false_positive'`
3. `triage_verdict`: `'malicious'`, `'suspicious'`, `'benign'`, `'false_positive'`, `'unknown'`
4. `incident_status`: `'open'`, `'investigating'`, `'contained'`, `'resolved'`, `'closed'`
5. `report_type`: `'operational_daily'`, `'executive_monthly'`, `'compliance_audit'`
6. `report_format`: `'pdf'`, `'docx'`, `'xlsx'`, `'json'`
7. `audit_action`: `'create'`, `'read'`, `'update'`, `'delete'`, `'export'`, `'login'`, `'triage'`, `'escalate'`
8. `audit_result`: `'success'`, `'failure'`, `'denied'`

---

## 3. Catálogo de Tablas (12 Tablas)

### 3.1. Gestión de Identidades y RBAC
1. **`roles`:** Define los perfiles del sistema (`admin`, `soc_lead`, `analyst_tier2`, `analyst_tier1`, `auditor`).
   - Columnas: `id` (SERIAL PK), `name` (VARCHAR unique), `description` (TEXT), `is_system` (BOOLEAN), `created_at` (TIMESTAMPTZ).
2. **`permissions`:** Permisos granulares con sintaxis `modulo:accion` (ej. `alerts:triage`, `reports:export`).
   - Columnas: `id` (SERIAL PK), `module` (VARCHAR), `action` (VARCHAR), `description` (TEXT), CONSTRAINT UNIQUE(`module`, `action`).
3. **`role_permissions`:** Tabla pivote de asignación de privilegios a roles.
   - Columnas: `role_id` (FK roles), `permission_id` (FK permissions), PRIMARY KEY (`role_id`, `permission_id`).
4. **`users`:** Operadores, analistas y auditores del SOC.
   - Columnas: `id` (UUID PK), `email` (VARCHAR unique), `hashed_password` (VARCHAR), `full_name` (VARCHAR), `role_id` (FK roles), `is_active` (BOOLEAN), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).

### 3.2. Operación de Alertas y Triaje Inteligente
5. **`alerts`:** Alertas ingeridas desde Wazuh, OPNsense o sensores de red.
   - Columnas: `id` (UUID PK), `external_id` (VARCHAR), `title` (VARCHAR), `description` (TEXT), `source` (VARCHAR), `severity` (severity_level), `status` (alert_status), `source_ip` (INET), `destination_ip` (INET), `raw_payload` (JSONB), `tags` (TEXT[]), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
6. **`enrichment_data`:** Datos contextuales de inteligencia de amenazas (OSINT).
   - Columnas: `id` (UUID PK), `alert_id` (UUID FK alerts unique), `virustotal` (JSONB), `abuseipdb` (JSONB), `geoip` (JSONB), `whois` (JSONB), `created_at` (TIMESTAMPTZ).
7. **`triage_results`:** Resultados del triaje ejecutado por el agente LangChain o motor heurístico.
   - Columnas: `id` (UUID PK), `alert_id` (UUID FK alerts unique), `verdict` (triage_verdict), `severity` (severity_level), `confidence` (NUMERIC(4,3)), `reasoning` (TEXT), `recommended_actions` (TEXT[]), `ai_model` (VARCHAR), `execution_mode` (VARCHAR CHECK IN ('llm', 'degraded')), `execution_time_ms` (INTEGER), `created_at` (TIMESTAMPTZ).

### 3.3. Gestión de Incidentes y Respuesta
8. **`incidents`:** Incidentes escalados que requieren contención activa.
   - Columnas: `id` (UUID PK), `alert_id` (UUID FK alerts), `title` (VARCHAR), `severity` (severity_level), `status` (incident_status), `assigned_to` (UUID FK users), `ticket_reference` (VARCHAR), `notes` (TEXT), `created_at` (TIMESTAMPTZ), `resolved_at` (TIMESTAMPTZ).
9. **`tickets`:** Sincronización con sistemas de ticketing externos (osTicket, Redmine, Jira).
   - Columnas: `id` (UUID PK), `incident_id` (UUID FK incidents), `external_system` (VARCHAR), `ticket_id` (VARCHAR), `status` (VARCHAR), `response_payload` (JSONB), `created_at` (TIMESTAMPTZ).

### 3.4. Auditoría Criptográfica, Reportes y Parámetros
10. **`audit_log`:** Bitácora inmutable con cadena de hashes criptográficos SHA-256.
    - Columnas: `id` (BIGSERIAL PK), `user_id` (UUID FK users NULLABLE), `username` (VARCHAR), `ip_address` (INET), `module` (VARCHAR), `action` (audit_action), `target_id` (VARCHAR), `details` (JSONB), `result` (audit_result), `prev_hash` (VARCHAR(64)), `curr_hash` (VARCHAR(64)), `timestamp` (TIMESTAMPTZ).
11. **`reports`:** Registro histórico de reportes generados y exportados.
    - Columnas: `id` (UUID PK), `report_type` (report_type), `format` (report_format), `generated_by` (UUID FK users), `file_path` (VARCHAR), `file_size` (BIGINT), `parameters` (JSONB), `created_at` (TIMESTAMPTZ).
12. **`system_settings`:** Configuración dinámica del SOC (umbrales de severidad, endpoints LLM, llaves de API).
    - Columnas: `key` (VARCHAR PK), `value` (JSONB), `description` (TEXT), `updated_at` (TIMESTAMPTZ).

---

## 4. Cadena Criptográfica de Hashes en `audit_log`

Para garantizar el cumplimiento de **ISO 27001 A.8.15** y la imposibilidad de manipulación de registros forenses:
- El primer registro (bloque génesis) utiliza un `prev_hash` semilla de 64 ceros: `"0000000000000000000000000000000000000000000000000000000000000000"`.
- Cada registro posterior calcula su hash de bloque:
  $$\text{curr\_hash} = \text{SHA256}(\text{prev\_hash} \,||\, \text{timestamp} \,||\, \text{username} \,||\, \text{module} \,||\, \text{action} \,||\, \text{target\_id} \,||\, \text{result} \,||\, \text{details\_json})$$
- Cualquier alteración retroactiva en un registro invalida inmediatamente toda la cadena de hashes subsiguiente, lo cual es detectado automáticamente por el endpoint de verificación forense `/api/v1/audit/verify-chain`.

---

## 5. Vistas Analíticas Nativas (4 Vistas)

### 5.1. `vw_alert_metrics`
Calcula en tiempo real los KPIs principales del SOC, incluyendo el cálculo del percentil 95 del MTTT (Mean Time to Triage) usando la función nativa de PostgreSQL:
```sql
CREATE OR REPLACE VIEW vw_alert_metrics AS
SELECT 
    COUNT(*) AS total_alerts,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_alerts,
    COUNT(*) FILTER (WHERE status = 'triaged') AS triaged_alerts,
    COUNT(*) FILTER (WHERE status = 'escalated') AS escalated_alerts,
    COUNT(*) FILTER (WHERE status = 'false_positive') AS false_positive_alerts,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_alerts,
    COUNT(*) FILTER (WHERE severity = 'high') AS high_alerts,
    ROUND(AVG(t.execution_time_ms) / 1000.0, 2) AS mttt_avg_sec,
    ROUND(
        (percentile_cont(0.95) WITHIN GROUP (ORDER BY t.execution_time_ms))::numeric / 1000.0, 
        2
    ) AS mttt_p95_sec,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'false_positive')::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 
        2
    ) AS false_positive_rate_pct
FROM alerts a
LEFT JOIN triage_results t ON a.id = t.alert_id;
```

### 5.2. `vw_top_attackers`
Identifica las direcciones IP origen con mayor recurrencia de ataques maliciosos confirmados.
```sql
CREATE OR REPLACE VIEW vw_top_attackers AS
SELECT 
    a.source_ip,
    COUNT(a.id) AS attack_count,
    MAX(a.severity::text) AS max_severity,
    (e.geoip->>'country_name') AS country,
    (e.geoip->>'country_code') AS country_code,
    (e.abuseipdb->>'abuseConfidenceScore')::int AS abuse_score,
    MAX(a.created_at) AS last_seen
FROM alerts a
LEFT JOIN enrichment_data e ON a.id = e.alert_id
WHERE a.source_ip IS NOT NULL
GROUP BY a.source_ip, e.geoip->>'country_name', e.geoip->>'country_code', e.abuseipdb->>'abuseConfidenceScore'
ORDER BY attack_count DESC
LIMIT 20;
```

### 5.3. `vw_daily_triage_trend`
Agregación temporal para alimentar gráficos de tendencia diaria en el dashboard y reportes ejecutivos.
```sql
CREATE OR REPLACE VIEW vw_daily_triage_trend AS
SELECT 
    DATE(a.created_at) AS triage_date,
    COUNT(a.id) AS total_received,
    COUNT(t.id) AS total_triaged,
    COUNT(*) FILTER (WHERE t.execution_mode = 'llm') AS triaged_by_llm,
    COUNT(*) FILTER (WHERE t.execution_mode = 'degraded') AS triaged_by_heuristic,
    COUNT(*) FILTER (WHERE t.verdict = 'false_positive') AS false_positives,
    ROUND(AVG(t.execution_time_ms) / 1000.0, 2) AS avg_duration_sec
FROM alerts a
LEFT JOIN triage_results t ON a.id = t.alert_id
GROUP BY DATE(a.created_at)
ORDER BY triage_date DESC;
```

### 5.4. `vw_incident_summary`
Resumen consolidado de incidentes escalados, tiempos de resolución, operadores asignados y estados de tickets externos.
```sql
CREATE OR REPLACE VIEW vw_incident_summary AS
SELECT 
    i.id AS incident_id,
    i.title,
    i.severity,
    i.status,
    i.ticket_reference,
    u.full_name AS assigned_analyst,
    u.email AS analyst_email,
    a.id AS original_alert_id,
    a.source AS alert_source,
    a.source_ip,
    tk.external_system,
    tk.status AS external_ticket_status,
    i.created_at,
    i.resolved_at,
    CASE 
        WHEN i.resolved_at IS NOT NULL THEN 
            ROUND(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at)) / 60.0, 2)
        ELSE NULL 
    END AS duration_minutes
FROM incidents i
JOIN alerts a ON i.alert_id = a.id
LEFT JOIN users u ON i.assigned_to = u.id
LEFT JOIN tickets tk ON i.id = tk.incident_id;
```
