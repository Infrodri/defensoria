'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, Settings2, ChevronRight, Loader2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamMemberStatus {
  id: string;
  userId: string;
  professionalName: string;
  role: string;
  requiredSessions: number | null;
  completedSessions: number;
  isInterventionFinished: boolean;
}

interface InterventionStatusData {
  caseId: string;
  caseCode: string;
  currentPhase: string;
  isClosed: boolean;
  isAllInterventionsFinished: boolean;
  teamMembers: TeamMemberStatus[];
}

interface InterventionStatusPanelProps {
  caseId: string;
  currentUserId: string;
  currentUserRole: string;
  onStatusChange?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DERIVACION: { label: 'Derivación / Recepción', color: 'var(--tierra-calida)', bg: 'oklch(0.95 0.05 65)' },
  EVALUACION: { label: 'Evaluación Interdisciplinaria', color: 'var(--salvia)', bg: 'oklch(0.95 0.04 165)' },
  SEGUIMIENTO: { label: 'Acompañamiento / Seguimiento', color: 'var(--bosque-profundo)', bg: 'oklch(0.95 0.04 170)' },
  CONCILIACION: { label: 'Conciliación', color: 'oklch(0.5 0.15 250)', bg: 'oklch(0.95 0.04 250)' },
  JUDICIAL: { label: 'Actuaciones Judiciales', color: 'oklch(0.45 0.18 30)', bg: 'oklch(0.95 0.05 30)' },
  CERRADO: { label: 'Caso Cerrado', color: 'oklch(0.4 0 0)', bg: 'oklch(0.93 0 0)' },
};

const ROLE_LABELS: Record<string, string> = {
  ABOGADO: 'Área Legal',
  PSICOLOGO: 'Psicología',
  SOCIAL: 'Trabajo Social',
};

