'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Users,
  FileText,
  Scale,
  Gavel,
  FolderOpen,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  role: 'ABOGADO' | 'PSICOLOGO' | 'SOCIAL';
  endDate: string | null;
  user: { id: string; firstName: string; lastName: string; role: string };
  requiredSessions?: number | null;
  completedSessions?: number;
  isInterventionFinished?: boolean;
}

interface Report {
  id: string;
  reportType: string;
  authorId: string;
  isSigned: boolean;
  createdAt: string;
}

interface CaseFlowWidgetProps {
  caseId: string;
  currentPhase: string;
  currentInterventionPath: string;
  isClosed: boolean;
  teamHistory: TeamMember[];
  reports: Report[];
  currentUserId: string;
  currentUserRole: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ABOGADO: 'Área Legal',
  PSICOLOGO: 'Psicología',
  SOCIAL: 'Trabajo Social',
};

// Which report type counts as the "initial" report per role
const INITIAL_REPORT_TYPES: Record<string, string[]> = {
  ABOGADO: ['INFORME_JURIDICO'],
  PSICOLOGO: ['INFORME_PSICOLOGICO', 'INFORME_PSICOSOCIAL'],
  SOCIAL: ['INFORME_SOCIAL', 'INFORME_PSICOSOCIAL'],
};

