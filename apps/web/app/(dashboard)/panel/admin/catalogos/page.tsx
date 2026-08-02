'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { ListFilter, Plus, CheckCircle2, XCircle, Trash2, Settings } from 'lucide-react';
interface CatalogItem {
  id: string;
  value: string;
  label: string;
  isActive: boolean;
  order: number;
}

interface SystemCatalog {
  id: string;
  code: string;
  name: string;
  description?: string;
  items: CatalogItem[];
}

export default function CatalogsAdminPage() {
  const { user } = useAuth();
  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La administración de catálogos dinámicos del sistema es exclusiva del Administrador General." />
    );
  }

  const [catalogs, setCatalogs] = useState<SystemCatalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<SystemCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Catalog Modal
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [showNewCatModal, setShowNewCatModal] = useState(false);

  // New Item Form
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<SystemCatalog[]>('/catalogs');
      setCatalogs(data || []);
      if (data && data.length > 0 && !selectedCatalog) {
        setSelectedCatalog(data[0]);
      } else if (selectedCatalog && data) {
        const updated = data.find((c) => c.id === selectedCatalog.id);
        if (updated) setSelectedCatalog(updated);
      }
    } catch {
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const handleCreateCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatCode || !newCatName) {
      setMessage({ text: 'El código y nombre del catálogo son requeridos', type: 'error' });
      return;
    }

    try {
      await fetchApi('/catalogs', {
        method: 'POST',
        body: JSON.stringify({
          code: newCatCode.toUpperCase().trim(),
          name: newCatName.trim(),
          description: newCatDesc.trim(),
        }),
      });
      setMessage({ text: 'Catálogo creado correctamente', type: 'success' });
      setNewCatCode('');
      setNewCatName('');
      setNewCatDesc('');
      setShowNewCatModal(false);
      fetchCatalogs();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al crear el catálogo', type: 'error' });
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalog) return;
    if (!newItemValue || !newItemLabel) {
      setMessage({ text: 'El valor técnico y la etiqueta son requeridos', type: 'error' });
      return;
    }

    try {
      await fetchApi(`/catalogs/${selectedCatalog.id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          value: newItemValue.toUpperCase().trim(),
          label: newItemLabel.trim(),
          order: selectedCatalog.items.length + 1,
        }),
      });
      setMessage({ text: 'Opción agregada al catálogo', type: 'success' });
      setNewItemValue('');
      setNewItemLabel('');
      fetchCatalogs();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al agregar opción', type: 'error' });
    }
  };

  const handleToggleItemStatus = async (item: CatalogItem) => {
    try {
      await fetchApi(`/catalogs/items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setMessage({ text: `Opción ${!item.isActive ? 'activada' : 'desactivada'}`, type: 'success' });
      fetchCatalogs();
    } catch {
      setMessage({ text: 'No se pudo actualizar la opción', type: 'error' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('¿Está seguro de eliminar esta opción del catálogo?')) return;
    try {
      await fetchApi(`/catalogs/items/${itemId}`, { method: 'DELETE' });
      setMessage({ text: 'Opción eliminada', type: 'success' });
      fetchCatalogs();
    } catch {
      setMessage({ text: 'No se pudo eliminar la opción', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ListFilter size={32} color="var(--tierra-calida)" /> Gestión de Catálogos Dinámicos
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Administra las opciones desplegables del sistema (Tipos de violencia, medidas de protección, barrios) de forma 100% configurable.
        </p>
      </header>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? 'oklch(0.92 0.08 140)' : 'oklch(0.92 0.08 30)',
          color: message.type === 'success' ? 'oklch(0.3 0.1 140)' : 'oklch(0.3 0.1 30)',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Catalogs List */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
              Catálogos del Sistema
            </h2>
            <button
              type="button"
              onClick={() => setShowNewCatModal(true)}
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Plus size={14} /> Nuevo
            </button>
          </div>

          {loading ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando catálogos...</p>
          ) : catalogs.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>No existen catálogos aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {catalogs.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatalog(cat)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedCatalog?.id === cat.id ? 'oklch(0.92 0.04 175)' : 'var(--papel)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>{cat.name}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>{cat.code}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--border)', padding: '0.15rem 0.4rem', borderRadius: '8px' }}>
                    {cat.items?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Catalog Items */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
          {selectedCatalog ? (
            <div>
              <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={20} color="var(--salvia)" /> {selectedCatalog.name}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
                  Código Técnico: <code style={{ fontFamily: 'monospace', backgroundColor: 'var(--papel)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{selectedCatalog.code}</code>
                  {selectedCatalog.description && ` — ${selectedCatalog.description}`}
                </p>
              </header>

              {/* Form New Item */}
              <form onSubmit={handleCreateItem} style={{ backgroundColor: 'var(--papel)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--bosque-profundo)' }}>
                  Agregar Nueva Opción / Ítem
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Etiqueta (Español)</label>
                    <input
                      type="text"
                      placeholder="Ej. Violencia Física"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Valor Técnico</label>
                    <input
                      type="text"
                      placeholder="Ej. VIOLENCIA_FISICA"
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Plus size={14} /> Agregar Opción
                  </button>
                </div>
              </form>

              {/* Items Table */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>Opciones Configuradas</h3>
                {selectedCatalog.items?.length === 0 ? (
                  <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Este catálogo no contiene opciones aún.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--papel)' }}>
                        <th style={{ padding: '0.625rem' }}>Orden</th>
                        <th style={{ padding: '0.625rem' }}>Etiqueta</th>
                        <th style={{ padding: '0.625rem' }}>Valor Técnico</th>
                        <th style={{ padding: '0.625rem' }}>Estado</th>
                        <th style={{ padding: '0.625rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCatalog.items?.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.625rem', fontFamily: 'monospace', opacity: 0.7 }}>{idx + 1}</td>
                          <td style={{ padding: '0.625rem', fontWeight: 600 }}>{item.label}</td>
                          <td style={{ padding: '0.625rem', fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.7 }}>{item.value}</td>
                          <td style={{ padding: '0.625rem' }}>
                            {item.isActive ? (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.12 140)', backgroundColor: 'oklch(0.92 0.06 140)', padding: '0.2rem 0.4rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <CheckCircle2 size={12} /> Activo
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.12 30)', backgroundColor: 'oklch(0.92 0.06 30)', padding: '0.2rem 0.4rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <XCircle size={12} /> Inactivo
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.625rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleItemStatus(item)}
                              style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--grafito)', fontSize: '0.75rem', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 600 }}
                            >
                              {item.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              style={{ backgroundColor: 'transparent', border: 'none', color: 'oklch(0.5 0.15 30)', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '3rem 0' }}>Selecciona un catálogo en el panel izquierdo.</p>
          )}
        </section>
      </div>

      {/* Modal New Catalog */}
      {showNewCatModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              Crear Nuevo Catálogo Dinámico
            </h3>
            <form onSubmit={handleCreateCatalog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre del Catálogo</label>
                <input
                  type="text"
                  placeholder="Ej. Tipos de Medidas de Protección"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Código Único (Mayúsculas)</label>
                <input
                  type="text"
                  placeholder="Ej. PROTECTION_MEASURES"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Descripción (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Opciones según Ley 548"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(false)}
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Crear Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
