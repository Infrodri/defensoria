import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'loading' | 'error';
  userRole?: 'ABOGADO' | 'PSICOLOGO' | 'SOCIAL' | 'TRABAJADOR_SOCIAL' | 'JEFATURA' | 'ADMINISTRADOR' | 'SECRETARIA';
  toolType?: 'legal' | 'psychological' | 'social' | 'transversal';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  userRole, 
  toolType 
}) => {
  const isToolAvailableForRole = () => {
    if (!userRole || !toolType) return true;
    // ADMINISTRADOR y JEFATURA ven todo
    if (userRole === 'ADMINISTRADOR' || userRole === 'JEFATURA') return true;
    
    switch (toolType) {
      case 'legal':
        return userRole === 'ABOGADO';
      case 'psychological':
        return userRole === 'PSICOLOGO';
      case 'social':
        return userRole === 'SOCIAL' || userRole === 'TRABAJADOR_SOCIAL';
      case 'transversal':
        return true;
      default:
        return true;
    }
  };

  const getStatusInfo = () => {
    if (!isToolAvailableForRole()) {
      return {
        color: '#ff6b6b',
        backgroundColor: '#fff0f0',
        text: 'No autorizado',
        icon: '🔒'
      };
    }

    switch (status) {
      case 'active':
        return {
          color: '#28a745',
          backgroundColor: '#f0fff0',
          text: 'Activo',
          icon: '✅'
        };
      case 'inactive':
        return {
          color: '#ffc107',
          backgroundColor: '#fff9e6',
          text: 'Inactivo',
          icon: '⏸️'
        };
      case 'loading':
        return {
          color: '#17a2b8',
          backgroundColor: '#e6f7ff',
          text: 'Cargando',
          icon: '⏳'
        };
      case 'error':
        return {
          color: '#dc3545',
          backgroundColor: '#fff0f0',
          text: 'Error',
          icon: '❌'
        };
      default:
        return {
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          text: 'Desconocido',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: statusInfo.color,
    backgroundColor: statusInfo.backgroundColor,
    border: `1px solid ${statusInfo.color}33`,
  };

  return (
    <span style={badgeStyles}>
      <span>{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
    </span>
  );
};