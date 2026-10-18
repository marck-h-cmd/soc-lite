# 07. Stack Tecnológico Detallado y Justificación de Arquitectura — SOC-Lite

## 1. Resumen Ejecutivo del Stack

| Componente | Tecnología Elegida | Versión | Alternativa Descartada | Justificación y Coste de la Decisión |
|------------|--------------------|---------|------------------------|---------------------------------------|
| **Base de Datos** | **PostgreSQL** | 16.2 | MongoDB 7.0 / Elasticsearch 8.x | PostgreSQL ofrece transacciones ACID estrictas, tipos de datos nativos (`INET`, `JSONB`, `ARRAY`, `ENUM`) y cálculo directo de percentiles con `percentile_cont(0.95)` sin requerir servidores de búsqueda adicionales. Coste: menor flexibilidad en esquemas puramente ad-hoc, pero coste de infraestructura 0 USD (licencia libre). |
| **Backend API** | **FastAPI + SQLAlchemy 2.0 async** | FastAPI 0.110+ / SQLAlchemy 2.0.28+ | Django 5.0 / Flask 3.0 | Desempeño asíncrono nativo para soportar ingesta concurrente de alertas I/O, generación automática de contratos OpenAPI v3 y validación de tipos con Pydantic v2. Coste: requiere manejo explícito de sesiones asíncronas con `asyncpg`. |
| **Orquestación Low-Code** | **n8n** | 1.33+ (Docker Community) | Apache Airflow / LangFlow | n8n permite integración inmediata mediante webhooks con SIEMs (Wazuh) y balancea visualmente los reintentos e idempotencia. LangFlow carecía de robustez para la orquestación y reintentos HTTP. Coste: consumo de ~350MB RAM en contenedor Node.js. |
| **Microservicio Agentes IA** | **Python + LangChain + Ollama** | LangChain 0.1.16+ / Ollama 0.1.30+ | OpenAI API pura en la nube | Procesamiento 100% on-premise mediante modelos locales (`llama3:8b`, `mistral:7b`) garantizando privacidad total (sin exfiltración de telemetría a la nube pública) y sin costes de tokens recurrentes por API. |
| **Frontend Web** | **React 18 + TypeScript + Vite** | React 18.2+ / Vite 5.1+ / TS 5.3+ | Next.js 14 / Angular 17 | Vite provee compilación instantánea y empaquetado optimizado con `splitChunks`; arquitectura SPA ligera para consola SOC privada sin la sobrecarga ni complejidad de renderizado del lado del servidor (SSR). |
| **Visualización** | **Recharts** | 2.12+ | Chart.js / D3.js | Componentes declarativos nativos de React con tipado TypeScript, aceleración SVG y soporte responsivo sin requerir manipulación directa del DOM de D3. |
| **Exportación PDF** | **ReportLab** | 4.1+ | WeasyPrint / Puppeteer | Generación directa y ligera de documentos PDF mediante código Python sin necesidad de levantar navegadores Chromium en servidores headless. |
| **Exportación Word** | **python-docx** | 1.1+ | Plantillas Jinja HTML a DOCX | Manipulación nativa del formato OpenXML (.docx) con tipografía, encabezados corporativos y tablas estructuradas. |
| **Exportación Excel** | **openpyxl** | 3.1+ | xlsxwriter / Pandas to_excel | Soporte completo para libros de trabajo de múltiples hojas, estilos tipográficos de celdas y renderizado de gráficos nativos (`BarChart`, `PieChart`) incrustados. |

---

## 2. Análisis Coste Total de Propiedad (TCO)

El despliegue de soluciones comerciales de SOAR (como Cortex XSOAR de Palo Alto Networks o Splunk SOAR) impone costes iniciales superiores a los **40.000 – 100.000 USD anuales** en licenciamiento base por volumen de alertas, sumado a costes de almacenamiento de nube y consultoría especializada.

**SOC-Lite** reduce el coste de adquisición a **0 USD en licenciamiento de software**:
- **Cero licencias comerciales:** Todo el stack está cimentado sobre tecnologías de código abierto certificadas (PostgreSQL, FastAPI, React, n8n Community, Ollama, LangChain).
- **Consumo de Hardware Moderado:** Un servidor o instancia virtual de 4 vCPUs y 16 GB de RAM con GPU moderada (o ejecución en CPU con cuantización 4-bit de Llama-3) es suficiente para procesar más de 20.000 alertas diarias.
- **Sin Costes Ocultos de API LLM:** Al emplear Ollama local para el triaje rutinario y solo conmutar a OpenAI si la política corporativa explícitamente lo financia, el coste marginal por alerta triada es prácticamente nulo.

---

## 3. Matriz de Dependencias y Versiones

### 3.1. Backend (`backend/requirements.txt`)
```text
fastapi==0.110.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.28
asyncpg==0.29.0
pydantic==2.6.4
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.2
httpx==0.27.0
python-multipart==0.0.9
reportlab==4.1.0
python-docx==1.1.0
openpyxl==3.1.2
```

### 3.2. Microservicio LangChain (`langchain-service/requirements.txt`)
```text
fastapi==0.110.0
uvicorn[standard]==0.29.0
pydantic==2.6.4
pydantic-settings==2.2.1
langchain==0.1.16
langchain-community==0.0.33
httpx==0.27.0
```

### 3.3. Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "recharts": "^2.12.3",
    "lucide-react": "^0.359.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.6"
  }
}
```
