'use client';

import React, { useState } from 'react';
import { useCaseRecord } from './use-case-record';
import { Field, Toggle, EmptyState, ErrorBanner, SaveButton, formatValue, formatDateOnly, inputStyle } from './ui';

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['ABOGADO', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function ConciliationTab({ caseId, userRole }: Props) {
  const { data, loading, error, saving, save } = useCaseRecord({
    getEndpoint: `/conciliation-agreements/case/${caseId}`,
    createEndpoint: `/conciliation-agreements/${caseId}`,
    updateEndpoint: () => `/conciliation-agreements/${caseId}`,
  });

  const [topic, setTopic] = useState('');
  const [agreedAmountBs, setAgreedAmountBs] = useState('');
  const [agreementContent, setAgreementContent] = useState('');
  const [isSignedByParties, setIsSignedByParties] = useState(false);
  const [submittedToCourtAt, setSubmittedToCourtAt] = useState('');
  const [courtApprovedAt, setCourtApprovedAt] = useState('');
  const [homologationCode, setHomologationCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const record = data as any;
  React.useEffect(() => {
    if (record) {
      setTopic(record.topic ?? '');
      setAgreedAmountBs(record.agreedAmountBs !== null && record.agreedAmountBs !== undefined ? String(record.agreedAmountBs) : '');
      setAgreementContent(record.agreementContent ?? '');
      setIsSignedByParties(record.isSignedByParties ?? false);
      setSubmittedToCourtAt(record.submittedToCourtAt ? String(record.submittedToCourtAt).slice(0, 10) : '');
      setCourtApprovedAt(record.courtApprovedAt ? String(record.courtApprovedAt).slice(0, 10) : '');
      setHomologationCode(record.homologationCode ?? '');
    }
  }, [record]);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!topic.trim()) {
      setFormError('La materia/objeto del acuerdo es obligatoria.');
      return;
    }
    if (!agreementContent.trim()) {
      setFormError('El contenido del acuerdo es obligatorio.');
      return;
    }
    const amount = agreedAmountBs === '' ? undefined : Number(agreedAmountBs);
    if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
      setFormError('El monto acordado debe ser un número mayor o igual a 0.');
      return;
    }

    try {
      await save({
        topic,
        agreedAmountBs: amount,
        agreementContent,
        isSignedByParties,
        submittedToCourtAt: submittedToCourtAt || undefined,
        courtApprovedAt: courtApprovedAt || undefined,
        homologationCode: homologationCode || undefined,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando acuerdo de conciliación...</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Acuerdo de Conciliación
        </h3>

        {error && <ErrorBanner message={error} />}

        {!record ? (
          <EmptyState message="Sin acuerdo de conciliación registrado. Complete el formulario de la derecha para registrar el acuerdo." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Tema / Materia:</strong> {formatValue(record.topic)}</div>
            <div><strong>Monto acordado (Bs):</strong> {formatValue(record.agreedAmountBs)}</div>
            <div><strong>Contenido:</strong> <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{record.agreementContent}</span></div>
            <div><strong>Firmado por las partes:</strong> {record.isSignedByParties ? 'Sí' : 'No'}</div>
            <div><strong>Presentado al juzgado:</strong> {formatDateOnly(record.submittedToCourtAt)}</div>
            <div><strong>Homologación judicial:</strong> {record.courtApprovedAt ? `${formatDateOnly(record.courtApprovedAt)}${record.homologationCode ? ` · ${record.homologationCode}` : ''}` : '—'}</div>
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            {record ? 'Actualizar Acuerdo' : 'Registrar Acuerdo de Conciliación'}
          </h3>

          {formError && <ErrorBanner message={formError} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Tema / Materia" required>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: pensión alimenticia, régimen de visitas" style={inputStyle} />
            </Field>

            <Field label="Monto acordado (Bs)">
              <input type="number" min={0} step={0.01} value={agreedAmountBs} onChange={(e) => setAgreedAmountBs(e.target.value)} placeholder="Ej: 800" style={inputStyle} />
            </Field>

            <Field label="Contenido del acuerdo" required>
              <textarea rows={5} value={agreementContent} onChange={(e) => setAgreementContent(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Toggle label="Firmado por las partes" checked={isSignedByParties} onChange={setIsSignedByParties} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Presentación ante el juzgado">
                <input type="date" value={submittedToCourtAt} onChange={(e) => setSubmittedToCourtAt(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Homologación judicial">
                <input type="date" value={courtApprovedAt} onChange={(e) => setCourtApprovedAt(e.target.value)} style={inputStyle} />
              </Field>
            </div>

            <Field label="Código de homologación">
              <input type="text" value={homologationCode} onChange={(e) => setHomologationCode(e.target.value)} placeholder="Código asignado por el juzgado" style={inputStyle} />
            </Field>

            <SaveButton saving={saving} label={record ? 'Guardar Cambios' : 'Registrar Acuerdo'} />
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Solo el área legal, Jefatura o Administración puede registrar acuerdos de conciliación.</p>
        </div>
      )}
    </div>
  );
}
