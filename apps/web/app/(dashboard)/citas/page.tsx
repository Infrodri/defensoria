'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Calendar, Clock, MapPin, User, FileText, Filter, Printer, Building2, CheckCircle2, AlertCircle, XCircle, UserCheck, ArrowRightLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface OfficeItem {
  id: string;
  code: string;
  name: string;
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  office?: {
    code: string;
    name: string;
  };
}

interface AppointmentItem {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  appointmentType: string;
  scheduledAt: string;
  endAt?: string;
  location?: string;
  status: string;
  case?: {
    id: string;
    caseCode: string;
    currentPhase: string;
    riskLevel?: string;
    currentOffice?: {
      id: string;
      code: string;
      name: string;
    };
    parties?: Array<{
      person?: {
        firstName: string;
        lastName: string;
      };
    }>;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    office?: {
      code: string;
      name: string;
    };
  };
}

export default function CitasPage() {
  const { user: currentUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedOffice, setSelectedOffice] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassigningApp, setReassigningApp] = useState<AppointmentItem | null>(null);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [submittingReassign, setSubmittingReassign] = useState(false);

  // Scope filter: Mi Agenda vs Agenda Consolidada
  const isAdminOrJefatura = currentUser?.role === 'ADMINISTRADOR' || currentUser?.role === 'JEFATURA';
  const [onlyMine, setOnlyMine] = useState<boolean>(true);

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);

    if (currentUser && !isAdminOrJefatura) {
      setOnlyMine(true);
    } else if (currentUser && isAdminOrJefatura) {
      setOnlyMine(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [onlyMine, currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const isMine = !isAdminOrJefatura ? true : onlyMine;
      const appointmentsUrl = isMine ? '/appointments?onlyMine=true' : '/appointments';

      const promises: Promise<any>[] = [
        fetchApi(appointmentsUrl),
        fetchApi('/offices'),
      ];

      if (isAdminOrJefatura) {
        promises.push(fetchApi('/users'));
      }

      const results = await Promise.all(promises);
      setAppointments(results[0] || []);
      setOffices(results[1] || []);
      if (results[2]) {
        setUsers(results[2]);
      }
    } catch (err: any) {
      toast.error('Error al cargar agenda de citas', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const openReassignModal = (app: AppointmentItem) => {
    setReassigningApp(app);
    setTargetUserId('');
    setReassignReason('');
    setIsReassignModalOpen(true);
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningApp || !targetUserId) {
      toast.error('Seleccione el profesional al cual transferir la citación');
      return;
    }

    setSubmittingReassign(true);
    try {
      let success = false;

      try {
        await fetchApi(`/appointments/${reassigningApp.id}/reassign`, {
          method: 'PATCH',
          body: JSON.stringify({ targetUserId, reason: reassignReason }),
        });
        success = true;
      } catch (e1) {
        try {
          await fetchApi(`/appointments/${reassigningApp.id}/reassign`, {
            method: 'POST',
            body: JSON.stringify({ targetUserId, reason: reassignReason }),
          });
          success = true;
        } catch (e2) {
          await fetchApi('/appointments/reassign-body', {
            method: 'POST',
            body: JSON.stringify({
              appointmentId: reassigningApp.id,
              targetUserId,
              reason: reassignReason,
            }),
          });
          success = true;
        }
      }

      toast.success('Citación y representación de expediente reasignadas correctamente', {
        description: 'Se ha habilitado el acceso al expediente para el nuevo profesional.',
      });

      setIsReassignModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Error al reasignar citación', { description: err.message });
    } finally {
      setSubmittingReassign(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((app) => {
    // Date filter
    if (selectedDate) {
      const appDate = new Date(app.scheduledAt).toISOString().split('T')[0];
      if (appDate !== selectedDate) return false;
    }

    // Office filter
    if (selectedOffice !== 'ALL') {
      const officeCode = app.case?.currentOffice?.code || app.creator?.office?.code;
      if (officeCode !== selectedOffice && app.case?.currentOffice?.id !== selectedOffice) return false;
    }

    // Type filter
    if (selectedType !== 'ALL') {
      if (app.appointmentType !== selectedType) return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      if (app.status !== selectedStatus) return false;
    }

    return true;
  });

  // Calculate metrics for selected view
  const metrics = {
    total: filteredAppointments.length,
    entrevistas: filteredAppointments.filter((a) => a.appointmentType === 'ENTREVISTA').length,
    audiencias: filteredAppointments.filter((a) => a.appointmentType === 'AUDIENCIA').length,
    visitas: filteredAppointments.filter((a) => a.appointmentType === 'VISITA_DOMICILIARIA').length,
    seguimiento: filteredAppointments.filter((a) => a.appointmentType === 'SEGUIMIENTO').length,
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'ENTREVISTA':
        return 'Evaluación Psicológica / Entrevista';
      case 'AUDIENCIA':
        return 'Audiencia Legal / Judicial';
      case 'VISITA_DOMICILIARIA':
        return 'Visita Domiciliaria';
      case 'SEGUIMIENTO':
        return 'Seguimiento de Caso';
      default:
        return type || 'Citación General';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'ENTREVISTA':
        return { backgroundColor: 'oklch(0.95 0.04 165)', color: 'var(--salvia)', border: '1px solid oklch(0.85 0.06 165)' };
      case 'AUDIENCIA':
        return { backgroundColor: 'oklch(0.95 0.05 40)', color: 'var(--tierra-calida)', border: '1px solid oklch(0.85 0.08 40)' };
      case 'VISITA_DOMICILIARIA':
        return { backgroundColor: 'oklch(0.94 0.05 250)', color: 'oklch(0.4 0.15 250)', border: '1px solid oklch(0.85 0.08 250)' };
      case 'SEGUIMIENTO':
        return { backgroundColor: 'oklch(0.96 0.03 90)', color: 'oklch(0.45 0.15 90)', border: '1px solid oklch(0.85 0.08 90)' };
      default:
        return { backgroundColor: 'var(--papel)', color: 'var(--grafito)', border: '1px solid var(--border)' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tierra-calida)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            <Calendar size={16} /> Monitoreo y Gestión Institucional de Citaciones
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
            Agenda Consolidada de Citas e Intervenciones
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Control diario de citaciones psicológicas, audiencias legales, visitas domiciliarias e inspecciones
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          style={{
            backgroundColor: 'var(--bosque-profundo)',
            color: 'white',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px oklch(0.25 0.08 165 / 0.2)',
          }}
        >
          <Printer size={16} /> Imprimir Reporte de Citas
        </button>
      </header>

      {/* Scope Toggle Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {isAdminOrJefatura ? (
          <>
            <button
              onClick={() => setOnlyMine(false)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                backgroundColor: !onlyMine ? 'var(--bosque-profundo)' : 'var(--card)',
                color: !onlyMine ? 'white' : 'var(--grafito)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                boxShadow: !onlyMine ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Building2 size={16} /> Agenda Consolidada Institucional (Todas las Citas)
            </button>
            <button
              onClick={() => setOnlyMine(true)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                backgroundColor: onlyMine ? 'var(--bosque-profundo)' : 'var(--card)',
                color: onlyMine ? 'white' : 'var(--grafito)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                boxShadow: onlyMine ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <UserCheck size={16} /> Mi Agenda Personal Asignada ({currentUser?.role})
            </button>
          </>
        ) : (
          <button
            disabled
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <UserCheck size={16} /> Mi Agenda Personal Asignada ({currentUser?.role})
          </button>
        )}
      </div>

      {/* Control Bar: Filters & Date Picker */}
      <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          
          {/* Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
              📅 Fecha Seleccionada
            </label>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', fontSize: '0.875rem', fontWeight: 700, boxSizing: 'border-box' }}
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  title="Ver todas las fechas"
                  style={{ padding: '0.5rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  Todas
                </button>
              )}
            </div>
          </div>

          {/* District Office Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
              🏢 Oficina / Distrito
            </label>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: 600, boxSizing: 'border-box' }}
            >
              <option value="ALL">Todas las 9 Oficinas Distritales</option>
              {offices.map((off) => (
                <option key={off.id} value={off.code}>
                  [{off.code}] {off.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
              📋 Tipo de Intervención
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: 600, boxSizing: 'border-box' }}
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="ENTREVISTA">🧠 Evaluación Psicológica / Entrevista</option>
              <option value="AUDIENCIA">⚖️ Audiencia Judicial / Medidas</option>
              <option value="VISITA_DOMICILIARIA">🏠 Visita Domiciliaria</option>
              <option value="SEGUIMIENTO">🔍 Seguimiento de Caso</option>
            </select>
          </div>

          {/* Quick Date Shortcuts */}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              style={{ flex: 1, padding: '0.5rem', backgroundColor: selectedDate === new Date().toISOString().split('T')[0] ? 'var(--bosque-profundo)' : 'var(--papel)', color: selectedDate === new Date().toISOString().split('T')[0] ? 'white' : 'inherit', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split('T')[0]);
              }}
              style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Mañana
            </button>
          </div>

        </div>
      </div>

      {/* Metric Counters Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>TOTAL CITAS PROGRAMADAS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginTop: '0.25rem' }}>{metrics.total}</div>
        </div>
        <div style={{ backgroundColor: 'var(--card)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--salvia)' }}>EVALUACIONES PSICOLÓGICAS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--salvia)', marginTop: '0.25rem' }}>{metrics.entrevistas}</div>
        </div>
        <div style={{ backgroundColor: 'var(--card)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)' }}>AUDIENCIAS JUDICIALES</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--tierra-calida)', marginTop: '0.25rem' }}>{metrics.audiencias}</div>
        </div>
        <div style={{ backgroundColor: 'var(--card)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.15 250)' }}>VISITAS DOMICILIARIAS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'oklch(0.4 0.15 250)', marginTop: '0.25rem' }}>{metrics.visitas}</div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)' }}>
          <p style={{ opacity: 0.7 }}>Cargando citaciones de la agenda centralizada...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>No hay citas registradas para este filtro</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
            {selectedDate ? `No existen citas ni audiencias para la fecha ${selectedDate}.` : 'Seleccione otra fecha u oficina para consultar citaciones.'}
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'oklch(0.96 0.02 165)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Horario</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Expediente & NNA Titular</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Tipo de Cita / Intervención</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Oficina / Distrito</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Profesional / Creador</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Ubicación / Detalles</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>Estado</th>
                  {(currentUser?.role === 'ADMINISTRADOR' || currentUser?.role === 'JEFATURA') && (
                    <th style={{ padding: '0.875rem', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => {
                  const nnaParty = app.case?.parties?.[0]?.person;
                  const nnaName = nnaParty ? `${nnaParty.firstName} ${nnaParty.lastName}` : 'NNA no especificado';
                  const dateObj = new Date(app.scheduledAt);
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateStr = dateObj.toLocaleDateString();

                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.875rem 0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        <div style={{ color: 'var(--bosque-profundo)', fontSize: '0.9375rem' }}>{timeStr}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{dateStr}</div>
                      </td>

                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        {app.case ? (
                          <Link href={`/casos/${app.case.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--salvia)', fontSize: '0.875rem' }}>
                              {app.case.caseCode}
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)', fontSize: '0.8125rem', marginTop: '0.1rem' }}>
                              {nnaName}
                            </div>
                          </Link>
                        ) : (
                          <span style={{ opacity: 0.6 }}>General</span>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.625rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-block',
                            ...getTypeBadgeStyle(app.appointmentType),
                          }}
                        >
                          {getTypeName(app.appointmentType)}
                        </span>
                      </td>

                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', backgroundColor: 'oklch(0.95 0.02 165)', color: 'var(--bosque-profundo)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                          {app.case?.currentOffice?.code || app.creator?.office?.code || 'CENTRAL'}
                        </span>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.15rem' }}>
                          {app.case?.currentOffice?.name || 'Sede Central'}
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        {app.creator ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)', fontSize: '0.8125rem' }}>
                              {app.creator.firstName} {app.creator.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{app.creator.role}</div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.6 }}>Sistema</span>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 0.75rem', maxWidth: '220px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)', fontSize: '0.8125rem' }}>{app.title}</div>
                        {app.location && (
                          <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <MapPin size={12} /> {app.location}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: app.status === 'PROGRAMADA' ? 'green' : 'gray' }}>
                          ● {app.status || 'PROGRAMADA'}
                        </span>
                      </td>

                      {(currentUser?.role === 'ADMINISTRADOR' || currentUser?.role === 'JEFATURA') && (
                        <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => openReassignModal(app)}
                            title="Reasignar citación y habilitar acceso a nuevo profesional"
                            style={{
                              padding: '0.35rem 0.625rem',
                              backgroundColor: 'oklch(0.96 0.03 65)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: 'var(--tierra-calida)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <ArrowRightLeft size={13} /> Reasignar
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassign Appointment Modal */}
      {isReassignModalOpen && reassigningApp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--card)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--tierra-calida)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRightLeft size={20} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                Reasignar Citación y Representación del Caso
              </h2>
            </div>

            <form onSubmit={handleReassignSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--papel)', padding: '0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                <div><strong>Citación:</strong> {reassigningApp.title}</div>
                <div><strong>Expediente:</strong> {reassigningApp.case?.caseCode || 'Sin expediente'}</div>
                <div><strong>Profesional Actual:</strong> {reassigningApp.creator ? `${reassigningApp.creator.firstName} ${reassigningApp.creator.lastName} (${reassigningApp.creator.role})` : 'Sistema'}</div>
              </div>

              {(() => {
                const requiredRole = reassigningApp.creator?.role;
                const candidateUsers = users.filter((u) => {
                  if (u.id === reassigningApp.creator?.id) return false;
                  if (requiredRole && requiredRole !== 'ADMINISTRADOR') {
                    return u.role === requiredRole;
                  }
                  return true;
                });

                return (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                      Seleccionar Nuevo Profesional Destino
                      {requiredRole && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'oklch(0.94 0.03 165)', color: 'var(--bosque-profundo)', padding: '0.15rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem', border: '1px solid var(--border)' }}>
                          Especialidad Requerida: {requiredRole}
                        </span>
                      )}
                    </label>

                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', fontSize: '0.875rem', fontWeight: 600, boxSizing: 'border-box' }}
                    >
                      <option value="">-- Seleccionar {requiredRole || 'Profesional'} --</option>
                      {candidateUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          [{u.role}] {u.firstName} {u.lastName} ({u.office?.code || 'CENTRAL'})
                        </option>
                      ))}
                    </select>

                    {candidateUsers.length === 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--riesgo-alto)', marginTop: '0.25rem', fontWeight: 600 }}>
                        ⚠️ No se encontraron otros profesionales activos con el rol <strong>{requiredRole}</strong> para reasignar la citación.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                  Motivo de la Reasignación (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cobertura por licencia médica / Reemplazo temporal"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ backgroundColor: 'oklch(0.96 0.03 65)', color: 'var(--tierra-calida)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid oklch(0.85 0.06 65)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Shield size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Habilitación Automática de Acceso:</strong> Al confirmar esta reasignación, el nuevo profesional quedará incorporado al equipo del expediente y se le otorgará acceso inmediato al historial y documentación del caso.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  style={{ padding: '0.625rem 1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReassign}
                  style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--tierra-calida)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: submittingReassign ? 'not-allowed' : 'pointer' }}
                >
                  {submittingReassign ? 'Reasignando...' : 'Confirmar Reasignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Report Modal */}
      {isPrintModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', color: 'black', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--border)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Actions Header */}
            <div style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Vista Previa de Reporte Imprimible de Citas</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handlePrint}
                  style={{ backgroundColor: 'var(--tierra-calida)', color: 'white', border: 'none', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Printer size={14} /> Imprimir / Guardar PDF
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Printable Content Area */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff', color: '#111827', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Gobierno Autónomo Municipal
                </h2>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: '0.25rem 0' }}>
                  Defensoría de la Niñez y Adolescencia (DNA)
                </h3>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.5rem', color: '#111827' }}>
                  REPORTE DIARIO CONSOLIDADO DE CITACIONES E INTERVENCIONES
                </div>
                <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Fecha de Reporte: <strong>{selectedDate || new Date().toISOString().split('T')[0]}</strong> | Filtro Oficina: <strong>{selectedOffice === 'ALL' ? 'Todas las 9 Oficinas Distritales' : selectedOffice}</strong>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #111827' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #d1d5db' }}>Hora</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #d1d5db' }}>Expediente & NNA</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #d1d5db' }}>Tipo de Cita</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #d1d5db' }}>Distrito</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #d1d5db' }}>Profesional Asignado</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #d1d5db' }}>Lugar / Objeto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app) => {
                    const nnaParty = app.case?.parties?.[0]?.person;
                    const nnaName = nnaParty ? `${nnaParty.firstName} ${nnaParty.lastName}` : 'N/A';
                    const timeStr = new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', fontWeight: 800 }}>{timeStr}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>
                          <strong>{app.case?.caseCode || 'N/A'}</strong><br />{nnaName}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', fontWeight: 700 }}>{getTypeName(app.appointmentType)}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{app.case?.currentOffice?.code || 'CENTRAL'}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{app.creator ? `${app.creator.firstName} ${app.creator.lastName} (${app.creator.role})` : 'N/A'}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{app.title} - {app.location || 'Oficina'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #111827', paddingTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  Firma Responsable de Secretaría
                </div>
                <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #111827', paddingTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  Firma Jefatura de Unidad / Admin
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
