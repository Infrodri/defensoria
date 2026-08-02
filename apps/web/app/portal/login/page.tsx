'use client';

import React, { useState } from 'react';
import { Shield, ArrowRight, Eye, EyeOff, KeyRound, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PortalLoginPage() {
  const router = useRouter();
  const [caseCode, setCaseCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseCode.trim() || !pin.trim()) {
      toast.error('Ingrese el código de expediente y el PIN de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api'}/portal/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseCode, pin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await res.json();
      localStorage.setItem('portalToken', data.accessToken);
      localStorage.setItem('portalCaseCode', data.caseCode);

      toast.success('Acceso correcto al portal del expediente');
      router.push('/portal/estado');
    } catch (err: any) {
      toast.error('Error de acceso', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--papel)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--card)',
          borderRadius: 'calc(var(--radius) * 1.5)',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 35px -5px rgba(0, 0, 0, 0.08), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--bosque-profundo)',
            color: 'var(--papel)',
            padding: '2.25rem 1.75rem 2rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '3.75rem',
              height: '3.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Shield size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Portal de Seguimiento para Tutores
          </h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.375rem', fontWeight: 500 }}>
            Defensoría de la Niñez y Adolescencia (DNA)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Código de Expediente */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--bosque-profundo)',
                marginBottom: '0.5rem',
              }}
            >
              <FileText size={15} color="var(--salvia)" />
              Código de Expediente
            </label>
            <input
              type="text"
              placeholder="Ej. DNA-2026-0001"
              value={caseCode}
              onChange={(e) => setCaseCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--papel)',
                color: 'var(--grafito)',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.05em',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            />
          </div>

          {/* PIN de Acceso */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--bosque-profundo)',
                marginBottom: '0.5rem',
              }}
            >
              <KeyRound size={15} color="var(--salvia)" />
              PIN de Acceso (6 dígitos)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                placeholder="******"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  padding: '0.875rem 2.75rem 0.875rem 1rem',
                  fontSize: '1.25rem',
                  letterSpacing: '0.35em',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--papel)',
                  color: 'var(--grafito)',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--grafito)',
                  opacity: 0.6,
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.95rem',
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 4px 14px oklch(0.25 0.08 165 / 0.25)',
              transition: 'transform 0.15s ease, background-color 0.2s ease',
            }}
          >
            {loading ? 'Verificando...' : (
              <>
                Ingresar al Expediente <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Info Box */}
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'oklch(0.96 0.02 165)',
              border: '1px solid oklch(0.9 0.04 165)',
              borderRadius: 'var(--radius)',
              fontSize: '0.78125rem',
              color: 'var(--grafito)',
              lineHeight: 1.45,
            }}
          >
            <strong>¿No tiene su PIN de acceso?</strong>
            <br />
            El PIN de 6 dígitos es proporcionado personalmente en la defensoría al aperturar el caso o por el equipo asignado.
          </div>
        </form>
      </div>
    </div>
  );
}

