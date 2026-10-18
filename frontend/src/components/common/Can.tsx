import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface CanProps {
  I: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ I, fallback = null, children }) => {
  const { hasPermission } = useAuth();

  if (hasPermission(I)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
