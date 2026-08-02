'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Building2, Plus, Edit2, CheckCircle2, XCircle, Users, FileText, Search, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface OfficeItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  _count: {
    users: number;
    currentCases: number;
  };
}

export default function OficinasPage() {
  const { user } = useAuth();
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeItem | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadOffices = async () => {
    try {
      const data = await fetchApi('/offices');
      setOffices(data);
    } catch (err: any) {
      toast.error('Error al cargar oficinas', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffices();
  }, []);

  const openCreateModal = () => {
    setEditingOffice(null);
    setFormCode('');
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (office: OfficeItem) => {
    setEditingOffice(office);
    setFormCode(office.code);
    setFormName(office.name);
    setFormAddress(office.address || '');
    setFormPhone(office.phone || '');
    setFormIsActive(office.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || (!editingOffice && !formCode.trim())) {
      toast.error('El nombre y el código son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      if (editingOffice) {
        await fetchApi(`/offices/${editingOffice.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: formName,
            address: formAddress,
            phone: formPhone,
            isActive: formIsActive,
          }),
        });
        toast.success('Oficina actualizada exitosamente');
      } else {
        await fetchApi('/offices', {
          method: 'POST',
          body: JSON.stringify({
            code: formCode,
            name: formName,
            address: formAddress,
            phone: formPhone,
          }),
        });
        toast.success('Oficina registrada exitosamente');
      }

      setIsModalOpen(false);
      loadOffices();
    } catch (err: any) {
      toast.error('Error al guardar datos de la oficina', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOffices = offices.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      (o.address && o.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
              Gestión de Oficinas y Distritos
            </h1>
            <span style={{ backgroundColor: 'oklch(0.92 0.04 175)', color: 'var(--bosque-profundo)', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '12px' }}>
              9 Distritos Municipal Sucre
            </span>
          </div>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Administración territorial y descentralización de defensorías en el municipio de Sucre
          </p>
        </div>

        {user?.role === 'ADMINISTRADOR' && (
          <button
            onClick={openCreateModal}
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px oklch(0.25 0.08 165 / 0.2)',
            }}
          >
            <Plus size={18} /> Registrar Nueva Oficina
          </button>
        )}
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        <input
          type="text"
          placeholder="Buscar oficina por nombre, código o zona..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius)',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--grafito)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Grid de 9 Distritos */}
      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando oficinas distritales...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredOffices.map((office) => (
            <div
              key={office.id}
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        backgroundColor: office.code === 'CENTRAL' ? 'var(--bosque-profundo)' : 'oklch(0.94 0.03 165)',
                        color: office.code === 'CENTRAL' ? 'white' : 'var(--bosque-profundo)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem', color: 'var(--salvia)', textTransform: 'uppercase' }}>
                        [{office.code}]
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0, lineHeight: 1.2 }}>
                        {office.name}
                      </h3>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: office.isActive ? 'oklch(0.94 0.04 140)' : 'oklch(0.94 0.04 30)',
                      color: office.isActive ? 'oklch(0.35 0.12 140)' : 'oklch(0.4 0.15 30)',
                    }}
                  >
                    {office.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {office.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--grafito)', display: 'flex', flexDirection: 'column', gap: '0.375rem', margin: '1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', opacity: 0.85 }}>
                    <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--salvia)' }} />
                    <span>{office.address || 'Ubicación no especificada'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: 0.85 }}>
                    <Phone size={14} style={{ flexShrink: 0, color: 'var(--salvia)' }} />
                    <span>{office.phone || 'Sin teléfono registrado'}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78125rem', fontWeight: 600, color: 'var(--grafito)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} color="var(--salvia)" /> {office._count?.users || 0} Personal
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FileText size={14} color="var(--tierra-calida)" /> {office._count?.currentCases || 0} Casos
                  </span>
                </div>

                {user?.role === 'ADMINISTRADOR' && (
                  <button
                    onClick={() => openEditModal(office)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--bosque-profundo)',
                      fontWeight: 700,
                      fontSize: '0.78125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'oklch(0.96 0.02 165)',
                    }}
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulario */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--card)',
              borderRadius: 'calc(var(--radius) * 1.5)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            <div style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', padding: '1.25rem 1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                {editingOffice ? `Editar Oficina ${editingOffice.code}` : 'Registrar Nueva Oficina Distrital'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!editingOffice && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Código Único (Ej. DIST_9)
                  </label>
                  <input
                    type="text"
                    placeholder="DIST_9"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius)',
                      border: '1.5px solid var(--border)',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                  Nombre de la Oficina
                </label>
                <input
                  type="text"
                  placeholder="Ej. Defensoría Distrital 9 - Zona Norte"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--border)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                  Dirección / Ubicación Física
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Hernando Siles N° 340, Sucre"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--border)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej. +591 4 64-59999"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--border)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {editingOffice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grafito)' }}>
                    Oficina Activa Operativamente
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'var(--papel)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: 'var(--bosque-profundo)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Guardando...' : editingOffice ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
