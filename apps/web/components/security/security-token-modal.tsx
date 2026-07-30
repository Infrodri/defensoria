'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { ShieldAlert, Lock, Key, CheckCircle2 } from 'lucide-react';

interface SecurityTokenModalProps {
  isOpen: boolean;
  onSuccess: (token: string) => void;
  onClose: () => void;
}

export function SecurityTokenModal({ isOpen, onSuccess, onClose }: SecurityTokenModalProps) {
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await fetchApi<{ securityToken: string }>('/security-token/activate', {
        method: 'POST',
        body: JSON.stringify({ passwordConfirm }),
      });

      localStorage.setItem('dna_security_token', data.securityToken);
      onSuccess(data.securityToken);
      setPasswordConfirm('');
    } catch (err: any) {
      setError(err.message || 'Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '450px',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShieldAlert size={28} color="var(--tierra-calida)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
            Token de Seguridad Documental
          </h3>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Por protocolo de resguardo institucional de NNA, el acceso a informes clínicos y evidencias sensibles exige re-autenticarte con tu contraseña (vigencia: 15 min).
        </p>

        {error && (
          <div style={{ backgroundColor: 'oklch(0.95 0.05 28)', color: 'var(--riesgo-alto)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Confirmá tu Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Ingresá tu contraseña de inicio de sesión..."
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Verificando...' : 'Activar Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
