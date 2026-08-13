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
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
              DEFENSORÍA DE LA NIÑEZ Y ADOLESCENCIA
            </span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Sistema de Gestión y Acompañamiento de Casos
          </h1>
          <blockquote
            style={{
              borderLeft: '4px solid var(--tierra-calida)',
              paddingLeft: '1.5rem',
              fontSize: '1.25rem',
              fontStyle: 'italic',
              opacity: 0.9,
              maxWidth: '600px',
            }}
          >
            "El caso es del NNA. Los profesionales y las oficinas son temporales dentro del caso."
          </blockquote>
        </div>

        <div>
          <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>
            Gobierno Autónomo Municipal · Unidad de Asuntos Generacionales
          </p>
        </div>
      </div>

      {/* Formulario de Login (40%) */}
      <div
        style={{
          flex: '4',
          backgroundColor: 'var(--background)',
          padding: '4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
            Ingreso Institucional
          </h2>
          <p style={{ color: 'var(--grafito)', opacity: 0.7, marginBottom: '2rem', fontSize: '0.875rem' }}>
            Introduce tus credenciales para acceder al sistema
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'oklch(0.95 0.05 28)',
                color: 'var(--riesgo-alto)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Accesos de Demostración por Rol */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--salvia)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Users size={14} /> Accesos Rápidos de Prueba
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoLogin(acc.email)}
                  style={{
                    textAlign: 'left',
                    padding: '0.375rem 0.625rem',
                    borderRadius: 'var(--radius)',
                    border: email === acc.email ? '1px solid var(--tierra-calida)' : '1px solid transparent',
                    backgroundColor: email === acc.email ? 'oklch(0.95 0.03 65)' : 'transparent',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{acc.label}</span>
                  <span style={{ opacity: 0.5 }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
