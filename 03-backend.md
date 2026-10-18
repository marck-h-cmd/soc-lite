# 03. Backend del Sistema — FastAPI & SQLAlchemy 2.0 Async

## 1. Visión General de la Capa Backend

El backend de **SOC-Lite** está implementado con **FastAPI** y **SQLAlchemy 2.0** en modo asíncrono puro (`asyncpg`). Actúa como el centro neurálgico del sistema, exponiendo la API canónica para la consola de operaciones, coordinando el control de acceso basado en roles (**RBAC**), gestionando la doble capa de auditoría forense inmutable y compilando reportes ejecutivos y operacionales en **PDF, Word y Excel nativo**.

---

## 2. Estructura de Módulos del Backend

```
backend/
├── app/
│   ├── main.py                     # Punto de entrada FastAPI, middlewares y routers
│   ├── core/
│   │   ├── config.py               # Variables de entorno con pydantic-settings
│   │   └── security.py             # Criptografía JWT, hashing de contraseñas con bcrypt
│   ├── db/
│   │   ├── session.py              # Engine asíncrono y sesión SQLAlchemy (asyncpg)
│   │   └── models.py               # Modelos ORM que replican el esquema SQL
│   ├── middleware/
│   │   └── audit_middleware.py     # Capa 1: Middleware de auditoría de acceso HTTP
│   ├── services/
│   │   ├── audit_service.py        # Capa 2: Servicio de auditoría de negocio con cadena SHA-256
│   │   ├── triage_client.py        # Cliente HTTP asíncrono para el microservicio LangChain
│   │   └── report_service.py       # Motores de exportación ReportLab, python-docx y openpyxl
│   └── api/
│       ├── deps.py                 # Inyección de dependencias (get_db, current_user, RBAC)
│       └── v1/
│           ├── auth.py             # Autenticación JWT (/login, /me)
│           ├── alerts.py           # Gestión y consulta de alertas
│           ├── incidents.py        # Escalado y resolución de incidentes
│           ├── metrics.py          # Agregaciones analíticas y contrato canónico
│           ├── reports.py          # Generación y descarga de reportes
│           ├── users.py            # Administración de usuarios
│           ├── rbac.py             # Matriz de permisos y asignación a roles
│           └── audit.py            # Consulta y verificación forense de la bitácora
├── requirements.txt                # Dependencias del servicio
└── Dockerfile                      # Empaquetado en contenedor Docker
```

---

## 3. Seguridad y Control de Acceso Basado en Roles (RBAC)

El acceso a las rutas de la API está protegido mediante tokens Bearer JWT y validación granular de permisos con formato canónico `modulo:accion`.

### 3.1. Roles del Sistema
- `admin`: Super Administrador SOC con acceso completo (`*:*`).
- `soc_lead`: Líder de SOC Tier 3, aprobación de reportes, triajes avanzados y gestión de incidentes.
- `analyst_tier2`: Analista de incidentes, investigación profunda y contención.
- `analyst_tier1`: Operador de triaje de alertas y validación inicial.
- `auditor`: Auditor de cumplimiento con permisos de solo lectura y verificación de bitácoras.

### 3.2. Dependencia de Verificación de Permisos
```python
def require_permission(required_perm: str):
    async def permission_checker(
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        # Administrador tiene bypass de permisos
        if current_user.role.name == "admin":
            return current_user
            
        user_perms = {f"{p.module}:{p.action}" for p in current_user.role.permissions}
        if required_perm not in user_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso insuficiente: se requiere '{required_perm}'"
            )
        return current_user
    return permission_checker
```

---

## 4. Doble Capa de Auditoría Forense

Cumpliendo con el Requisito R6 y la norma ISO 27001 A.8.15, el backend implementa dos capas complementarias de registro:

