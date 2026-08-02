'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Search, UserPlus, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function IngestaCasoPage() {
  const router = useRouter();

  // Catalogs State
  const [caseTypeCatalog, setCaseTypeCatalog] = useState<any>(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);

  // Wizard Step State
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchExecuted, setSearchExecuted] = useState(false);

  // Step 2: Selected or New Person / Case Form State
  const [selectedNna, setSelectedNna] = useState<any | null>(null);
  const [isNewNna, setIsNewNna] = useState(false);

  // New NNA Form
  const [nnaFirstName, setNnaFirstName] = useState('');
  const [nnaLastName, setNnaLastName] = useState('');
  const [nnaDocumentNumber, setNnaDocumentNumber] = useState('');
  const [nnaGender, setNnaGender] = useState('MASCULINO');

  // Case Details
  const [caseType, setCaseType] = useState('');
  const [intakeNarrative, setIntakeNarrative] = useState('');
  
  // Third Party Complainant
  const [isThirdPartyComplainant, setIsThirdPartyComplainant] = useState(false);
  const [complainantFullName, setComplainantFullName] = useState('');
  const [complainantDocumentId, setComplainantDocumentId] = useState('');
  const [complainantRelation, setComplainantRelation] = useState('MADRE');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load catalogs on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const catalog = await fetchApi('/catalogs/CASE_TYPES');
        setCaseTypeCatalog(catalog);
        
        // Set first case type as default
        if (catalog?.items && catalog.items.length > 0) {
          setCaseType(catalog.items[0].value);
        }
      } catch (err) {
        console.error('Error loading catalogs:', err);
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  // Handle Step 1 Anti-Duplication Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchExecuted(true);
    try {
      const results = await fetchApi(`/persons/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(results);
    } catch (err: any) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Proceed to Step 2 with existing person
  const handleSelectExistingPerson = (person: any) => {
    setSelectedNna(person);
    setIsNewNna(false);
    setStep(2);
  };

  // Proceed to Step 2 with new person registration
  const handleStartNewPersonRegistration = () => {
    setSelectedNna(null);
    setIsNewNna(true);
    // Pre-fill name if user searched for names
    if (isNaN(Number(searchQuery))) {
      const parts = searchQuery.split(' ');
      setNnaFirstName(parts[0] || '');
      setNnaLastName(parts.slice(1).join(' ') || '');
    } else {
      setNnaDocumentNumber(searchQuery);
    }
    setStep(2);
  };

  // Submit complete case
  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let finalNnaId = selectedNna?.id;

      // Create new person if required
      if (isNewNna) {
        const newPerson = await fetchApi('/persons', {
          method: 'POST',
          body: JSON.stringify({
            firstName: nnaFirstName,
            lastName: nnaLastName,
            documentNumber: nnaDocumentNumber || undefined,
            gender: nnaGender,
          }),
        });
        finalNnaId = newPerson.id;
      }

      // Prepare case payload
      const casePayload: any = {
        nnaId: finalNnaId,
        caseType,
        intakeNarrative,
        isThirdPartyComplainant,
      };

      // Add third party complainant fields if applicable
      if (isThirdPartyComplainant) {
        if (!complainantFullName.trim()) {
          throw new Error('Nombre del denunciante es obligatorio');
        }
        casePayload.complainantFullName = complainantFullName;
        casePayload.complainantDocumentId = complainantDocumentId || undefined;
        casePayload.complainantRelation = complainantRelation;
        casePayload.complainantPhone = complainantPhone || undefined;
        casePayload.complainantAddress = complainantAddress || undefined;
      }

      // Create Case
      const newCase = await fetchApi('/cases', {
        method: 'POST',
        body: JSON.stringify(casePayload),
      });

      router.push(`/casos/${newCase.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el expediente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Primera Recepción e Ingesta de Caso
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Módulo operativo exclusivo de Secretaría y Jefatura
        </p>
      </header>

      {/* Stepper Header */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: 'var(--radius)',
            backgroundColor: step === 1 ? 'var(--bosque-profundo)' : 'var(--card)',
            color: step === 1 ? 'white' : 'var(--grafito)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Search size={20} color={step === 1 ? 'var(--tierra-calida)' : 'var(--salvia)'} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>PASO 1 OBLIGATORIO</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Búsqueda Previa Anti-duplicación</div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: 'var(--radius)',
            backgroundColor: step === 2 ? 'var(--bosque-profundo)' : 'var(--card)',
            color: step === 2 ? 'white' : 'var(--grafito)',
            border: '1px solid var(--border)',
            opacity: step === 2 ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <FileText size={20} color={step === 2 ? 'var(--tierra-calida)' : 'var(--salvia)'} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>PASO 2</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Registro de Datos del Expediente</div>
          </div>
        </div>
      </div>

      {/* STEP 1: Mandatory Anti-Duplication Search */}
      {step === 1 && (
        <section style={{ backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tierra-calida)', marginBottom: '1rem' }}>
            <ShieldAlert size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Principio Rector N° 3: No Duplicación de Testimonio
            </span>
          </div>

          <p style={{ color: 'var(--grafito)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Antes de abrir un expediente nuevo, es **obligatorio** buscar si el NNA o su familia ya tienen registros previos en el sistema para no revictimizar ni duplicar información.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingrese carnet de identidad, nombre o apellidos del NNA..."
              required
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {searching ? 'Buscando...' : 'Buscar Antecedentes'}
            </button>
          </form>

          {/* Results list */}
          {searchExecuted && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
                Resultados de la Búsqueda ({searchResults.length})
              </h3>

              {searchResults.length === 0 ? (
                <div style={{ backgroundColor: 'oklch(0.96 0.02 165)', border: '1px solid var(--salvia)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bosque-profundo)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={20} color="var(--salvia)" />
                    Sin antecedente encontrado para "{searchQuery}"
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
                    Se confirmó en auditoría que no existe registro previo de este NNA. Podés proceder con el registro de un nuevo titular.
                  </p>
                  <button
                    onClick={handleStartNewPersonRegistration}
                    style={{
                      backgroundColor: 'var(--bosque-profundo)',
                      color: 'white',
                      padding: '0.625rem 1.25rem',
                      borderRadius: 'var(--radius)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    + Continuar y Registrar Nuevo NNA
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--riesgo-alto)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    ⚠️ Se encontraron personas coincidentes. Verifique antes de crear un nuevo registro:
                  </div>

                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--papel)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                          {p.firstName} {p.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                          Documento: {p.documentNumber || 'SIN DOCUMENTO'} · Casos previos: {p.caseParties?.length || 0}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectExistingPerson(p)}
                        style={{
                          backgroundColor: 'var(--salvia)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius)',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        Seleccionar este NNA para Nuevo Caso
                      </button>
                    </div>
                  ))}

                  <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button
                      onClick={handleStartNewPersonRegistration}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--bosque-profundo)',
                        border: '1px solid var(--bosque-profundo)',
                        padding: '0.625rem 1.25rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Ninguno de estos es la persona · Registrar Nuevo NNA
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* STEP 2: Case Details Registration */}
      {step === 2 && (
        <form onSubmit={handleSubmitCase} style={{ backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1.5rem' }}>
            {isNewNna ? 'Registro de Nuevo NNA Titular y Caso' : `Nuevo Caso para: ${selectedNna?.firstName} ${selectedNna?.lastName}`}
          </h2>

          {error && (
            <div style={{ backgroundColor: 'oklch(0.95 0.05 28)', color: 'var(--riesgo-alto)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* New NNA fields if applicable */}
          {isNewNna && (
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
                Datos Personales del NNA
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Nombres</label>
                  <input
                    type="text"
                    value={nnaFirstName}
                    onChange={(e) => setNnaFirstName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Apellidos</label>
                  <input
                    type="text"
                    value={nnaLastName}
                    onChange={(e) => setNnaLastName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>N° Documento (CI)</label>
                  <input
                    type="text"
                    value={nnaDocumentNumber}
                    onChange={(e) => setNnaDocumentNumber(e.target.value)}
                    placeholder="Opcional"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Género</label>
                  <select
                    value={nnaGender}
                    onChange={(e) => setNnaGender(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro / No especificado</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Case Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Tipo de Trámite / Caso</label>
              {catalogsLoading ? (
                <div style={{ padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--grafito)', opacity: 0.6 }}>
                  Cargando tipos de caso...
                </div>
              ) : (
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                >
                  <option value="">Seleccionar tipo...</option>
                  {caseTypeCatalog?.items?.map((item: any) => (
                    <option key={item.id} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Narrativa Inicial / Hechos de la Denuncia</label>
              <textarea
                rows={5}
                value={intakeNarrative}
                onChange={(e) => setIntakeNarrative(e.target.value)}
                placeholder="Describa objetivamente los hechos reportados durante la primera recepción..."
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
              />
            </div>

            {/* Denunciante / Third Party Section */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="isThirdParty"
                  checked={isThirdPartyComplainant}
                  onChange={(e) => {
                    setIsThirdPartyComplainant(e.target.checked);
                    if (!e.target.checked) {
                      // Reset third party fields
                      setComplainantFullName('');
                      setComplainantDocumentId('');
                      setComplainantRelation('MADRE');
                      setComplainantPhone('');
                      setComplainantAddress('');
                    }
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isThirdParty" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  ¿La denuncia es presentada por un tercero (no por el NNA)?
                </label>
              </div>

              {isThirdPartyComplainant && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Nombre Completo del Denunciante *</label>
                      <input
                        type="text"
                        value={complainantFullName}
                        onChange={(e) => setComplainantFullName(e.target.value)}
                        placeholder="ej: María García Rodríguez"
                        required
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Documento de Identidad (CI/Pasaporte)</label>
                      <input
                        type="text"
                        value={complainantDocumentId}
                        onChange={(e) => setComplainantDocumentId(e.target.value)}
                        placeholder="ej: 1234567-LP"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Relación con el NNA</label>
                      <select
                        value={complainantRelation}
                        onChange={(e) => setComplainantRelation(e.target.value)}
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      >
                        <option value="MADRE">Madre</option>
                        <option value="PADRE">Padre</option>
                        <option value="TUTOR">Tutor/a</option>
                        <option value="DOCENTE">Docente</option>
                        <option value="VECINO">Vecino/a</option>
                        <option value="DIRECTOR">Director/a de Institución</option>
                        <option value="TRABAJADOR_SOCIAL">Trabajador Social</option>
                        <option value="MEDICO">Médico/a</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Teléfono de Contacto</label>
                      <input
                        type="tel"
                        value={complainantPhone}
                        onChange={(e) => setComplainantPhone(e.target.value)}
                        placeholder="ej: +59123456789"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Dirección de Domicilio</label>
                    <input
                      type="text"
                      value={complainantAddress}
                      onChange={(e) => setComplainantAddress(e.target.value)}
                      placeholder="ej: Calle Bolívar #245, Barrio San Roque"
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ← Volver a Búsqueda
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--bosque-profundo)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Generando Expediente...' : 'Abrir Expediente DNA'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
