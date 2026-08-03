'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Calendar, Clock, User, Filter, UserPlus, MapPin, FileText, AlertCircle, Building2, Briefcase, Users } from 'lucide-react';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  office: { id: string; name: string; code: string };
}

interface Office {
  id: string;
  name: string;
  code: string;
  address: string;
}

interface Appointment {
  id: string;
  title: string;
  description: string;
  appointmentType: string;
  scheduledAt: string;
  endAt: string;
  location: string;
  status: string;
  case: {
    id: string;
    caseCode: string;
    currentPhase: string;
    riskLevel: string;
    parties: Array<{
      person: { firstName: string; lastName: string; };
    }>;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const SPECIALTY_LABELS = {
  ABOGADO: 'Área Legal',
  PSICOLOGO: 'Área Psicológica',
  SOCIAL: 'Área Social',
};

const SPECIALTY_ICONS = {
  ABOGADO: '⚖️',
  PSICOLOGO: '🧠',
  SOCIAL: '👥',
};

export default function AgendaPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [selectedOffice, setSelectedOffice] = useState<string>('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Reasignación
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [professionalsData, officesData] = await Promise.all([
          fetchApi('/users/professionals/list'),
          fetchApi('/offices')
        ]);
        setProfessionals(professionalsData);
        setOffices(officesData);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, []);

  // Cargar citas cuando cambien los filtros
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (selectedOffice !== 'ALL') {
          params.append('officeId', selectedOffice);
        }
        if (selectedSpecialty !== 'ALL') {
          params.append('specialtyRole', selectedSpecialty);
        }
        if (selectedProfessional !== 'ALL') {
          params.append('professionalId', selectedProfessional);
        }
        if (selectedDate) {
          params.append('date', selectedDate);
        }

        const data = await fetchApi(`/appointments?${params.toString()}`);
        setAppointments(data);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [selectedOffice, selectedSpecialty, selectedProfessional, selectedDate]);

  // Filtrar profesionales por especialidad seleccionada
  const filteredProfessionals = selectedSpecialty === 'ALL' 
    ? professionals 
    : professionals.filter(p => p.role === selectedSpecialty);

  // Obtener profesionales de la misma especialidad para reasignación
  const getSamSpecialtyProfessionals = (currentRole: string, currentId: string) => {
    return professionals.filter(p => p.role === currentRole && p.id !== currentId);
  };

  const handleReassignAppointment = async (targetProfessionalId: string, reason: string) => {
    if (!selectedAppointment) return;

    try {
      await fetchApi(`/appointments/${selectedAppointment.id}/reassign`, {
        method: 'PATCH',
        body: JSON.stringify({
          targetUserId: targetProfessionalId,
          reason,
        }),
      });

      alert('✅ Cita reasignada exitosamente y registrada para reportes');
      setShowReassignModal(false);
      setSelectedAppointment(null);

      // Recargar citas
      const params = new URLSearchParams();
      if (selectedOffice !== 'ALL') params.append('officeId', selectedOffice);
      if (selectedSpecialty !== 'ALL') params.append('specialtyRole', selectedSpecialty);
      if (selectedProfessional !== 'ALL') params.append('professionalId', selectedProfessional);
      if (selectedDate) params.append('date', selectedDate);
      
      const data = await fetchApi(`/appointments?${params.toString()}`);
      setAppointments(data);
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Error al reasignar cita'));
    }
  };

  const clearAllFilters = () => {
    setSelectedOffice('ALL');
    setSelectedSpecialty('ALL');
    setSelectedProfessional('ALL');
    setSelectedDate('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PROGRAMADA: '#3B82F6',
      CONFIRMADA: '#059669',
      COMPLETADA: '#D97706',
      CANCELADA: '#6B7280',
      NO_ASISTIO: '#DC2626',
      REPROGRAMADA: '#7C3AED',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PROGRAMADA: 'Programada',
      CONFIRMADA: 'Confirmada',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      NO_ASISTIO: 'No Asistió',
      REPROGRAMADA: 'Reprogramada',
    };
    return labels[status] || status;
  };

  const isPastAppointment = (scheduledAt: string) => {
    return new Date(scheduledAt) < new Date();
  };

  // Solo secretarias pueden ver esta vista completa
  if (user?.role !== 'SECRETARIA' && user?.role !== 'JEFATURA' && user?.role !== 'ADMINISTRADOR') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertCircle size={64} color="#DC2626" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
          🚫 Acceso Restringido
        </h2>
        <p style={{ color: '#6B7280', fontSize: '1rem' }}>
          Esta vista está disponible solo para <strong>Secretaría, Jefatura y Administradores</strong>.
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
          <Calendar size={36} color="var(--tierra-calida)" />
          Agenda Consolidada de Profesionales
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.5rem', fontSize: '1rem' }}>
          Gestión centralizada de citas y reasignaciones por especialidad profesional
        </p>
      </header>

