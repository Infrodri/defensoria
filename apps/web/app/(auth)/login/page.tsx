'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, Lock, Mail, Users, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'JEFATURA', label: 'Jefatura de Unidad', email: 'jefatura@defensoria.gob.bo' },
  { role: 'SECRETARIA', label: 'Secretaría / Recepción', email: 'secretaria@defensoria.gob.bo' },
  { role: 'ABOGADO', label: 'Área Legal', email: 'abogado@defensoria.gob.bo' },
  { role: 'PSICOLOGO', label: 'Psicología', email: 'psicologo@defensoria.gob.bo' },
  { role: 'SOCIAL', label: 'Trabajo Social', email: 'social@defensoria.gob.bo' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('jefatura@defensoria.gob.bo');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/panel');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Panel Institucional (60%) */}
      <div
        style={{
          flex: '6',
          backgroundColor: 'var(--bosque-profundo)',
          color: 'oklch(0.98 0 0)',
          padding: '4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Shield size={36} color="var(--tierra-calida)" />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Defensoría de la Niñez y Adolescencia
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '3rem',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}
          >
            Sistema de Gestión y Acompañamiento de Casos
          </h1>

          <p style={{ fontSize: '1.125rem', opacity: 0.85, maxWidth: '540px', lineHeight: 1.6 }}>
            Plataforma institucional para el seguimiento de casos de vulneración de derechos,
            coordinación de equipos interdisciplinarios y resguardo seguro on-premise.
          </p>
        </div>

        <div>
          <div
            style={{
              borderLeft: '3px solid var(--tierra-calida)',
              paddingLeft: '1rem',
              fontSize: '0.875rem',
              opacity: 0.8,
            }}
          >
            Gobierno Autónomo Municipal — Bolivia
            <br />
            Ley N° 548 / Código Niña, Niño y Adolescente
          </div>
        </div>
      </div>

      {/* Formulario de Login (40%) */}
      <div
        style={{
          flex: '4',
          backgroundColor: 'var(--papel)',
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.5rem' }}>
            Ingreso al Sistema
          </h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '2rem' }}>
            Ingrese con sus credenciales institucionales
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'oklch(0.95 0.05 25)',
                color: 'var(--riesgo-alto)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                border: '1px solid oklch(0.85 0.1 25)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--grafito)',
                  marginBottom: '0.5rem',
                }}
              >
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.4,
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@defensoria.gob.bo"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid oklch(0.85 0.01 90)',
                    backgroundColor: 'white',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--grafito)',
                  marginBottom: '0.5rem',
                }}
              >
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.4,
                  }}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid oklch(0.85 0.01 90)',
                    backgroundColor: 'white',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Acceso Rápido Demo */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid oklch(0.9 0.01 90)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--salvia)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Users size={14} /> Acceso Rápido (Entorno de Desarrollo)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoLogin(acc.email)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid oklch(0.9 0.01 90)',
                    backgroundColor: email === acc.email ? 'oklch(0.95 0.02 165)' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--grafito)' }}>{acc.label}</span>
                  <span style={{ opacity: 0.6, fontFamily: 'monospace' }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
