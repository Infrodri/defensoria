'use client';

import React, { useEffect, useState, use } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PhaseRail } from '@/components/cases/phase-rail';
import { Shield, Users, FileText, Building2, UserPlus, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CasoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'equipo' | 'narrativa'>('resumen');

  // Assignment State
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState<'ABOGADO' | 'PSICOLOGO' | 'SOCIAL'>('ABOGADO');
  const [assignReason, setAssignReason] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchApi(`/cases/${caseId}`)
      .then((data) => setCaseData(data))
      .catch(() => setCaseData(null))
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId || !assignReason.trim()) return;

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

      // Reload case data
      const updated = await fetchApi(`/cases/${caseId}`);
      setCaseData(updated);
      setAssignReason('');
      alert('Profesional asignado correctamente al equipo del caso.');
    } catch (err: any) {
      alert(err.message || 'Error al asignar profesional');
    } finally {
      setAssigning(false);
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
    <div>
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
                {caseData.currentInterventionPath}
              </span>
            </div>
            <p style={{ fontSize: '1.125rem', color: 'var(--grafito)', marginTop: '0.25rem' }}>
              NNA Titular: <strong>{primaryNna ? `${primaryNna.firstName} ${primaryNna.lastName}` : 'No registrado'}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.875rem', opacity: 0.8 }}>
            <div>Oficina actual: <strong>{caseData.currentOffice?.name}</strong></div>
            <div>Apertura: {new Date(caseData.createdAt).toLocaleDateString('es-BO')}</div>
          </div>
        </div>
      </div>

      {/* Riel de Fase Component */}
      <div style={{ marginBottom: '2rem' }}>
        <PhaseRail currentPhase={caseData.currentPhase} orientation="horizontal" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
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
          onClick={() => setActiveTab('narrativa')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'narrativa' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'narrativa' ? 700 : 500,
            color: activeTab === 'narrativa' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
          }}
        >
          Narrativa de Denuncia
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
                <strong>{caseData.caseType}</strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: 'block' }}>Nivel de Riesgo Evaluado:</span>
                <strong style={{ color: caseData.riskLevel === 'ALTO' ? 'var(--riesgo-alto)' : 'var(--bosque-profundo)' }}>
                  {caseData.riskLevel || 'PENDIENTE DE EVALUACIÓN'}
                </strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: 'block' }}>Vía de Intervención:</span>
                <strong>{caseData.currentInterventionPath}</strong>
              </div>
            </div>
          </div>
        </div>
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

          {/* Assignment form for Jefatura/Secretaría */}
          {(user?.role === 'JEFATURA' || user?.role === 'SECRETARIA') && (
            <form onSubmit={handleAssignTeam} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
                Asignar Profesional
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Rol a Asignar</label>
                  <select
                    value={assignRole}
                    onChange={(e: any) => setAssignRole(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value="ABOGADO">Área Legal (Abogado/a)</option>
                    <option value="PSICOLOGO">Psicología</option>
                    <option value="SOCIAL">Trabajo Social</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>ID o Correo de Usuario</label>
                  <input
                    type="text"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    placeholder="Ingrese ID del profesional..."
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Motivo de Asignación</label>
                  <textarea
                    rows={3}
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="Justifique la asignación o reasignación..."
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={assigning}
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
                  {assigning ? 'Asignando...' : 'Asignar al Equipo'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: Narrativa */}
      {activeTab === 'narrativa' && (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            Hechos e Ingesta de Denuncia Inicial
          </h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem', padding: '1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            {caseData.intakeNarrative}
          </div>
        </div>
      )}
    </div>
  );
}