      {/* Filtros Mejorados */}
      <div style={{ 
        backgroundColor: 'var(--card)', 
        padding: '2rem', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border)', 
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        alignItems: 'end'
      }}>
        {/* Filtro por Unidad/Distrito */}
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: 'var(--bosque-profundo)'
          }}>
            <Building2 size={16} color="var(--tierra-calida)" />
            Unidad / Distrito
          </label>
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <option value="ALL">🏢 Todas las Unidades</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                📍 {office.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Especialidad */}
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: 'var(--bosque-profundo)'
          }}>
            <Briefcase size={16} color="var(--tierra-calida)" />
            Especialidad
          </label>
          <select
            value={selectedSpecialty}
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              setSelectedProfessional('ALL'); // Reset professional filter
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <option value="ALL">🎯 Todas las Especialidades</option>
            <option value="ABOGADO">{SPECIALTY_ICONS.ABOGADO} {SPECIALTY_LABELS.ABOGADO}</option>
            <option value="PSICOLOGO">{SPECIALTY_ICONS.PSICOLOGO} {SPECIALTY_LABELS.PSICOLOGO}</option>
            <option value="SOCIAL">{SPECIALTY_ICONS.SOCIAL} {SPECIALTY_LABELS.SOCIAL}</option>
          </select>
        </div>

        {/* Filtro por Profesional */}
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: 'var(--bosque-profundo)'
          }}>
            <User size={16} color="var(--tierra-calida)" />
            Profesional
          </label>
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <option value="ALL">👤 Todos los Profesionales</option>
            {filteredProfessionals.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {SPECIALTY_ICONS[prof.role as keyof typeof SPECIALTY_ICONS] || '👤'} {prof.firstName} {prof.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Fecha */}
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: 'var(--bosque-profundo)'
          }}>
            <Calendar size={16} color="var(--tierra-calida)" />
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          />
        </div>

        {/* Botón Limpiar Filtros */}
        <div>
          <button
            onClick={clearAllFilters}
            style={{
              backgroundColor: 'var(--salvia)',
              color: 'white',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Filter size={16} />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Lista de Citas Programadas - Mejorada */}
      <div style={{ 
        backgroundColor: 'var(--card)', 
        padding: '2rem', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          borderBottom: '2px solid var(--border)',
          paddingBottom: '1rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              color: 'var(--bosque-profundo)', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              🗓️ CITAS PROGRAMADAS
              {selectedDate && (
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  color: 'var(--tierra-calida)',
                  backgroundColor: 'var(--papel)',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)'
                }}>
                  📅 {formatDate(selectedDate)}
                </span>
              )}
            </h2>
            {(selectedOffice !== 'ALL' || selectedSpecialty !== 'ALL' || selectedProfessional !== 'ALL') && (
              <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', marginTop: '0.5rem' }}>
                Filtros activos: {
                  [
                    selectedOffice !== 'ALL' && `Oficina: ${offices.find(o => o.id === selectedOffice)?.name}`,
                    selectedSpecialty !== 'ALL' && `Especialidad: ${SPECIALTY_LABELS[selectedSpecialty as keyof typeof SPECIALTY_LABELS]}`,
                    selectedProfessional !== 'ALL' && `Profesional: ${professionals.find(p => p.id === selectedProfessional)?.firstName} ${professionals.find(p => p.id === selectedProfessional)?.lastName}`
                  ].filter(Boolean).join(' • ')
                }
              </div>
            )}
          </div>
          <div style={{ 
            fontSize: '1.125rem', 
            color: 'var(--bosque-profundo)', 
            fontWeight: 700,
            backgroundColor: 'var(--papel)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius)',
            border: '2px solid var(--border)'
          }}>
            📊 Total: <span style={{ color: 'var(--tierra-calida)' }}>{appointments.length}</span> citas
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            color: 'var(--grafito)',
            backgroundColor: 'var(--papel)',
            borderRadius: 'var(--radius)'
          }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>⏳ Cargando agenda consolidada...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            color: 'var(--grafito)',
            backgroundColor: 'var(--papel)',
            borderRadius: 'var(--radius)'
          }}>
            <Calendar size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              📅 No hay citas programadas
            </h3>
            <p style={{ fontSize: '1rem' }}>
              No se encontraron citas con los filtros actuales.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {appointments.map((appointment) => {
              const samSpecialtyProfs = getSamSpecialtyProfessionals(appointment.creator.role, appointment.creator.id);
              const canReassign = samSpecialtyProfs.length > 0;
              
              return (
                <div
                  key={appointment.id}
                  style={{
                    padding: '1.75rem',
                    backgroundColor: isPastAppointment(appointment.scheduledAt) && appointment.status === 'PROGRAMADA' 
                      ? 'rgba(107, 114, 128, 0.05)' 
                      : 'var(--papel)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    borderLeft: `6px solid ${getStatusColor(appointment.status)}`,
                    opacity: isPastAppointment(appointment.scheduledAt) && appointment.status === 'PROGRAMADA' ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Información Principal de la Cita */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={20} color="var(--bosque-profundo)" />
                          <h3 style={{ 
                            fontWeight: 800, 
                            fontSize: '1.25rem', 
                            color: 'var(--bosque-profundo)', 
                            margin: 0 
                          }}>
                            📋 {appointment.title}
                          </h3>
                        </div>
                        
                        <span
                          style={{
                            padding: '0.375rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: getStatusColor(appointment.status),
                            color: 'white',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>

                        {/* Indicador de Especialidad */}
                        <span
                          style={{
                            padding: '0.375rem 0.875rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: 'var(--tierra-calida)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {SPECIALTY_ICONS[appointment.creator.role as keyof typeof SPECIALTY_ICONS]} 
                          {SPECIALTY_LABELS[appointment.creator.role as keyof typeof SPECIALTY_LABELS]}
                        </span>
                      </div>

                      <div style={{ 
                        fontSize: '0.95rem', 
                        color: 'var(--grafito)', 
                        lineHeight: 1.6,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        <div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--bosque-profundo)' }}>📅 Fecha y Hora:</strong>
                            <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>
                              {formatDate(appointment.scheduledAt)} a las {formatTime(appointment.scheduledAt)}
                              {appointment.endAt && ` - ${formatTime(appointment.endAt)}`}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--bosque-profundo)' }}>👨‍💼 Profesional:</strong>
                            <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>
                              {appointment.creator.firstName} {appointment.creator.lastName}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--bosque-profundo)' }}>📁 Expediente:</strong>
                            <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>
                              {appointment.case.caseCode}
                              {appointment.case.parties[0] && (
                                <span style={{ color: 'var(--grafito)' }}>
                                  {' - '}👤 {appointment.case.parties[0].person.firstName} {appointment.case.parties[0].person.lastName}
                                </span>
                              )}
                            </span>
                          </div>
                          
                          {appointment.location && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong style={{ color: 'var(--bosque-profundo)' }}>📍 Lugar:</strong>
                              <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>
                                {appointment.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {appointment.description && (
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.875rem', 
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                          borderRadius: 'var(--radius)', 
                          fontStyle: 'italic',
                          color: 'var(--grafito)'
                        }}>
                          📝 <strong>Descripción:</strong> {appointment.description}
                        </div>
                      )}
                    </div>

                    {/* Botón Ver Expediente */}
                    <button
                      onClick={() => window.open(`/casos/${appointment.case.id}`, '_blank')}
                      style={{
                        backgroundColor: 'var(--bosque-profundo)',
                        color: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--salvia)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bosque-profundo)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <FileText size={16} /> 📂 Ver Expediente
                    </button>

                    {/* Botón Reasignar por Incidencia */}
                    {(user?.role === 'SECRETARIA' || user?.role === 'JEFATURA') && (
                      <button
                        onClick={() => {
                          if (!canReassign) {
                            alert(`❌ No hay otros profesionales del ${SPECIALTY_LABELS[appointment.creator.role as keyof typeof SPECIALTY_LABELS]} disponibles para reasignación.`);
                            return;
                          }
                          setSelectedAppointment(appointment);
                          setShowReassignModal(true);
                        }}
                        disabled={!canReassign}
                        style={{
                          backgroundColor: canReassign ? 'var(--tierra-calida)' : 'var(--grafito)',
                          color: 'white',
                          padding: '0.75rem 1.25rem',
                          borderRadius: 'var(--radius)',
                          border: 'none',
                          cursor: canReassign ? 'pointer' : 'not-allowed',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: canReassign ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                          opacity: canReassign ? 1 : 0.6,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          if (canReassign) {
                            e.currentTarget.style.backgroundColor = '#D97706';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (canReassign) {
                            e.currentTarget.style.backgroundColor = 'var(--tierra-calida)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <UserPlus size={16} /> 
                        {canReassign ? '🔄 Reasignar por Incidencia' : '🚫 Sin Profesionales'}
                      </button>
                    )}
                  </div>

                  {/* Información de Disponibilidad para Reasignación */}
                  {(user?.role === 'SECRETARIA' || user?.role === 'JEFATURA') && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: canReassign 
                        ? 'rgba(34, 197, 94, 0.05)' 
                        : 'rgba(239, 68, 68, 0.05)',
                      border: `1px solid ${canReassign ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {canReassign ? (
                        <span style={{ color: '#059669' }}>
                          ✅ Disponibles para reasignación: {samSpecialtyProfs.length} profesionales del {SPECIALTY_LABELS[appointment.creator.role as keyof typeof SPECIALTY_LABELS]}
                        </span>
                      ) : (
                        <span style={{ color: '#DC2626' }}>
                          ⚠️ No hay otros profesionales del {SPECIALTY_LABELS[appointment.creator.role as keyof typeof SPECIALTY_LABELS]} disponibles
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Reasignación por Especialidad */}
      {showReassignModal && selectedAppointment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--card)',
              padding: '2.5rem',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--border)',
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                marginBottom: '1rem', 
                color: 'var(--bosque-profundo)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                🔄 Reasignar Cita por Incidencia
              </h3>
              
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--papel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginBottom: '1rem',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
                  📋 {selectedAppointment.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--grafito)' }}>
                  📅 {formatDate(selectedAppointment.scheduledAt)} a las {formatTime(selectedAppointment.scheduledAt)}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius)',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                    Profesional Actual
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                    {SPECIALTY_ICONS[selectedAppointment.creator.role as keyof typeof SPECIALTY_ICONS]} {selectedAppointment.creator.firstName} {selectedAppointment.creator.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grafito)' }}>
                    {SPECIALTY_LABELS[selectedAppointment.creator.role as keyof typeof SPECIALTY_LABELS]}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                    Expediente
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                    📁 {selectedAppointment.case.caseCode}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grafito)' }}>
                    {selectedAppointment.case.parties[0] && 
                      `👤 ${selectedAppointment.case.parties[0].person.firstName} ${selectedAppointment.case.parties[0].person.lastName}`
                    }
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const targetProfessionalId = formData.get('targetProfessionalId') as string;
                const reason = formData.get('reason') as string;
                
                if (!targetProfessionalId) {
                  alert('❌ Debe seleccionar un profesional de la misma especialidad');
                  return;
                }

                if (!reason.trim()) {
                  alert('❌ Debe proporcionar un motivo para la reasignación');
                  return;
                }

                handleReassignAppointment(targetProfessionalId, reason);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  marginBottom: '0.75rem',
                  color: 'var(--bosque-profundo)'
                }}>
                  <UserPlus size={16} color="var(--tierra-calida)" />
                  Reasignar a Profesional del {SPECIALTY_LABELS[selectedAppointment.creator.role as keyof typeof SPECIALTY_LABELS]}:
                </label>
                
                <select
                  name="targetProfessionalId"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <option value="">
                    Seleccionar profesional del {SPECIALTY_LABELS[selectedAppointment.creator.role as keyof typeof SPECIALTY_LABELS]}...
                  </option>
                  {getSamSpecialtyProfessionals(selectedAppointment.creator.role, selectedAppointment.creator.id)
                    .map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {SPECIALTY_ICONS[prof.role as keyof typeof SPECIALTY_ICONS]} {prof.firstName} {prof.lastName}
                        {prof.office?.name && ` - ${prof.office.name}`}
                      </option>
                    ))}
                </select>

                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--grafito)', 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)'
                }}>
                  ℹ️ Solo se muestran profesionales de la misma especialidad para mantener la coherencia del tratamiento
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  marginBottom: '0.75rem',
                  color: 'var(--bosque-profundo)'
                }}>
                  📝 Motivo de la reasignación (Obligatorio para reportes):
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  required
                  placeholder="Ej: Profesional con licencia médica por 15 días&#10;Ej: Sobrecarga de casos en agenda profesional&#10;Ej: Especialización requerida para el caso específico&#10;Ej: Conflicto de horarios con audiencia judicial"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    resize: 'vertical',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', marginTop: '0.5rem' }}>
                  📊 Este motivo se registrará en el sistema de reportes para seguimiento de Jefatura
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReassignModal(false);
                    setSelectedAppointment(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid var(--border)',
                    padding: '0.875rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--grafito)',
                  }}
                >
                  ❌ Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--tierra-calida)',
                    color: 'white',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  ✅ Confirmar Reasignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}