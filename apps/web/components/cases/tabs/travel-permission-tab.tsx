'use client';

import React, { useState } from 'react';
import { useCaseRecord } from './use-case-record';
import { Field, Toggle, EmptyState, ErrorBanner, SaveButton, formatValue, formatDateOnly, inputStyle } from './ui';

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  NACIONAL: 'Nacional',
  INTERNACIONAL: 'Internacional',
};

const COMPANION_LABELS: Record<string, string> = {
  AMBOS_PADRES: 'Ambos padres',
  PADRE_SOLO: 'Padre solo',
  MADRE_SOLA: 'Madre sola',
  TERCERO_AUTORIZADO: 'Tercero autorizado',
  SOLO: 'Solo (sin acompañante)',
};

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['ABOGADO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function TravelPermissionTab({ caseId, userRole }: Props) {
  const { data, loading, error, saving, save } = useCaseRecord({
    getEndpoint: `/travel-permissions/case/${caseId}`,
    createEndpoint: `/travel-permissions`,
    updateEndpoint: (record) => `/travel-permissions/${record.id}`,
  });

  const [travelType, setTravelType] = useState('NACIONAL');
  const [companionType, setCompanionType] = useState('AMBOS_PADRES');
  const [originCity, setOriginCity] = useState('Sucre');
  const [destinationCity, setDestinationCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [companionFullName, setCompanionFullName] = useState('');
  const [companionIdentityNumber, setCompanionIdentityNumber] = useState('');
  const [companionRelation, setCompanionRelation] = useState('');
  const [bothParentsPresent, setBothParentsPresent] = useState(true);
  const [oppositionNotes, setOppositionNotes] = useState('');
  const [isIssued, setIsIssued] = useState(false);
  const [issuedAt, setIssuedAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showBigCode, setShowBigCode] = useState(false);

  const record = data as any;
  React.useEffect(() => {
    if (record) {
      setTravelType(record.travelType ?? 'NACIONAL');
      setCompanionType(record.companionType ?? 'AMBOS_PADRES');
      setOriginCity(record.originCity ?? 'Sucre');
      setDestinationCity(record.destinationCity ?? '');
      setDepartureDate(record.departureDate ? String(record.departureDate).slice(0, 10) : '');
      setReturnDate(record.returnDate ? String(record.returnDate).slice(0, 10) : '');
      setCompanionFullName(record.companionFullName ?? '');
      setCompanionIdentityNumber(record.companionIdentityNumber ?? '');
      setCompanionRelation(record.companionRelation ?? '');
      setBothParentsPresent(record.bothParentsPresent ?? true);
      setOppositionNotes(record.oppositionNotes ?? '');
      setIsIssued(record.isIssued ?? false);
      setIssuedAt(record.issuedAt ? String(record.issuedAt).slice(0, 10) : '');
    }
  }, [record]);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!destinationCity.trim()) {
      setFormError('La ciudad de destino es obligatoria.');
      return;
    }
    if (!departureDate) {
      setFormError('La fecha de salida es obligatoria (debe ser futura).');
      return;
    }
    if (isIssued && !issuedAt) {
      setFormError('Si el permiso fue emitido, debe indicar la fecha de emisión.');
      return;
    }

    try {
      await save({
        caseId,
        travelType,
        companionType,
        originCity: originCity || undefined,
        destinationCity,
        departureDate,
        returnDate: returnDate || undefined,
        companionFullName: companionFullName || undefined,
        companionIdentityNumber: companionIdentityNumber || undefined,
        companionRelation: companionRelation || undefined,
        bothParentsPresent,
        oppositionNotes: oppositionNotes || undefined,
        isIssued,
        issuedAt: isIssued && issuedAt ? issuedAt : undefined,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando permiso de viaje...</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Permiso de Viaje
        </h3>

        {error && <ErrorBanner message={error} />}

        {!record ? (
          <EmptyState message="Sin permiso de viaje registrado. Complete el formulario de la derecha para tramitar el permiso." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Código de autorización en grande */}
            {record.authorizationCode && (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'oklch(0.97 0.03 65)',
                  border: '2px solid var(--tierra-calida)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tierra-calida)' }}>
                  Código de Autorización
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--bosque-profundo)', letterSpacing: '0.05em' }}>
                  {record.authorizationCode}
                </div>
                <button
                  type="button"
                  onClick={() => setShowBigCode((v) => !v)}
                  style={{
                    marginTop: '0.75rem',
                    backgroundColor: 'var(--bosque-profundo)',
                    color: 'white',
                    border: 'none',
                    padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {showBigCode ? 'Ocultar código' : 'Generar / Imprimir código en grande'}
                </button>
                {showBigCode && (
                  <div style={{ marginTop: '1rem', fontSize: '3.5rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--bosque-profundo)' }}>
                    {record.authorizationCode}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Tipo de viaje:</strong> {TRAVEL_TYPE_LABELS[record.travelType] ?? formatValue(record.travelType)}</div>
              <div><strong>Acompañante:</strong> {COMPANION_LABELS[record.companionType] ?? formatValue(record.companionType)}</div>
              <div><strong>Origen:</strong> {formatValue(record.originCity)} → <strong>Destino:</strong> {formatValue(record.destinationCity)}</div>
              <div><strong>Salida:</strong> {formatDateOnly(record.departureDate)} {record.returnDate ? `→ Retorno: ${formatDateOnly(record.returnDate)}` : ''}</div>
              {record.companionFullName && <div><strong>Acompañante:</strong> {record.companionFullName} {record.companionIdentityNumber ? `(CI ${record.companionIdentityNumber})` : ''}{record.companionRelation ? ` · ${record.companionRelation}` : ''}</div>}
              <div><strong>Ambos progenitores presentes:</strong> {record.bothParentsPresent ? 'Sí' : 'No'}</div>
              {record.oppositionNotes && <div><strong>Notas de oposición:</strong> {record.oppositionNotes}</div>}
              <div><strong>Estado:</strong> {record.isIssued ? `Emitido${record.issuedAt ? ` (${formatDateOnly(record.issuedAt)})` : ''}` : 'En trámite'}</div>
            </div>
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            {record ? 'Actualizar Permiso' : 'Tramitar Permiso de Viaje'}
          </h3>

          {formError && <ErrorBanner message={formError} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Tipo de viaje">
              <select value={travelType} onChange={(e) => setTravelType(e.target.value)} style={inputStyle}>
                <option value="NACIONAL">Nacional</option>
                <option value="INTERNACIONAL">Internacional</option>
              </select>
            </Field>

            <Field label="Con quién viaja el NNA">
              <select value={companionType} onChange={(e) => setCompanionType(e.target.value)} style={inputStyle}>
                {Object.entries(COMPANION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Ciudad de origen">
              <input type="text" value={originCity} onChange={(e) => setOriginCity(e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Ciudad de destino" required>
              <input type="text" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="Ej: La Paz" style={inputStyle} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Fecha de salida" required hint="Debe ser futura">
                <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Fecha de retorno">
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} style={inputStyle} />
              </Field>
            </div>

            <Field label="Nombre completo del acompañante">
              <input type="text" value={companionFullName} onChange={(e) => setCompanionFullName(e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Documento del acompañante">
              <input type="text" value={companionIdentityNumber} onChange={(e) => setCompanionIdentityNumber(e.target.value)} placeholder="CI o pasaporte" style={inputStyle} />
            </Field>

            <Field label="Relación del acompañante con el NNA">
              <input type="text" value={companionRelation} onChange={(e) => setCompanionRelation(e.target.value)} placeholder="Ej: tía, abuela" style={inputStyle} />
            </Field>

            <Toggle label="Ambos progenitores presentes" checked={bothParentsPresent} onChange={setBothParentsPresent} />

            <Field label="Notas de oposición al permiso">
              <textarea rows={3} value={oppositionNotes} onChange={(e) => setOppositionNotes(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Toggle label="Permiso emitido" checked={isIssued} onChange={setIsIssued} />
            {isIssued && (
              <Field label="Fecha de emisión" required>
                <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} style={inputStyle} />
              </Field>
            )}

            <SaveButton saving={saving} label={record ? 'Guardar Cambios' : 'Tramitar Permiso'} />
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Solo el área legal, Trabajo Social, Jefatura o Administración puede gestionar permisos de viaje.</p>
        </div>
      )}
    </div>
  );
}
