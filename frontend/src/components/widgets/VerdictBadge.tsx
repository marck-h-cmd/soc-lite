import React from 'react';
import { TriageVerdict } from '../../types';
import { Skull, AlertOctagon, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface VerdictBadgeProps {
  verdict?: TriageVerdict | string;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict }) => {
  const v = (verdict || 'unknown').toLowerCase();

  const styles: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    malicious: {
      label: 'Malicioso',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: <Skull size={13} />
    },
    suspicious: {
      label: 'Sospechoso',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: <AlertOctagon size={13} />
    },
    benign: {
      label: 'Benigno',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.3)',
      icon: <ShieldCheck size={13} />
    },
    false_positive: {
      label: 'Falso Positivo',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: <CheckCircle2 size={13} />
    },
    unknown: {
      label: 'Pendiente',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.3)',
      icon: <HelpCircle size={13} />
    }
  };

  const current = styles[v] || styles['unknown'];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: current.color,
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`
      }}
    >
      {current.icon}
      {current.label}
    </span>
  );
};
