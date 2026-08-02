'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { ArrowLeft, Scale, Calendar, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ConciliacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [recording, setRecording] = useState(false);

  // Formulario de audiencia
  const [hearingForm, setHearingForm] = useState({
    scheduledDate: '',
    location: '',
  });

  // Formulario de resultado
  const [resultForm, setResultForm] = useState({
    processId: '',
    agreementReached: false,
    agreementText: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cData, evalData, processesData] = await Promise.all([
          fetchApi(`/cases/${caseId}`),
          fetchApi(`/conciliation/evaluation/${caseId}`).catch(() => null),
          fetchApi(`/conciliation/processes/${caseId}`).catch(() => []),
        ]);

        setCaseData(cData);
        setEvaluation(evalData);
        setProcesses(processesData);
      } catch (error) {
        alert('Error al cargar datos del caso');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [caseId, user]);

  const handleEvaluate = async () => {
    if (
      !confirm(
        '¿Desea evaluar la conciliabilidad de este caso?\n\nEl sistema analizará automáticamente según el Art. 24 de la Ordenanza 136/03.',
      )
    ) {
      return;
    }

    setEvaluating(true);
    try {
      const result = await fetchApi(`/conciliation/${caseId}/evaluate`, {
        method: 'POST',
      });

      setEvaluation(result);

      if (result.isConciliable) {
        alert('✅ CASO CONCILIABLE\n\nEl caso puede proceder por vía de conciliación.');
      } else {
        alert(
          '❌ CASO NO CONCILIABLE\n\nEl caso debe proceder por VÍA JUDICIAL.\n\nMotivo: ' +
            result.reason,
        );
      }

      // Recargar datos
      const [cData, processesData] = await Promise.all([
        fetchApi(`/cases/${caseId}`),
        fetchApi(`/conciliation/processes/${caseId}`).catch(() => []),
      ]);
      setCaseData(cData);
      setProcesses(processesData);
    } catch (error: any) {
      alert(error.message || 'Error al evaluar conciliabilidad');
    } finally {
      setEvaluating(false);
    }
  };

  const handleScheduleHearing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !confirm(
        '¿Desea agendar esta audiencia de conciliación?\n\nSe creará una cita en el calendario y se notificará a las partes.',
      )
    ) {
      return;
    }

    setScheduling(true);
    try {
      await fetchApi(`/conciliation/${caseId}/schedule-hearing`, {
        method: 'POST',
        body: JSON.stringify(hearingForm),
      });

      alert('✅ Audiencia de conciliación agendada correctamente.');

      // Recargar procesos
      const processesData = await fetchApi(`/conciliation/processes/${caseId}`);
      setProcesses(processesData);

      // Limpiar formulario
      setHearingForm({ scheduledDate: '', location: '' });
    } catch (error: any) {
      alert(error.message || 'Error al agendar audiencia');
    } finally {
      setScheduling(false);
    }
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !confirm(
        resultForm.agreementReached
          ? '¿Confirma que se alcanzó un ACUERDO en la audiencia de conciliación?'
          : '¿Confirma que NO se alcanzó acuerdo?\n\nEl caso se derivará automáticamente a VÍA JUDICIAL.',
      )
    ) {
      return;
    }

    setRecording(true);
    try {
      await fetchApi(`/conciliation/process/${resultForm.processId}/record-result`, {
        method: 'POST',
        body: JSON.stringify({
          agreementReached: resultForm.agreementReached,
          agreementText: resultForm.agreementText,
        }),
      });

      alert(
        resultForm.agreementReached
          ? '✅ Acuerdo registrado correctamente.'
          : '❌ Sin acuerdo. El caso se deriva a VÍA JUDICIAL.',
      );

      // Recargar datos
      const [cData, processesData] = await Promise.all([
        fetchApi(`/cases/${caseId}`),
        fetchApi(`/conciliation/processes/${caseId}`).catch(() => []),
      ]);
      setCaseData(cData);
      setProcesses(processesData);

      // Limpiar formulario
      setResultForm({ processId: '', agreementReached: false, agreementText: '' });
    } catch (error: any) {
      alert(error.message || 'Error al registrar resultado');
    } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
        Cargando datos de conciliación...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Caso no encontrado</h2>
        <Link href="/casos">Volver a lista de casos</Link>
      </div>
    );
  }

  // Verificar permisos
  if (user?.role !== 'ABOGADO' && user?.role !== 'ADMINISTRADOR') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      >
        <AlertTriangle size={48} color="var(--riesgo-alto)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
          Acceso Restringido
        </h2>
        <p style={{ color: 'var(--grafito)', marginBottom: '1.5rem' }}>
          Solo ABOGADOS pueden evaluar la conciliabilidad y gestionar audiencias.
        </p>
        <Link href={`/casos/${caseId}`} style={{ color: 'var(--bosque-profundo)', fontWeight: 600 }}>
          ← Volver al expediente
        </Link>
      </div>
    );
  }

  const isConciliable = evaluation?.isConciliable;
  const hasEvaluation = evaluation !== null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href={`/casos/${caseId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--bosque-profundo)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Volver al expediente
        </Link>

        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--bosque-profundo)',
              marginBottom: '0.25rem',
            }}
          >
            <Scale size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Conciliación
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--grafito)' }}>
            Expediente: <strong>{caseData.caseCode}</strong> · Ruta actual:{' '}
            <strong>{caseData.currentInterventionPath}</strong>
          </p>
        </div>
      </div>

      {/* Marco Legal */}
      <div
        style={{
          backgroundColor: 'oklch(0.96 0.03 165)',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--salvia)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <strong style={{ color: 'var(--bosque-profundo)' }}>
          📜 Arts. 24, 26, 27 - Ordenanza Municipal 136/03:
        </strong>{' '}
        Los casos NO penales deben intentar conciliación. Se prohíbe conciliar en casos de maltrato o
        pérdida de autoridad paterna.
      </div>

      {/* Evaluación de Conciliabilidad */}
      <div
        style={{
          backgroundColor: 'var(--card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--bosque-profundo)',
            marginBottom: '1rem',
          }}
        >
          1. Evaluación de Conciliabilidad (Art. 24)
        </h2>

        {!hasEvaluation ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Scale size={48} color="var(--grafito)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--grafito)', marginBottom: '1.5rem' }}>
              Este caso aún no ha sido evaluado para determinar si es conciliable.
            </p>
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Scale size={18} />
              {evaluating ? 'Evaluando...' : 'Evaluar Conciliabilidad'}
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: isConciliable ? 'oklch(0.96 0.03 145)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius)',
                border: `2px solid ${isConciliable ? 'var(--salvia)' : 'var(--riesgo-alto)'}`,
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.75rem',
                }}
              >
                {isConciliable ? (
                  <CheckCircle2 size={32} color="var(--salvia)" />
                ) : (
                  <XCircle size={32} color="var(--riesgo-alto)" />
                )}
                <div>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: isConciliable ? 'var(--salvia)' : 'var(--riesgo-alto)',
                      margin: 0,
                    }}
                  >
                    {isConciliable ? 'CASO CONCILIABLE' : 'CASO NO CONCILIABLE'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                    Evaluado el {new Date(evaluation.createdAt).toLocaleString('es-BO')}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--card)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '0.75rem',
                }}
              >
                <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Fundamentación Legal:
                </strong>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {evaluation.reason}
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                <strong>Factores analizados:</strong>
                <ul style={{ margin: '0.25rem 0 0 1.5rem', padding: 0 }}>
                  <li>Maltrato: {evaluation.hasMaltrato ? '❌ SÍ' : '✅ NO'}</li>
                  <li>
                    Pérdida Autoridad Paterna: {evaluation.hasAuthorityLoss ? '❌ SÍ' : '✅ NO'}
                  </li>
                  <li>Delito Tipificado: {evaluation.hasCriminalAction ? '❌ SÍ' : '✅ NO'}</li>
                </ul>
              </div>
            </div>

            {!isConciliable && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--riesgo-alto)',
                  fontSize: '0.875rem',
                }}
              >
                <strong>⚠️ Acción Requerida:</strong> El caso debe proceder por VÍA JUDICIAL. La ruta
                de intervención ha sido actualizada automáticamente.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audiencias de Conciliación (solo si es conciliable) */}
      {isConciliable && (
        <>
          {/* Historial de Procesos */}
          <div
            style={{
              backgroundColor: 'var(--card)',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--bosque-profundo)',
                marginBottom: '1rem',
              }}
            >
              2. Audiencias de Conciliación (Arts. 26, 27)
            </h2>

            {processes.length === 0 ? (
              <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>
                No se han programado audiencias de conciliación aún.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {processes.map((proc) => (
                  <div
                    key={proc.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--papel)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: proc.isCompleted
                              ? proc.agreementReached
                                ? 'var(--salvia)'
                                : 'var(--riesgo-alto)'
                              : 'var(--tierra-calida)',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {proc.isCompleted
                            ? proc.agreementReached
                              ? '✅ CON ACUERDO'
                              : '❌ SIN ACUERDO'
                            : '📅 PROGRAMADA'}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                          Audiencia de Conciliación
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                          📍 {proc.location}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(proc.scheduledDate).toLocaleString('es-BO')}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                          Abogado: {proc.leadLawyer?.firstName} {proc.leadLawyer?.lastName}
                        </div>
                      </div>
                    </div>

                    {proc.isCompleted && proc.agreementReached && proc.agreementText && (
                      <div
                        style={{
                          padding: '1rem',
                          backgroundColor: 'oklch(0.96 0.03 145)',
                          borderRadius: 'var(--radius)',
                          marginTop: '0.75rem',
                        }}
                      >
                        <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                          📄 Texto del Acuerdo:
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                          {proc.agreementText}
                        </p>
                      </div>
                    )}

                    {proc.isCompleted && proc.completedAt && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
                        Completada el: {new Date(proc.completedAt).toLocaleString('es-BO')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario para Agendar Audiencia */}
          <div
            style={{
              backgroundColor: 'var(--card)',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--bosque-profundo)',
                marginBottom: '1rem',
              }}
            >
              3. Agendar Nueva Audiencia
            </h2>

            <form onSubmit={handleScheduleHearing}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.375rem',
                    }}
                  >
                    Fecha y hora de la audiencia <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={hearingForm.scheduledDate}
                    onChange={(e) =>
                      setHearingForm({ ...hearingForm, scheduledDate: e.target.value })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.375rem',
                    }}
                  >
                    Lugar de la audiencia <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={hearingForm.location}
                    onChange={(e) => setHearingForm({ ...hearingForm, location: e.target.value })}
                    placeholder="Ej: Sala de Audiencias - Defensoría Central"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={scheduling}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--bosque-profundo)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Calendar size={18} />
                {scheduling ? 'Agendando...' : 'Agendar Audiencia de Conciliación'}
              </button>
            </form>
          </div>

          {/* Formulario para Registrar Resultado */}
          {processes.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--bosque-profundo)',
                  marginBottom: '1rem',
                }}
              >
                4. Registrar Resultado de Audiencia
              </h2>

              <form onSubmit={handleRecordResult}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.375rem',
                      }}
                    >
                      Seleccionar audiencia <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
                    </label>
                    <select
                      value={resultForm.processId}
                      onChange={(e) => setResultForm({ ...resultForm, processId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <option value="">-- Seleccionar audiencia --</option>
                      {processes
                        .filter((p) => !p.isCompleted)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {new Date(p.scheduledDate).toLocaleString('es-BO')} - {p.location}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--papel)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={resultForm.agreementReached}
                        onChange={(e) =>
                          setResultForm({
                            ...resultForm,
                            agreementReached: e.target.checked,
                            agreementText: e.target.checked ? resultForm.agreementText : '',
                          })
                        }
                        style={{ width: '1.25rem', height: '1.25rem' }}
                      />
                      <CheckCircle2
                        size={20}
                        color={resultForm.agreementReached ? 'var(--salvia)' : 'var(--grafito)'}
                      />
                      <span
                        style={{
                          color: resultForm.agreementReached ? 'var(--salvia)' : 'var(--grafito)',
                        }}
                      >
                        ✅ Se alcanzó un acuerdo conciliatorio
                      </span>
                    </label>
                  </div>

                  {resultForm.agreementReached && (
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          marginBottom: '0.375rem',
                        }}
                      >
                        Texto del acuerdo <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
                      </label>
                      <textarea
                        rows={6}
                        value={resultForm.agreementText}
                        onChange={(e) =>
                          setResultForm({ ...resultForm, agreementText: e.target.value })
                        }
                        placeholder="Redactar el texto completo del acuerdo alcanzado entre las partes..."
                        required={resultForm.agreementReached}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={recording || !resultForm.processId}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: resultForm.agreementReached
                      ? 'var(--salvia)'
                      : 'var(--riesgo-alto)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FileText size={18} />
                  {recording ? 'Registrando...' : 'Registrar Resultado'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
