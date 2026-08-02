'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { canReadTool, ToolId, ACCESS_DENIED_MESSAGES, UserRole } from '@/lib/role-access';
import { Lock, AlertCircle } from 'lucide-react';

interface ProtectedToolProps {
  toolId: ToolId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireWrite?: boolean; // Si true, valida permisos de escritura
}

const styles = {
  deniedContainer: {
    backgroundColor: '#fee',
    border: '2px solid #f99',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#c00',
    marginTop: '1rem',
  },
  deniedIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  deniedTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  deniedMessage: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  deniedActions: {
    marginTop: '1.5rem',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#e8e8e8',
    color: '#333',
  },
};

/**
 * Componente que protege herramientas según permisos del usuario
 * 
 * Uso:
 * <ProtectedTool toolId="legal_discrepancies">
 *   <YourToolComponent />
 * </ProtectedTool>
 */
export function ProtectedTool({
  toolId,
  children,
  fallback,
  requireWrite = false,
}: ProtectedToolProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.deniedIcon}>🔒</div>
        <div style={styles.deniedTitle}>Usuario No Autenticado</div>
        <div style={styles.deniedMessage}>Por favor, inicia sesión para acceder a esta herramienta.</div>
      </div>
    );
  }

  const hasAccess = canReadTool(user.role as any, toolId);

  if (!hasAccess) {
    const message = ACCESS_DENIED_MESSAGES[user.role as UserRole] || 'No tienes permiso para acceder a esta herramienta.';

    return (
      fallback || (
        <div style={styles.deniedContainer}>
          <div style={styles.deniedIcon}>⛔</div>
          <div style={styles.deniedTitle}>Acceso Denegado</div>
          <div style={styles.deniedMessage}>{message}</div>
          <div style={styles.deniedActions}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => window.history.back()}
            >
              Volver
            </button>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={() => (window.location.href = '/dashboard/panel')}
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Componente para mostrar/ocultar botones de edición según permisos
 */
interface EditableToolProps {
  toolId: ToolId;
  children: React.ReactElement;
  onEdit?: () => void;
  onSave?: () => void;
  isEditing?: boolean;
}

export function EditableTool({ toolId, children, onEdit, onSave, isEditing }: EditableToolProps) {
  const { user } = useAuth();

  if (!user) return children;

  // Aquí se puede agregar lógica de edición

  return children;
}

/**
 * Hook para verificar permisos en componentes funcionales
 */
export function useToolAccess(toolId: ToolId) {
  const { user } = useAuth();

  if (!user) {
    return {
      canRead: false,
      canWrite: false,
      userRole: null,
    };
  }

  return {
    canRead: canReadTool(user.role as any, toolId),
    canWrite: canReadTool(user.role as any, toolId), // Puedes cambiar a canWriteTool si tienes esa función
    userRole: user.role,
  };
}

/**
 * Componente para mostrar indicador de permisos limitados
 */
export function ToolPermissionIndicator({ toolId, isEditing }: { toolId: ToolId; isEditing?: boolean }) {
  const { user } = useAuth();
  const { canRead, canWrite } = useToolAccess(toolId);

  if (!user || !canRead) return null;

  if (!canWrite && !isEditing) {
    return (
      <div
        style={{
          backgroundColor: '#eef',
          border: '1px solid #99f',
          borderRadius: '6px',
          padding: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: '#0066cc',
        }}
      >
        <Lock size={16} />
        <span>Modo lectura. Solo puedes ver esta información.</span>
      </div>
    );
  }

  return null;
}
