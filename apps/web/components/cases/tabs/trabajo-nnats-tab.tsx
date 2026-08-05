'use client';

import React, { useState } from 'react';
import { useCaseRecord, splitList } from './use-case-record';
import { Field, Toggle, EmptyState, ErrorBanner, SaveButton, formatValue, formatDateOnly, inputStyle } from './ui';

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['SOCIAL', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function TrabajoNNATSTab({ caseId, userRole }: Props) {
  const { data, loading, error, saving, save } = useCaseRecord({
    getEndpoint: `/spec-trabajo-nnats/case/${caseId}`,
    createEndpoint: `/spec-trabajo-nnats/${caseId}`,
    updateEndpoint: () => `/spec-trabajo-nnats/${caseId}`,
  });

  const [hasEscolaridadCert, setHasEscolaridadCert] = useState(false);
  const [hasAptitudMedicaSUS, setHasAptitudMedicaSUS] = useState(false);
  const [inspeccionRealizada, setInspeccionRealizada] = useState(false);
  const [fechaInspeccion, setFechaInspeccion] = useState('');
  const [risksIdentified, setRisksIdentified] = useState('');
  const [isProhibitedWork, setIsProhibitedWork] = useState(false);
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [salaryBs, setSalaryBs] = useState('');
  const [studyHoursGrant, setStudyHoursGrant] = useState(true);
  const [hasSocialSecurity, setHasSocialSecurity] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const record = data as any;
  React.useEffect(() => {
    if (record) {
      setHasEscolaridadCert(record.hasEscolaridadCert ?? false);
      setHasAptitudMedicaSUS(record.hasAptitudMedicaSUS ?? false);
      setInspeccionRealizada(record.inspeccionRealizada ?? false);
      setFechaInspeccion(record.fechaInspeccion ? String(record.fechaInspeccion).slice(0, 10) : '');
      setRisksIdentified((record.risksIdentified ?? []).join(', '));
      setIsProhibitedWork(record.isProhibitedWork ?? false);
      setHoursPerWeek(record.hoursPerWeek !== null && record.hoursPerWeek !== undefined ? String(record.hoursPerWeek) : '');
      setSalaryBs(record.salaryBs !== null && record.salaryBs !== undefined ? String(record.salaryBs) : '');
      setStudyHoursGrant(record.studyHoursGrant ?? true);
      setHasSocialSecurity(record.hasSocialSecurity ?? false);
    }
  }, [record]);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const hours = Number(hoursPerWeek);
    const salary = Number(salaryBs);
    if (!Number.isFinite(hours) || hours < 0 || hours > 40) {
      setFormError('Las horas semanales deben ser un número entre 0 y 40 (máximo legal por normativa).');
      return;
    }
    if (!Number.isFinite(salary) || salary < 0) {
      setFormError('El salario mensual debe ser un número mayor o igual a 0.');
      return;
    }

    try {
      await save({
        hasEscolaridadCert,
        hasAptitudMedicaSUS,
        inspeccionRealizada,
        fechaInspeccion: fechaInspeccion || undefined,
        risksIdentified: splitList(risksIdentified),
        isProhibitedWork,
        hoursPerWeek: hours,
        salaryBs: salary,
        studyHoursGrant,
        hasSocialSecurity,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando formulario de trabajo adolescente (NNATS)...</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Formulario Trabajo Adolescente (NNATS)
        </h3>

        {error && <ErrorBanner message={error} />}

        {!record ? (
          <EmptyState message="Sin datos registrados. Complete el formulario de la derecha para registrar el trabajo adolescente del NNA." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Certificado de escolaridad:</strong> {record.hasEscolaridadCert ? 'Sí' : 'No'}</div>
            <div><strong>Aptitud médica SUS:</strong> {record.hasAptitudMedicaSUS ? 'Sí' : 'No'}</div>
            <div><strong>Inspección laboral:</strong> {record.inspeccionRealizada ? `Sí (${formatDateOnly(record.fechaInspeccion)})` : 'No'}</div>
            <div><strong>Riesgos identificados:</strong> {formatValue(record.risksIdentified)}</div>
            <div><strong>Trabajo prohibido por normativa:</strong> {record.isProhibitedWork ? 'Sí' : 'No'}</div>
            <div><strong>Horas por semana:</strong> {formatValue(record.hoursPerWeek)} (máx. 40)</div>
            <div><strong>Salario mensual (Bs):</strong> {formatValue(record.salaryBs)}</div>
            <div><strong>Horas de estudio otorgadas:</strong> {record.studyHoursGrant ? 'Sí' : 'No'}</div>
            <div><strong>Seguridad social:</strong> {record.hasSocialSecurity ? 'Sí' : 'No'}</div>
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            {record ? 'Actualizar Formulario' : 'Registrar Trabajo Adolescente'}
          </h3>

          {formError && <ErrorBanner message={formError} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Toggle label="Cuenta con certificado de escolaridad" checked={hasEscolaridadCert} onChange={setHasEscolaridadCert} />
            <Toggle label="Cuenta con aptitud médica del SUS" checked={hasAptitudMedicaSUS} onChange={setHasAptitudMedicaSUS} />
            <Toggle label="Se realizó la inspección laboral" checked={inspeccionRealizada} onChange={setInspeccionRealizada} />

            {inspeccionRealizada && (
              <Field label="Fecha de la inspección">
                <input type="date" value={fechaInspeccion} onChange={(e) => setFechaInspeccion(e.target.value)} style={inputStyle} />
              </Field>
            )}

            <Field label="Riesgos identificados en el puesto" hint="Separados por coma">
              <input type="text" value={risksIdentified} onChange={(e) => setRisksIdentified(e.target.value)} placeholder="Ej: exposición a químicos, jornadas nocturnas" style={inputStyle} />
            </Field>

            <Toggle label="El trabajo está prohibido por normativa" checked={isProhibitedWork} onChange={setIsProhibitedWork} />

            <Field label="Horas semanales de trabajo" required hint="Máx. 40 por normativa">
              <input type="number" min={0} max={40} step={1} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} placeholder="Ej: 20" style={inputStyle} />
            </Field>

            <Field label="Salario mensual (Bs)" required hint="En bolivianos, mayor o igual a 0">
              <input type="number" min={0} step={0.01} value={salaryBs} onChange={(e) => setSalaryBs(e.target.value)} placeholder="Ej: 500" style={inputStyle} />
            </Field>

            <Toggle label="Se le otorgan horas de estudio" checked={studyHoursGrant} onChange={setStudyHoursGrant} />
            <Toggle label="Cuenta con seguridad social" checked={hasSocialSecurity} onChange={setHasSocialSecurity} />

            <SaveButton saving={saving} label={record ? 'Guardar Cambios' : 'Registrar'} />
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Solo Trabajo Social, Jefatura o Administración puede registrar esta información.</p>
        </div>
      )}
    </div>
  );
}
