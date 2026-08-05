'use client';

import React, { useState } from 'react';
import { useCaseRecord, splitList } from './use-case-record';
import { Field, Toggle, EmptyState, ErrorBanner, SaveButton, formatValue, formatDateOnly, inputStyle } from './ui';

const PHASE_LABELS: Record<string, string> = {
  ADHERENCIA: 'Adherencia',
  REHABILITACION: 'Rehabilitación',
  REINTEGRACION: 'Reintegración',
};

const PHASES = ['ADHERENCIA', 'REHABILITACION', 'REINTEGRACION'];

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['SOCIAL', 'PSICOLOGO', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function SituacionCalleTab({ caseId, userRole }: Props) {
  const { data, loading, error, saving, save } = useCaseRecord({
    getEndpoint: `/spec-situacion-calle/case/${caseId}`,
    createEndpoint: `/spec-situacion-calle/${caseId}`,
    updateEndpoint: () => `/spec-situacion-calle/${caseId}`,
  });

  const [faseActual, setFaseActual] = useState('ADHERENCIA');
  const [programaReferente, setProgramaReferente] = useState('');
  const [educadorCalleRef, setEducadorCalleRef] = useState('');
  const [yearsOnStreet, setYearsOnStreet] = useState('');
  const [survivalStrategy, setSurvivalStrategy] = useState('');
  const [substanceAbuse, setSubstanceAbuse] = useState('');
  const [streetHistory, setStreetHistory] = useState('');
  const [idFormReferencia, setIdFormReferencia] = useState('');
  const [idFormContraref, setIdFormContraref] = useState('');
  const [notificadoITD, setNotificadoITD] = useState(false);
  const [fechaNotificacion, setFechaNotificacion] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const record = data as any;
  React.useEffect(() => {
    if (record) {
      setFaseActual(record.faseActual ?? 'ADHERENCIA');
      setProgramaReferente(record.programaReferente ?? '');
      setEducadorCalleRef(record.educadorCalleRef ?? '');
      setYearsOnStreet(record.yearsOnStreet !== null && record.yearsOnStreet !== undefined ? String(record.yearsOnStreet) : '');
      setSurvivalStrategy(record.survivalStrategy ?? '');
      setSubstanceAbuse((record.substanceAbuse ?? []).join(', '));
      setStreetHistory(record.streetHistory ?? '');
      setIdFormReferencia(record.idFormReferencia ?? '');
      setIdFormContraref(record.idFormContraref ?? '');
      setNotificadoITD(record.notificadoITD ?? false);
      setFechaNotificacion(record.fechaNotificacion ? String(record.fechaNotificacion).slice(0, 10) : '');
    }
  }, [record]);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!streetHistory.trim()) {
      setFormError('La historia de vida en situación de calle es obligatoria.');
      return;
    }

    const years = yearsOnStreet === '' ? undefined : Number(yearsOnStreet);
    if (years !== undefined && (!Number.isFinite(years) || years < 0)) {
      setFormError('Los años en situación de calle deben ser un número mayor o igual a 0.');
      return;
    }

    try {
      await save({
        faseActual,
        programaReferente: programaReferente || undefined,
        educadorCalleRef: educadorCalleRef || undefined,
        yearsOnStreet: years,
        survivalStrategy: survivalStrategy || undefined,
        substanceAbuse: splitList(substanceAbuse),
        streetHistory,
        idFormReferencia: idFormReferencia || undefined,
        idFormContraref: idFormContraref || undefined,
        notificadoITD,
        fechaNotificacion: fechaNotificacion || undefined,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando registro de situación de calle...</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Registro de Situación de Calle
        </h3>

        {error && <ErrorBanner message={error} />}

        {!record ? (
          <EmptyState message="Sin datos registrados. Complete el formulario de la derecha para registrar la situación de calle del NNA." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Fase actual:</strong> {PHASE_LABELS[record.faseActual] ?? formatValue(record.faseActual)}</div>
            <div><strong>Programa referente:</strong> {formatValue(record.programaReferente)}</div>
            <div><strong>Educador/a de calle:</strong> {formatValue(record.educadorCalleRef)}</div>
            <div><strong>Años en situación de calle:</strong> {formatValue(record.yearsOnStreet)}</div>
            <div><strong>Estrategia de supervivencia:</strong> {formatValue(record.survivalStrategy)}</div>
            <div><strong>Consumo de sustancias:</strong> {formatValue(record.substanceAbuse)}</div>
            <div><strong>Historia de vida:</strong> <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{record.streetHistory}</span></div>
            <div><strong>Notificado al ITD:</strong> {record.notificadoITD ? `Sí (${formatDateOnly(record.fechaNotificacion)})` : 'No'}</div>
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            {record ? 'Actualizar Registro' : 'Registrar Situación de Calle'}
          </h3>

          {formError && <ErrorBanner message={formError} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Fase actual del proceso">
              <select value={faseActual} onChange={(e) => setFaseActual(e.target.value)} style={inputStyle}>
                {PHASES.map((p) => (
                  <option key={p} value={p}>{PHASE_LABELS[p]}</option>
                ))}
              </select>
            </Field>

            <Field label="Programa referente">
              <input type="text" value={programaReferente} onChange={(e) => setProgramaReferente(e.target.value)} placeholder="Ej: Aldeas Infantiles SOS" style={inputStyle} />
            </Field>

            <Field label="Educador/a de calle de referencia">
              <input type="text" value={educadorCalleRef} onChange={(e) => setEducadorCalleRef(e.target.value)} placeholder="Nombre del educador/a" style={inputStyle} />
            </Field>

            <Field label="Años en situación de calle">
              <input type="number" min={0} step={0.5} value={yearsOnStreet} onChange={(e) => setYearsOnStreet(e.target.value)} placeholder="Ej: 3" style={inputStyle} />
            </Field>

            <Field label="Estrategias de supervivencia">
              <input type="text" value={survivalStrategy} onChange={(e) => setSurvivalStrategy(e.target.value)} placeholder="Ej: limpieza de parabrisas, venta ambulante" style={inputStyle} />
            </Field>

            <Field label="Sustancias con consumo" hint="Separadas por coma">
              <input type="text" value={substanceAbuse} onChange={(e) => setSubstanceAbuse(e.target.value)} placeholder="Ej: clefa, alcohol, marihuana" style={inputStyle} />
            </Field>

            <Field label="Historia de vida en situación de calle" required>
              <textarea rows={5} value={streetHistory} onChange={(e) => setStreetHistory(e.target.value)} placeholder="Historia del NNA en situación de calle..." style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Toggle label="Notificado al ITD (Instituto Técnico Departamental)" checked={notificadoITD} onChange={setNotificadoITD} />

            {notificadoITD && (
              <Field label="Fecha de notificación al ITD">
                <input type="date" value={fechaNotificacion} onChange={(e) => setFechaNotificacion(e.target.value)} style={inputStyle} />
              </Field>
            )}

            <SaveButton saving={saving} label={record ? 'Guardar Cambios' : 'Registrar'} />
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Solo Trabajo Social, Psicología, Jefatura o Administración puede registrar esta información.</p>
        </div>
      )}
    </div>
  );
}
