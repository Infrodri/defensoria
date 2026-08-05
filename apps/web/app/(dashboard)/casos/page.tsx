'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPhase, formatInterventionPath, formatCaseType } from '@defensoria/shared';
import { FileText, ArrowRight, UserPlus, ShieldOff, AlertTriangle, Trash2 } from 'lucide-react';

export default function CasosListPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showHardDeleteModal, setShowHardDeleteModal] = useState(false);
  const [hardConfirm, setHardConfirm] = useState('');

  useEffect(() => {
    fetchApi('/cases')
      .then((data) => setCases(data))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDisableCase = async (reason: string) => {
    if (!selectedCase) return;

    try {
      await fetchApi(`/cases/${selectedCase.id}/disable`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      // Remove from local list
      setCases(cases.filter(c => c.id !== selectedCase.id));
      setShowDisableModal(false);
      setSelectedCase(null);
      
      alert('✅ Expediente inhabilitado exitosamente. Se generó reporte para Jefatura.');
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Error al inhabilitar expediente'));
    }
  };

  const handleHardDelete = async () => {
    if (!selectedCase) return;
    if (hardConfirm !== selectedCase.caseCode) {
      alert(`❌ Confirmación incorrecta. Escribí exactamente el caseCode "${selectedCase.caseCode}" del expediente.`);
      return;
    }
    if (!confirm(`¿Borrar de raíz "${selectedCase.caseCode}"? Esta acción es IRREVERSIBLE y eliminará todo su información.`)) return;

    try {
      await fetchApi(`/cases/${selectedCase.id}/hard-delete`, {
        method: 'POST',
        body: JSON.stringify({ confirm: hardConfirm }),
        headers: { 'Content-Type': 'application/json' },
      });

      // Quitar de la lista local y cerrar modal
      setCases(cases.filter(c => c.id !== selectedCase.id));
      setShowHardDeleteModal(false);
      setSelectedCase(null);
      setHardConfirm('');
      alert('✅ Expediente borrado de raíz. Toda su información asociada fue eliminada de forma definitiva.');
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Error al borrar el expediente'));
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            Expedientes de Casos
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Listado de casos asignados y activos en la oficina
          </p>
        </div>

        {(user?.role === 'SECRETARIA' || user?.role === 'JEFATURA') && (
          <Link
            href="/ingesta-caso"
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <UserPlus size={18} /> Inicio de Caso Nuevo
          </Link>
        )}
      </header>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando expedientes...</p>
      ) : cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>No tenés casos asignados o registrados</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
            Los expedientes aparecerán aquí según tu rol y asignación activa.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cases.map((c) => {
            const nnaParty = c.parties?.find((p: any) => p.roleInCase === 'NNA');
            const primaryNna = nnaParty?.person;

            return (
              <div
                key={c.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--bosque-profundo)', fontSize: '1rem' }}>
                      {c.caseCode}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '12px',
                        backgroundColor: 'oklch(0.92 0.04 175)',
                        color: 'var(--bosque-profundo)',
                        fontWeight: 700,
                      }}
                    >
                      {formatPhase(c.currentPhase)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '12px',
                        backgroundColor: 'oklch(0.96 0.03 65)',
                        color: 'var(--tierra-calida)',
                        fontWeight: 600,
                      }}
                    >
                      {formatInterventionPath(c.currentInterventionPath)}
                    </span>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--grafito)' }}>
                    NNA Titular: {primaryNna ? `${primaryNna.firstName} ${primaryNna.lastName}` : 'Sin datos del NNA'}
                  </div>

                  <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
                    Tipo de caso: <strong>{formatCaseType(c.caseType)}</strong> · Oficina: {c.currentOffice?.name}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Botón Inhabilitar - Solo para Secretaria */}
                  {user?.role === 'SECRETARIA' && (
                    <button
                      onClick={() => {
                        setSelectedCase(c);
                        setShowDisableModal(true);
                      }}
                      style={{
                        backgroundColor: '#DC2626',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldOff size={16} /> Inhabilitar
                    </button>
                  )}

                  {user?.role === 'ADMINISTRADOR' && (
                    <button
                      onClick={() => {
                        setSelectedCase(c);
                        setShowHardDeleteModal(true);
                        setHardConfirm('');
                      }}
                      style={{
                        backgroundColor: '#7f1d1d',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        flexShrink: 0,
                      }}
                      title="Borrar expediente de raíz (destructivo e irreversible)"
                    >
                      <Trash2 size={16} /> Borrar de raíz
                    </button>
                  )}

                  <Link
                    href={`/casos/${c.id}`}
                    style={{
                      backgroundColor: 'var(--bosque-profundo)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      flexShrink: 0,
                    }}
                  >
                    Abrir Expediente <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Inhabilitación */}
      {showDisableModal && selectedCase && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--card)',
              padding: '2rem',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--border)',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={24} color="#DC2626" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
                🚫 Inhabilitar Expediente
              </h3>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: '0.5rem' }}>
                ADVERTENCIA: Esta acción es irreversible
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--grafito)' }}>
                El expediente <strong>{selectedCase.caseCode}</strong> será inhabilitado permanentemente y no podrá ser editado por los profesionales. Se generará un reporte automático para revisión de Jefatura.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reason = formData.get('reason') as string;
                
                if (!reason.trim()) {
                  alert('❌ Debe proporcionar un motivo para la inhabilitación');
                  return;
                }

                handleDisableCase(reason);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  marginBottom: '0.5rem',
                  color: 'var(--bosque-profundo)' 
                }}>
                  Motivo de inhabilitación (Obligatorio):
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  required
                  placeholder="Ej: Información duplicada detectada&#10;Ej: Error en la asignación del caso&#10;Ej: Solicitud de la familia&#10;Ej: Derivación a otra instancia"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', marginTop: '0.5rem' }}>
                  📊 Este motivo se registrará en el reporte para Jefatura
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setSelectedCase(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  🚫 Confirmar Inhabilitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Modal Borrar expediente de raíz (solo Admin, doble confirmación) ═══ */}
      {showHardDeleteModal && selectedCase && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--card)',
              padding: '2rem',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--border)',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={24} color="#ef4444" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
                🗑 Borrar expediente de raíz
              </h3>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                ADVERTENCIA: Esta acción es IRREVERSIBLE
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', lineHeight: 1.5 }}>
                El expediente <strong>{selectedCase.caseCode}</strong> será <strong>borrado físicamente de la base de datos</strong> junto con TODA su información asociada: evidencias, transcripciones, análisis de IA, reportes, conciliaciones e inspecciones. La operación no genera reporte de Jefatura y no se puede deshacer.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleHardDelete();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--bosque-profundo)'
                }}>
                  Confirmación (escribí exactamente el caseCode: "{selectedCase.caseCode}"):
                </label>
                <input
                  type="text"
                  value={hardConfirm}
                  onChange={(e) => setHardConfirm(e.target.value)}
                  placeholder={selectedCase.caseCode}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.95rem',
                    fontFamily: 'mono',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowHardDeleteModal(false); setSelectedCase(null); setHardConfirm(''); }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#7f1d1d',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  🗑 Borrar definitivamente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

