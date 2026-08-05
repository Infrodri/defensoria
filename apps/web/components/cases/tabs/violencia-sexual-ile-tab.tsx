'use client';

import React, { useState } from 'react';
import { useCaseRecord } from './use-case-record';
import { Field, Toggle, EmptyState, ErrorBanner, SaveButton, formatValue, inputStyle } from './ui';

// Roles permitidos para crear/editar (espejo del backend).
const EDITOR_ROLES = ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'];

interface Props {
  caseId: string;
  userRole: string;
}

export function ViolenciaSexualILETab({ caseId, userRole }: Props) {
  const { data, loading, error, saving, save } = useCaseRecord({
    getEndpoint: `/spec-violencia-sexual-ile/case/${caseId}`,
    createEndpoint: `/spec-violencia-sexual-ile/${caseId}`,
    updateEndpoint: () => `/spec-violencia-sexual-ile/${caseId}`,
  });

  const [copiaDenunciaAdjunta, setCopiaDenunciaAdjunta] = useState(false);
  const [consentimientoNNA, setConsentimientoNNA] = useState(false);
  const [atendidoDentro24h, setAtendidoDentro24h] = useState(false);
  const [apersonamientoDNA, setApersonamientoDNA] = useState(true);
  const [delitoCalificado, setDelitoCalificado] = useState('');
  const [solicitoCamaraGesell, setSolicitoCamaraGesell] = useState(false);
  const [certificadoMedicoUnico, setCertificadoMedicoUnico] = useState(false);
  const [solicitoReserva, setSolicitoReserva] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const record = data as any;
  React.useEffect(() => {
    if (record) {
      setCopiaDenunciaAdjunta(record.copiaDenunciaAdjunta ?? false);
      setConsentimientoNNA(record.consentimientoNNA ?? false);
      setAtendidoDentro24h(record.atendidoDentro24h ?? false);
      setApersonamientoDNA(record.apersonamientoDNA ?? true);
      setDelitoCalificado(record.delitoCalificado ?? '');
      setSolicitoCamaraGesell(record.solicitoCamaraGesell ?? false);
      setCertificadoMedicoUnico(record.certificadoMedicoUnico ?? false);
      setSolicitoReserva(record.solicitoReserva ?? true);
    }
  }, [record]);

  const canEdit = EDITOR_ROLES.includes(userRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!delitoCalificado.trim()) {
      setFormError('El delito calificado es obligatorio.');
      return;
    }

    try {
      await save({
        copiaDenunciaAdjunta,
        consentimientoNNA,
        atendidoDentro24h,
        apersonamientoDNA,
        delitoCalificado,
        solicitoCamaraGesell,
        certificadoMedicoUnico,
        solicitoReserva,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    }
  };

  if (loading) {
    return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando registro de violencia sexual (ILE)...</p>;
  }

  const toggles: { label: string; value: boolean; onChange: (v: boolean) => void }[] = [
    { label: 'Copia de la denuncia adjunta al expediente', value: copiaDenunciaAdjunta, onChange: setCopiaDenunciaAdjunta },
    { label: 'Consentimiento informado del NNA', value: consentimientoNNA, onChange: setConsentimientoNNA },
    { label: 'NNA atendido dentro de las 24h del hecho', value: atendidoDentro24h, onChange: setAtendidoDentro24h },
    { label: 'Apersonamiento de la Defensoría del NNA', value: apersonamientoDNA, onChange: setApersonamientoDNA },
    { label: 'Se solicitó la Cámara Gesell', value: solicitoCamaraGesell, onChange: setSolicitoCamaraGesell },
    { label: 'Certificado médico único forense obtenido', value: certificadoMedicoUnico, onChange: setCertificadoMedicoUnico },
    { label: 'Se solicitó reserva del expediente', value: solicitoReserva, onChange: setSolicitoReserva },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Registro Violencia Sexual (ILE)
        </h3>

        {error && <ErrorBanner message={error} />}

        {!record ? (
          <EmptyState message="Sin datos registrados. Complete el formulario de la derecha para registrar la violencia sexual (ILE) del caso." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Delito calificado:</strong> {formatValue(record.delitoCalificado)}</div>
            <div><strong>Copia de denuncia adjunta:</strong> {record.copiaDenunciaAdjunta ? 'Sí' : 'No'}</div>
            <div><strong>Consentimiento del NNA:</strong> {record.consentimientoNNA ? 'Sí' : 'No'}</div>
            <div><strong>Atendido en 24h:</strong> {record.atendidoDentro24h ? 'Sí' : 'No'}</div>
            <div><strong>Apersonamiento DNA:</strong> {record.apersonamientoDNA ? 'Sí' : 'No'}</div>
            <div><strong>Cámara Gesell:</strong> {record.solicitoCamaraGesell ? 'Sí' : 'No'}</div>
            <div><strong>Certificado médico único:</strong> {record.certificadoMedicoUnico ? 'Sí' : 'No'}</div>
            <div><strong>Reserva del expediente:</strong> {record.solicitoReserva ? 'Sí' : 'No'}</div>
          </div>
        )}
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            {record ? 'Actualizar Registro' : 'Registrar Violencia Sexual (ILE)'}
          </h3>

          {formError && <ErrorBanner message={formError} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Delito calificado" required hint="Calificación del fiscal/abogado">
              <input type="text" value={delitoCalificado} onChange={(e) => setDelitoCalificado(e.target.value)} placeholder="Ej: VIOLACION_NNA, ABUSO_SEXUAL" style={inputStyle} />
            </Field>

            {toggles.map((t) => (
              <Toggle key={t.label} label={t.label} checked={t.value} onChange={t.onChange} />
            ))}

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