function StepDot({ done, active }: { done: boolean; active: boolean }) {
  if (done)
    return (
      <CheckCircle2
        size={20}
        style={{ color: 'var(--salvia)', flexShrink: 0 }}
      />
    );
  if (active)
    return (
      <Clock
        size={20}
        style={{ color: 'var(--tierra-calida)', flexShrink: 0 }}
      />
    );
  return (
    <Circle size={20} style={{ color: 'var(--border)', flexShrink: 0 }} />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CaseFlowWidget({
  caseId,
  currentPhase,
  currentInterventionPath,
  isClosed,
  teamHistory,
  reports,
  currentUserId,
  currentUserRole,
}: CaseFlowWidgetProps) {
  const activeTeam = teamHistory.filter((m) => m.endDate === null);

  // ── Per-phase derived state ────────────────────────────────────────────────

  // DERIVACION: needs at least 1 active professional
  const hasActiveTeam = activeTeam.length > 0;

  // EVALUACION: each active professional needs their initial report
  const initialReportStatus = activeTeam.map((member) => {
    const allowedTypes = INITIAL_REPORT_TYPES[member.role] ?? [];
    const hasReport = reports.some(
      (r) =>
        allowedTypes.includes(r.reportType) && r.authorId === member.user.id,
    );
    return { member, hasReport };
  });
  const pendingInitialReports = initialReportStatus.filter((s) => !s.hasReport);
  const allInitialReportsDone =
    activeTeam.length > 0 && pendingInitialReports.length === 0;

  // SEGUIMIENTO: session-based (data comes from teamHistory fields if present)
  const followUpStatuses = activeTeam.map((m) => ({
    member: m,
    isFinished: m.isInterventionFinished ?? false,
    hasPlan: (m.requiredSessions ?? 0) > 0,
  }));
  const allFollowUpDone =
    followUpStatuses.length > 0 &&
    followUpStatuses.every((s) => s.isFinished);

  // My own pending initial report (for callout)
  const myPendingInitialReport =
    currentPhase === 'EVALUACION' &&
    initialReportStatus.find(
      (s) => s.member.user.id === currentUserId && !s.hasReport,
    );

  // ── Phase definitions ──────────────────────────────────────────────────────
  const phases = [
    {
      key: 'DERIVACION',
      label: 'Derivación / Recepción',
      icon: <FolderOpen size={16} />,
      done: currentPhase !== 'DERIVACION',
      active: currentPhase === 'DERIVACION',
      description: hasActiveTeam
        ? 'Equipo interdisciplinario asignado.'
        : 'Esperando asignación del equipo interdisciplinario.',
      blocker: !hasActiveTeam ? 'Sin equipo asignado' : null,
    },
    {
      key: 'EVALUACION',
      label: 'Evaluación Interdisciplinaria',
      icon: <FileText size={16} />,
      done: ['SEGUIMIENTO', 'JUDICIALIZACION', 'CIERRE'].includes(currentPhase),
      active: currentPhase === 'EVALUACION',
      description: allInitialReportsDone
        ? 'Todos los informes iniciales presentados.'
        : `${pendingInitialReports.length} informe(s) inicial(es) pendiente(s).`,
      blocker:
        currentPhase === 'EVALUACION' && pendingInitialReports.length > 0
          ? `Falta(n) informe de: ${pendingInitialReports.map((s) => ROLE_LABELS[s.member.role] ?? s.member.role).join(', ')}`
          : null,
    },
    {
      key: 'SEGUIMIENTO',
      label: 'Acompañamiento / Seguimiento',
      icon: <Users size={16} />,
      done: ['JUDICIALIZACION', 'CIERRE'].includes(currentPhase),
      active: currentPhase === 'SEGUIMIENTO',
      description: allFollowUpDone
        ? 'Todas las intervenciones de seguimiento finalizadas.'
        : currentPhase === 'SEGUIMIENTO'
          ? `${followUpStatuses.filter((s) => !s.hasPlan).length > 0 ? 'Profesionales sin plan de sesiones. ' : ''}${followUpStatuses.filter((s) => s.hasPlan && !s.isFinished).length} intervención(es) en curso.`
          : 'Pendiente de inicio.',
      blocker: null,
    },
    {
      key: 'RESOLUCION',
      label:
        currentInterventionPath === 'VIA_JUDICIAL'
          ? 'Actuaciones Judiciales'
          : 'Conciliación',
      icon:
        currentInterventionPath === 'VIA_JUDICIAL' ? (
          <Gavel size={16} />
        ) : (
          <Scale size={16} />
        ),
      done: currentPhase === 'CIERRE',
      active: currentPhase === 'JUDICIALIZACION',
      description:
        currentPhase === 'JUDICIALIZACION'
          ? currentInterventionPath === 'VIA_JUDICIAL'
            ? 'Caso en proceso judicial activo.'
            : 'Proceso de conciliación activo.'
          : 'Pendiente de apertura.',
      blocker: null,
    },
    {
      key: 'CIERRE',
      label: 'Cierre del Caso',
      icon: <CheckCircle2 size={16} />,
      done: isClosed,
      active: currentPhase === 'CIERRE',
      description: isClosed
        ? 'Expediente cerrado.'
        : 'Pendiente de cierre formal.',
      blocker: null,
    },
  ];

  const activePhaseObj = phases.find((p) => p.active);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isClosed ? 'oklch(0.93 0 0)' : 'oklch(0.97 0.02 170)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              opacity: 0.55,
              letterSpacing: '0.04em',
            }}
          >
            Flujo del Expediente
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--bosque-profundo)',
              marginTop: '0.125rem',
            }}
          >
            {isClosed ? 'Caso cerrado' : activePhaseObj?.label ?? currentPhase}
          </div>
        </div>
        {isClosed && (
          <span
            style={{
              backgroundColor: 'oklch(0.4 0 0)',
              color: 'white',
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            CERRADO
          </span>
        )}
      </div>

      {/* Phase stepper */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {phases.map((phase, idx) => (
            <div key={phase.key} style={{ display: 'flex', gap: '0.875rem' }}>
              {/* Left: dot + connector */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <StepDot done={phase.done} active={phase.active} />
                {idx < phases.length - 1 && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '1.75rem',
                      backgroundColor: phase.done
                        ? 'var(--salvia)'
                        : 'var(--border)',
                      margin: '3px 0',
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div
                style={{
                  paddingBottom: idx < phases.length - 1 ? '1rem' : '0',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: phase.active ? 700 : phase.done ? 600 : 400,
                    color: phase.active
                      ? 'var(--bosque-profundo)'
                      : phase.done
                        ? 'var(--salvia)'
                        : 'var(--grafito)',
                    opacity: !phase.done && !phase.active ? 0.5 : 1,
                  }}
                >
                  {phase.icon}
                  {phase.label}
                  {phase.active && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.45rem',
                        backgroundColor: 'oklch(0.93 0.06 85)',
                        color: 'oklch(0.5 0.14 85)',
                        borderRadius: '10px',
                        fontWeight: 700,
                      }}
                    >
                      ACTUAL
                    </span>
                  )}
                </div>

                {(phase.active || phase.done) && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--grafito)',
                      opacity: 0.75,
                      marginTop: '0.2rem',
                    }}
                  >
                    {phase.description}
                  </div>
                )}

                {/* Blocker callout */}
                {phase.blocker && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'oklch(0.95 0.06 85)',
                      border: '1px solid oklch(0.88 0.08 85)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.8rem',
                      color: 'oklch(0.48 0.14 85)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <AlertTriangle size={13} />
                    {phase.blocker}
                  </div>
                )}

                {/* Quick link to conciliacion/judicial */}
                {phase.key === 'RESOLUCION' && phase.active && (
                  <Link
                    href={
                      currentInterventionPath === 'VIA_JUDICIAL'
                        ? `/casos/${caseId}/conciliacion`
                        : `/casos/${caseId}/conciliacion`
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginTop: '0.5rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--bosque-profundo)',
                      textDecoration: 'none',
                    }}
                  >
                    Ver expediente{' '}
                    {currentInterventionPath === 'VIA_JUDICIAL'
                      ? 'judicial'
                      : 'de conciliación'}
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal callout: my pending action */}
      {myPendingInitialReport && (
        <div
          style={{
            margin: '0 1.5rem 1.25rem',
            padding: '0.875rem 1rem',
            backgroundColor: 'oklch(0.95 0.06 85)',
            border: '1px solid oklch(0.87 0.09 85)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'oklch(0.5 0.15 85)', flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'oklch(0.45 0.14 85)',
              }}
            >
              Tu informe inicial aun no fue presentado
            </div>
            <div style={{ fontSize: '0.8rem', color: 'oklch(0.5 0.1 85)', marginTop: '0.2rem' }}>
              El caso no puede avanzar a la fase de Seguimiento hasta que todos los profesionales del equipo presenten su informe de evaluacion inicial. Ir a{' '}
              <button
                onClick={() => {
                  // Dispatch to parent via custom event to switch tab
                  window.dispatchEvent(
                    new CustomEvent('case-tab-navigate', { detail: 'informes' }),
                  );
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'oklch(0.45 0.18 250)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                }}
              >
                Informes Profesionales
              </button>
              .
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
