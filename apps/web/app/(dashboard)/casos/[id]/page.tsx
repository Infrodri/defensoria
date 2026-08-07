'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PhaseRail } from '@/components/cases/phase-rail';
import { InterventionStatusPanel } from '@/components/cases/intervention-status-panel';
import { CaseFlowWidget } from '@/components/cases/case-flow-widget';
import { ReportEditor } from '@/components/reports/report-editor';
import { EvidenceGallery } from '@/components/evidences/evidence-gallery';
import { CaseTimeline } from '@/components/cases/case-timeline';
import { SpecialProceduresTabs } from '@/components/cases/tabs/special-procedures-tabs';
import { AiCopilot } from '@/components/ai/ai-copilot';
import { formatCaseType, formatInterventionPath, formatActionType, formatAppointmentType, formatRiskLevel } from '@defensoria/shared';
import { Shield, Users, FileText, Building2, UserPlus, Clock, ArrowLeft, CheckCircle2, Lock, Plus, Calendar as CalendarIcon, MapPin, ShieldAlert, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function CasoDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id: caseId } = use(params);
  const sp = use(searchParams);
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<any | null>(null);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read initial tab/subtab from query params for deep-linking from
  // administrative procedure creation (e.g. ?tab=tramites&subtab=permiso-viaje)
  const VALID_TABS = ['resumen', 'equipo', 'bitacora', 'informes', 'evidencias', 'agenda', 'narrativa', 'lineatiempo', 'tramites'] as const;
  const initialTab = (sp?.tab && typeof sp.tab === 'string' && VALID_TABS.includes(sp.tab as any))
    ? sp.tab as typeof VALID_TABS[number]
    : 'resumen';
  const initialSubtab = (sp?.subtab && typeof sp.subtab === 'string')
    ? sp.subtab as string
    : undefined;

  const [activeTab, setActiveTab] = useState<typeof VALID_TABS[number]>(initialTab);
  const router = useRouter();

  // Helper: verifica si el tipo de caso corresponde a un trámite administrativo
  const isAdministrativeCase = (caseType: string | undefined): boolean => {
    if (!caseType) return false;
    return ['PERMISO_VIAJE', 'NNATS', 'OPERATIVO'].includes(caseType);
  };

  // Resetear a "resumen" si el tipo de caso cambia a no administrativo
  // y la pestaña activa era "tramites"
  useEffect(() => {
    if (activeTab === 'tramites' && caseData && !isAdministrativeCase(caseData.caseType)) {
      setActiveTab('resumen');
    }
  }, [caseData?.caseType, activeTab]);

  // Assignment State
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState<'ABOGADO' | 'PSICOLOGO' | 'SOCIAL'>('ABOGADO');
  const [assignReason, setAssignReason] = useState('');
  const [assigning, setAssigning] = useState(false);

  // New Action Log State
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState('ENTREVISTA');
  const [submittingLog, setSubmittingLog] = useState(false);

  // New Appointment State
  const [appTitle, setAppTitle] = useState('');
  const [appType, setAppType] = useState('ENTREVISTA');
  const [appTypeCustom, setAppTypeCustom] = useState('');     // tipo libre escrito a mano
  const [appScheduledAt, setAppScheduledAt] = useState('');
  const [appLocation, setAppLocation] = useState('');
  const [appAssignedProfessionalId, setAppAssignedProfessionalId] = useState(''); // profesional que atenderá
  const [submittingApp, setSubmittingApp] = useState(false);

  // External Portal PIN State
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);

  const handleGeneratePin = async () => {
    try {
      const res = await fetchApi(`/cases/${caseId}/generate-pin`, { method: 'POST' });
      setGeneratedPin(res.pin);
      alert(`NUEVO PIN GENERADO PARA TUTOR: ${res.pin}\nEntregue este PIN al tutor junto con el Código de Expediente (${caseData.caseCode}).`);
    } catch (err: any) {
      alert(err.message || 'Error al generar PIN');
    }
  };

  // Staff users list for interactive assignment dropdown
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);

  const canManageCase = user?.role === 'ADMINISTRADOR' || user?.role === 'JEFATURA' || user?.role === 'SECRETARIA';

  // Filter staff by selected role (backend already filters by isActive)
  useEffect(() => {
    if (assignRole && staffUsers.length > 0) {
      const filtered = staffUsers.filter((u) => u.role === assignRole);
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]);
    }
  }, [assignRole, staffUsers]);

  const loadCaseDetails = async () => {
    try {
      const promises: Promise<any>[] = [
        fetchApi(`/cases/${caseId}`),
        fetchApi(`/action-logs/case/${caseId}`).catch(() => []),
        fetchApi(`/appointments/case/${caseId}`).catch(() => []),
        fetchApi(`/reports/case/${caseId}`).catch(() => []),
        fetchApi(`/evidences/case/${caseId}`).catch(() => []),
      ];

      if (canManageCase) {
        promises.push(fetchApi('/users/professionals/list').catch(() => []));
      }

      const [cData, logs, apps, reps, evs, uList] = await Promise.all(promises);
      setCaseData(cData);
      setActionLogs(logs);
      setAppointments(apps);
      setReports(reps);
      setEvidences(evs);
      if (uList) {
        setStaffUsers(uList);
      }

      // Load professionals filtered by the case's office (overrides global list if results exist)
      if (cData?.currentOfficeId && (user?.role === 'ADMINISTRADOR' || user?.role === 'JEFATURA' || user?.role === 'SECRETARIA')) {
        fetchApi(`/users/professionals/list?officeId=${cData.currentOfficeId}`)
          .then((filtered: any[]) => {
            if (filtered && filtered.length > 0) {
              setStaffUsers(filtered);
            }
            // If nobody in that office, keep the global uList loaded above
          })
          .catch(() => {});
      }

      // Check automatic phase advance after data reload
      fetchApi(`/cases/${caseId}/phase/advance`, { method: 'PATCH' }).catch(() => {});

      // Auto-seleccionar el primer profesional activo del equipo del caso
      if (cData?.teamHistory) {
        const activeMembers = cData.teamHistory.filter((t: any) => !t.endDate);
        if (activeMembers.length > 0) {
          setAppAssignedProfessionalId(activeMembers[0].user?.id || '');
        }
      }
    } catch (err) {
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCaseDetails();
    }
  }, [caseId, user]);

  // Listen for cross-component tab navigation requests (e.g. from CaseFlowWidget)
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('case-tab-navigate', handler);
    return () => window.removeEventListener('case-tab-navigate', handler);
  }, []);

  // Clean up URL query params after they have been consumed for initial state.
  // This prevents stale ?tab= ?subtab= params lingering after navigation.
  useEffect(() => {
    if (sp?.tab || sp?.subtab) {
      router.replace(`/casos/${caseId}`, { scroll: false });
    }
  }, [caseId, router, sp?.tab, sp?.subtab]);

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!assignUserId || !assignUserId.trim()) {
      alert('❌ Error: Debe seleccionar un profesional');
      return;
    }
    
    if (!assignReason.trim()) {
      alert('❌ Error: Debe proporcionar un motivo para la asignación');
      return;
    }
    
    if (assignReason.length < 10) {
      alert('❌ Error: El motivo debe tener al menos 10 caracteres');
      return;
    }

    setAssigning(true);
    try {
      await fetchApi(`/cases/${caseId}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          userId: assignUserId,
          role: assignRole,
          reason: assignReason,
        }),
      });

      // Trigger automatic phase advance after team assignment
      fetchApi(`/cases/${caseId}/phase/advance`, { method: 'PATCH' }).catch(() => {});

      await loadCaseDetails();
      setAssignUserId('');
      setAssignReason('');
      alert('✅ Profesional asignado correctamente al equipo del caso.');
    } catch (err: any) {
      console.error('Error assigning team:', err);
      const errorMessage = err.message || 'Error desconocido al asignar profesional';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateActionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim() || !logContent.trim()) return;

    setSubmittingLog(true);
    try {
      await fetchApi('/action-logs', {
        method: 'POST',
        body: JSON.stringify({
          caseId,
          actionType: logType,
          title: logTitle,
          content: logContent,
        }),
      });

      const updatedLogs = await fetchApi(`/action-logs/case/${caseId}`);
      setActionLogs(updatedLogs);
      setLogTitle('');
      setLogContent('');
    } catch (err: any) {
      alert(err.message || 'Error al registrar actuación');
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleSignActionLog = async (logId: string) => {
    if (!confirm('¿Desea firmar inmutablemente esta actuación? Una vez firmada no podrá ser modificada ni eliminada.')) {
      return;
    }

    try {
      await fetchApi(`/action-logs/${logId}/sign`, { method: 'POST' });
      const updatedLogs = await fetchApi(`/action-logs/case/${caseId}`);
      setActionLogs(updatedLogs);
    } catch (err: any) {
      alert(err.message || 'Error al firmar actuación');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTitle.trim()) return;

    // El tipo final es el custom si se eligió "OTRO", si no el seleccionado del dropdown
    const finalType = appType === 'OTRO' ? 'OTRO' : appType;
    // El título ya lo escribe el usuario libremente

    setSubmittingApp(true);
    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          caseId,
          title: appTitle,
          appointmentType: finalType,
          scheduledAt: appScheduledAt,
          location: appLocation || undefined,
          assignedProfessionalId: appAssignedProfessionalId || undefined,
        }),
      });

      const updatedApps = await fetchApi(`/appointments/case/${caseId}`);
      setAppointments(updatedApps);
      setAppTitle('');
      setAppScheduledAt('');
      setAppLocation('');
      // NO resetear el profesional — es probable que la próxima cita sea del mismo
    } catch (err: any) {
      alert(err.message || 'Error al programar cita');
    } finally {
      setSubmittingApp(false);
    }
  };

  // ── Modal respuesta del profesional a propuesta de cita ──────────────────
  const [respondingApp, setRespondingApp] = useState<any | null>(null);
  const [respondType, setRespondType] = useState<'ACCEPTED' | 'MODIFIED' | 'REJECTED'>('ACCEPTED');
  const [respondScheduledAt, setRespondScheduledAt] = useState('');
  const [respondTitle, setRespondTitle] = useState('');
  const [respondLocation, setRespondLocation] = useState('');
  const [respondNotes, setRespondNotes] = useState('');
  const [submittingRespond, setSubmittingRespond] = useState(false);

  const openRespondModal = (app: any) => {
    setRespondingApp(app);
    setRespondType('ACCEPTED');
    setRespondScheduledAt(app.scheduledAt ? new Date(app.scheduledAt).toISOString().slice(0, 16) : '');
    setRespondTitle(app.title);
    setRespondLocation(app.location || '');
    setRespondNotes('');
  };

  const handleRespondAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingApp) return;

    if (respondType === 'MODIFIED' && !respondScheduledAt) {
      alert('Si modificás la cita, debés especificar la nueva fecha y hora.');
      return;
    }

    setSubmittingRespond(true);
    try {
      await fetchApi(`/appointments/${respondingApp.id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({
          response: respondType,
          scheduledAt: respondType !== 'REJECTED' ? respondScheduledAt || undefined : undefined,
          title: respondType === 'MODIFIED' ? respondTitle : undefined,
          location: respondType !== 'REJECTED' ? respondLocation || undefined : undefined,
          notes: respondNotes || undefined,
        }),
      });

      const updatedApps = await fetchApi(`/appointments/case/${caseId}`);
      setAppointments(updatedApps);
      setRespondingApp(null);
    } catch (err: any) {
      alert(err.message || 'Error al responder a la propuesta');
    } finally {
      setSubmittingRespond(false);
    }
  };

  if (loading) {
    return <div style={{ opacity: 0.6 }}>Cargando datos del expediente...</div>;
  }

  if (!caseData) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Expediente no encontrado</h2>
        <Link href="/casos">Volver a la lista de casos</Link>
      </div>
    );
  }

  const primaryNna = caseData.parties?.find((p: any) => p.roleInCase === 'NNA')?.person;
  const complainant = caseData.parties?.find((p: any) => p.roleInCase === 'DENUNCIANTE')?.person;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/casos" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--bosque-profundo)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Volver a expedientes
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)', fontFamily: 'monospace' }}>
                {caseData.caseCode}
              </h1>
              <span style={{ backgroundColor: 'oklch(0.95 0.03 65)', color: 'var(--tierra-calida)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700 }}>
                {formatInterventionPath(caseData.currentInterventionPath)}
              </span>
              {caseData.riskLevel && (
                <span style={{ backgroundColor: caseData.riskLevel === 'ALTO' ? 'var(--riesgo-alto)' : 'var(--salvia)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700 }}>
                  Riesgo {formatRiskLevel(caseData.riskLevel)}
                </span>
              )}
            </div>
            <p style={{ fontSize: '1.125rem', color: 'var(--grafito)', marginTop: '0.25rem' }}>
              NNA Titular: <strong>{primaryNna ? `${primaryNna.firstName} ${primaryNna.lastName}` : 'No registrado'}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.875rem', opacity: 0.8 }}>
            <div>Oficina actual: <strong>{caseData.currentOffice?.name}</strong></div>
            <div>Apertura: {new Date(caseData.createdAt).toLocaleDateString('es-BO')}</div>
            {canManageCase && (
              <button
                onClick={handleGeneratePin}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--tierra-calida)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Lock size={12} /> {generatedPin ? `PIN: ${generatedPin}` : 'Generar PIN Tutor'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Riel de Fase Component */}
      <div style={{ marginBottom: '2rem' }}>
        <PhaseRail currentPhase={caseData.currentPhase} orientation="horizontal" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('resumen')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'resumen' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'resumen' ? 700 : 500,
            color: activeTab === 'resumen' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Resumen General
        </button>

        <button
          onClick={() => setActiveTab('equipo')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'equipo' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'equipo' ? 700 : 500,
            color: activeTab === 'equipo' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Equipo Interdisciplinario ({caseData.teamHistory?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('informes')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'informes' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'informes' ? 700 : 500,
            color: activeTab === 'informes' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Informes Profesionales ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('evidencias')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'evidencias' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'evidencias' ? 700 : 500,
            color: activeTab === 'evidencias' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Evidencias & Cadena de Custodia ({evidences.length})
        </button>

        <button
          onClick={() => setActiveTab('bitacora')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'bitacora' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'bitacora' ? 700 : 500,
            color: activeTab === 'bitacora' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Bitácora / Actuaciones ({actionLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'agenda' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'agenda' ? 700 : 500,
            color: activeTab === 'agenda' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Agenda / Citas ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('lineatiempo')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'lineatiempo' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'lineatiempo' ? 700 : 500,
            color: activeTab === 'lineatiempo' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Línea de Tiempo
        </button>

        {isAdministrativeCase(caseData?.caseType) && (
          <button
            onClick={() => setActiveTab('tramites')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'tramites' ? '3px solid var(--tierra-calida)' : '3px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: activeTab === 'tramites' ? 700 : 500,
              color: activeTab === 'tramites' ? 'var(--bosque-profundo)' : 'var(--grafito)',
              cursor: 'pointer',
            }}
          >
            Trámites Especiales
          </button>
        )}
      </div>

      {/* TAB CONTENT: Resumen */}
      {activeTab === 'resumen' && (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Partes Involucradas en el Expediente
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--salvia)', textTransform: 'uppercase' }}>NNA Titular (Víctima / Sujeto de Derechos)</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {primaryNna ? `${primaryNna.firstName} ${primaryNna.lastName}` : 'N/A'}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  Documento: {primaryNna?.documentNumber || 'SIN DOCUMENTO'} · Género: {primaryNna?.gender || 'N/A'}
                </div>
              </div>

              {complainant && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)', textTransform: 'uppercase' }}>Persona Denunciante</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {complainant.firstName} {complainant.lastName}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    Documento: {complainant.documentNumber || 'SIN DOCUMENTO'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Estado y Categoría
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ opacity: 0.6, display: 'block' }}>Tipo de Trámite:</span>
                <strong>{formatCaseType(caseData.caseType)}</strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: 'block' }}>Nivel de Riesgo Evaluado:</span>
                <strong style={{ color: caseData.riskLevel === 'ALTO' ? 'var(--riesgo-alto)' : 'var(--bosque-profundo)' }}>
                  {formatRiskLevel(caseData.riskLevel)}
                </strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: 'block' }}>Vía de Intervención:</span>
                <strong>{formatInterventionPath(caseData.currentInterventionPath)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow status - full width below the 2-col grid */}
        <div style={{ marginTop: '1.5rem' }}>
          <CaseFlowWidget
            caseId={caseId}
            currentPhase={caseData.currentPhase}
            currentInterventionPath={caseData.currentInterventionPath}
            isClosed={caseData.isClosed}
            teamHistory={caseData.teamHistory ?? []}
            reports={reports}
            currentUserId={user?.id ?? ''}
            currentUserRole={user?.role ?? ''}
          />
        </div>
        </>
      )}

      {/* TAB CONTENT: Informes Profesionales */}
      {activeTab === 'informes' && (
        <ReportEditor
          caseId={caseId}
          caseCode={caseData.caseCode}
          nnaName={primaryNna ? `${primaryNna.firstName} ${primaryNna.lastName}` : undefined}
          reports={reports}
          onReportUpdated={loadCaseDetails}
        />
      )}

      {/* TAB CONTENT: Evidencias & MinIO */}
      {activeTab === 'evidencias' && (
        <EvidenceGallery
          caseId={caseId}
          evidences={evidences}
          onEvidenceUploaded={loadCaseDetails}
        />
      )}

      {activeTab === 'equipo' && (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Historial de Asignaciones del Equipo
            </h3>

            {caseData.teamHistory?.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No hay profesionales asignados aún a este caso.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {caseData.teamHistory.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: item.endDate === null ? 'oklch(0.96 0.02 165)' : 'var(--papel)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)', textTransform: 'uppercase' }}>
                          {item.role} {item.endDate === null && '· (ASIGNACIÓN ACTIVA)'}
                        </span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                          {item.user?.firstName} {item.user?.lastName}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'right' }}>
                        Inicio: {new Date(item.startDate).toLocaleDateString('es-BO')}
                        {item.endDate && <div>Fin: {new Date(item.endDate).toLocaleDateString('es-BO')}</div>}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem', fontStyle: 'italic' }}>
                      Motivo: "{item.reason}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canManageCase && (
            <form onSubmit={handleAssignTeam} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
                Asignar Profesional
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Rol a Asignar</label>
                  <select
                    value={assignRole}
                    onChange={(e: any) => {
                      setAssignRole(e.target.value);
                      setAssignUserId('');
                    }}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value="ABOGADO">Área Legal (Abogado/a)</option>
                    <option value="PSICOLOGO">Psicología</option>
                    <option value="SOCIAL">Trabajo Social</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Profesional Asignado</label>
                  {staffUsers.length > 0 ? (
                    <>
                      {filteredStaff.length === 0 && assignRole ? (
                        <div style={{ padding: '0.75rem', backgroundColor: 'oklch(0.95 0.08 85)', border: '1px solid oklch(0.85 0.08 85)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--tierra-calida)' }}>
                          ⚠️ No hay profesionales de <strong>{assignRole}</strong> en esta oficina.
                          {staffUsers.filter((u: any) => u.role === assignRole).length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                              Hay {staffUsers.filter((u: any) => u.role === assignRole).length} profesional(es) disponible(s) en otras oficinas.
                              <button
                                type="button"
                                onClick={() => fetchApi('/users/professionals/list').then((all: any[]) => setStaffUsers(all)).catch(() => {})}
                                style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--tierra-calida)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                              >
                                Ver todos (asignación excepcional)
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <select
                          value={assignUserId}
                          onChange={(e) => setAssignUserId(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        >
                          <option value="">-- Seleccionar Profesional --</option>
                          {filteredStaff.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} - {u.email} {u.office?.name ? `(${u.office.name})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      placeholder="ID del profesional..."
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Motivo</label>
                  <textarea
                    rows={3}
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="Justifique la asignación (mínimo 10 caracteres)..."
                    required
                    minLength={10}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--grafito)', marginTop: '0.25rem', opacity: 0.7 }}>
                    {assignReason.length}/10 caracteres mínimos
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={assigning || !assignUserId || assignReason.length < 10}
                  style={{
                    backgroundColor: assignUserId && assignReason.length >= 10 ? 'var(--bosque-profundo)' : 'var(--border)',
                    color: 'white',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius)',
                    fontWeight: 600,
                    border: 'none',
                    cursor: assignUserId && assignReason.length >= 10 ? 'pointer' : 'not-allowed',
                    opacity: assignUserId && assignReason.length >= 10 ? 1 : 0.6,
                  }}
                >
                  {assigning ? 'Asignando...' : 'Asignar al Equipo'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Intervention progress panel - full width below the 2-col grid */}
        <div style={{ marginTop: '1.5rem' }}>
          <InterventionStatusPanel
            caseId={caseId}
            currentUserId={user?.id ?? ''}
            currentUserRole={user?.role ?? ''}
            onStatusChange={loadCaseDetails}
          />
        </div>
        </>
      )}

      {/* TAB CONTENT: Bitácora / Actuaciones */}
      {activeTab === 'bitacora' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Cronología de Actuaciones del Caso
            </h3>

            {actionLogs.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No hay actuaciones registradas en la bitácora aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {actionLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--papel)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--bosque-profundo)', color: 'white', fontWeight: 700 }}>
                            {formatActionType(log.actionType)}
                          </span>
                          {log.isSigned && (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--salvia)', color: 'white', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Lock size={12} /> FIRMADA INMUTABLE
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginTop: '0.375rem' }}>
                          {log.title}
                        </h4>
                      </div>

                      <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'right' }}>
                        <div>{new Date(log.createdAt).toLocaleString('es-BO')}</div>
                        <div>Autor: {log.author?.firstName} {log.author?.lastName} ({log.author?.role})</div>
                      </div>
                    </div>

                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.875rem', color: 'var(--grafito)' }}>
                      {log.content}
                    </div>

                    {!log.isSigned && log.authorId === user?.id && (
                      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleSignActionLog(log.id)}
                          style={{
                            backgroundColor: 'var(--salvia)',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                          }}
                        >
                          <CheckCircle2 size={14} /> Firmar Actuación (Congelar)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Action Log Form - SOLO PROFESIONALES */}
          {user?.role !== 'SECRETARIA' && (
            <form onSubmit={handleCreateActionLog} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
                Registrar Nueva Actuación
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Tipo de Actuación</label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value="ENTREVISTA">Entrevista / Declaración</option>
                    <option value="VISITA_DOMICILIARIA">Visita Domiciliaria</option>
                    <option value="AUDIENCIA">Audiencia / Diligencia</option>
                    <option value="NOTA">Nota de Campo</option>
                    <option value="DERIVACION">Derivación Institucional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Título / Asunto</label>
                  <input
                    type="text"
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    placeholder="Resumen del hecho..."
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Contenido de la Actuación</label>
                  <textarea
                    rows={5}
                    value={logContent}
                    onChange={(e) => setLogContent(e.target.value)}
                    placeholder="Detalle objetivo de la actuación realizada..."
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLog}
                  style={{
                    backgroundColor: 'var(--bosque-profundo)',
                    color: 'white',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius)',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {submittingLog ? 'Guardando...' : '+ Agregar a la Bitácora'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: Agenda del Caso */}
      {activeTab === 'agenda' && (() => {
        // Equipo activo del caso para el selector de profesional
        const activeTeam = (caseData?.teamHistory ?? []).filter((t: any) => !t.endDate);
        // El profesional es quien puede también crear su propia cita si la secretaria no lo hizo
        const isProfessionalInTeam = activeTeam.some((t: any) => t.user?.id === user?.id);
        const canSchedule = canManageCase || isProfessionalInTeam;

        const APPOINTMENT_TYPES = [
          { value: 'ENTREVISTA',          label: '🗣️ Entrevista Psicología/Social' },
          { value: 'AUDIENCIA',           label: '⚖️ Audiencia Judicial' },
          { value: 'VISITA_DOMICILIARIA', label: '🏠 Visita Domiciliaria' },
          { value: 'SEGUIMIENTO',         label: '📋 Sesión de Seguimiento' },
          { value: 'PERICIA',             label: '🔬 Peritaje / Evaluación Técnica' },
          { value: 'CONCILIACION',        label: '🤝 Sesión de Conciliación' },
          { value: 'OTRO',                label: '✏️ Otro (escribir descripción)' },
        ];

        return (
          <div style={{ display: 'grid', gridTemplateColumns: !caseData?.isClosed && canSchedule ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>

            {/* Banner de propuestas pendientes para el usuario actual */}
            {appointments.filter((a: any) =>
              a.status === 'PROPUESTA' &&
              a.assignedProfessionalId === user?.id
            ).length > 0 && (
              <div style={{ backgroundColor: 'oklch(0.96 0.08 85)', border: '1px solid oklch(0.85 0.1 85)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.5rem', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>
                  📬 Tenés {appointments.filter((a: any) => a.status === 'PROPUESTA' && a.assignedProfessionalId === user?.id).length} propuesta(s) de cita pendiente(s) de respuesta
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {appointments
                    .filter((a: any) => a.status === 'PROPUESTA' && a.assignedProfessionalId === user?.id)
                    .map((a: any) => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid oklch(0.88 0.06 85)' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{a.title}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            {a.appointmentType} — {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('es-BO') : 'Fecha a confirmar'}
                            {a.location ? ` · ${a.location}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openRespondModal(a)}
                          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Responder
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── Lista de citas ── */}
            <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
                Citas y Audiencias del Expediente
              </h3>

              {appointments.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No hay citas programadas para este expediente.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {appointments.map((app) => {
                    const professional = app.assignedProfessional ?? app.creator;
                    const roleLabel: Record<string, string> = {
                      ABOGADO: '⚖️ Abogado/a',
                      PSICOLOGO: '🧠 Psicólogo/a',
                      SOCIAL: '👥 Trab. Social',
                      SECRETARIA: '📋 Secretaría',
                      JEFATURA: '🏛️ Jefatura',
                    };

                    const statusStyles: Record<string, { bg: string; label: string; icon: string }> = {
                      PROPUESTA:    { bg: '#F59E0B', label: 'Propuesta',    icon: '⏳' },
                      PROGRAMADA:   { bg: '#3B82F6', label: 'Programada',   icon: '📅' },
                      CONFIRMADA:   { bg: '#059669', label: 'Confirmada',   icon: '✅' },
                      COMPLETADA:   { bg: '#D97706', label: 'Completada',   icon: '🏁' },
                      CANCELADA:    { bg: '#6B7280', label: 'Cancelada',    icon: '❌' },
                      REPROGRAMADA: { bg: '#7C3AED', label: 'Reprogramada', icon: '🔄' },
                      NO_ASISTIO:   { bg: '#DC2626', label: 'No Asistió',   icon: '🚫' },
                      RECHAZADA:    { bg: '#DC2626', label: 'Rechazada',    icon: '🚫' },
                    };
                    const ss = statusStyles[app.status] ?? { bg: '#6B7280', label: app.status, icon: '❓' };

                    // El profesional asignado puede responder si la cita está en PROPUESTA
                    const isProfessionalAssigned = app.assignedProfessionalId === user?.id ||
                      (!app.assignedProfessionalId && app.createdBy === user?.id);
                    const canRespond = app.status === 'PROPUESTA' && isProfessionalAssigned;

                    return (
                      <div
                        key={app.id}
                        style={{
                          padding: '1rem 1.25rem',
                          backgroundColor: app.status === 'PROPUESTA' ? 'oklch(0.98 0.03 65)' : 'var(--papel)',
                          borderRadius: 'var(--radius)',
                          border: `2px solid ${app.status === 'PROPUESTA' ? '#FCD34D' : 'var(--border)'}`,
                          borderLeft: `5px solid ${ss.bg}`,
                        }}
                      >
                        {/* Cabecera */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--tierra-calida)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {formatAppointmentType(app.appointmentType)}
                              </span>
                              <span style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem',
                                borderRadius: '12px', color: 'white', backgroundColor: ss.bg,
                              }}>
                                {ss.icon} {ss.label}
                              </span>
                              {app.status === 'PROPUESTA' && (
                                <span style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 700, backgroundColor: '#FEF3C7', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                                  ⚠️ Pendiente confirmación del profesional
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.4rem' }}>
                              {app.title}
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--grafito)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div>
                                👨‍⚕️ <strong>Profesional:</strong>{' '}
                                {professional ? `${professional.firstName} ${professional.lastName}` : '—'}
                                {professional?.role && <span style={{ opacity: 0.7 }}> ({roleLabel[professional.role] ?? professional.role})</span>}
                              </div>

                              {app.scheduledAt ? (
                                <div>
                                  📅 {new Date(app.scheduledAt).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
                                  {app.endAt && <span> → {new Date(app.endAt).toLocaleTimeString('es-BO', { timeStyle: 'short' })}</span>}
                                </div>
                              ) : (
                                <div style={{ color: '#B45309', fontWeight: 600 }}>
                                  📅 Fecha pendiente — el profesional debe confirmar su disponibilidad
                                </div>
                              )}

                              {app.location && <div><MapPin size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />{app.location}</div>}

                              {app.professionalNotes && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'oklch(0.96 0.02 165)', borderRadius: 'var(--radius)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                  💬 <strong>Nota del profesional:</strong> {app.professionalNotes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Botones de acción para el profesional asignado */}
                          {canRespond && (
                            <button
                              onClick={() => openRespondModal(app)}
                              style={{
                                backgroundColor: '#F59E0B',
                                color: 'white',
                                border: 'none',
                                padding: '0.625rem 1rem',
                                borderRadius: 'var(--radius)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                              }}
                            >
                              ✋ Responder propuesta
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Formulario: solo si el caso no está cerrado y el usuario puede programar ── */}
            {!caseData?.isClosed && canSchedule && (
              <form onSubmit={handleCreateAppointment} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.25rem' }}>
                  Programar Cita u Audiencia
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7, marginBottom: '1.25rem' }}>
                  {canManageCase
                    ? 'Asigná el profesional responsable y define la cita.'
                    : 'Como profesional asignado, podés programar tu propia cita.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Profesional responsable — lógica por rol */}
                  {(() => {
                    const isProfessional = ['ABOGADO', 'PSICOLOGO', 'SOCIAL'].includes(user?.role ?? '');
                    const isManager = canManageCase;

                    if (isManager && activeTeam.length > 0) {
                      // Secretaria/Jefatura: puede elegir cualquier miembro del equipo
                      return (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                            👨‍⚕️ Profesional responsable
                          </label>
                          <select
                            value={appAssignedProfessionalId}
                            onChange={(e) => setAppAssignedProfessionalId(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                          >
                            <option value="">-- Sin profesional asignado (cita general) --</option>
                            {/* Primero los del equipo activo del caso */}
                            {caseData?.teamHistory
                              ?.filter((m: any) => m.endDate === null)
                              .map((m: any) => (
                                <option key={m.user.id} value={m.user.id}>
                                  {m.user.firstName} {m.user.lastName} ({m.role}) — Equipo del caso
                                </option>
                              ))}
                            {/* Separador visual si también hay otros staff */}
                            {staffUsers.filter((u: any) => !caseData?.teamHistory?.some((m: any) => m.endDate === null && m.user.id === u.id)).length > 0 && (
                              <option disabled>── Otros profesionales ──</option>
                            )}
                            {staffUsers
                              .filter((u: any) => !caseData?.teamHistory?.some((m: any) => m.endDate === null && m.user.id === u.id))
                              .map((u: any) => (
                                <option key={u.id} value={u.id}>
                                  {u.firstName} {u.lastName} ({u.role})
                                </option>
                              ))}
                          </select>
                        </div>
                      );
                    }

                    if (isProfessional) {
                      // Profesional: solo aparece él mismo + opción de sugerir a colega del mismo rol
                      const sameRoleColleagues = staffUsers.filter(
                        (u: any) => u.role === user?.role && u.id !== user?.id &&
                          !activeTeam.some((t: any) => t.user?.id === u.id),
                      );
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                              👨‍⚕️ Profesional responsable
                            </label>
                            <select
                              value={appAssignedProfessionalId}
                              onChange={(e) => setAppAssignedProfessionalId(e.target.value)}
                              style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                            >
                              {/* El propio profesional */}
                              <option value={user?.id ?? ''}>
                                {user?.firstName} {user?.lastName} ({user?.role}) — yo
                              </option>
                              {/* Colegas del mismo rol asignados al equipo */}
                              {activeTeam
                                .filter((t: any) => t.user?.role === user?.role && t.user?.id !== user?.id)
                                .map((t: any) => (
                                  <option key={t.user?.id} value={t.user?.id}>
                                    {t.user?.firstName} {t.user?.lastName} ({t.user?.role})
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Sugerencia: cita con colega del mismo rol fuera del equipo */}
                          {sameRoleColleagues.length > 0 && (
                            <div style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: 'oklch(0.98 0.02 65)',
                              border: '1px solid var(--tierra-calida)',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.8rem',
                            }}>
                              <div style={{ fontWeight: 700, color: 'var(--tierra-calida)', marginBottom: '0.375rem' }}>
                                💡 ¿Necesitás sugerir esta cita a un colega {user?.role}?
                              </div>
                              <div style={{ color: 'var(--grafito)', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                Podés crear la cita como propuesta para que otro profesional del mismo rol la atienda:
                              </div>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) setAppAssignedProfessionalId(e.target.value);
                                }}
                                defaultValue=""
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}
                              >
                                <option value="">— Sugerir a colega {user?.role} (fuera del equipo) —</option>
                                {sameRoleColleagues.map((u: any) => (
                                  <option key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName} — {u.office?.name ?? ''}
                                  </option>
                                ))}
                              </select>
                              <div style={{ fontSize: '0.7rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.375rem' }}>
                                ℹ️ Si elegís un colega que no está en el equipo, la cita quedará como PROPUESTA para que él confirme disponibilidad.
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {/* Tipo de cita */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      📋 Tipo de Cita
                    </label>
                    <select
                      value={appType}
                      onChange={(e) => setAppType(e.target.value)}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    >
                      {APPOINTMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Si eligió OTRO → campo libre para describir el tipo */}
                  {appType === 'OTRO' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                        ✏️ Descripción del tipo de cita
                      </label>
                      <input
                        type="text"
                        value={appTypeCustom}
                        onChange={(e) => setAppTypeCustom(e.target.value)}
                        placeholder="Ej: Reunión con institución educativa..."
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                      />
                    </div>
                  )}

                  {/* Título libre */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      📝 Título / Asunto
                    </label>
                    <input
                      type="text"
                      value={appTitle}
                      onChange={(e) => setAppTitle(e.target.value)}
                      placeholder="Ej: Primera entrevista con la familia..."
                      required
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Fecha y hora */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      📅 Fecha y Hora
                    </label>
                    <input
                      type="datetime-local"
                      value={appScheduledAt}
                      onChange={(e) => setAppScheduledAt(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Lugar */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      📍 Lugar / Dirección
                    </label>
                    <input
                      type="text"
                      value={appLocation}
                      onChange={(e) => setAppLocation(e.target.value)}
                      placeholder="Ej: Oficina Central - Sala 2"
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingApp || !appTitle.trim() || !appScheduledAt}
                    style={{
                      backgroundColor: appTitle.trim() && appScheduledAt ? 'var(--bosque-profundo)' : 'var(--border)',
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      fontWeight: 700,
                      border: 'none',
                      cursor: appTitle.trim() && appScheduledAt ? 'pointer' : 'not-allowed',
                      fontSize: '0.875rem',
                    }}
                  >
                    {submittingApp ? '⏳ Programando...' : '📅 + Programar en Agenda'}
                  </button>
                </div>
              </form>
            )}

            {/* Aviso si el caso tiene equipo vacío y el usuario es profesional externo */}
            {!caseData?.isClosed && !canSchedule && (
              <div style={{
                backgroundColor: 'var(--card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                textAlign: 'center',
                opacity: 0.7,
              }}>
                <p style={{ fontSize: '0.875rem' }}>
                  Las citas son programadas por Secretaría o Jefatura.<br />
                  Si necesitás programar una cita, contactá a la secretaria.
                </p>
              </div>
            )}
          </div>
        );
      })()}
      {activeTab === 'lineatiempo' && (
        <CaseTimeline
          caseId={caseId}
          currentUserId={user?.id}
          currentUserRole={user?.role}
          reports={reports}
          teamHistory={caseData?.teamHistory}
        />
      )}

      {/* TAB CONTENT: Trámites Especiales (Fase 3) — solo para casos administrativos */}
      {isAdministrativeCase(caseData?.caseType) && activeTab === 'tramites' && (
        <SpecialProceduresTabs
          caseId={caseId}
          userRole={user?.role ?? ''}
          defaultTab={initialSubtab && activeTab === 'tramites' ? (initialSubtab as any) : undefined}
        />
      )}

      {/* AI Copilot Widget */}
      <AiCopilot context={caseData.narrative} isLegalRole={user?.role === 'ABOGADO' || user?.role === 'JEFATURA'} />

      {/* ── Modal: Profesional responde a propuesta de cita ── */}
      {respondingApp && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setRespondingApp(null); }}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1500, padding: '1.5rem',
          }}
        >
          <div style={{
            backgroundColor: 'var(--card)', borderRadius: 'var(--radius)',
            border: '2px solid var(--border)', width: '100%', maxWidth: '560px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ backgroundColor: '#F59E0B', padding: '1.25rem 1.5rem', color: 'white' }}>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                ✋ Responder Propuesta de Cita
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {respondingApp.title} — propuesta por secretaría
              </div>
            </div>

            <form onSubmit={handleRespondAppointment} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Tipo de respuesta */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--bosque-profundo)' }}>
                  ¿Qué querés hacer con esta propuesta?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {([
                    { value: 'ACCEPTED', icon: '✅', label: 'Aceptar tal cual', desc: 'Confirmo la cita con la fecha y hora propuesta.' },
                    { value: 'MODIFIED', icon: '✏️', label: 'Aceptar con cambios', desc: 'Acepto atender la cita pero necesito cambiar fecha, hora o lugar.' },
                    { value: 'REJECTED', icon: '❌', label: 'No puedo atenderla', desc: 'No estoy disponible. La secretaria deberá reasignar o reprogramar.' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.875rem 1rem', borderRadius: 'var(--radius)',
                        border: `2px solid ${respondType === opt.value ? '#F59E0B' : 'var(--border)'}`,
                        backgroundColor: respondType === opt.value ? 'oklch(0.98 0.03 65)' : 'var(--papel)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="respondType"
                        value={opt.value}
                        checked={respondType === opt.value}
                        onChange={() => setRespondType(opt.value)}
                        style={{ marginTop: '0.125rem', accentColor: '#F59E0B' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--bosque-profundo)' }}>
                          {opt.icon} {opt.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', marginTop: '0.125rem' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Campos adicionales si modifica */}
              {respondType === 'MODIFIED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.25rem' }}>
                    ✏️ Proponer nuevos datos para la cita:
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nuevo título (opcional)</label>
                    <input
                      type="text"
                      value={respondTitle}
                      onChange={(e) => setRespondTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Nueva fecha y hora <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={respondScheduledAt}
                      onChange={(e) => setRespondScheduledAt(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Lugar (opcional)</label>
                    <input
                      type="text"
                      value={respondLocation}
                      onChange={(e) => setRespondLocation(e.target.value)}
                      placeholder="Ej: Sala 3, Oficina Central"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Fecha si acepta sin cambios y no había fecha */}
              {respondType === 'ACCEPTED' && !respondingApp.scheduledAt && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    📅 Fecha y hora de la cita <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={respondScheduledAt}
                    onChange={(e) => setRespondScheduledAt(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                  />
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                    La secretaria no especificó una fecha. Como profesional asignado, podés definirla.
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  💬 Observaciones {respondType === 'REJECTED' ? '(motivo del rechazo)' : '(opcional)'}
                </label>
                <textarea
                  rows={3}
                  value={respondNotes}
                  onChange={(e) => setRespondNotes(e.target.value)}
                  required={respondType === 'REJECTED'}
                  placeholder={
                    respondType === 'REJECTED'
                      ? 'Ej: Estaré en audiencia judicial ese día. Por favor reasignar.'
                      : 'Ej: Confirmo la cita. El familiar también asistirá.'
                  }
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRespondingApp(null)}
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingRespond}
                  style={{
                    backgroundColor: respondType === 'REJECTED' ? '#DC2626' : respondType === 'MODIFIED' ? '#7C3AED' : '#059669',
                    color: 'white', border: 'none',
                    padding: '0.625rem 1.5rem',
                    borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                  }}
                >
                  {submittingRespond ? '⏳ Enviando...' :
                    respondType === 'ACCEPTED' ? '✅ Confirmar Cita' :
                    respondType === 'MODIFIED' ? '✏️ Proponer Cambios' :
                    '❌ Rechazar Propuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
