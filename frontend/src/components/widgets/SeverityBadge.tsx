import React from 'react';
import { SeverityLevel } from '../../types';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'sm' }) => {
  const sev = (severity || 'info').toLowerCase();

  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    critical: {
      label: 'Crítico',
      className: 'badge-critical',
      icon: <ShieldAlert size={size === 'sm' ? 12 : 14} />
    },
    high: {
      label: 'Alto',
      className: 'badge-high',
      icon: <AlertTriangle size={size === 'sm' ? 12 : 14} />
    },
    medium: {
      label: 'Medio',
      className: 'badge-medium',
      icon: <AlertCircle size={size === 'sm' ? 12 : 14} />
    },
    low: {
      label: 'Bajo',
      className: 'badge-low',
      icon: <Info size={size === 'sm' ? 12 : 14} />
    },
    info: {
      label: 'Info',
      className: 'badge-info',
      icon: <Info size={size === 'sm' ? 12 : 14} />
    }
  };

  const item = config[sev] || config['info'];

  return (
    <span className={`badge ${item.className}`}>
      {item.icon}
      {item.label}
    </span>
  );
};
