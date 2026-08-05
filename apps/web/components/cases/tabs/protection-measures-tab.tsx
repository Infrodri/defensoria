'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Field, EmptyState, ErrorBanner, SaveButton, AlertBanner, formatDate, inputStyle } from './ui';

const MEASURE_LABELS: Record<string, string> = {
  ACOGIMIENTO_CIRCUNSTANCIAL: 'Acogimiento Circunstancial',
  INTEGRACION_RED_APOYO: 'Integración a Red de Apoyo',
  RESTITUCION_DOMICILIARIA: 'Restitución Domiciliaria',
};

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function ProtectionMeasuresTab({ caseId, userRole }: Props) {
  const [measures, setMeasures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [measureType, setMeasureType] = useState('ACOGIMIENTO_CIRCUNSTANCIAL');
  const [reason, setReason] = useState('');
  const [receptiveCenterName, setReceptiveCenterName] = useState('');
  const [executedAt, setExecutedAt] = useState('');
  const [judgeNotifiedAt, setJudgeNotifiedAt] = useState('');
  const [judgeNotificationCode, setJudgeNotificationCode] = useState('');

  // Edición inline de la notificación judicial de una medida.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editJudgeNotifiedAt, setEditJudgeNotifiedAt] = useState('');
  const [editJudgeNotificationCode, setEditJudgeNotificationCode] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/protection-measures/case/${caseId}`);
      setMeasures(res ?? []);
    } catch (err: any) {
      setMeasures([]);
      setError(err?.message || 'No se pudo cargar las medidas de protección');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [caseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!reason.trim()) {
      setFormError('El motivo de la medida es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetchApi(`/protection-measures/${caseId}`, {
        method: 'POST',
        body: JSON.stringify({
          measureType,
          reason,
          receptiveCenterName: receptiveCenterName || undefined,
          executedAt: executedAt ? new Date(executedAt).toISOString() : undefined,
          judgeNotifiedAt: judgeNotifiedAt ? new Date(judgeNotifiedAt).toISOString() : undefined,
          judgeNotificationCode: judgeNotificationCode || undefined,
        }),
      });
      if (res?.alert) {
        setFormError(res.alert); // se muestra como banner amarillo tras guardar
      }
      setReason('');
      setReceptiveCenterName('');
      setJudgeNotifiedAt('');
      setJudgeNotificationCode('');
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Error al registrar la medida');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (m: any) => {
    setEditingId(m.id);
    setEditJudgeNotifiedAt(m.judgeNotifiedAt ? String(m.judgeNotifiedAt).slice(0, 16) : '');
    setEditJudgeNotificationCode(m.judgeNotificationCode ?? '');
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const res = await fetchApi(`/protection-measures/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          judgeNotifiedAt: editJudgeNotifiedAt ? new Date(editJudgeNotifiedAt).toISOString() : undefined,
          judgeNotificationCode: editJudgeNotificationCode || undefined,
        }),
      });
      if (res?.alert) {
        setError(res.alert);
      }
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la notificación');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando medidas de protección...</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Medidas de Protección ({measures.length})
        </h3>

        {error && <ErrorBanner message={error} />}

        {measures.length === 0 ? (
          <EmptyState message="Sin medidas de protección registradas. Complete el formulario de la derecha para registrar una medida." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {measures.map((m) => {
              const needsAlert = !m.isWithinLegalDeadline;
              const alertMsg =
                m.alert ??
                (m.measureType === 'ACOGIMIENTO_CIRCUNSTANCIAL' && needsAlert
                  ? 'ALERTA: La notificación judicial de la medida ACOGIMIENTO_CIRCUNSTANCIAL debe realizarse dentro de las 24 horas desde su ejecución.'
                  : null);

              return (
                <div
                  key={m.id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--papel)',
                    borderRadius: 'var(--radius)',
                    border: needsAlert ? '2px solid var(--riesgo-alto)' : '1px solid var(--border)',
                  }}
                >
                  {alertMsg && <AlertBanner message={alertMsg} tone={needsAlert ? 'danger' : 'warning'} />}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                        {MEASURE_LABELS[m.measureType] ?? m.measureType}
                      </div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.85, marginTop: '0.25rem' }}>{m.reason}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'right' }}>
                      <div>Ejecución: {formatDate(m.executedAt)}</div>
                      <div>Notif. judicial: {formatDate(m.judgeNotifiedAt)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', marginTop: '0.5rem', opacity: 0.85 }}>
                    {m.receptiveCenterName && <div>Centro receptor: {m.receptiveCenterName}</div>}
                    {m.judgeNotificationCode && <div>Código de notificación: {m.judgeNotificationCode}</div>}
                  </div>

                  {canEdit && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {editingId !== m.id ? (
                        <button
                          type="button"
                          onClick={() => openEdit(m)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--bosque-profundo)',
                            color: 'var(--bosque-profundo)',
                            padding: '0.375rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Registrar notificación judicial
                        </button>
                      ) : (
                        <form
                          onSubmit={(e) => handleEditSubmit(e, m.id)}
                          style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '0.75rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                            Actualizar notificación judicial (re-evalúa el plazo de 24h)
                          </div>
                          <Field label="Fecha de notificación al juzgado">
                            <input type="datetime-local" value={editJudgeNotifiedAt} onChange={(e) => setEditJudgeNotifiedAt(e.target.value)} style={inputStyle} />
                          </Field>
                          <Field label="Código de la notificación">
                            <input type="text" value={editJudgeNotificationCode} onChange={(e) => setEditJudgeNotificationCode(e.target.value)} style={inputStyle} />
                          </Field>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={editSaving}
                              style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: 700, cursor: editSaving ? 'not-allowed' : 'pointer' }}
                            >
                              {editSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleCreate} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            Registrar Medida de Protección
          </h3>

          {formError && <AlertBanner message={formError} tone="warning" />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Tipo de medida">
              <select value={measureType} onChange={(e) => setMeasureType(e.target.value)} style={inputStyle}>
                {Object.entries(MEASURE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Motivo" required>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Field label="Centro receptor">
              <input type="text" value={receptiveCenterName} onChange={(e) => setReceptiveCenterName(e.target.value)} placeholder="Ej: Centro de Acogida Esperanza" style={inputStyle} />
            </Field>

            <Field label="Fecha de ejecución de la medida">
              <input type="datetime-local" value={executedAt} onChange={(e) => setExecutedAt(e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Fecha de notificación al juzgado" hint="Para ACOGIMIENTO_CIRCUNSTANCIAL debe realizarse dentro de las 24h de la ejecución">
              <input type="datetime-local" value={judgeNotifiedAt} onChange={(e) => setJudgeNotifiedAt(e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Código de la notificación judicial">
              <input type="text" value={judgeNotificationCode} onChange={(e) => setJudgeNotificationCode(e.target.value)} style={inputStyle} />
            </Field>

            <SaveButton saving={saving} label="Registrar Medida" />
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Solo el equipo profesional puede registrar medidas de protección.</p>
        </div>
      )}
    </div>
  );
}
