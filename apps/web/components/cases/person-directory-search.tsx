'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { DocumentType, Gender } from '@defensoria/shared';
import {
  Search,
  UserPlus,
  CheckCircle2,
  X,
  Loader2,
  User,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

export interface PersonDirectorySearchProps {
  label?: string;
  roleLabel?: string;
  placeholder?: string;
  selectedPerson?: any | null;
  onSelectPerson: (person: any) => void;
  onClearSelection?: () => void;
  allowCreateOnTheFly?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export function PersonDirectorySearch({
  label = 'Búsqueda en Directorio de Personas',
  roleLabel,
  placeholder = 'Buscar por CI, pasaporte, nombre o apellido...',
  selectedPerson = null,
  onSelectPerson,
  onClearSelection,
  allowCreateOnTheFly = true,
  required = false,
  disabled = false,
}: PersonDirectorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle state for creation on the fly
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // New person form fields
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newDocumentType, setNewDocumentType] = useState<DocumentType>(DocumentType.CI);
  const [newDocumentNumber, setNewDocumentNumber] = useState('');
  const [newGender, setNewGender] = useState<Gender>(Gender.OTRO);
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Fetch search results
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setSearchExecuted(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/persons/search?q=${encodeURIComponent(query.trim())}`);
      setResults(Array.isArray(data) ? data : []);
      setSearchExecuted(true);
    } catch (err: any) {
      console.error('Error fetching persons search:', err);
      setError(err.message || 'Error al consultar el directorio de personas');
      setResults([]);
      setSearchExecuted(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  // Pre-fill creation form if term looks like document number or name
  const handleOpenCreateForm = () => {
    const trimmed = searchTerm.trim();
    if (trimmed) {
      if (/^\d/.test(trimmed)) {
        setNewDocumentNumber(trimmed);
        setNewDocumentType(DocumentType.CI);
      } else {
        const parts = trimmed.split(/\s+/);
        setNewFirstName(parts[0] || '');
        setNewLastName(parts.slice(1).join(' ') || '');
      }
    }
    setShowCreateForm(true);
  };

  // Submit new person on the fly
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newFirstName.trim() || !newLastName.trim()) {
      setCreateError('Nombre y apellido son obligatorios');
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        documentType: newDocumentType,
        documentNumber: newDocumentNumber.trim() || undefined,
        gender: newGender,
        birthDate: newBirthDate || undefined,
        phone: newPhone.trim() || undefined,
        address: newAddress.trim() || undefined,
      };

      const createdPerson = await fetchApi('/persons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onSelectPerson(createdPerson);
      setShowCreateForm(false);
      // Reset form
      setNewFirstName('');
      setNewLastName('');
      setNewDocumentNumber('');
      setNewPhone('');
      setNewAddress('');
      setNewBirthDate('');
      setSearchTerm('');
    } catch (err: any) {
      setCreateError(err.message || 'Error al registrar la persona');
    } finally {
      setCreating(false);
    }
  };

  const handleClear = () => {
    if (onClearSelection) {
      onClearSelection();
    } else {
      onSelectPerson(null);
    }
    setSearchTerm('');
    setResults([]);
    setSearchExecuted(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {label && (
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--grafito)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {label}
          {roleLabel && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--salvia)',
                color: 'white',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              {roleLabel}
            </span>
          )}
          {required && <span style={{ color: 'var(--riesgo-alto)' }}>*</span>}
        </label>
      )}

      {/* Selected Person Card View */}
      {selectedPerson ? (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius)',
            border: '1.5px solid var(--bosque-profundo)',
            backgroundColor: 'oklch(0.98 0.01 175)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--grafito)', fontSize: '1rem' }}>
                {selectedPerson.firstName} {selectedPerson.lastName}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.85, display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                <span>
                  <strong>Doc:</strong> {selectedPerson.documentNumber || 'Sin Documento'} ({selectedPerson.documentType || 'N/A'})
                </span>
                {selectedPerson.phone && (
                  <span>
                    <strong>Telf:</strong> {selectedPerson.phone}
                  </span>
                )}
                {selectedPerson.gender && (
                  <span>
                    <strong>Género:</strong> {selectedPerson.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--grafito)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <X size={14} /> Cambiar
            </button>
          )}
        </div>
      ) : (
        /* Search Box and Results */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                fontSize: '0.875rem',
                color: 'var(--grafito)',
                outline: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--salvia)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--grafito)',
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Error */}
          {error && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--riesgo-alto)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Results List */}
          {searchExecuted && !loading && (
            <div
              style={{
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              {results.length > 0 ? (
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--papel)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', opacity: 0.7 }}>
                    PERSONAS ENCONTRADAS ({results.length})
                  </div>
                  {results.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => onSelectPerson(person)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'oklch(0.96 0.01 90)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--bosque-profundo)' }}>
                          {person.firstName} {person.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.125rem' }}>
                          Doc: {person.documentNumber || 'Sin Doc'} ({person.documentType}) | Género: {person.gender}
                          {person.caseParties && person.caseParties.length > 0 && (
                            <span style={{ marginLeft: '0.5rem', color: 'var(--tierra-calida)', fontWeight: 600 }}>
                              ({person.caseParties.length} caso(s) registrado(s))
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius)',
                          backgroundColor: 'var(--bosque-profundo)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--grafito)' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    No se encontraron personas registradas con &quot;{searchTerm}&quot;.
                  </p>
                  {allowCreateOnTheFly && !showCreateForm && (
                    <button
                      type="button"
                      onClick={handleOpenCreateForm}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        backgroundColor: 'var(--tierra-calida)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      <UserPlus size={16} /> Registrar Nueva Persona
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action button to create on the fly when not searching or wanting to force creation */}
          {allowCreateOnTheFly && !showCreateForm && !searchExecuted && (
            <button
              type="button"
              onClick={handleOpenCreateForm}
              style={{
                alignSelf: 'flex-start',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--salvia)',
                backgroundColor: 'transparent',
                color: 'var(--bosque-profundo)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <UserPlus size={15} /> + Registrar nueva persona en el acto
            </button>
          )}

          {/* Create Person Form (Inline Modal / Drawer) */}
          {showCreateForm && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--salvia)',
                backgroundColor: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={18} /> Registrar Persona Rápida
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grafito)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {createError && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--riesgo-alto)', backgroundColor: 'oklch(0.95 0.05 28)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)' }}>
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreatePerson} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Nombres *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Ej. Juan Carlos"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Ej. Pérez Mamani"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Tipo Documento</label>
                  <select
                    value={newDocumentType}
                    onChange={(e) => setNewDocumentType(e.target.value as DocumentType)}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  >
                    <option value={DocumentType.CI}>CI (Cédula de Identidad)</option>
                    <option value={DocumentType.PASAPORTE}>Pasaporte</option>
                    <option value={DocumentType.PARTIDA_NACIMIENTO}>Certificado de Nacimiento</option>
                    <option value={DocumentType.SIN_DOCUMENTO}>Sin Documento</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Nro. Documento</label>
                  <input
                    type="text"
                    value={newDocumentNumber}
                    onChange={(e) => setNewDocumentNumber(e.target.value)}
                    placeholder="Ej. 1234567-LP"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Género</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as Gender)}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  >
                    <option value={Gender.MASCULINO}>Masculino</option>
                    <option value={Gender.FEMENINO}>Femenino</option>
                    <option value={Gender.OTRO}>Otro</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Teléfono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Ej. 71234567"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)' }}>Dirección</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Ej. Av. Blanco Galindo #123"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'white',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'var(--bosque-profundo)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    {creating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Guardar y Seleccionar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
