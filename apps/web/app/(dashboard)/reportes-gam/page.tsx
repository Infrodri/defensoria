'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { BarChart2, FileText, Users, AlertTriangle, TrendingUp, Building2, Download } from 'lucide-react';
import { formatCaseType, formatPhase, formatRiskLevel } from '@defensoria/shared';

export default function ReportesGamPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchApi('/cases/analytics');
        setAnalytics(data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ opacity: 0.6, padding: '2rem' }}>Cargando datos estadísticos...</div>;
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    padding: '1.5rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    padding: '1.25rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    textAlign: 'center',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          📊 Reportes GAM — Estadísticas del Sistema
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Resumen estadístico de expedientes para el Gobierno Autónomo Municipal de Sucre
        </p>
      </header>

      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            {analytics?.totalCases ?? 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', marginTop: '0.25rem' }}>
            Total de Expedientes
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--riesgo-alto)' }}>
            {analytics?.byRiskLevel?.find((r: any) => r.name === 'ALTO')?.count ?? 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', marginTop: '0.25rem' }}>
            Riesgo Alto
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--tierra-calida)' }}>
            {analytics?.byRiskLevel?.find((r: any) => r.name === 'MEDIO')?.count ?? 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', marginTop: '0.25rem' }}>
            Riesgo Medio
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--salvia)' }}>
            {analytics?.byRiskLevel?.find((r: any) => r.name === 'BAJO')?.count ?? 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', marginTop: '0.25rem' }}>
            Riesgo Bajo
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Por tipo de caso */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Expedientes por Tipo de Trámite
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(analytics?.byCaseType ?? []).map((item: any) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>{formatCaseType(item.name)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    height: '8px',
                    width: `${Math.max(20, (item.count / (analytics?.totalCases || 1)) * 160)}px`,
                    backgroundColor: 'var(--bosque-profundo)',
                    borderRadius: '4px',
                    opacity: 0.7,
                  }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '2rem', textAlign: 'right' }}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
            {(!analytics?.byCaseType || analytics.byCaseType.length === 0) && (
              <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Por fase procesal */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> Expedientes por Fase Procesal
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(analytics?.byPhase ?? []).map((item: any) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>{formatPhase(item.name)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    height: '8px',
                    width: `${Math.max(20, (item.count / (analytics?.totalCases || 1)) * 160)}px`,
                    backgroundColor: 'var(--salvia)',
                    borderRadius: '4px',
                    opacity: 0.7,
                  }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '2rem', textAlign: 'right' }}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
            {(!analytics?.byPhase || analytics.byPhase.length === 0) && (
              <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Por vía de intervención */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} /> Por Vía de Intervención
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(analytics?.byInterventionPath ?? []).map((item: any) => {
              const labels: Record<string, string> = {
                GESTION_ADMINISTRATIVA: 'Gestión Administrativa',
                CONCILIACION: 'Conciliación',
                VIA_JUDICIAL: 'Vía Judicial',
              };
              return (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem' }}>{labels[item.name] ?? item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      height: '8px',
                      width: `${Math.max(20, (item.count / (analytics?.totalCases || 1)) * 160)}px`,
                      backgroundColor: 'var(--tierra-calida)',
                      borderRadius: '4px',
                      opacity: 0.7,
                    }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '2rem', textAlign: 'right' }}>
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!analytics?.byInterventionPath || analytics.byInterventionPath.length === 0) && (
              <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Por nivel de riesgo */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Por Nivel de Riesgo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(analytics?.byRiskLevel ?? []).map((item: any) => {
              const colors: Record<string, string> = {
                ALTO: 'var(--riesgo-alto)',
                MEDIO: 'var(--tierra-calida)',
                BAJO: 'var(--salvia)',
                SIN_EVALUAR: 'var(--border)',
              };
              return (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem' }}>{formatRiskLevel(item.name)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      height: '8px',
                      width: `${Math.max(20, (item.count / (analytics?.totalCases || 1)) * 160)}px`,
                      backgroundColor: colors[item.name] ?? 'var(--border)',
                      borderRadius: '4px',
                    }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '2rem', textAlign: 'right' }}>
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!analytics?.byRiskLevel || analytics.byRiskLevel.length === 0) && (
              <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Sin datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem', backgroundColor: 'oklch(0.97 0.02 175)', borderRadius: 'var(--radius)', border: '1px solid oklch(0.88 0.04 175)', fontSize: '0.8125rem', color: 'var(--bosque-profundo)' }}>
        📋 Estos datos son estadísticas agregadas y no nominales. Generados en tiempo real desde la base de datos del sistema DNA Sucre.
      </div>
    </div>
  );
}
