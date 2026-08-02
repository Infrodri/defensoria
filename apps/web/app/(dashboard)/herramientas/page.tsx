'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getToolsByRole, groupToolsByModule, TOOL_DESCRIPTIONS, canReadTool, canWriteTool } from '@/lib/role-access';
import { ProtectedTool } from '@/components/common/ProtectedTool';
import { AlertCircle, Edit2, Lock } from 'lucide-react';

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '2px solid var(--salvia)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--grafito)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
  },
  modulesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  moduleHeader: {
    padding: '1.5rem',
    borderBottom: '2px solid var(--salvia)',
    backgroundColor: '#f9f9f9',
  },
  moduleTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--salvia)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  moduleIcon: {
    fontSize: '1.5rem',
  },
  toolsList: {
    padding: '1.5rem',
  },
  toolItem: {
    padding: '1rem',
    marginBottom: '0.75rem',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    border: '1px solid #e8e8e8',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontWeight: '600',
    color: 'var(--grafito)',
    marginBottom: '0.3rem',
  },
  toolDescription: {
    fontSize: '0.85rem',
    color: '#777',
    lineHeight: '1.4',
  },
  permissionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  readOnly: {
    backgroundColor: '#eef',
    color: '#0066cc',
  },
  readWrite: {
    backgroundColor: '#efe',
    color: '#006600',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#999',
  },
  accessDenied: {
    backgroundColor: '#fee',
    border: '2px solid #f99',
    borderRadius: '10px',
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#c00',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--salvia)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    marginTop: '1rem',
    transition: 'all 0.2s ease',
  },
};

interface ToolItemProps {
  toolId: string;
  canRead: boolean;
  canWrite: boolean;
}

function ToolItemComponent({ toolId, canRead, canWrite }: ToolItemProps) {
  const tool = TOOL_DESCRIPTIONS[toolId];
  
  if (!tool) return null;

  return (
    <div
      style={{
        ...styles.toolItem,
        backgroundColor: canWrite ? '#f0f9f0' : '#f5f5f5',
        border: canWrite ? '1px solid #90ee90' : '1px solid #e0e0e0',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = canWrite ? '#e8f5e8' : '#efefef';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = canWrite ? '#f0f9f0' : '#f5f5f5';
      }}
    >
      <div style={styles.toolInfo}>
        <div style={styles.toolName}>
          {tool.icon} {tool.title}
        </div>
        <div style={styles.toolDescription}>{tool.description}</div>
      </div>
      {!canRead ? (
        <div style={{ ...styles.permissionBadge, ...styles.readOnly }}>
          <Lock size={12} />
          Sin acceso
        </div>
      ) : canWrite ? (
        <div style={{ ...styles.permissionBadge, ...styles.readWrite }}>
          <Edit2 size={12} />
          Lectura/Edición
        </div>
      ) : (
        <div style={{ ...styles.permissionBadge, ...styles.readOnly }}>
          Lectura
        </div>
      )}
    </div>
  );
}

export default function HerramientasPage() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.accessDenied}>
          <AlertCircle size={32} style={{ marginBottom: '1rem', margin: '0 auto 1rem' }} />
          <p>Debes iniciar sesión para acceder a las herramientas.</p>
        </div>
      </div>
    );
  }

  // Obtener herramientas disponibles para el rol
  const availableTools = getToolsByRole(user.role as any);

  if (availableTools.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔧 Herramientas de Análisis</h1>
          <p style={styles.subtitle}>Rol: {user.role}</p>
        </div>
        <div style={styles.accessDenied}>
          <AlertCircle size={32} style={{ marginBottom: '1rem', margin: '0 auto 1rem' }} />
          <p>Tu rol ({user.role}) no tiene acceso a herramientas de análisis.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Contacta con un profesional del equipo especializado.
          </p>
        </div>
      </div>
    );
  }

  // Agrupar herramientas por módulo
  const groupedTools = groupToolsByModule(availableTools as any);

  // Obtener información del módulo
  const getModuleInfo = (module: string) => {
    const icons: Record<string, string> = {
      legal: '⚖️',
      psychological: '🧠',
      social: '👥',
      transversal: '🔗',
    };

    const titles: Record<string, string> = {
      legal: 'Herramientas Legales',
      psychological: 'Herramientas Psicológicas',
      social: 'Herramientas Sociales',
      transversal: 'Herramientas Transversales',
    };

    return {
      icon: icons[module] || '🔧',
      title: titles[module] || 'Herramientas',
    };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔧 Herramientas de Análisis</h1>
        <p style={styles.subtitle}>
          Profesional: <strong>{user.firstName} {user.lastName}</strong> • Rol: <strong>{user.role}</strong>
        </p>
      </div>

      {/* Módulos */}
      <div style={styles.modulesContainer}>
        {Object.entries(groupedTools).map(([module, tools]) => {
          // Solo mostrar módulos con herramientas
          if (tools.length === 0) return null;

          const moduleInfo = getModuleInfo(module);

          return (
            <div key={module} style={styles.moduleCard}>
              {/* Header del módulo */}
              <div style={styles.moduleHeader}>
                <div style={styles.moduleTitle}>
                  <span style={styles.moduleIcon}>{moduleInfo.icon}</span>
                  {moduleInfo.title}
                </div>
              </div>

              {/* Lista de herramientas */}
              <div style={styles.toolsList}>
                {tools.map((toolId) => (
                  <ToolItemComponent
                    key={toolId}
                    toolId={toolId}
                    canRead={canReadTool(user.role as any, toolId as any)}
                    canWrite={canWriteTool(user.role as any, toolId as any)}
                  />
                ))}

                {/* Botón para acceder al módulo */}
                <button
                  style={styles.button}
                  onClick={() => {
                    // Navegar a la página de herramientas específica
                    const moduleMap: Record<string, string> = {
                      legal: '/tools-demo?tab=legal',
                      psychological: '/tools-demo?tab=psychological',
                      social: '/tools-demo?tab=social',
                      transversal: '/tools-demo?tab=transversal',
                    };
                    window.location.href = moduleMap[module] || '/tools-demo';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--salvia-oscuro)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--salvia)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Acceder al Módulo →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info adicional */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          borderLeft: '4px solid var(--salvia)',
          color: '#333',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
          <strong>💡 Información:</strong> Las herramientas te permiten realizar análisis especializados sobre casos.
          Cada herramienta está diseñada para tu rol específico y te proporciona acceso de lectura o lectura/edición
          según sea apropiado. Contáctanos si necesitas ayuda.
        </p>
      </div>
    </div>
  );
}
