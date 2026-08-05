'use client';

import React from 'react';

/** Estilo base de inputs/selects/textarea consistente con el resto de la app. */
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  backgroundColor: 'var(--card)',
  color: 'var(--grafito)',
  boxSizing: 'border-box',
};

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, required, hint, children }: FieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
        {label} {required && <span style={{ color: 'var(--riesgo-alto)' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>{hint}</p>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ width: '18px', height: '18px', cursor: disabled ? 'not-allowed' : 'pointer', accentColor: 'var(--salvia)' }}
      />
      {label}
    </label>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--papel)',
        borderRadius: 'var(--radius)',
        border: '1px dashed var(--border)',
      }}
    >
      <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.7, margin: 0 }}>{message}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        backgroundColor: 'oklch(0.95 0.05 28)',
        color: 'var(--riesgo-alto)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        marginBottom: '1rem',
        fontSize: '0.875rem',
      }}
    >
      ⚠️ {message}
    </div>
  );
}

/** Banner de alerta (amarillo por defecto, rojo si tone === 'danger'). */
export function AlertBanner({ message, tone = 'warning' }: { message: string; tone?: 'warning' | 'danger' }) {
  const bg = tone === 'danger' ? 'oklch(0.94 0.06 28)' : 'oklch(0.97 0.06 85)';
  const fg = tone === 'danger' ? 'var(--riesgo-alto)' : 'var(--tierra-calida)';
  return (
    <div
      style={{
        backgroundColor: bg,
        color: fg,
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        marginBottom: '0.75rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  );
}

interface SaveButtonProps {
  saving: boolean;
  label?: string;
  savingLabel?: string;
  disabled?: boolean;
}

export function SaveButton({ saving, label = 'Guardar', savingLabel = 'Guardando...', disabled }: SaveButtonProps) {
  return (
    <button
      type="submit"
      disabled={saving || disabled}
      style={{
        backgroundColor: disabled ? 'var(--border)' : 'var(--bosque-profundo)',
        color: 'white',
        padding: '0.625rem 1.25rem',
        borderRadius: 'var(--radius)',
        fontWeight: 600,
        border: 'none',
        cursor: saving || disabled ? 'not-allowed' : 'pointer',
        opacity: saving || disabled ? 0.6 : 1,
      }}
    >
      {saving ? savingLabel : label}
    </button>
  );
}

/** Renderiza valores de un registro de forma legible (null/undefined → '—'). */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function formatDate(value: unknown): string {
  if (!value) return '—';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDateOnly(value: unknown): string {
  if (!value) return '—';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-BO');
}