function ProgressRing({
  completed,
  required,
  size = 56,
}: {
  completed: number;
  required: number | null;
  size?: number;
}) {
  if (!required) return null;
  const pct = Math.min(completed / required, 1);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct >= 1 ? 'var(--salvia)' : 'var(--bosque-profundo)'}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InterventionStatusPanel({
  caseId,
  currentUserId,
  currentUserRole,
  onStatusChange,
}: InterventionStatusPanelProps) {
  const [data, setData] = useState<InterventionStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sessions plan form state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [sessionInput, setSessionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/cases/${caseId}/intervention-status`);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Error cargando estado de intervención');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetSessionPlan = async (member: TeamMemberStatus) => {
    const n = parseInt(sessionInput, 10);
    if (isNaN(n) || n < 1) {
      alert('Ingresá un número válido de sesiones (mínimo 1)');
      return;
    }
    setSubmitting(true);
    try {
      await fetchApi(`/cases/${caseId}/sessions-plan`, {
        method: 'POST',
        body: JSON.stringify({ requiredSessions: n }),
      });
      await load();
      onStatusChange?.();
      setEditingMemberId(null);
      setSessionInput('');
    } catch (e: any) {
      alert(e?.message || 'Error al establecer plan de sesiones');
    } finally {
      setSubmitting(false);
    }
  };

  // Only PSICOLOGO and SOCIAL can set session plans
  const canSetSessions = currentUserRole === 'PSICOLOGO' || currentUserRole === 'SOCIAL';

  // Find if current user is an active member
  const myMembership = data?.teamMembers.find((m) => m.userId === currentUserId);
  const isMyMembershipActive = !!myMembership;

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1.5rem',
          color: 'var(--grafito)',
          opacity: 0.7,
          fontSize: '0.875rem',
        }}
      >
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        Cargando estado de intervención...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'oklch(0.95 0.05 30)',
          borderRadius: 'var(--radius)',
          border: '1px solid oklch(0.85 0.08 30)',
          fontSize: '0.875rem',
          color: 'oklch(0.45 0.18 30)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <AlertCircle size={16} />
        {error}
      </div>
    );
  }

  if (!data) return null;

  const phaseInfo = PHASE_LABELS[data.currentPhase] ?? {
    label: data.currentPhase,
    color: 'var(--grafito)',
    bg: 'var(--papel)',
  };

  const isFollowUpPhase = data.currentPhase === 'SEGUIMIENTO';

  return (
    <div
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header — fase actual + badge global */}
      <div
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: phaseInfo.bg,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>
            Fase Actual del Expediente
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: phaseInfo.color,
              marginTop: '0.125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ChevronRight size={16} />
            {phaseInfo.label}
          </div>
        </div>

        {data.isClosed ? (
          <span
            style={{
              backgroundColor: 'oklch(0.93 0 0)',
              color: 'oklch(0.4 0 0)',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            CASO CERRADO
          </span>
        ) : data.isAllInterventionsFinished && isFollowUpPhase ? (
          <span
            style={{
              backgroundColor: 'oklch(0.93 0.06 165)',
              color: 'var(--bosque-profundo)',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <CheckCircle2 size={12} /> Todas las intervenciones completadas
          </span>
        ) : isFollowUpPhase ? (
          <span
            style={{
              backgroundColor: 'oklch(0.95 0.04 85)',
              color: 'oklch(0.5 0.14 85)',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={12} /> Intervenciones en curso
          </span>
        ) : null}
      </div>

      {/* Team members progress */}
      {isFollowUpPhase && data.teamMembers.length > 0 && (
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              opacity: 0.55,
              marginBottom: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            Progreso de Intervención por Profesional
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data.teamMembers.map((member) => {
              const isMe = member.userId === currentUserId;
              const hasPlan = member.requiredSessions !== null && member.requiredSessions > 0;
              const isEditing = editingMemberId === member.id;

              return (
                <div
                  key={member.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: member.isInterventionFinished
                      ? 'oklch(0.96 0.03 165)'
                      : isMe
                        ? 'oklch(0.97 0.02 250)'
                        : 'var(--papel)',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${member.isInterventionFinished ? 'oklch(0.88 0.06 165)' : isMe ? 'oklch(0.88 0.04 250)' : 'var(--border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Progress ring */}
                    {hasPlan && (
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <ProgressRing
                          completed={member.completedSessions}
                          required={member.requiredSessions}
                          size={56}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: 'var(--bosque-profundo)',
                          }}
                        >
                          {member.completedSessions}/{member.requiredSessions}
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--tierra-calida)',
                          }}
                        >
                          {ROLE_LABELS[member.role] ?? member.role}
                        </span>
                        {isMe && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '10px',
                              backgroundColor: 'oklch(0.88 0.04 250)',
                              color: 'oklch(0.45 0.15 250)',
                              fontWeight: 700,
                            }}
                          >
                            Vos
                          </span>
                        )}
                        {member.isInterventionFinished && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '10px',
                              backgroundColor: 'oklch(0.9 0.07 165)',
                              color: 'var(--bosque-profundo)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <CheckCircle2 size={10} /> Intervención finalizada
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--bosque-profundo)',
                          marginTop: '0.125rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {member.professionalName}
                      </div>

                      {hasPlan ? (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
                          {member.completedSessions} de {member.requiredSessions} sesiones completadas
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'oklch(0.55 0.12 85)',
                            marginTop: '0.25rem',
                            fontStyle: 'italic',
                          }}
                        >
                          Sin plan de sesiones definido
                        </div>
                      )}
                    </div>

                    {/* Action: set sessions plan (only for own membership and allowed roles) */}
                    {isMe && canSetSessions && !member.isInterventionFinished && (
                      <div style={{ flexShrink: 0 }}>
                        {!isEditing ? (
                          <button
                            onClick={() => {
                              setEditingMemberId(member.id);
                              setSessionInput(member.requiredSessions?.toString() ?? '');
                            }}
                            title="Definir plan de sesiones"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.75rem',
                              backgroundColor: 'var(--bosque-profundo)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Settings2 size={13} />
                            {hasPlan ? 'Actualizar sesiones' : 'Definir sesiones'}
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={sessionInput}
                              onChange={(e) => setSessionInput(e.target.value)}
                              placeholder="N°"
                              style={{
                                width: '4rem',
                                padding: '0.375rem 0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSetSessionPlan(member)}
                              disabled={submitting}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'var(--bosque-profundo)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: submitting ? 'wait' : 'pointer',
                              }}
                            >
                              {submitting ? '...' : 'Guardar'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingMemberId(null);
                                setSessionInput('');
                              }}
                              style={{
                                padding: '0.375rem 0.5rem',
                                backgroundColor: 'transparent',
                                color: 'var(--grafito)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state: not in follow-up phase */}
      {!isFollowUpPhase && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            fontSize: '0.875rem',
            color: 'var(--grafito)',
            opacity: 0.65,
            fontStyle: 'italic',
          }}
        >
          El seguimiento de sesiones de intervención se activa al llegar a la fase de{' '}
          <strong>Acompañamiento / Seguimiento</strong>.
        </div>
      )}

      {isFollowUpPhase && data.teamMembers.length === 0 && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            fontSize: '0.875rem',
            color: 'var(--grafito)',
            opacity: 0.65,
            fontStyle: 'italic',
          }}
        >
          No hay profesionales activos asignados al equipo del caso.
        </div>
      )}
    </div>
  );
}
