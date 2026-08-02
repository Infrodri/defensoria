'use client';

import React from 'react';
import { AlertCircle, Gavel, Brain, Users, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'legal' | 'psychological' | 'social' | 'system';
  documentId?: string;
  metadata?: Record<string, string>;
}

interface UnifiedTimelineProps {
  caseId: string;
  events: TimelineEvent[];
  analyzedAt?: string;
}

const getTypeColor = (type: 'legal' | 'psychological' | 'social' | 'system') => {
  switch (type) {
    case 'legal':
      return 'var(--salvia)';
    case 'psychological':
      return 'var(--amarillo)';
    case 'social':
      return 'var(--azul)';
    case 'system':
      return 'var(--grafito)';
  }
};

const getTypeLabel = (type: 'legal' | 'psychological' | 'social' | 'system') => {
  switch (type) {
    case 'legal':
      return 'Legal';
    case 'psychological':
      return 'Psicológico';
    case 'social':
      return 'Social';
    case 'system':
      return 'Sistema';
  }
};

const getTypeIcon = (type: 'legal' | 'psychological' | 'social' | 'system') => {
  switch (type) {
    case 'legal':
      return Gavel;
    case 'psychological':
      return Brain;
    case 'social':
      return Users;
    case 'system':
      return Clock;
  }
};

export const UnifiedTimeline: React.FC<UnifiedTimelineProps> = ({ caseId, events, analyzedAt }) => {
  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--salvia)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Línea de Tiempo Integrada
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Cronología del Caso
        </h3>
      </div>

      {/* Timeline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          paddingLeft: '2rem',
        }}
      >
        {/* Vertical Line */}
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: 'var(--border)',
          }}
        />

        {sortedEvents.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--grafito)',
              opacity: 0.6,
            }}
          >
            Sin eventos en la línea de tiempo
          </div>
        ) : (
          sortedEvents.map((event, idx) => {
            const TypeIcon = getTypeIcon(event.type);
            const typeColor = getTypeColor(event.type);
            const typeLabel = getTypeLabel(event.type);

            return (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '2rem',
                  position: 'relative',
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.25rem',
                    top: '0.5rem',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: typeColor,
                    border: '3px solid var(--card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: `0 0 0 3px ${typeColor}40`,
                  }}
                >
                  <TypeIcon size={12} />
                </div>

                {/* Event Content */}
                <div
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: 'var(--papel)',
                    borderRadius: '6px',
                    border: `1px solid ${typeColor}`,
                    borderLeft: `4px solid ${typeColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    cursor: event.documentId ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (event.documentId) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--papel)';
                  }}
                >
                  {/* Date and Type */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: typeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {typeLabel}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--grafito)',
                        }}
                      >
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {event.documentId && (
                      <div
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          borderRadius: '3px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--grafito)',
                          opacity: 0.6,
                        }}
                      >
                        📄 Ver
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--grafito)',
                    }}
                  >
                    {event.title}
                  </h4>

                  {/* Description */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--grafito)',
                      lineHeight: 1.5,
                      opacity: 0.8,
                    }}
                  >
                    {event.description}
                  </p>

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            borderRadius: '3px',
                            color: 'var(--grafito)',
                            fontWeight: 600,
                          }}
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--papel)',
          borderRadius: '6px',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border)',
          marginTop: '1rem',
        }}
      >
        {(['legal', 'psychological', 'social', 'system'] as const).map((type) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--grafito)',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getTypeColor(type),
              }}
            />
            {getTypeLabel(type)}
          </div>
        ))}
      </div>

      {/* Footer */}
      {analyzedAt && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--grafito)',
            opacity: 0.6,
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            textAlign: 'right',
          }}
        >
          Actualizado: {new Date(analyzedAt).toLocaleDateString('es-ES')}
        </div>
      )}
    </div>
  );
};
