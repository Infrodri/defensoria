'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  livesWithNNA: boolean;
  socialVulnerabilities?: string[];
}

interface FamilyStructureProps {
  caseId: string;
  analysisId: string;
  nnaName: string;
  nuclearFamily: FamilyMember[];
  extendedFamily?: FamilyMember[];
  familyDynamics: string;
  vulnerabilities: string[];
  analyzedAt: string;
  analyzedBy: string;
}

export const FamilyStructure: React.FC<FamilyStructureProps> = ({
  caseId,
  analysisId,
  nnaName,
  nuclearFamily,
  extendedFamily,
  familyDynamics,
  vulnerabilities,
  analyzedAt,
  analyzedBy,
}) => {
  const getFamilyMemberColor = (livesWithNNA: boolean) => {
    return livesWithNNA ? 'var(--salvia)' : 'rgba(0, 0, 0, 0.3)';
  };

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
          Estructura Familiar
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Composición del Grupo Familiar
        </h3>
      </div>

      {/* Family Dynamics Box */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--papel)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--grafito)',
          }}
        >
          Dinámica Familiar
        </span>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--grafito)',
            lineHeight: 1.5,
          }}
        >
          {familyDynamics}
        </p>
      </div>

      {/* Nuclear Family */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--grafito)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Familia Nuclear
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* NNA (center) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              gridColumn: 'span 1',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--salvia)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '0.5rem',
                boxSizing: 'border-box',
                boxShadow: '0 0 0 4px rgba(73, 180, 142, 0.2)',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <span style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>👶</span>
            </div>
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--grafito)',
                }}
              >
                {nnaName}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--grafito)',
                  opacity: 0.6,
                }}
              >
                NNA
              </div>
            </div>
          </div>

          {/* Other family members */}
          {nuclearFamily.map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '8px',
                  backgroundColor: getFamilyMemberColor(member.livesWithNNA),
                  border: member.livesWithNNA ? '2px solid var(--salvia)' : '2px solid rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: member.livesWithNNA ? 'white' : 'var(--grafito)',
                  textAlign: 'center',
                  padding: '0.5rem',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  opacity: member.livesWithNNA ? 1 : 0.5,
                }}
              >
                {member.relationship === 'Padre' && <span style={{ fontSize: '1.5rem' }}>👨</span>}
                {member.relationship === 'Madre' && <span style={{ fontSize: '1.5rem' }}>👩</span>}
                {member.relationship === 'Hermano' && <span style={{ fontSize: '1.5rem' }}>👦</span>}
                {member.relationship === 'Hermana' && <span style={{ fontSize: '1.5rem' }}>👧</span>}
              </div>

              <div
                style={{
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--grafito)',
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--grafito)',
                    opacity: 0.6,
                  }}
                >
                  {member.relationship}
                </div>
                {member.age && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--grafito)',
                      opacity: 0.5,
                    }}
                  >
                    {member.age} años
                  </div>
                )}
                {member.livesWithNNA && (
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--salvia)',
                      fontWeight: 600,
                      marginTop: '0.25rem',
                    }}
                  >
                    ✓ Convive
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extended Family */}
      {extendedFamily && extendedFamily.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--grafito)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Familia Extendida
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              opacity: 0.7,
            }}
          >
            {extendedFamily.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: '6px',
                  border: '1px dashed var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                  }}
                >
                  👤
                </div>

                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--grafito)',
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--grafito)',
                      opacity: 0.6,
                    }}
                  >
                    {member.relationship}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vulnerabilities */}
      {vulnerabilities.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--rojo)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <AlertTriangle size={18} />
            Vulnerabilidades Identificadas
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {vulnerabilities.map((vuln, idx) => (
              <span
                key={idx}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--rojo)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {vuln}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--grafito)',
          opacity: 0.6,
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Analizado por: {analyzedBy}</span>
        <span>{new Date(analyzedAt).toLocaleDateString('es-ES')}</span>
      </div>
    </div>
  );
};