1. **Capa 1 (Middleware de Acceso HTTP):** Registra cada solicitud entrante, midiendo método, URL, IP cliente, código de estado HTTP y tiempo de respuesta en milisegundos.
2. **Capa 2 (Servicio de Dominio de Negocio):** Se invoca explícitamente en operaciones críticas (`triage`, `escalate`, `export`, `login`, `update_role`). Calcula el hash criptográfico SHA-256 encadenado:
   $$\text{curr\_hash} = \text{SHA256}(\text{prev\_hash} \,||\, \text{timestamp} \,||\, \text{username} \,||\, \text{module} \,||\, \text{action} \,||\, \text{target\_id} \,||\, \text{result} \,||\, \text{details\_json})$$

### 4.1. Verificación de Integridad de la Cadena
El endpoint `/api/v1/audit/verify-chain` recorre secuencialmente todos los registros de la tabla `audit_log`, recalcula cada hash y certifica si la bitácora ha sido alterada o si conserva integridad criptográfica del 100%.

---

## 5. Motor de Reportes Operacionales y Ejecutivos (R4)

El backend integra tres generadores de documentos sin requerir dependencias externas de Node ni navegadores headless:

1. **PDF (ReportLab):** Genera documentos con membrete de SOC, resumen ejecutivo, tabla de distribución de severidades, métricas MTTT y tabla forense de incidentes recientes.
2. **Word (python-docx):** Produce informes ejecutivos y de cumplimiento con estilos tipográficos corporativos, encabezados jerárquicos y tablas de evidencia técnica.
3. **Excel (openpyxl):** Genera libros de trabajo con múltiples hojas:
   - `Resumen Ejecutivo`: Métricas clave y KPIs.
   - `Alertas Detalladas`: Listado tabular completo con severidad y origen.
   - `Incidentes`: Histórico de tiempos de contención.
   - `Auditoría Forense`: Traza de eventos y hashes.
   - **Gráficos Nativos:** Incorpora un objeto `BarChart` y `PieChart` nativo de Excel renderizado dentro de la hoja de cálculo.

---

## 6. Contrato de API Canónico y Alias para Widgets

Para garantizar compatibilidad total entre el backend y los componentes del frontend (widgets de gráficos y tarjetas KPI), los esquemas de respuesta implementan campos canónicos y alias normalizados mediante serializadores Pydantic:

| Campo Canónico | Alias Aceptado por Widgets | Tipo | Descripción |
|----------------|----------------------------|------|-------------|
| `date` | `period` | string (YYYY-MM-DD) | Marca de fecha para series temporales de gráficos |
| `mttt_avg_sec` | `mttt_avg` | float | Tiempo medio de triaje en segundos |
| `metric_name` / `metric_value` | `key` / `value` | string / numeric | Pares clave-valor para gráficos circulares y barras |
| `count` | `total` / `value` | integer | Conteo absoluto de ocurrencias |

### Ejemplo de Respuesta Normalizada de Métricas (`/api/v1/metrics/dashboard`)
```json
{
  "kpis": {
    "total_alerts": 1248,
    "pending_alerts": 14,
    "triaged_alerts": 1184,
    "escalated_alerts": 50,
    "false_positive_alerts": 842,
    "critical_alerts": 38,
    "high_alerts": 112,
    "mttt_avg_sec": 42.5,
    "mttt_avg": 42.5,
    "mttt_p95_sec": 78.2,
    "false_positive_rate_pct": 67.46,
    "llm_availability_pct": 99.4
  },
  "severity_distribution": [
    { "name": "Crítico", "key": "critical", "value": 38, "color": "#ef4444" },
    { "name": "Alto", "key": "high", "value": 112, "color": "#f97316" },
    { "name": "Medio", "key": "medium", "value": 320, "color": "#eab308" },
    { "name": "Bajo", "key": "low", "value": 530, "color": "#3b82f6" },
    { "name": "Informativo", "key": "info", "value": 248, "color": "#64748b" }
  ],
  "daily_trend": [
    { "date": "2026-10-12", "period": "2026-10-12", "total": 142, "triaged": 139, "false_positives": 98, "mttt_avg_sec": 44.1, "mttt_avg": 44.1 },
    { "date": "2026-10-13", "period": "2026-10-13", "total": 165, "triaged": 162, "false_positives": 115, "mttt_avg_sec": 39.8, "mttt_avg": 39.8 }
  ]
}
```
