# SOC-Lite: Sistema de Triaje Automático de Alertas SOC con IA Agéntica y Orquestación Low-Code

![SOC-Lite Architecture](https://img.shields.io/badge/Architecture-3--Tier%20Hybrid-blue)
![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![n8n](https://img.shields.io/badge/n8n-Orchestration-EA4B71)
![License](https://img.shields.io/badge/License-MIT-green)

**SOC-Lite** es una plataforma integral de triaje de alertas de ciberseguridad diseñada para operar como un **SOAR ligero y autónomo** para pequeñas y medianas empresas (PYMEs) y administraciones públicas. Resuelve la **fatiga de alertas** provocada por SIEMs como Wazuh mediante una arquitectura híbrida de orquestación low-code (**n8n**), microservicios de enriquecimiento contextual y razonamiento cognitivo con LLMs locales (**LangChain + Ollama**), respaldada por un motor de base de datos **PostgreSQL 16** con auditoría forense inmutable basada en **cadenas de hashes SHA-256**.

---

## 🚀 Características Principales

- **Reducción del MTTT (Mean Time to Triage):** Disminución verificada de horas a < 90 segundos por alerta.
- **Resiliencia 24/7 sin Punto Único de Fallo:** Si el runtime LLM (Ollama) sufre caídas o timeouts, conmuta automáticamente a un **motor heurístico de reglas deterministas** marcado como `degraded`. La alerta **nunca se pierde**.
- **El Agente Propone, No Ejecuta:** Toda salida del agente se valida mediante esquemas estrictos de **Pydantic** antes de su persistencia.
- **Control de Acceso Basado en Roles (RBAC):** Permisos granulares `modulo:accion`, 5 roles predefinidos (`admin`, `soc_lead`, `analyst_tier2`, `analyst_tier1`, `auditor`) y ocultación dinámica de acciones en frontend.
- **Doble Capa de Auditoría Criptográfica:** Middleware de accesos HTTP + servicio de auditoría de negocio con encadenamiento SHA-256 (`curr_hash = SHA256(prev_hash + ...)`), asegurando cumplimiento **ISO 27001 A.8.15** y **A.5.24**.
- **Generación de Reportes Nativos Multi-formato (R4):** Exportación en **PDF** (ReportLab con gráficos y tablas ejecutivas), **Word** (python-docx estructurado) y **Excel** (openpyxl con múltiples hojas y gráficos nativos de barras y pastel).
- **Consola de Operaciones de Alto Impacto Visual:** Frontend en **React 18 + TypeScript + Vite** con estética *Dark Cybersecurity*, más de 8 tarjetas KPI en tiempo real y más de 7 gráficos interactivos **Recharts**.

---

## 📁 Estructura del Repositorio

```text
soc-lite/
├── README.md                      # Documento principal y guía de inicio rápido
├── docker-compose.yml              # Orquestación completa de servicios
├── .env.example                    # Variables de entorno modelo
├── docs/                           # Documentación técnica exhaustiva (7 secciones)
│   ├── 01-arquitectura.md          # Especificación arquitectónica, ADRs y riesgos
│   ├── 02-modelo-datos.md          # Modelo relacional, 12 tablas, 4 vistas y 8 enums
│   ├── 03-backend.md               # Especificación técnica del backend FastAPI y RBAC
│   ├── 04-frontend.md              # Arquitectura de la consola React Vite y gráficos
│   ├── 05-workflow-n8n.md          # Diagrama y detalle de los 10 nodos de n8n
│   ├── 06-datasets-publicos.md     # Catálogo de 56 datasets públicos (8 categorías)
│   └── 07-stack-tecnologico.md     # Justificación de tecnologías, alternativas y TCO
├── db/
│   ├── schema.sql                  # Esquema DDL con 12 tablas, 4 vistas, 8 enums e índices
│   └── seed.sql                    # Datos semilla con roles, usuarios, alertas y auditoría
├── backend/                        # API REST FastAPI + SQLAlchemy 2.0 Async + Reportes
├── langchain-service/              # Microservicio de agentes de triaje y enriquecimiento
├── frontend/                       # Aplicación React 18 + TS + Vite + Recharts
└── n8n/
    └── soc_lite_triage_workflow.json  # Workflow exportado de 10 nodos con reintentos
```

---

## 🛠️ Requisitos Previos

- **Docker & Docker Compose** (versión 24.0+ recomendada)
- O bien para ejecución local:
  - **Python 3.11+**
  - **Node.js 18+** y **npm**
  - **PostgreSQL 15+**

---

## ⚡ Despliegue Rápido con Docker Compose

1. Clonar el repositorio y configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Iniciar todos los servicios en segundo plano:
   ```bash
   docker compose up -d --build
   ```

3. URLs de acceso a los servicios:
   - **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
   - **Backend API & Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Microservicio LangChain:** [http://localhost:8001/docs](http://localhost:8001/docs)
   - **Consola n8n:** [http://localhost:5678](http://localhost:5678)
   - **Base de Datos PostgreSQL:** `localhost:5432` (usuario: `soc_user`, bd: `soc_lite_db`)

---

## 🔑 Credenciales de Acceso Semilla

| Usuario | Correo Electrónico | Contraseña | Rol Asignado | Nivel de Privilegios |
|---------|-------------------|------------|--------------|----------------------|
| **Super Administrador** | `admin@soc-lite.internal` | `Admin123!` | `admin` | Acceso completo (`*:*`) |
| **Líder SOC Tier 3** | `lead@soc-lite.internal` | `Lead123!` | `soc_lead` | Aprobación, gestión de incidentes y reportes |
| **Analista Tier 2** | `analyst2@soc-lite.internal` | `Tier2Pass123!` | `analyst_tier2` | Investigación profunda y mitigación |
| **Analista Tier 1** | `analyst1@soc-lite.internal` | `Tier1Pass123!` | `analyst_tier1` | Triaje de alertas y operación básica |
| **Auditor de Seguridad**| `auditor@soc-lite.internal` | `Auditor123!` | `auditor` | Solo lectura y verificación de bitácoras |

---

## 🧪 Comandos de Humo (Smoke Testing)

### 1. Verificar Estado del Backend y Base de Datos
```bash
curl -X GET http://localhost:8000/api/v1/health
```

### 2. Autenticación y Obtención de Token JWT
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@soc-lite.internal&password=Admin123!"
```

### 3. Disparo Manual de Triaje al Microservicio LangChain
```bash
curl -X POST http://localhost:8001/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "c1f7a0b3-90d1-4e7a-9a99-90b5df8e4d10",
    "title": "Posible ataque de fuerza bruta SSH",
    "source": "Wazuh-EDR",
    "source_ip": "185.220.101.5",
    "destination_ip": "192.168.1.10",
    "raw_payload": { "rule": { "id": "5710", "level": 10 }, "attempts": 48 }
  }'
```

### 4. Verificación Criptográfica de la Bitácora de Auditoría
```bash
curl -X GET http://localhost:8000/api/v1/audit/verify-chain \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

### 5. Descarga de Reporte Ejecutivo en Excel con Gráficos Nativos
```bash
curl -X GET "http://localhost:8000/api/v1/reports/export?report_type=executive_monthly&format=xlsx" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>" \
  --output reporte_ejecutivo.xlsx
```

---

## 🛡️ Cumplimiento Normativo Mapeado

- **NIST CSF v2.0 (DE.AE):** Clasificación automática de eventos anómalos, mitigación de falsos positivos y correlación de telemetría de red.
- **ISO/IEC 27001:2022:**
  - **A.8.15 (Registro de eventos):** Registro inmutable con sellado criptográfico de hashes `prev_hash` y `curr_hash`.
  - **A.5.24 (Respuesta a incidentes):** Escalado guiado de alertas a incidentes con seguimiento de tickets y tiempos de resolución.
