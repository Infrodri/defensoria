'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FileText, AlertTriangle, Clock, CheckCircle, XCircle, User, Calendar, Building2, Eye } from 'lucide-react';

interface DisabilityReport {
  id: string;
  caseCode: string;
  reason: string;
  disabledAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  case: {
    id: string;
    caseCode: string;
    caseType: string;
    currentPhase: string;
    currentOffice: { name: string; code: string };
    parties: Array<{
      person: { firstName: string; lastName: string; };
    }>;
  };
  disabler: {
    firstName: string;
    lastName: string;
    role: string;
  };
  reviewer?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  reviewedAt?: string;
}

export default function ReportesPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<DisabilityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await fetchApi('/cases/admin/disability-reports');
        setReports(data);
      } catch (err) {
        console.error('Error loading disability reports:', err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleReview = async (reportId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetchApi(`/cases/admin/disability-reports/${reportId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });

      // Update local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status, reviewedAt: new Date().toISOString() }
          : report
      ));

      alert(`✅ Reporte ${status === 'APPROVED' ? 'aprobado' : 'rechazado'} exitosamente`);
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Error al revisar reporte'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: '#F59E0B',
      APPROVED: '#059669',
      REJECTED: '#DC2626',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <Clock size={16} />,
      APPROVED: <CheckCircle size={16} />,
      REJECTED: <XCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || <AlertTriangle size={16} />;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Pendiente de Revisión',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredReports = filter === 'ALL' 
    ? reports 
    : reports.filter(report => report.status === filter);

  // Solo Jefatura y Administradores pueden ver reportes
  if (user?.role !== 'JEFATURA' && user?.role !== 'ADMINISTRADOR') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={64} color="#DC2626" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
          🚫 Acceso Restringido
        </h2>
        <p style={{ color: '#6B7280', fontSize: '1rem' }}>
          Esta vista está disponible solo para <strong>Jefatura y Administradores</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 800, 
          color: 'var(--bosque-profundo)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem' 
        }}>
          <FileText size={36} color="var(--tierra-calida)" />
          Reportes de Expedientes Inhabilitados
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.5rem', fontSize: '1rem' }}>
          Sistema de auditoría y revisión de inhabilitaciones realizadas por Secretaría
        </p>
      </header>

      {/* Filtros */}
      <div style={{
        backgroundColor: 'var(--card)',
        padding: '1.5rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)' }}>
          Filtrar por estado:
        </div>
        
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            style={{
              backgroundColor: filter === status ? 'var(--bosque-profundo)' : 'transparent',
              color: filter === status ? 'white' : 'var(--grafito)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {status === 'ALL' && '📊'}
            {status === 'PENDING' && '⏳'}
            {status === 'APPROVED' && '✅'}
            {status === 'REJECTED' && '❌'}
            {status === 'ALL' ? 'Todos' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          backgroundColor: 'var(--card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            {reports.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', fontWeight: 600 }}>
            📊 Total Reportes
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B' }}>
            {reports.filter(r => r.status === 'PENDING').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', fontWeight: 600 }}>
            ⏳ Pendientes
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
            {reports.filter(r => r.status === 'APPROVED').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', fontWeight: 600 }}>
            ✅ Aprobados
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626' }}>
            {reports.filter(r => r.status === 'REJECTED').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', fontWeight: 600 }}>
            ❌ Rechazados
          </div>
        </div>
      </div>

      {/* Lista de Reportes */}
      <div style={{
        backgroundColor: 'var(--card)',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 700, 
          marginBottom: '1.5rem', 
          color: 'var(--bosque-profundo)' 
        }}>
          📋 Lista de Reportes {filter !== 'ALL' && `- ${getStatusLabel(filter)}`}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grafito)' }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Cargando reportes de inhabilitación...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grafito)' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No hay reportes {filter !== 'ALL' ? `con estado ${getStatusLabel(filter).toLowerCase()}` : 'de inhabilitación'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReports.map((report) => (
              <div
                key={report.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--papel)',
                  border: '2px solid var(--border)',
                  borderLeft: `6px solid ${getStatusColor(report.status)}`,
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1.5rem', alignItems: 'start' }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 700, 
                        color: 'var(--bosque-profundo)', 
                        margin: 0 
                      }}>
                        📁 {report.case.caseCode}
                      </h3>
                      
                      <span
                        style={{
                          padding: '0.375rem 0.875rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: getStatusColor(report.status),
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {getStatusIcon(report.status)}
                        {getStatusLabel(report.status)}
                      </span>
                    </div>

                    {/* Información del caso */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--grafito)',
                      marginBottom: '1rem',
                    }}>
                      <div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--bosque-profundo)' }}>👤 NNA:</strong>
                          <span style={{ marginLeft: '0.5rem' }}>
                            {report.case.parties[0] ? 
                              `${report.case.parties[0].person.firstName} ${report.case.parties[0].person.lastName}` : 
                              'Sin información'
                            }
                          </span>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--bosque-profundo)' }}>🏢 Oficina:</strong>
                          <span style={{ marginLeft: '0.5rem' }}>
                            {report.case.currentOffice.name}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--bosque-profundo)' }}>⏰ Inhabilitado:</strong>
                          <span style={{ marginLeft: '0.5rem' }}>
                            {formatDate(report.disabledAt)}
                          </span>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--bosque-profundo)' }}>👨‍💼 Por:</strong>
                          <span style={{ marginLeft: '0.5rem' }}>
                            {report.disabler.firstName} {report.disabler.lastName} ({report.disabler.role})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Motivo */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      borderRadius: 'var(--radius)',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        color: 'var(--bosque-profundo)', 
                        marginBottom: '0.25rem' 
                      }}>
                        MOTIVO DE INHABILITACIÓN:
                      </div>
                      <div style={{ fontStyle: 'italic', color: 'var(--grafito)' }}>
                        {report.reason}
                      </div>
                    </div>

                    {/* Información de revisión */}
                    {report.reviewer && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--grafito)',
                        padding: '0.5rem',
                        backgroundColor: 'var(--papel)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}>
                        ✅ Revisado por {report.reviewer.firstName} {report.reviewer.lastName} 
                        el {formatDate(report.reviewedAt!)}
                      </div>
                    )}
                  </div>

                  {/* Botón Ver Expediente */}
                  <button
                    onClick={() => window.open(`/casos/${report.case.id}`, '_blank')}
                    style={{
                      backgroundColor: 'var(--bosque-profundo)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Eye size={16} />
                    Ver Expediente
                  </button>

                  {/* Botones de Revisión */}
                  {report.status === 'PENDING' && (user?.role === 'JEFATURA' || user?.role === 'ADMINISTRADOR') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleReview(report.id, 'APPROVED')}
                        style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <CheckCircle size={14} />
                        Aprobar
                      </button>
                      
                      <button
                        onClick={() => handleReview(report.id, 'REJECTED')}
                        style={{
                          backgroundColor: '#DC2626',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <XCircle size={14} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}