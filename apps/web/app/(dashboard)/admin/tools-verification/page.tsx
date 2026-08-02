'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { AdminToolsPanel } from '@/components/admin/admin-tools-panel';
import { AlertCircle, Lock } from 'lucide-react';
import { Role } from '@defensoria/shared';

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  errorIcon: {
    color: '#991b1b',
    flexShrink: 0,
  },
  errorText: {
    color: '#991b1b',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
};

export default function ToolsVerificationPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar que sea ADMINISTRADOR
  if (!user || user.role !== Role.ADMINISTRADOR) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <Lock style={styles.errorIcon} size={24} />
          <div style={styles.errorText}>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Acceso Denegado</h2>
            <p style={{ margin: 0 }}>
              Solo los administradores pueden acceder a este panel de verificación de herramientas.
            </p>
            {user && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Tu rol actual: {user.role}</p>}
          </div>
        </div>
      </div>
    );
  }

  return <AdminToolsPanel />;
}
