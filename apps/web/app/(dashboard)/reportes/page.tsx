'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { BarChart3, PieChart, TrendingUp, ShieldAlert, FileSpreadsheet, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#1E4B43', '#6B9080', '#C98A3E', '#B44B3C', '#2B2B28'];

export default function ReportesEstadisticosPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/cases/analytics')
      .then((res) => setData(res))
      .catch((err) => toast.error('Error al cargar datos estadísticos', { description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const exportReport = () => {
    toast.success('Generando reporte en formato PDF/Excel para el GAM Sucre...');
  };

  if (loading) {
    return <div style={{ opacity: 0.6 }}>Cargando estadísticas institucionales...</div>;
  }

  if (!data) {
    return <div>No hay datos disponibles para generar gráficos.</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            Estadísticas e Indicadores Municipales (GAM)
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Métricas agregadas no nominales de protección infantil bajo la Ley 548
          </p>
        </div>

        <button
          onClick={exportReport}
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: 'var(--bosque-profundo)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Download size={18} /> Exportar Reporte GAM
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tierra-calida)' }}>Total Expedientes</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginTop: '0.25rem' }}>{data.totalCases}</div>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--salvia)' }}>Tipos de Vulneración</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginTop: '0.25rem' }}>{data.byCaseType.length}</div>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--riesgo-alto)' }}>Casos de Alto Riesgo</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--riesgo-alto)', marginTop: '0.25rem' }}>
            {data.byRiskLevel.find((r: any) => r.name === 'ALTO')?.count || 0}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Distribution by Intervention Path */}
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} /> Distribución por Vía de Intervención
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <RePieChart>
                <Pie data={data.byInterventionPath} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {data.byInterventionPath.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribution by Risk Level */}
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Casos por Nivel de Riesgo
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.byRiskLevel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--tierra-calida)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distribution by Case Type */}
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} /> Distribución por Tipo de Trámite / Vulneración
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.byCaseType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--bosque-profundo)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
