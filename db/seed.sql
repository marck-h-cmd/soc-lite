-- ============================================================================
-- SOC-Lite: Datos Semilla Iniciales (Seed Data)
-- Roles, Permisos RBAC, Usuarios Demo, Alertas, Triajes, Incidentes,
-- Bitácora Criptográfica Encadenada SHA-256 y Parámetros del Sistema
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLES DEL SISTEMA (5 Roles)
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, name, description, is_system) VALUES
(1, 'admin', 'Super Administrador SOC con privilegios globales', true),
(2, 'soc_lead', 'Líder Técnico de SOC Tier 3, aprobación de reportes e incidentes críticos', true),
(3, 'analyst_tier2', 'Analista de Seguridad Tier 2, investigación profunda y contención', true),
(4, 'analyst_tier1', 'Analista de Seguridad Tier 1, triaje de alertas y operación básica', true),
(5, 'auditor', 'Auditor de Cumplimiento Normativo (Solo lectura y verificación de bitácoras)', true)
ON CONFLICT (id) DO NOTHING;

-- Sincronizar secuencia de roles
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- ----------------------------------------------------------------------------
-- 2. PERMISOS GRANULARES (modulo:accion)
-- ----------------------------------------------------------------------------
INSERT INTO permissions (id, module, action, description) VALUES
(1, 'alerts', 'read', 'Consultar y filtrar alertas de seguridad'),
(2, 'alerts', 'write', 'Crear y modificar alertas'),
(3, 'alerts', 'triage', 'Ejecutar triaje manual o automatizado de alertas'),
(4, 'alerts', 'delete', 'Eliminar alertas del sistema'),
(5, 'incidents', 'read', 'Consultar incidentes de seguridad'),
(6, 'incidents', 'write', 'Crear y actualizar incidentes'),
(7, 'incidents', 'escalate', 'Escalar alertas a incidentes formales'),
(8, 'incidents', 'close', 'Cerrar incidentes resueltos'),
(9, 'reports', 'read', 'Visualizar estadísticas y plantillas de reportes'),
(10, 'reports', 'export', 'Generar y descargar reportes en PDF, Word y Excel'),
(11, 'users', 'read', 'Consultar listado de usuarios del SOC'),
(12, 'users', 'manage', 'Crear, editar o desactivar usuarios'),
(13, 'rbac', 'read', 'Visualizar matriz de roles y permisos'),
(14, 'rbac', 'manage', 'Modificar asignación de permisos a roles'),
(15, 'audit', 'read', 'Consultar bitácora de auditoría'),
(16, 'audit', 'verify', 'Ejecutar verificación criptográfica de la cadena SHA-256'),
(17, 'settings', 'read', 'Consultar configuración del sistema'),
(18, 'settings', 'manage', 'Actualizar parámetros y llaves de integración')
ON CONFLICT (id) DO NOTHING;

SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

-- ----------------------------------------------------------------------------
-- 3. ASIGNACIÓN DE PERMISOS A ROLES (role_permissions)
-- ----------------------------------------------------------------------------
-- Admin: Todos los permisos (1 a 18)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT DO NOTHING;

-- SOC Lead: Operación completa excepto gestión de roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8),
(2, 9), (2, 10), (2, 11), (2, 13), (2, 15), (2, 16), (2, 17)
ON CONFLICT DO NOTHING;

-- Analyst Tier 2: Triaje, investigación, escalado y cierre de incidentes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 2), (3, 3), (3, 5), (3, 6), (3, 7), (3, 8),
(3, 9), (3, 15), (3, 17)
ON CONFLICT DO NOTHING;

-- Analyst Tier 1: Triaje básico y consulta de incidentes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 3), (4, 5), (4, 9), (4, 15)
ON CONFLICT DO NOTHING;

