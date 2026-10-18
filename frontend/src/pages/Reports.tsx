import React, { useState } from 'react';
import { Can } from '../components/common/Can';
import {
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  CheckCircle2,
  Lock,
  BarChart,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('executive_monthly');
  const [format, setFormat] = useState<string>('xlsx');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportTypes = [
    {
      id: 'operational_daily',
      title: 'Reporte Operacional Diario de Triaje',
      badge: 'Operacional (Tier 1/2)',
      description: 'Resumen consolidado de eventos recibidos en las últimas 24 horas, tasa de falsos positivos filtrados y desglose de tiempos de resolución por sensor.',
      icon: Calendar,
      color: 'cyan'
    },
    {
      id: 'executive_monthly',
      title: 'Informe Ejecutivo Mensual de Ciberseguridad',
      badge: 'Gerencial / CISO',
      description: 'Métricas de alto nivel para el comité de dirección: evolución del MTTT, cumplimiento de SLA (<90s), mapa de top orígenes hostiles y retorno de inversión SOAR.',
      icon: BarChart,
      color: 'purple'
    },
    {
      id: 'compliance_audit',
      title: 'Evidencia de Auditoría y Cumplimiento Normativo',
      badge: 'ISO 27001 & NIST CSF',
      description: 'Certificación forense de inmutabilidad: traza de eventos con cadena de hashes SHA-256 según ISO 27001 A.8.15, A.5.24 y NIST CSF DE.AE.',
      icon: Lock,
      color: 'emerald'
    }
  ];

  const formats = [
    {
      id: 'xlsx',
      name: 'Excel (.xlsx) con Gráficos Nativos',
      badge: 'openpyxl',
      ext: 'xlsx',
      icon: FileSpreadsheet,
      desc: 'Libro de trabajo con 4 hojas (Resumen, Alertas, Incidentes, Auditoría) y gráficos de barras integrados.'
    },
    {
      id: 'pdf',
      name: 'Documento PDF (.pdf) de Alta Definición',
      badge: 'ReportLab',
      ext: 'pdf',
      icon: FileText,
      desc: 'Formato corporativo con membrete oficial del SOC, tablas de distribución de severidad y sello forense.'
    },
    {
      id: 'docx',
      name: 'Documento Word (.docx) Editable',
      badge: 'python-docx',
      ext: 'docx',
      icon: FileText,
      desc: 'Informe técnico editable con estilos tipográficos jerárquicos y tablas de evidencia forense.'
    },
    {
      id: 'json',
      name: 'Exportación Estructurada (.json)',
      badge: 'REST API',
      ext: 'json',
      icon: FileCode,
      desc: 'Carga útil cruda estructurada para ingesta directa en pipelines de datos y correladores SIEM.'
    }
  ];

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(null);
    try {
      const url = `/api/v1/reports/export?report_type=${reportType}&format=${format}`;
      const resp = await fetch(url);

      if (!resp.ok) {
        throw new Error(`Error en el servidor al compilar el reporte (${resp.status})`);
      }

      const blob = await resp.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `soc_lite_${reportType}_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(`Reporte exportado exitosamente en formato .${format.toUpperCase()}`);
    } catch (err: unknown) {
      alert(`Error al generar el reporte: ${err instanceof Error ? err.message : 'Error de conexión'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
          Centro de Exportación de Reportes (Requisito R4)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Generación y descarga de informes ejecutivos, operacionales y de cumplimiento en 4 formatos nativos sin dependencias externas.
        </p>
      </div>

      {downloadSuccess && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#34d399'
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{downloadSuccess}</span>
        </div>
      )}

      {/* Paso 1: Seleccionar Tipo de Reporte */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyber-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
          Paso 1: Selecciona el Tipo de Informe de Ciberseguridad:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {reportTypes.map((rt) => {
            const isSelected = reportType === rt.id;
            const Icon = rt.icon;
            return (
              <div
                key={rt.id}
                onClick={() => setReportType(rt.id)}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--cyber-cyan)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(0, 210, 255, 0.08)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 210, 255, 0.2)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'var(--cyber-cyan)' : 'var(--text-muted)'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-dim)'
                    }}
                  >
                    {rt.badge}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-main)' }}>
                  {rt.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                  {rt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 2: Seleccionar Formato de Exportación */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyber-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
          Paso 2: Selecciona el Formato de Salida:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {formats.map((fmt) => {
            const isSelected = format === fmt.id;
            const Icon = fmt.icon;
            return (
              <div
                key={fmt.id}
                onClick={() => setFormat(fmt.id)}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--cyber-cyan)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(0, 210, 255, 0.08)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 210, 255, 0.2)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Icon size={20} color={isSelected ? 'var(--cyber-cyan)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyber-emerald)' }}>
                    {fmt.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  {fmt.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.35 }}>
                  {fmt.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 3: Disparo de Descarga con Control RBAC (Requisito R5) */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderTop: '2px solid var(--cyber-cyan)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            Compilación Lista para Despacho
          </span>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Se compilarán métricas en vivo, eventos recientes de la base de datos y verificación de hashes SHA-256.
          </p>
        </div>

        {/* Autorización condicional RBAC exigida */}
        <Can
          I="reports:export"
          fallback={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <AlertCircle size={16} color="var(--cyber-amber)" />
              <span>Tu rol actual no posee autorización para descargar reportes formales (Se requiere <code>reports:export</code>).</span>
            </div>
          }
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Download size={18} className={downloading ? 'animate-spin' : ''} />
            {downloading ? 'Generando Reporte Nativo...' : `Descargar Reporte en .${format.toUpperCase()}`}
          </button>
        </Can>
      </div>
    </div>
  );
};
