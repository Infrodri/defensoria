'use client';

import React, { useEffect, useState, use } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PhaseRail } from '@/components/cases/phase-rail';
import { ReportEditor } from '@/components/reports/report-editor';
import { EvidenceGallery } from '@/components/evidences/evidence-gallery';
import { CaseTimeline } from '@/components/cases/case-timeline';
import { AiCopilot } from '@/components/ai/ai-copilot';
import { formatCaseType, formatInterventionPath, formatActionType, formatAppointmentType, formatRiskLevel } from '@defensoria/shared';
import { Shield, Users, FileText, Building2, UserPlus, Clock, ArrowLeft, CheckCircle2, Lock, Plus, Calendar as CalendarIcon, MapPin, ShieldAlert, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function CasoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<any | null>(null);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'equipo' | 'bitacora' | 'informes' | 'evidencias' | 'agenda' | 'narrativa' | 'lineatiempo'>('resumen');

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
  const [appScheduledAt, setAppScheduledAt] = useState('');
  const [appLocation, setAppLocation] = useState('');
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

  // Filter staff by selected role and active status
  useEffect(() => {
    if (assignRole && staffUsers.length > 0) {
      const filtered = staffUsers.filter((u) => u.role === assignRole && u.isActive === true);
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
        promises.push(fetchApi('/users').catch(() => []));
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
    if (!appTitle.trim() || !appScheduledAt) return;

    setSubmittingApp(true);
    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          caseId,
          title: appTitle,
          appointmentType: appType,
          scheduledAt: appScheduledAt,
          location: appLocation || undefined,
        }),
      });

      const updatedApps = await fetchApi(`/appointments/case/${caseId}`);
      setAppointments(updatedApps);
      setAppTitle('');
      setAppScheduledAt('');
      setAppLocation('');
    } catch (err: any) {
      alert(err.message || 'Error al programar cita');
    } finally {
      setSubmittingApp(false);
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
      </div>

      {/* TAB CONTENT: Resumen */}
      {activeTab === 'resumen' && (
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

      {/* TAB CONTENT: Equipo Interdisciplinario */}
      {activeTab === 'equipo' && (
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
                          ⚠️ No hay profesionales activos con el rol <strong>{assignRole === 'ABOGADO' ? 'ABOGADO' : assignRole === 'PSICOLOGO' ? 'PSICÓLOGO' : 'TRABAJADOR SOCIAL'}</strong>
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

          {/* New Action Log Form */}
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
        </div>
      )}

      {/* TAB CONTENT: Agenda del Caso */}
      {activeTab === 'agenda' && (
        <div style={{ display: 'grid', gridTemplateColumns: caseData?.isClosed ? '1fr' : '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Citas y Audiencias del Expediente
            </h3>

            {appointments.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No hay citas o audiencias programadas para este expediente.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--papel)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)', textTransform: 'uppercase' }}>
                          {formatAppointmentType(app.appointmentType)}
                        </span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                          {app.title}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'right', fontWeight: 600 }}>
                        {new Date(app.scheduledAt).toLocaleString('es-BO')}
                      </div>
                    </div>

                    {app.location && (
                      <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {app.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!caseData?.isClosed && (
            <form onSubmit={handleCreateAppointment} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Programar Cita u Audiencia
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Tipo de Cita</label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                >
                  <option value="ENTREVISTA">Entrevista Psicología/Social</option>
                  <option value="AUDIENCIA">Audiencia Judicial</option>
                  <option value="VISITA_DOMICILIARIA">Visita Domiciliaria</option>
                  <option value="SEGUIMIENTO">Sesión de Seguimiento</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Título / Asunto</label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="Ej: Entrevista Psicológica Inicial..."
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={appScheduledAt}
                  onChange={(e) => setAppScheduledAt(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Lugar / Dirección</label>
                <input
                  type="text"
                  value={appLocation}
                  onChange={(e) => setAppLocation(e.target.value)}
                  placeholder="Ej: Oficina Central - Sala 2"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingApp}
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
                {submittingApp ? 'Programando...' : '+ Programar en Agenda'}
              </button>
            </div>
          </form>
          )}
        </div>
      )}
      {activeTab === 'lineatiempo' && (
        <CaseTimeline caseId={caseId} />
      )}

      {/* AI Copilot Widget */}
      <AiCopilot context={caseData.narrative} isLegalRole={user?.role === 'ABOGADO' || user?.role === 'JEFATURA'} />

    </div>
  );
}
