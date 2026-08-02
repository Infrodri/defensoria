'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface SocialIntakeFormData {
  interviewDate: string;
  interviewLocation: string;
  incidentDescription: string;
  incidentLocation: string;
  incidentDate: string;
  incidentWitnesses: string;
  familyStructure: string;
  socialEconomicSituation: string;
  immediateDangerAssessment: boolean;
  dangerLevel: 'BAJO' | 'MEDIO' | 'ALTO' | '';
  professionalObservations: string;
  initialRecommendations: string;
}

export default function FichaSocialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState<any>(null);
  const [existingForm, setExistingForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<SocialIntakeFormData>({
    interviewDate: new Date().toISOString().split('T')[0],
    interviewLocation: '',
    incidentDescription: '',
    incidentLocation: '',
    incidentDate: '',
    incidentWitnesses: '',
    familyStructure: '',
    socialEconomicSituation: '',
    immediateDangerAssessment: false,
    dangerLevel: '',
    professionalObservations: '',
    initialRecommendations: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cData, existingFormData] = await Promise.all([
          fetchApi(`/cases/${caseId}`),
          fetchApi(`/social-intake/case/${caseId}`).catch(() => null),
        ]);

        setCaseData(cData);
        setExistingForm(existingFormData);

        // Pre-llenar con narrativa del caso si existe
        if (cData.intakeNarrative && !existingFormData) {
          setForm((prev) => ({
            ...prev,
            incidentDescription: cData.intakeNarrative,
          }));
        }

        // Si ya existe la ficha, mostrarla en modo lectura
        if (existingFormData) {
          setForm({
            interviewDate: existingFormData.interviewDate.split('T')[0],
            interviewLocation: existingFormData.interviewLocation,
            incidentDescription: existingFormData.incidentDescription,
            incidentLocation: existingFormData.incidentLocation,
            incidentDate: existingFormData.incidentDate
              ? existingFormData.incidentDate.split('T')[0]
              : '',
            incidentWitnesses: existingFormData.incidentWitnesses || '',
            familyStructure: existingFormData.familyStructure,
            socialEconomicSituation: existingFormData.socialEconomicSituation,
            immediateDangerAssessment: existingFormData.immediateDangerAssessment,
            dangerLevel: existingFormData.dangerLevel || '',
            professionalObservations: existingFormData.professionalObservations,
            initialRecommendations: existingFormData.initialRecommendations,
          });
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirm('¿Desea guardar esta ficha social? Podrá completarla más tarde.')) {
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi(`/social-intake/${caseId}/create`, {
        method: 'POST',
        body: JSON.stringify(form),
      });

      alert('Ficha social guardada correctamente.');
      router.push(`/casos/${caseId}`);
    } catch (error: any) {
      alert(error.message || 'Error al guardar ficha social');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (
      !confirm(
        '⚠️ ¿Desea COMPLETAR y ENVIAR esta ficha social?\n\nAl completarla:\n- El caso avanzará a fase EVALUACION\n- No podrá modificar la ficha después\n- Se generará un registro auditable',
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi(`/social-intake/${existingForm.id}/complete`, {
        method: 'POST',
      });

      alert('✅ Ficha social completada. El caso avanza a fase EVALUACION.');
      router.push(`/casos/${caseId}`);
    } catch (error: any) {
      alert(error.message || 'Error al completar ficha social');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
        Cargando ficha social...
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
  if (user?.role !== 'SOCIAL' && user?.role !== 'ADMINISTRADOR') {
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
          Solo TRABAJADORES SOCIALES pueden acceder a la ficha social.
        </p>
        <Link href={`/casos/${caseId}`} style={{ color: 'var(--bosque-profundo)', fontWeight: 600 }}>
          ← Volver al expediente
        </Link>
      </div>
    );
  }

  const isCompleted = existingForm?.isCompleted;
  const isReadOnly = isCompleted;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--bosque-profundo)',
                marginBottom: '0.25rem',
              }}
            >
              Ficha Social Profesional
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--grafito)' }}>
              Expediente: <strong>{caseData.caseCode}</strong>
            </p>
          </div>

          {isCompleted && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--salvia)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={20} />
              COMPLETADA
            </div>
          )}
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
          📋 Art. 25, Ordenanza Municipal 136/03:
        </strong>{' '}
        El Trabajador Social es responsable de elaborar la "ficha social" profesional del caso.
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        {/* Sección 1: Datos de Entrevista */}
        <section
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
            1. Datos de la Entrevista
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.375rem',
                }}
              >
                Fecha de entrevista <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <input
                type="date"
                value={form.interviewDate}
                onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                required
                disabled={isReadOnly}
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
                Lugar de entrevista <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.interviewLocation}
                onChange={(e) => setForm({ ...form, interviewLocation: e.target.value })}
                placeholder="Ej: Oficina Central - Sala de Entrevistas"
                required
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Sección 2: Descripción del Hecho */}
        <section
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
            2. Descripción del Hecho
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.375rem',
                }}
              >
                Descripción detallada del incidente{' '}
                <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <textarea
                rows={6}
                value={form.incidentDescription}
                onChange={(e) => setForm({ ...form, incidentDescription: e.target.value })}
                placeholder="Describir los hechos denunciados desde la perspectiva del trabajo social..."
                required
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.375rem',
                  }}
                >
                  Lugar del incidente <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.incidentLocation}
                  onChange={(e) => setForm({ ...form, incidentLocation: e.target.value })}
                  placeholder="Dirección o ubicación"
                  required
                  disabled={isReadOnly}
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
                  Fecha del incidente (si se conoce)
                </label>
                <input
                  type="date"
                  value={form.incidentDate}
                  onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                  disabled={isReadOnly}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>
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
                Testigos presenciales
              </label>
              <textarea
                rows={3}
                value={form.incidentWitnesses}
                onChange={(e) => setForm({ ...form, incidentWitnesses: e.target.value })}
                placeholder="Nombres y datos de contacto de testigos si los hay..."
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </section>

        {/* Sección 3: Evaluación Social */}
        <section
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
            3. Evaluación Social
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.375rem',
                }}
              >
                Estructura familiar <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={form.familyStructure}
                onChange={(e) => setForm({ ...form, familyStructure: e.target.value })}
                placeholder="Composición familiar, roles, relaciones, dinámicas identificadas..."
                required
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
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
                Situación socioeconómica <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={form.socialEconomicSituation}
                onChange={(e) => setForm({ ...form, socialEconomicSituation: e.target.value })}
                placeholder="Ingresos, empleo, vivienda, acceso a servicios básicos..."
                required
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: form.immediateDangerAssessment
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'var(--papel)',
                borderRadius: 'var(--radius)',
                border: `2px solid ${form.immediateDangerAssessment ? 'var(--riesgo-alto)' : 'var(--border)'}`,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: isReadOnly ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.immediateDangerAssessment}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      immediateDangerAssessment: e.target.checked,
                      dangerLevel: e.target.checked ? form.dangerLevel : '',
                    })
                  }
                  disabled={isReadOnly}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <AlertTriangle
                  size={20}
                  color={form.immediateDangerAssessment ? 'var(--riesgo-alto)' : 'var(--grafito)'}
                />
                <span
                  style={{
                    color: form.immediateDangerAssessment ? 'var(--riesgo-alto)' : 'var(--grafito)',
                  }}
                >
                  ⚠️ Existe peligro inmediato para el NNA
                </span>
              </label>

              {form.immediateDangerAssessment && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.375rem',
                    }}
                  >
                    Nivel de peligro <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
                  </label>
                  <select
                    value={form.dangerLevel}
                    onChange={(e: any) => setForm({ ...form, dangerLevel: e.target.value })}
                    required={form.immediateDangerAssessment}
                    disabled={isReadOnly}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="BAJO">Peligro Bajo</option>
                    <option value="MEDIO">Peligro Medio</option>
                    <option value="ALTO">Peligro Alto</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sección 4: Observaciones Profesionales */}
        <section
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
            4. Observaciones Profesionales
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.375rem',
                }}
              >
                Observaciones desde la perspectiva del trabajo social{' '}
                <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <textarea
                rows={6}
                value={form.professionalObservations}
                onChange={(e) => setForm({ ...form, professionalObservations: e.target.value })}
                placeholder="Análisis profesional de la situación, factores de riesgo y protección identificados..."
                required
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
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
                Recomendaciones iniciales <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={form.initialRecommendations}
                onChange={(e) => setForm({ ...form, initialRecommendations: e.target.value })}
                placeholder="Acciones sugeridas, derivaciones necesarias, medidas de protección recomendadas..."
                required
                disabled={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </section>

        {/* Botones de Acción */}
        {!isCompleted && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {!existingForm && (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--tierra-calida)',
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
                <Save size={18} />
                {submitting ? 'Guardando...' : 'Guardar Borrador'}
              </button>
            )}

            {existingForm && !existingForm.isCompleted && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--salvia)',
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
                <CheckCircle2 size={18} />
                {submitting ? 'Completando...' : 'Completar y Enviar'}
              </button>
            )}

            <Link
              href={`/casos/${caseId}`}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--grafito)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Cancelar
            </Link>
          </div>
        )}

        {isCompleted && (
          <div
            style={{
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: 'oklch(0.96 0.03 165)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--salvia)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--bosque-profundo)' }}>
              ✅ Esta ficha social fue completada el{' '}
              {new Date(existingForm.completedAt).toLocaleString('es-BO')} por{' '}
              {existingForm.socialWorker?.firstName} {existingForm.socialWorker?.lastName}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
