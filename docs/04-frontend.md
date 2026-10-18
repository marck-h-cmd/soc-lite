# 04. Frontend del Sistema — React 18, TypeScript & Vite

## 1. Visión General y Experiencia de Usuario

La interfaz web de **SOC-Lite** es una consola de operaciones de ciberseguridad moderna construida con **React 18**, **TypeScript** estricto y empaquetada mediante **Vite**. Está diseñada bajo la estética **Dark Cybersecurity Theme** (fondos obsidiana `#0a0e17`, acentos cian cyber `#00d2ff`, estados en esmeralda, ámbar y carmesí), ofreciendo alta densidad de información, contraste óptimo y actualización en tiempo real sin recarga de página.

---

## 2. Arquitectura de Módulos y Rutas

```
frontend/
├── src/
│   ├── main.tsx                    # Punto de entrada de la aplicación React
│   ├── App.tsx                     # Enrutador principal y layout con barra lateral
│   ├── index.css                   # Sistema de diseño con variables CSS y estilos cyber
│   ├── types/
│   │   └── index.ts                # Tipos TypeScript para alertas, KPIs, RBAC y auditoría
│   ├── context/
│   │   └── AuthContext.tsx         # Estado global de autenticación, token JWT y permisos
│   ├── hooks/
│   │   ├── useAuth.ts              # Hook de autenticación y helpers de permisos
│   │   ├── useMetrics.ts           # Hook de consulta de telemetría y KPIs en tiempo real
│   │   └── useAlerts.ts            # Hook de consulta y triaje de alertas
│   ├── components/
│   │   ├── common/
│   │   │   ├── Can.tsx             # Componente de autorización RBAC condicional
│   │   │   ├── Navbar.tsx          # Barra superior con estado de red y usuario
│   │   │   ├── Sidebar.tsx         # Navegación lateral reactiva con indicador de rol
│   │   │   ├── MetricCard.tsx      # Tarjeta KPI con indicador de tendencia y brillo cyber
│   │   │   └── Modal.tsx           # Ventana modal accesible y estilizada
│   │   └── widgets/
│   │       ├── SeverityBadge.tsx   # Badge de severidad con código de color
│   │       ├── VerdictBadge.tsx    # Badge de veredicto (Malicioso, Sospechoso, FP, etc.)
│   │       └── HashVerificationModal.tsx # Visor de verificación criptográfica de la bitácora
│   └── pages/
│       ├── Login.tsx               # Acceso seguro con credenciales y selección de rol demo
│       ├── Dashboard.tsx           # Vista principal: 8+ KPIs y 7+ gráficos interactivos
│       ├── Alerts.tsx              # Gestión de alertas, filtros y modal de triaje LLM
│       ├── TriageStats.tsx         # Estadísticas profundas de triaje, MTTT P95 y modo degradado
│       ├── Incidents.tsx           # Gestión de incidentes y seguimiento de tickets
│       ├── Reports.tsx             # Centro de generación y descarga de reportes PDF/DOCX/XLSX
│       ├── RbacManagement.tsx      # Matriz editable de permisos por rol y usuarios
│       └── AuditLog.tsx            # Visor forense inmutable y verificador de cadena SHA-256
├── vite.config.ts                  # Configuración de compilación y code splitting
├── tsconfig.json                   # Configuración estricta de TypeScript
└── package.json                    # Dependencias y scripts
```

---

## 3. Catálogo de Indicadores y Gráficos (R3)

### 3.1. Tarjetas KPI (≥ 8 Tarjetas)
1. **Total de Alertas Recibidas:** Volumen global procesado en la ventana temporal.
2. **Alertas Pendientes de Triaje:** Cola de eventos en espera de análisis.
3. **Alertas Triadas con Éxito:** Eventos clasificados automáticamente por IA o heurística.
4. **Incidentes Escalados:** Amenazas confirmadas asignadas a analistas Tier 2/3.
5. **Tasa de Falsos Positivos (%):** Porcentaje de ruido filtrado exitosamente.
6. **MTTT Promedio (`mttt_avg_sec`):** Tiempo medio de resolución de triaje.
7. **MTTT Percentil 95 (`mttt_p95_sec`):** Garantía de SLA para el 95% de las alertas.
8. **Amenazas Críticas y Altas:** Indicador de contingencias activas de máxima prioridad.

### 3.2. Gráficos Analíticos Interactivos (≥ 7 Gráficos Recharts)
1. **Distribución por Severidad:** Gráfico Donut de alertas categorizadas (`critical`, `high`, `medium`, `low`, `info`).
2. **Tendencia Diaria de Ingesta y Triaje:** Gráfico de Área/Línea con comparativa de eventos recibidos vs. triados.
3. **Top 10 Direcciones IP Atacantes:** Gráfico de Barras horizontales ordenado por frecuencia y país de origen.
4. **Ratio de Falsos Positivos vs. Maliciosos:** Gráfico Circular con segmentación de veredictos del triaje.
5. **Distribución del MTTT y Percentil 95:** Gráfico de Barras con línea de referencia de umbral SLA (90s).
6. **Desglose de Ejecución IA vs. Heurística (Degraded):** Gráfico de Barras apiladas mostrando la resiliencia del sistema.
7. **Matriz de Ingesta por Hora del Día:** Gráfico de Barras de telemetría de 24 horas para detección de actividad nocturna anómala.

---

## 4. Control de Acceso Granular en la Interfaz (RBAC)

Para evitar que operadores ejecuten acciones fuera de su perfil (ej. analistas Tier 1 exportando reportes de auditoría o modificando roles), la interfaz implementa el componente guardián `<Can />`:

```tsx
// Ejemplo de uso en Reports.tsx
<Can I="reports:export" fallback={<p className="text-muted">No posee autorización para exportar reportes.</p>}>
  <button onClick={handleDownload} className="btn-primary">
    Descargar Reporte Ejecutivo
  </button>
</Can>
```

Los elementos del menú lateral se ocultan o deshabilitan dinámicamente si el usuario autenticado carece del permiso de lectura en el módulo correspondiente.

---

## 5. Optimización de Compilación y Code Splitting (Vite)

La configuración de `vite.config.ts` divide el bundle en fragmentos (*chunks*) optimizados para garantizar tiempos de carga inicial inferiores a 400ms:
- `vendor`: React, React-DOM, React-Router-DOM.
- `charts`: Recharts y dependencias matemáticas de renderizado SVG.
- `icons`: Lucide-React para iconos vectoriales de ciberseguridad.
- `query`: Cliente HTTP y utilidades de serialización.
