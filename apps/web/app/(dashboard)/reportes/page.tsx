'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Search,
  FileText,
  AlertTriangle,
  Users,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  XCircle,
  CheckCircle,
} from 'lucide-react';

interface CasoResultado {
  id: string;
  caseCode: string;
  caseType: string;
  currentPhase: string;
  riskLevel: string | null;
  isClosed: boolean;
  createdAt: string;
  nna: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string | null;
    gender: string;
    documentNumber: string | null;
  } | null;
}

interface Estadisticas {
  totalCasos: number;
  porTipificacion: Record<string, number>;
  porGenero: Record<string, number>;
  porRangoEdad: Record<string, number>;
}

interface Profesional {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  officeId: string | null;
  stats: {
    totalAsignados: number;
    enCurso: number;
    cerrados: number;
    rechazados: number;
  };
}

interface FiltrarResponse {
  casos: CasoResultado[];
  estadisticas: Estadisticas;
  profesionales: Profesional[];
}

interface AnalyticsData {
  totalCases: number;
  byInterventionPath: Array<{ name: string; count: number }>;
  byRiskLevel: Array<{ name: string; count: number }>;
  byCaseType: Array<{ name: string; count: number }>;
  byPhase: Array<{ name: string; count: number }>;
}

export default function ReportesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'buscar' | 'profesionales'>('dashboard');
  const [loading, setLoading] = useState(false);

  // Dashboard data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Buscar data
  const [searchCi, setSearchCi] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchApellido, setSearchApellido] = useState('');
  const [searchRol, setSearchRol] = useState('');
  const [resultados, setResultados] = useState<CasoResultado[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loadingResultados, setLoadingResultados] = useState(false);

  // Profesionales data
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loadingProfesionales, setLoadingProfesionales] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadAnalytics();
    } else if (activeTab === 'profesionales') {
      loadProfesionales();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<AnalyticsData>('/cases/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingResultados(true);
    try {
      const params = new URLSearchParams();
      if (searchCi) params.set('ci', searchCi);
      if (searchNombre) params.set('nombre', searchNombre);
      if (searchApellido) params.set('apellido', searchApellido);
      if (searchRol) params.set('rol', searchRol);

      const data = await fetchApi<FiltrarResponse>(`/reports/filtrar?${params.toString()}`);
      setResultados(data.casos || []);
      setEstadisticas(data.estadisticas || null);
    } catch (err) {
      console.error('Error searching:', err);
      setResultados([]);
      setEstadisticas(null);
    } finally {
      setLoadingResultados(false);
    }
  };

  const loadProfesionales = async () => {
    setLoadingProfesionales(true);
    try {
      const data = await fetchApi<FiltrarResponse>('/reports/filtrar');
      setProfesionales(data.profesionales || []);
    } catch (err) {
      console.error('Error loading profesionales:', err);
      setProfesionales([]);
    } finally {
      setLoadingProfesionales(false);
    }
  };

  const exportCSV = () => {
    if (!estadisticas) return;
    const csv = [
      ['Concepto', 'Valor'],
      ['Total Casos', estadisticas.totalCasos],
      ...Object.entries(estadisticas.porTipificacion).map(([k, v]) => [`Tipificación: ${k}`, v]),
      ...Object.entries(estadisticas.porGenero).map(([k, v]) => [`Género: ${k}`, v]),
      ...Object.entries(estadisticas.porRangoEdad).map(([k, v]) => [`Edad: ${k}`, v]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte-estadisticas.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getRiskColor = (risk: string | null) => {
    const colors = {
      ALTO: '#DC2626',
      MEDIO: '#F59E0B',
      BAJO: '#059669',
      null: '#6B7280',
    };
    return colors[risk as keyof typeof colors] || '#6B7280';
  };

  const getPhaseLabel = (phase: string) => {
    const labels = {
      DERIVACION: 'Derivación',
      EVALUACION: 'Evaluación',
      SEGUIMIENTO: 'Seguimiento',
      JUDICIALIZACION: 'Judicialización',
      CIERRE: 'Cierre',
    };
    return labels[phase as keyof typeof labels] || phase;
  };

  if (user?.role !== 'ADMINISTRADOR' && user?.role !== 'JEFATURA') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={64} color="#DC2626" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
          🚫 Acceso Restringido
        </h2>
        <p style={{ color: '#6B7280', fontSize: '1rem' }}>
          Esta vista está disponible solo para <strong>Administrador y Jefatura</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
          📊 Reportes y Estadísticas
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8 }}>
          Monitoreo integral de expedientes, carga profesional y análisis de datos de la Defensoría de la Niñez.
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'dashboard', label: 'Tablero General', icon: BarChart3 },
          { id: 'buscar', label: 'Buscar por CI / Nombre', icon: Search },
          { id: 'profesionales', label: 'Carga por Profesional', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
                backgroundColor: isActive ? 'oklch(0.95 0.02 175)' : 'transparent',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--bosque-profundo)' : 'var(--grafito)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- Tablero General --- */}
      {activeTab === 'dashboard' && (
        <div>
          {loading ? (
            <p style={{ opacity: 0.6 }}>Cargando estadísticas...</p>
          ) : analytics ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <FileText size={28} color="var(--bosque-profundo)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{analytics.totalCases}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7, fontWeight: 600 }}>Total Expedientes</div>
                </div>
                {analytics.byRiskLevel && (
                  <>
                    <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <AlertTriangle size={28} color={getRiskColor('ALTO')} style={{ margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getRiskColor('ALTO') }}>
                        {analytics.byRiskLevel.find((r) => r.name === 'ALTO')?.count || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7, fontWeight: 600 }}>Riesgo Alto</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <AlertTriangle size={28} color={getRiskColor('MEDIO')} style={{ margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getRiskColor('MEDIO') }}>
                        {analytics.byRiskLevel.find((r) => r.name === 'MEDIO')?.count || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7, fontWeight: 600 }}>Riesgo Medio</div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Distribución por fase */}
                <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Expedientes por Fase</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {analytics.byPhase?.map((p) => (
                      <div key={p.name} style={{ padding: '1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{p.count}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', fontWeight: 600 }}>{getPhaseLabel(p.name)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribución por ruta de intervención */}
                <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Expedientes por Ruta de Intervención</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analytics.byInterventionPath?.map((p) => (
                      <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--grafito)' }}>{p.name === 'GESTION_ADMINISTRATIVA' ? 'Gestión Administrativa' : p.name === 'CONCILIACION' ? 'Conciliación' : p.name === 'VIA_JUDICIAL' ? 'Vía Judicial' : p.name}</span>
                        <span style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tipificaciones */}
                <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Tipificaciones (Tipo de Caso)</h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem', fontWeight: 700 }}>Tipo</th>
                        <th style={{ padding: '0.5rem', fontWeight: 700, textAlign: 'right' }}>Casos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.byCaseType?.map((t) => (
                        <tr key={t.name} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem' }}>{t.name}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>{t.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <BarChart3 size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p>No se pudieron cargar las estadísticas.</p>
            </div>
          )}
        </div>
      )}

      {/* --- Buscar por CI / Nombre --- */}
      {activeTab === 'buscar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search Form */}
          <form onSubmit={handleBuscar} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Buscar Expedientes por Persona</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>CI / Número de Documento</label>
                <input
                  type="text"
                  value={searchCi}
                  onChange={(e) => setSearchCi(e.target.value)}
                  placeholder="Ej: 5487321 Sc"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre</label>
                <input
                  type="text"
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                  placeholder="Ej: María Fernanda"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Apellido</label>
                <input
                  type="text"
                  value={searchApellido}
                  onChange={(e) => setSearchApellido(e.target.value)}
                  placeholder="Ej: Quispe"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rol Profesional</label>
                <select
                  value={searchRol}
                  onChange={(e) => setSearchRol(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem' }}
                >
                  <option value="">Todos los roles</option>
                  <option value="ABOGADO">Abogado</option>
                  <option value="PSICOLOGO">Psicólogo</option>
                  <option value="SOCIAL">Trabajador Social</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loadingResultados}
                style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Search size={16} /> {loadingResultados ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>

          {/* Results */}
          {loadingResultados ? (
            <p style={{ opacity: 0.6 }}>Buscando expedientes...</p>
          ) : (
            <>
              {/* Estadísticas */}
              {estadisticas && resultados.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <FileText size={24} color="var(--bosque-profundo)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{estadisticas.totalCasos}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7 }}>Expedientes encontrados</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>Por Tipificación</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {Object.entries(estadisticas.porTipificacion).map(([t, c]) => (
                        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--grafito)' }}>{t}</span>
                          <span style={{ fontWeight: 700 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>Por Género</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {Object.entries(estadisticas.porGenero).map(([g, c]) => (
                        <div key={g} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--grafito)' }}>{g}</span>
                          <span style={{ fontWeight: 700 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>Por Edad</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {Object.entries(estadisticas.porRangoEdad).map(([r, c]) => (
                        <div key={r} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--grafito)' }}>{r.replace('_', ' - ')}</span>
                          <span style={{ fontWeight: 700 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Casos Table */}
              {resultados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <FileText size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <p>No se encontraron expedientes para los criterios de búsqueda.</p>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Expediente</th>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>NNA</th>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Tipo</th>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Fase</th>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Riesgo</th>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Estado</th>
                          <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Ingreso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--bosque-profundo)' }}>{c.caseCode}</td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              {c.nna ? `${c.nna.firstName} ${c.nna.lastName}` : 'NNA no especificado'}
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem', opacity: 0.8 }}>{c.caseType}</td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>{getPhaseLabel(c.currentPhase)}</td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: c.riskLevel ? 'oklch(0.95 0.04 30)' : 'var(--papel)', color: getRiskColor(c.riskLevel) }}>
                                {c.riskLevel ? c.riskLevel.charAt(0) + c.riskLevel.slice(1).toLowerCase() : 'Sin evaluar'}
                              </span>
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              {c.isClosed ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>Cerrado</span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B' }}>Activo</span>
                              )}
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem', opacity: 0.7 }}>{formatDate(c.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* --- Carga por Profesional --- */}
      {activeTab === 'profesionales' && (
        <div>
          {loadingProfesionales ? (
            <p style={{ opacity: 0.6 }}>Cargando carga profesional...</p>
          ) : profesionales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <Users size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p>No hay profesionales activos en el sistema.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Profesional</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Rol</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Asignados</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>En Curso</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Cerrados</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Rechazados</th>
                  </tr>
                </thead>
                <tbody>
                  {profesionales.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '12px', backgroundColor: 'var(--papel)' }}>{p.role}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>{p.stats.totalAsignados}</td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', color: '#F59E0B', fontWeight: 700 }}>{p.stats.enCurso}</td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', color: '#059669', fontWeight: 700 }}>{p.stats.cerrados}</td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', color: '#DC2626', fontWeight: 700 }}>{p.stats.rechazados}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}