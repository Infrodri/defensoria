'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { ShieldCheck, Plus, Building2, Search, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function InspeccionesPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Establishment Modal
  const [showEstModal, setShowEstModal] = useState(false);
  const [estName, setEstName] = useState('');
  const [estCategory, setEstCategory] = useState('BAR_DISCOTECA');
  const [estAddress, setEstAddress] = useState('');
  const [submittingEst, setSubmittingEst] = useState(false);

  // New Inspection Modal
  const [showInspModal, setShowInspModal] = useState(false);
  const [selectedEstId, setSelectedEstId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingInsp, setSubmittingInsp] = useState(false);

  // New Finding Modal
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [selectedInspId, setSelectedInspId] = useState('');
  const [findingType, setFindingType] = useState('VENTA_ALCOHOL_NNA');
  const [findingDesc, setFindingDesc] = useState('');
  const [nnaCount, setNnaCount] = useState(1);
  const [submittingFinding, setSubmittingFinding] = useState(false);

  const loadData = async () => {
    try {
      const [insps, ests] = await Promise.all([
        fetchApi('/inspections'),
        fetchApi('/inspections/establishments'),
      ]);
      setInspections(insps);
      setEstablishments(ests);
    } catch (err: any) {
      toast.error('Error al cargar operativos', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estName.trim()) return;
    setSubmittingEst(true);
    try {
      await fetchApi('/inspections/establishments', {
        method: 'POST',
        body: JSON.stringify({
          name: estName,
          category: estCategory,
          address: estAddress,
        }),
      });
      toast.success('Establecimiento registrado');
      setShowEstModal(false);
      setEstName('');
      setEstAddress('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar establecimiento');
    } finally {
      setSubmittingEst(false);
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstId || !scheduledAt) return;
    setSubmittingInsp(true);
    try {
      await fetchApi('/inspections', {
        method: 'POST',
        body: JSON.stringify({
          establishmentId: selectedEstId,
          scheduledAt,
          generalNotes: notes,
        }),
      });
      toast.success('Operativo de inspección programado');
      setShowInspModal(false);
      setSelectedEstId('');
      setScheduledAt('');
      setNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al programar operativo');
    } finally {
      setSubmittingInsp(false);
    }
  };

  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspId || !findingDesc.trim()) return;
    setSubmittingFinding(true);
    try {
      await fetchApi(`/inspections/${selectedInspId}/findings`, {
        method: 'POST',
        body: JSON.stringify({
          findingType,
          description: findingDesc,
          nnaCount: Number(nnaCount),
        }),
      });
      toast.success('Hallazgo registrado en el operativo');
      setShowFindingModal(false);
      setFindingDesc('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar hallazgo');
    } finally {
      setSubmittingFinding(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            Módulo de Inspecciones & Fiscalización
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Operativos proactivos en establecimientos comerciales y puntos de control municipal
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowEstModal(true)}
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--salvia)',
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
            <Building2 size={18} /> Registrar Local
          </button>

          <button
            onClick={() => setShowInspModal(true)}
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
            <Plus size={18} /> Nuevo Operativo
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div style={{ opacity: 0.6 }}>Cargando registros de fiscalización...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)', color: 'var(--bosque-profundo)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Fecha / Hora</th>
                <th style={{ padding: '1rem' }}>Establecimiento</th>
                <th style={{ padding: '1rem' }}>Inspector a Cargo</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem' }}>Hallazgos / NNA</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                    No hay operativos de inspección registrados.
                  </td>
                </tr>
              ) : (
                inspections.map((insp) => (
                  <tr key={insp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {new Date(insp.scheduledAt).toLocaleString('es-BO')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>{insp.establishment?.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{insp.establishment?.category}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {insp.inspector?.firstName} {insp.inspector?.lastName}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: insp.status === 'PROGRAMADA' ? 'oklch(0.95 0.03 65)' : 'var(--salvia)',
                        color: insp.status === 'PROGRAMADA' ? 'var(--tierra-calida)' : 'white',
                      }}>
                        {insp.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: insp.findings.length > 0 ? 'var(--riesgo-alto)' : 'inherit' }}>
                        <AlertTriangle size={14} /> {insp.findings.length} Infracciones
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedInspId(insp.id);
                          setShowFindingModal(true);
                        }}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: 'var(--tierra-calida)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        + Reportar Infracción
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Registrar Local */}
      {showEstModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', width: '400px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Registrar Establecimiento</h3>
            <form onSubmit={handleCreateEstablishment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Nombre del Local / Punto</label>
                <input type="text" value={estName} onChange={(e) => setEstName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Categoría</label>
                <select value={estCategory} onChange={(e) => setEstCategory(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <option value="BAR_DISCOTECA">Bar / Discoteca / Karaoke</option>
                  <option value="INTERNET_JUEGOS">Sala de Juegos / Internet</option>
                  <option value="TERMINAL_TRANSPORTE">Terminal de Buses / Punto Control</option>
                  <option value="EXPLOTACION_LABORAL">Comercial / Explotación Laboral</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dirección / Ubicación</label>
                <input type="text" value={estAddress} onChange={(e) => setEstAddress(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEstModal(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={submittingEst} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Programar Operativo */}
      {showInspModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', width: '400px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Programar Operativo</h3>
            <form onSubmit={handleCreateInspection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Establecimiento Target</label>
                <select value={selectedEstId} onChange={(e) => setSelectedEstId(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <option value="">-- Seleccionar Local --</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name} ({est.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Fecha y Hora del Operativo</label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Notas u Objetivos</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowInspModal(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={submittingInsp} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer' }}>Programar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Hallazgo */}
      {showFindingModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', width: '450px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>Reportar Infracción / Hallazgo</h3>
            <form onSubmit={handleAddFinding} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tipo de Infracción</label>
                <select value={findingType} onChange={(e) => setFindingType(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <option value="VENTA_ALCOHOL_NNA">Venta o Expansión de Alcohol a NNA</option>
                  <option value="PRESENCIA_NNA_SIN_TUTOR">Presencia de NNA sin Tutor en Horario Prohibido</option>
                  <option value="TRABAJO_INFANTIL_NO_AUTORIZADO">Trabajo Infantil No Autorizado / Explotación</option>
                  <option value="FALTA_PERMISO_VIAJE">NNA viajando sin Permiso de Viaje de la DNA</option>
                  <option value="OTRO">Otro Hallazgo de Vulneración</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Cantidad de NNA Intervenidos</label>
                <input type="number" min={1} value={nnaCount} onChange={(e) => setNnaCount(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Descripción del Hallazgo</label>
                <textarea value={findingDesc} onChange={(e) => setFindingDesc(e.target.value)} required rows={3} placeholder="Detallar la situación encontrada durante la inspección..." style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowFindingModal(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={submittingFinding} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--riesgo-alto)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer' }}>Registrar Infracción</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
