'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useCaseRecord, splitList } from './use-case-record';
import { Field, Toggle, EmptyState, ErrorBanner, SaveButton, formatValue, inputStyle } from './ui';

const PLATFORM_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  ONLYFANS: 'OnlyFans',
  TELEGRAM: 'Telegram',
  X_TWITTER: 'X / Twitter',
  OTRO: 'Otra plataforma',
};

const PLATFORMS = ['WHATSAPP', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'ONLYFANS', 'TELEGRAM', 'X_TWITTER', 'OTRO'];

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function ViolenceDigitalTab({ caseId, userRole }: Props) {
  const { data, loading, error, saving, save } = useCaseRecord({
    getEndpoint: `/spec-violence-digital/case/${caseId}`,
    createEndpoint: `/spec-violence-digital/${caseId}`,
    updateEndpoint: () => `/spec-violence-digital/${caseId}`,
  });

  const [urls, setUrls] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [usedDevices, setUsedDevices] = useState('');
  const [coercionMethods, setCoercionMethods] = useState('');
  const [requiresForensic, setRequiresForensic] = useState(false);
  const [phoneOperator, setPhoneOperator] = useState('');
  const [phoneOwnerVerified, setPhoneOwnerVerified] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sincroniza el formulario con el registro existente.
  const record = data as any;
  React.useEffect(() => {
    if (record) {
      setUrls(record.urls?.join('\n') ?? '');
      setPlatforms(record.platforms ?? []);
      setUsedDevices(record.usedDevices?.join(', ') ?? '');
      setCoercionMethods(record.coercionMethods?.join(', ') ?? '');
      setRequiresForensic(record.requiresForensic ?? false);
      setPhoneOperator(record.phoneOperator ?? '');
      setPhoneOwnerVerified(record.phoneOwnerVerified ?? '');
    }
  }, [record]);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await save({
        urls: splitList(urls),
        platforms,
        usedDevices: splitList(usedDevices),
        coercionMethods: splitList(coercionMethods),
        requiresForensic,
        phoneOperator: phoneOperator || undefined,
        phoneOwnerVerified: phoneOwnerVerified || undefined,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando registro de violencia digital...</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Registro de Violencia Digital
        </h3>

        {error && <ErrorBanner message={error} />}

        {!record ? (
          <EmptyState message="Sin datos registrados. Complete el formulario de la derecha para registrar la violencia digital del caso." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <strong>Plataformas:</strong> {record.platforms?.length ? record.platforms.map((p: string) => PLATFORM_LABELS[p] ?? p).join(', ') : '—'}
            </div>
            <div>
              <strong>URLs de difusión:</strong> {formatValue(record.urls)}
            </div>
            <div>
              <strong>Dispositivos usados:</strong> {formatValue(record.usedDevices)}
            </div>
            <div>
              <strong>Métodos de coerción:</strong> {formatValue(record.coercionMethods)}
            </div>
            <div>
              <strong>Requiere peritaje forense:</strong> {record.requiresForensic ? 'Sí' : 'No'}
            </div>
            <div>
              <strong>Operadora del agresor:</strong> {formatValue(record.phoneOperator)}
            </div>
            <div>
              <strong>Titularidad del teléfono verificada:</strong> {formatValue(record.phoneOwnerVerified)}
            </div>
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            {record ? 'Actualizar Registro' : 'Registrar Violencia Digital'}
          </h3>

          {formError && <ErrorBanner message={formError} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Plataformas involucradas</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {PLATFORMS.map((p) => (
                  <Toggle key={p} label={PLATFORM_LABELS[p]} checked={platforms.includes(p)} onChange={() => togglePlatform(p)} />
                ))}
              </div>
            </div>

            <Field label="URLs donde se difundió" hint="Una URL por línea">
              <textarea rows={4} value={urls} onChange={(e) => setUrls(e.target.value)} placeholder="https://..." style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Field label="Dispositivos utilizados" hint="Separados por coma">
              <input type="text" value={usedDevices} onChange={(e) => setUsedDevices(e.target.value)} placeholder="Ej: celular, computadora" style={inputStyle} />
            </Field>

            <Field label="Métodos de coerción" hint="Separados por coma">
              <input type="text" value={coercionMethods} onChange={(e) => setCoercionMethods(e.target.value)} placeholder="Ej: amenazas, difusión de contenido" style={inputStyle} />
            </Field>

            <Toggle label="Requiere peritaje forense" checked={requiresForensic} onChange={setRequiresForensic} />

            <Field label="Operadora de telefonía del agresor">
              <input type="text" value={phoneOperator} onChange={(e) => setPhoneOperator(e.target.value)} placeholder="Ej: Tigo, Entel" style={inputStyle} />
            </Field>

            <Field label="Verificación de titularidad del teléfono">
              <input type="text" value={phoneOwnerVerified} onChange={(e) => setPhoneOwnerVerified(e.target.value)} placeholder="Ej: verificada por operadora" style={inputStyle} />
            </Field>

            <SaveButton saving={saving} label={record ? 'Guardar Cambios' : 'Registrar'} />
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Solo el equipo profesional puede registrar esta información.</p>
        </div>
      )}
    </div>
  );
}
