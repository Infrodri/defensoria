'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert, Lock } from 'lucide-react';

interface SecurityTokenModalProps {
  isOpen: boolean;
  onSuccess: (token: string) => void;
  onClose: () => void;
}

// Roles que pueden activar el token de seguridad documental
const CLINICAL_ROLES = ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'];

export function SecurityTokenModal({ isOpen, onSuccess, onClose }: SecurityTokenModalProps) {
  const { user } = useAuth();
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Secretaria y otros roles sin acceso clínico: mostrar mensaje de bloqueo en lugar del form
  const hasAccess = user?.role && CLINICAL_ROLES.includes(user.role);

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
          <ShieldAlert size={28} color={hasAccess ? 'var(--tierra-calida)' : '#DC2626'} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
            Token de Seguridad Documental
          </h3>
        </div>

        {/* ── Bloqueo para Secretaria y otros roles sin acceso clínico ── */}
        {!hasAccess ? (
          <div>
            <div style={{
              backgroundColor: 'oklch(0.95 0.05 28)',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🚫 Acceso no autorizado
              </div>
              <p style={{ fontSize: '0.875rem', color: '#7F1D1D', lineHeight: 1.5, margin: 0 }}>
                El rol <strong>{user?.role}</strong> no tiene acceso a contenido clínico sensible.<br /><br />
                El Token de Seguridad Documental es exclusivo para <strong>profesionales (Abogado/a, Psicólogo/a, Trabajador/a Social)</strong> y <strong>Jefatura</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
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
                Entendido
              </button>
            </div>
          </div>
        ) : (
          /* ── Formulario para roles autorizados ── */
          <>
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
                    autoFocus
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
                  disabled={loading || !passwordConfirm.trim()}
                  style={{
                    backgroundColor: passwordConfirm.trim() ? 'var(--bosque-profundo)' : 'var(--border)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: passwordConfirm.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading ? '⏳ Verificando...' : '🔐 Activar Token'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