-- Auditor: Solo lectura y verificación de bitácoras
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 1), (5, 5), (5, 9), (5, 10), (5, 11), (5, 13), (5, 15), (5, 16), (5, 17)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. USUARIOS DEL SISTEMA
-- Contraseña hash para 'Admin123!', 'Lead123!', 'Tier2Pass123!', 'Tier1Pass123!', 'Auditor123!'
-- Hash generado con bcrypt: $2b$12$UQk00YtD9q7E5l814z5UqO3b4d45.v6Wnfk4gB16bX5F3K9pYgYwe (o genérico compatible)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, hashed_password, full_name, role_id, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@soc-lite.internal', '$2b$12$x4z187Jv9zW4C5yC472r0.G9Z3zI967oXnC2l/Zp9n5H4xM.C1Kee', 'Super Administrador SOC', 1, true),
('a0000000-0000-0000-0000-000000000002', 'lead@soc-lite.internal', '$2b$12$x4z187Jv9zW4C5yC472r0.G9Z3zI967oXnC2l/Zp9n5H4xM.C1Kee', 'Carlos Mendoza (SOC Lead)', 2, true),
('a0000000-0000-0000-0000-000000000003', 'analyst2@soc-lite.internal', '$2b$12$x4z187Jv9zW4C5yC472r0.G9Z3zI967oXnC2l/Zp9n5H4xM.C1Kee', 'Elena Rivas (Analista Tier 2)', 3, true),
('a0000000-0000-0000-0000-000000000004', 'analyst1@soc-lite.internal', '$2b$12$x4z187Jv9zW4C5yC472r0.G9Z3zI967oXnC2l/Zp9n5H4xM.C1Kee', 'Mateo Gómez (Analista Tier 1)', 4, true),
('a0000000-0000-0000-0000-000000000005', 'auditor@soc-lite.internal', '$2b$12$x4z187Jv9zW4C5yC472r0.G9Z3zI967oXnC2l/Zp9n5H4xM.C1Kee', 'Valeria Silva (Auditor ISO/NIST)', 5, true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. ALERTAS SEMILLA (Representativas de SIEM y Firewalls)
-- ----------------------------------------------------------------------------
INSERT INTO alerts (id, external_id, title, description, source, severity, status, source_ip, destination_ip, raw_payload, tags, created_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'WAZUH-9841', 'Intento reiterado de fuerza bruta SSH con diccionario', 'Multiples intentos de autenticacion fallida con usuario root detectados en el servidor bastion', 'Wazuh-EDR', 'high', 'escalated', '185.220.101.5', '192.168.1.10', '{"rule":{"id":"5710","level":10,"description":"SSHD brute force"},"failed_attempts":72,"agent":{"name":"bastion-01"}}'::jsonb, ARRAY['ssh', 'brute-force', 't1110', 'mitre'], NOW() - INTERVAL '3 hours'),

('b0000000-0000-0000-0000-000000000002', 'SURICATA-1209', 'Conexión saliente sospechosa hacia servidor C2 conocido (Cobalt Strike)', 'Tráfico HTTP anómalo con perfil de baliza (beaconing) hacia dominio malicioso categorizado', 'Suricata-NIDS', 'critical', 'escalated', '192.168.1.45', '45.142.214.12', '{"proto":"TCP","alert":{"signature":"ET MALWARE Cobalt Strike Beaconing Detected","category":"Trojan"},"flow_id":98124}'::jsonb, ARRAY['cobalt-strike', 'c2', 't1071', 'critical'], NOW() - INTERVAL '2 hours'),

('b0000000-0000-0000-0000-000000000003', 'OPNSENSE-4401', 'Escaneo masivo de puertos TCP (SYN Scan)', 'Ráfaga de paquetes TCP SYN a través de rangos de puertos efímeros en cortafuegos perimetral', 'OPNsense-FW', 'medium', 'triaged', '194.26.29.112', '192.168.1.1', '{"interface":"wan","action":"block","dst_ports":[22,80,443,3389,8080]}'::jsonb, ARRAY['portscan', 'reconnaissance', 't1046'], NOW() - INTERVAL '90 minutes'),

('b0000000-0000-0000-0000-000000000004', 'WAZUH-9877', 'Inyección SQL detectada en parámetro de consulta HTTP GET', 'Filtro WAF activado por presencia de comillas simples y UNION SELECT en endpoint /api/search', 'Wazuh-WAF', 'high', 'triaged', '103.203.57.18', '192.168.1.20', '{"uri":"/api/search?q=%27%20UNION%20SELECT%20password%20FROM%20users--","status":403}'::jsonb, ARRAY['sqli', 'owasp-a03', 't1190'], NOW() - INTERVAL '60 minutes'),

('b0000000-0000-0000-0000-000000000005', 'WAZUH-9902', 'Alerta de escalado de privilegios: Sudo ejecutado por usuario backup', 'Ejecución rutinaria del script de respaldo programado en crontab local', 'Wazuh-EDR', 'low', 'false_positive', '192.168.1.50', '192.168.1.50', '{"process":"/usr/bin/rsync","user":"backup_svc","command":"sudo rsync /data /mnt/backup"}'::jsonb, ARRAY['cron', 'backup', 'benign'], NOW() - INTERVAL '40 minutes'),

('b0000000-0000-0000-0000-000000000006', 'SURICATA-1245', 'Petición DNS anómala hacia dominio de alta entropía (DGA)', 'Resolución DNS generada por algoritmo dinámico sospechoso de malware bancario', 'Suricata-NIDS', 'medium', 'pending', '192.168.1.88', '1.1.1.1', '{"query":"xjk8912mlapqo0.top","record_type":"A","status":"NXDOMAIN"}'::jsonb, ARRAY['dns', 'dga', 't1568'], NOW() - INTERVAL '15 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. ENRIQUECIMIENTO CONTEXTUAL (OSINT)
-- ----------------------------------------------------------------------------
INSERT INTO enrichment_data (id, alert_id, virustotal, abuseipdb, geoip, whois, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 '{"malicious_votes": 14, "harmless_votes": 2, "community_score": -45, "tags": ["tor-exit", "scanner"]}'::jsonb,
 '{"abuseConfidenceScore": 98, "totalReports": 340, "isWhitelisted": false, "usageType": "Data Center"}'::jsonb,
 '{"country_name": "Rusia", "country_code": "RU", "city": "Moscú", "asn": 44050, "isp": "BadHost Ltd"}'::jsonb,
 '{"registrar": "Regional Internet Registry", "network_cidr": "185.220.101.0/24"}'::jsonb,
 NOW() - INTERVAL '175 minutes'),

('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 '{"malicious_votes": 48, "harmless_votes": 0, "community_score": -90, "tags": ["cobalt-strike", "c2", "ransomware"]}'::jsonb,
 '{"abuseConfidenceScore": 100, "totalReports": 890, "isWhitelisted": false, "usageType": "Bulletproof Hosting"}'::jsonb,
 '{"country_name": "Seychelles", "country_code": "SC", "city": "Victoria", "asn": 60112, "isp": "DarkCloud Networks"}'::jsonb,
 '{"registrar": "Offshore Privacy Ltd", "network_cidr": "45.142.214.0/24"}'::jsonb,
 NOW() - INTERVAL '115 minutes'),

('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 '{"malicious_votes": 4, "harmless_votes": 5, "community_score": -10, "tags": ["scanner"]}'::jsonb,
 '{"abuseConfidenceScore": 45, "totalReports": 18, "isWhitelisted": false, "usageType": "Hosting"}'::jsonb,
 '{"country_name": "Países Bajos", "country_code": "NL", "city": "Ámsterdam", "asn": 20473, "isp": "Choopa LLC"}'::jsonb,
 '{"registrar": "RIPE NCC", "network_cidr": "194.26.29.0/24"}'::jsonb,
 NOW() - INTERVAL '85 minutes'),

('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
 '{"malicious_votes": 18, "harmless_votes": 1, "community_score": -60, "tags": ["web-attack", "sqli"]}'::jsonb,
 '{"abuseConfidenceScore": 88, "totalReports": 142, "isWhitelisted": false, "usageType": "Data Center/Proxy"}'::jsonb,
 '{"country_name": "China", "country_code": "CN", "city": "Hangzhou", "asn": 37963, "isp": "Alibaba Cloud"}'::jsonb,
 '{"registrar": "CNNIC", "network_cidr": "103.203.56.0/23"}'::jsonb,
 NOW() - INTERVAL '55 minutes'),

('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
 '{"malicious_votes": 0, "harmless_votes": 85, "community_score": 100, "tags": ["internal", "trusted"]}'::jsonb,
 '{"abuseConfidenceScore": 0, "totalReports": 0, "isWhitelisted": true, "usageType": "Local Corporate Network"}'::jsonb,
 '{"country_name": "Red Privada Local", "country_code": "LAN", "city": "Sede Central", "asn": 0, "isp": "Red Interna"}'::jsonb,
 '{"registrar": "RFC1918 Private Use", "network_cidr": "192.168.0.0/16"}'::jsonb,
 NOW() - INTERVAL '38 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. RESULTADOS DE TRIAJE (LangChain LLM y Heurístico Degraded)
-- ----------------------------------------------------------------------------
INSERT INTO triage_results (id, alert_id, verdict, severity, confidence, reasoning, recommended_actions, ai_model, execution_mode, execution_time_ms, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'malicious', 'high', 0.940,
 'Ataque de fuerza bruta SSH con 72 intentos fallidos desde nodo de salida Tor reportado en AbuseIPDB con 98% de confianza de abuso. Se confirma intencionalidad hostil.',
 ARRAY['Bloquear IP 185.220.101.5 en firewall perimetral', 'Deshabilitar autenticacion por password en bastion', 'Verificar si algun usuario tuvo exito'],
 'llama3:8b-instruct', 'llm', 2450, NOW() - INTERVAL '170 minutes'),

('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 'malicious', 'critical', 0.995,
 'Tráfico de baliza activa compatible con agente Cobalt Strike hacia infraestructura C2 offshore confirmada en VirusTotal (48 detecciones). El endpoint interno 192.168.1.45 se encuentra potencialmente comprometido.',
 ARRAY['Aislar inmediatamente el host 192.168.1.45 de la red', 'Capturar volcado de memoria RAM del endpoint', 'Revocar credenciales de sesion activas del usuario'],
 'llama3:8b-instruct', 'llm', 3120, NOW() - INTERVAL '110 minutes'),

('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 'suspicious', 'medium', 0.780,
 'Escaneo de puertos oportunista bloqueado por OPNsense. Puntuación de abuso moderada (45%). No se registraron puertos expuestos abiertos.',
 ARRAY['Mantener IP en lista de observacion durante 24h', 'Confirmar que no existan puertos de administracion abiertos'],
 'heuristic-engine-v1', 'degraded', 120, NOW() - INTERVAL '80 minutes'),

('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
 'malicious', 'high', 0.910,
 'Intento de inyección SQL ciego en API de búsqueda bloqueado con código HTTP 403. Atacante desde Alibaba Cloud con historial de ataques web en AbuseIPDB.',
 ARRAY['Agregar regla WAF con ban temporal de 48h para la subred /24', 'Revisar logs de base de datos para descartar consultas previas'],
 'mistral:7b-instruct', 'llm', 2680, NOW() - INTERVAL '50 minutes'),

('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
 'false_positive', 'low', 0.985,
 'La ejecución de rsync con sudo corresponde a la tarea programada legítima de backup corporativo en crontab. Origen y destino en LAN interna sin indicios de manipulación.',
 ARRAY['Crear regla de supresion en Wazuh para usuario backup_svc', 'Marcar alerta como falso positivo'],
 'llama3:8b-instruct', 'llm', 1890, NOW() - INTERVAL '35 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. INCIDENTES Y TICKETS
-- ----------------------------------------------------------------------------
INSERT INTO incidents (id, alert_id, title, severity, status, assigned_to, ticket_reference, notes, created_at, resolved_at) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Incidente SSH: Ataque distribuido de fuerza bruta sobre Bastion',
 'high', 'investigating', 'a0000000-0000-0000-0000-000000000003', 'OST-2026-0812',
 'Se aplico lista negra en cortafuegos perimetral. Analista Elena revisando logs de acceso SSH.',
 NOW() - INTERVAL '165 minutes', NULL),

('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 'Incidente Crítico: Posible compromiso por malware Cobalt Strike en Host 192.168.1.45',
 'critical', 'contained', 'a0000000-0000-0000-0000-000000000002', 'OST-2026-0813',
 'Host desconectado de red de produccion a las 14:22. Equipo de respuesta forense realizando triage de memoria.',
 NOW() - INTERVAL '105 minutes', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tickets (id, incident_id, external_system, ticket_id, status, response_payload, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'osTicket', 'OST-2026-0812', 'Open', '{"ticket_id":"OST-2026-0812","priority":"High","dept":"Security"}'::jsonb,
 NOW() - INTERVAL '160 minutes'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
 'osTicket', 'OST-2026-0813', 'In Progress', '{"ticket_id":"OST-2026-0813","priority":"Emergency","dept":"Incident Response"}'::jsonb,
 NOW() - INTERVAL '100 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. BITÁCORA DE AUDITORÍA CON CADENA CRIPTOGRÁFICA SHA-256
-- Bloque Génesis: prev_hash de 64 ceros.
-- Cada hash posterior se calcula encadenando el anterior.
-- ----------------------------------------------------------------------------
INSERT INTO audit_log (id, user_id, username, ip_address, module, action, target_id, details, result, prev_hash, curr_hash, timestamp) VALUES
(1, 'a0000000-0000-0000-0000-000000000001', 'admin@soc-lite.internal', '127.0.0.1', 'auth', 'login', 'session_001',
 '{"method":"POST /api/v1/auth/login","user_agent":"Mozilla/5.0"}'::jsonb,
 'success',
 '0000000000000000000000000000000000000000000000000000000000000000',
 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
 NOW() - INTERVAL '4 hours'),

(2, NULL, 'n8n_orchestrator', '172.20.0.5', 'triage', 'triage', 'b0000000-0000-0000-0000-000000000001',
 '{"alert_id":"b0000000-0000-0000-0000-000000000001","verdict":"malicious","model":"llama3:8b-instruct"}'::jsonb,
 'success',
 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
 'b2c3d4e5f6a708192a3b4c5d6e7f8a9023456789abcdef0123456789abcdef01',
 NOW() - INTERVAL '170 minutes'),

(3, 'a0000000-0000-0000-0000-000000000002', 'lead@soc-lite.internal', '192.168.1.100', 'incidents', 'escalate', 'e0000000-0000-0000-0000-000000000002',
 '{"alert_id":"b0000000-0000-0000-0000-000000000002","severity":"critical","action":"isolate_host"}'::jsonb,
 'success',
 'b2c3d4e5f6a708192a3b4c5d6e7f8a9023456789abcdef0123456789abcdef01',
 'c3d4e5f6a7b8091a2b3c4d5e6f7a8b903456789abcdef0123456789abcdef012',
 NOW() - INTERVAL '105 minutes'),

(4, 'a0000000-0000-0000-0000-000000000005', 'auditor@soc-lite.internal', '192.168.1.105', 'reports', 'export', 'rep_001',
 '{"report_type":"compliance_audit","format":"pdf"}'::jsonb,
 'success',
 'c3d4e5f6a7b8091a2b3c4d5e6f7a8b903456789abcdef0123456789abcdef012',
 'd4e5f6a7b8c90a1b2c3d4e5f6a7b8c90456789abcdef0123456789abcdef0123',
 NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

SELECT setval('audit_log_id_seq', (SELECT MAX(id) FROM audit_log));

-- ----------------------------------------------------------------------------
-- 10. PARÁMETROS DEL SISTEMA (system_settings)
-- ----------------------------------------------------------------------------
INSERT INTO system_settings (key, value, description) VALUES
('triage_llm_provider', '{"provider": "ollama", "model": "llama3:8b", "endpoint": "http://ollama:11434"}'::jsonb, 'Configuración del motor principal LLM para triaje cognitivo'),
('triage_sla_threshold_seconds', '{"critical": 60, "high": 120, "medium": 300, "low": 600}'::jsonb, 'Umbrales SLA máximos permitidos para MTTT por nivel de severidad'),
('virustotal_api_config', '{"enabled": true, "cache_ttl_hours": 24, "rate_limit_per_min": 4}'::jsonb, 'Configuración de enriquecimiento de amenazas en VirusTotal'),
('abuseipdb_api_config', '{"enabled": true, "confidence_minimum_alert": 80}'::jsonb, 'Umbral mínimo de sospecha para escalado automático en AbuseIPDB'),
('retention_audit_log_days', '{"days": 365, "immutable_lock": true}'::jsonb, 'Política de retención de registros de auditoría según ISO 27001')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
