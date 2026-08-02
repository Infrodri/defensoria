'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Calendar, Building2, MapPin, Phone, LogOut, AlertCircle } from 'lucide-react';
import { PhaseRail } from '@/components/cases/phase-rail';
import { formatPhase, formatInterventionPath, formatAppointmentType, formatAppointmentStatus } from '@defensoria/shared';

export default function PortalEstadoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('portalToken');
    if (!token) {
      router.push('/portal/login');
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

    const loadData = async () => {
      try {
        const [statusRes, appRes] = await Promise.all([
          fetch(`${API_URL}/portal/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/portal/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statusRes.status === 401 || appRes.status === 401) {
          localStorage.removeItem('portalToken');
          router.push('/portal/login');
          return;
        }

        if (!statusRes.ok) throw new Error('No se pudo cargar el estado del expediente');

        const sData = await statusRes.json();
        const aData = await appRes.json();

        setStatus(sData);
        setAppointments(aData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portalToken');
    localStorage.removeItem('portalCaseCode');
    router.push('/portal/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--papel)' }}>
        <p style={{ opacity: '0.7', fontWeight: 600 }}>Cargando estado del expediente...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--papel)', padding: '1rem' }}>
        <AlertCircle size={48} color="var(--riesgo-alto)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '1rem' }}>Error de Conexión</h2>
        <p style={{ opacity: 0.8 }}>{error || 'No se encontró información disponible.'}</p>
        <button
          onClick={handleLogout}
          style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700 }}
        >
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--papel)', paddingBottom: '3rem' }}>
      {/* Top Bar */}
      <header style={{ backgroundColor: 'var(--bosque-profundo)', color: 'var(--papel)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={24} />
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Portal de Tutores DNA</h1>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'monospace' }}>{status.caseCode}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'var(--papel)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}
        >
          <LogOut size={16} /> Salir
        </button>
      </header>

      <main style={{ maxWidth: '960px', margin: '1.5rem auto 0', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Vertical Phase Rail */}
          <div>
            <PhaseRail currentPhase={status.currentPhase} orientation="vertical" />
          </div>

          {/* Right Column: Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* State Banner */}
            <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)', textTransform: 'uppercase' }}>
                Estado Procesal Actual
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginTop: '0.25rem' }}>
                {formatPhase(status.currentPhase)}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
                Vía de Intervención: <strong>{formatInterventionPath(status.currentInterventionPath)}</strong>
              </p>
            </div>

            {/* Appointments */}
            <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Calendar size={20} color="var(--bosque-profundo)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
                  Próximas Citaciones & Audiencias
                </h3>
              </div>

              {appointments.length === 0 ? (
                <p style={{ fontSize: '0.875rem', opacity: 0.7, fontStyle: 'italic' }}>
                  No hay citas ni audiencias pendientes agendadas en este momento.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {appointments.map((app) => (
                    <div key={app.id} style={{ padding: '1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>{app.title}</h4>
                          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>Tipo: {formatAppointmentType(app.appointmentType)}</p>
                        </div>
                        <span style={{ backgroundColor: 'var(--salvia)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                          {formatAppointmentStatus(app.status)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--tierra-calida)', marginTop: '0.75rem' }}>
                        📅 {new Date(app.scheduledAt).toLocaleString('es-BO', { dateStyle: 'full', timeStyle: 'short' })}
                      </div>
                      {app.location && (
                        <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} /> Lugar: {app.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Office Info */}
            <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 size={20} color="var(--bosque-profundo)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
                  Oficina Asignada
                </h3>
              </div>
              <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p><strong>{status.currentOffice.name}</strong></p>
                {status.currentOffice.address && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: 0.8 }}>
                    <MapPin size={14} /> {status.currentOffice.address}
                  </p>
                )}
                {status.currentOffice.phone && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: 0.8 }}>
                    <Phone size={14} /> {status.currentOffice.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
