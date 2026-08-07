'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Search, UserPlus, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AudioRecorder } from '@/components/audio-recorder';

export default function InicioCasoPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Catalogs State
  const [caseTypeCatalog, setCaseTypeCatalog] = useState<any>(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [offices, setOffices] = useState<any[]>([]);

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
  const [nnaBirthDate, setNnaBirthDate] = useState('');
  const [nnaCity, setNnaCity] = useState('');
  const [nnaPhone, setNnaPhone] = useState('');
  const [nnaAddress, setNnaAddress] = useState('');

   // Case Details
  const [caseType, setCaseType] = useState('');
  const [intakeNarrative, setIntakeNarrative] = useState('');
  const [secretariaTomaNarrativa, setSecretariaTomaNarrativa] = useState(true);
  
   // Tipo de Solicitud / Atención — determina el flujo (denuncia vs. trámite admin)
   const [requestType, setRequestType] = useState<'DENUNCIA' | 'PERMISO_VIAJE' | 'NNATS' | 'OPERATIVO'>('DENUNCIA');

   // Auditoría normativa (Ley 548 / OM 136)
   const [district, setDistrict] = useState('');
   const [aggressorUnknown, setAggressorUnknown] = useState(false);
  
  // Audio Recording
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Third Party Complainant
  const [isThirdPartyComplainant, setIsThirdPartyComplainant] = useState(false);
  const [complainantFullName, setComplainantFullName] = useState('');
  const [complainantDocumentId, setComplainantDocumentId] = useState('');
  const [complainantRelation, setComplainantRelation] = useState('MADRE');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');

  const [complainantSearchQuery, setComplainantSearchQuery] = useState('');
  const [complainantSearchResults, setComplainantSearchResults] = useState<any[]>([]);
  const [complainantSearching, setComplainantSearching] = useState(false);
  const [complainantSearchExecuted, setComplainantSearchExecuted] = useState(false);
  const [complainantFromExisting, setComplainantFromExisting] = useState(false);

  // Banderas de situación especial de la denuncia (CreateCaseDto Fase 2)
  const [menorAutodenuncia, setMenorAutodenuncia] = useState(false);
  const [denunciaAnonima, setDenunciaAnonima] = useState(false);
  const [involucraFuncionario, setInvolucraFuncionario] = useState(false);

  // Persona Denunciada (opcional — accusedId del CreateCaseDto)
  const [accusedQuery, setAccusedQuery] = useState('');
  const [accusedResults, setAccusedResults] = useState<any[]>([]);
  const [accusedSearching, setAccusedSearching] = useState(false);
  const [accusedSearched, setAccusedSearched] = useState(false);
  const [selectedAccused, setSelectedAccused] = useState<any | null>(null);
  
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

        const officesList = await fetchApi('/offices').catch(() => []);
        setOffices(Array.isArray(officesList) ? officesList : []);
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

  // Búsqueda opcional de la persona denunciada (accusedId)
  const handleSearchAccused = async () => {
    if (!accusedQuery.trim()) return;
    setAccusedSearching(true);
    setAccusedSearched(true);
    try {
      const results = await fetchApi(`/persons/search?query=${encodeURIComponent(accusedQuery)}`);
      setAccusedResults(results);
    } catch (err: any) {
      setAccusedResults([]);
    } finally {
      setAccusedSearching(false);
    }
  };

  const handleSearchComplainant = async () => {
    if (!complainantSearchQuery.trim()) return;
    setComplainantSearching(true);
    setComplainantSearchExecuted(true);
    try {
      const results = await fetchApi(`/persons/search?query=${encodeURIComponent(complainantSearchQuery)}`);
      setComplainantSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setComplainantSearchResults([]);
    } finally {
      setComplainantSearching(false);
    }
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
      // Decision: for administrative procedures the caseType IS the requestType
      // (e.g. PERMISO_VIAJE, NNATS, OPERATIVO). For standard DENUNCIA flows the
      // caseType comes from the catalog dropdown selection.
      const effectiveCaseType = requestType !== 'DENUNCIA' ? requestType : caseType;
      const isAdministrative = requestType !== 'DENUNCIA';

      const casePayload: any = {
        nnaId: finalNnaId,
        caseType: effectiveCaseType,
        intakeNarrative: intakeNarrative || undefined,
        // Campos específicos de denuncia: se envían como falsos/undefined para
        // trámites administrativos (no aplican, pero el DTO los acepta).
        isThirdPartyComplainant: isAdministrative ? false : isThirdPartyComplainant,
        menorAutodenuncia: isAdministrative ? false : menorAutodenuncia,
        denunciaAnonima: isAdministrative ? false : denunciaAnonima,
        involucraFuncionario: isAdministrative ? false : involucraFuncionario,
        // Persona denunciada (opcional)
        accusedId: selectedAccused?.id || undefined,
        // Datos demográficos NNA
        nnaBirthDate: nnaBirthDate || undefined,
        nnaGender: nnaGender || undefined,
        nnaCity: nnaCity || undefined,
         nnaPhone: nnaPhone || undefined,
         nnaAddress: nnaAddress || undefined,
         // Auditoría normativa (Ley 548 / OM 136)
         district: district || undefined,
         aggressorUnknown: aggressorUnknown,
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

      // Upload audio if recorded — usar fetch directo para que el browser
      // pueda poner el Content-Type multipart/form-data con boundary correcto.
      // fetchApi fuerza Content-Type: application/json y rompe el FormData.
      if (recordedAudio && recordingDuration > 0) {
        try {
          const formData = new FormData();
          const ext = recordedAudio.type.includes('mp4') ? 'm4a' : 'webm';
          formData.append('file', recordedAudio, `entrevista-inicial-${Date.now()}.${ext}`);
          formData.append('caseId', newCase.id);
          formData.append('isSensitive', 'false');
          formData.append(
            'description',
            `Grabación de entrevista inicial (${Math.floor(recordingDuration / 60)}:${String(recordingDuration % 60).padStart(2, '0')})`,
          );

          const token = typeof window !== 'undefined' ? localStorage.getItem('dna_token') : null;
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

          const uploadRes = await fetch(`${apiBase}/evidences/upload`, {
            method: 'POST',
            headers: {
              // NO Content-Type — el browser lo pone solo con el boundary correcto
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            throw new Error(errData.message || `Upload error ${uploadRes.status}`);
          }

          console.log('Audio uploaded successfully as evidence');
        } catch (audioErr: any) {
          console.warn('Audio upload failed but case was created:', audioErr);
          // No lanzar error — el caso ya fue creado exitosamente
        }
      }

      // NO crear cita automática — la secretaria asigna citas manualmente desde Agenda y Citas

      // Redirección según tipo de solicitud:
      // - Denuncia: flujo actual (expediente en pestaña de resumen)
      // - Trámites administrativos: abrir pestaña "Trámites Especiales" con la
      //   sub-pestaña correspondiente preseleccionada
      if (requestType === 'DENUNCIA') {
        router.push(`/casos/${newCase.id}`);
      } else if (requestType === 'PERMISO_VIAJE') {
        router.push(`/casos/${newCase.id}?tab=tramites&subtab=permiso-viaje`);
      } else if (requestType === 'NNATS') {
        router.push(`/casos/${newCase.id}?tab=tramites&subtab=nnats`);
      } else {
        // OPERATIVO — abrir pestaña de trámites sin subtab específica
        router.push(`/casos/${newCase.id}?tab=tramites`);
      }
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
          Primera Recepción e Inicio de Caso
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={nnaBirthDate}
                    onChange={(e) => setNnaBirthDate(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Ciudad</label>
                  <input
                    type="text"
                    value={nnaCity}
                    onChange={(e) => setNnaCity(e.target.value)}
                    placeholder="ej: Sucre"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Teléfono de Contacto</label>
                  <input
                    type="tel"
                    value={nnaPhone}
                    onChange={(e) => setNnaPhone(e.target.value)}
                    placeholder="ej: 71234501"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Dirección</label>
                  <input
                    type="text"
                    value={nnaAddress}
                    onChange={(e) => setNnaAddress(e.target.value)}
                    placeholder="ej: Calle Bolívar #245, Barrio San Roque"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>
              </div>
            </div>
          )}

           {/* Selector de Tipo de Solicitud / Atención */}
           <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
               Tipo de Solicitud / Atención
             </label>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
               {[
                 { value: 'DENUNCIA' as const, emoji: '🚨', label: 'Denuncia de Vulneración / Delito' },
                 { value: 'PERMISO_VIAJE' as const, emoji: '✈️', label: 'Solicitud de Permiso de Viaje' },
                 { value: 'NNATS' as const, emoji: '💼', label: 'Registro / Autorización de Trabajo Adolescente (NNATS)' },
                 { value: 'OPERATIVO' as const, emoji: '🔍', label: 'Operativo / Inspección Territorial' },
               ].map((opt) => (
                 <button
                   key={opt.value}
                   type="button"
                   onClick={() => {
                     setRequestType(opt.value);
                     if (opt.value !== 'DENUNCIA') {
                       setCaseType('DENUNCIA_VULNERACION');
                     }
                   }}
                   style={{
                     padding: '0.75rem',
                     border: requestType === opt.value
                       ? '2px solid var(--bosque-profundo)'
                       : '1px solid var(--border)',
                     borderRadius: 'var(--radius)',
                     backgroundColor: requestType === opt.value ? 'var(--papel)' : 'var(--card)',
                     textAlign: 'center',
                     cursor: 'pointer',
                   }}
                 >
                   <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{opt.emoji}</div>
                   <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                     {opt.label}
                   </div>
                 </button>
               ))}
             </div>
           </div>

            {/* Selector de Distrito de Origen (Ley 548 / OM 136) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Distrito de Origen
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              >
                <option value="">Seleccionar distrito u oficina...</option>
                {offices.map((office: any) => (
                  <option key={office.id} value={office.id}>
                    {office.name} {office.code ? `(${office.code})` : ''}
                  </option>
                ))}
                {offices.length === 0 && (
                  <option value="" disabled>Cargando oficinas...</option>
                )}
              </select>
            </div>

            {/* Case Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Tipo de Trámite / Caso — solo para denuncias */}
              {requestType === 'DENUNCIA' ? (
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
             ) : (
               <div style={{ padding: '0.75rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                 <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)' }}>
                   Tipo de Caso: DENUNCIA_VULNERACION (contenedor — el trámite se gestiona en la pestaña de Trámites Especiales)
                 </div>
               </div>
             )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', padding: '0.625rem 0.75rem', backgroundColor: 'oklch(0.97 0.02 85)', borderRadius: 'var(--radius)', border: '1px solid oklch(0.88 0.05 85)' }}>
                <input
                  type="checkbox"
                  id="secretariaTomaNarrativa"
                  checked={secretariaTomaNarrativa}
                  onChange={(e) => setSecretariaTomaNarrativa(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="secretariaTomaNarrativa" style={{ fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: 'var(--bosque-profundo)' }}>
                  La secretaría recibe y registra la narrativa ahora
                </label>
              </div>
              {!secretariaTomaNarrativa && (
                <p style={{ fontSize: '0.75rem', color: 'var(--tierra-calida)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ⚠️ La narrativa será completada por el profesional desde la Bitácora del expediente una vez asignado el equipo.
                </p>
              )}
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                {requestType === 'DENUNCIA' ? 'Narrativa Inicial / Hechos de la Denuncia' : 'Observaciones / Detalles del Trámite'}
              </label>
              <textarea
                rows={5}
                value={intakeNarrative}
                onChange={(e) => setIntakeNarrative(e.target.value)}
                placeholder={requestType === 'DENUNCIA' ? 'Describa objetivamente los hechos reportados durante la primera recepción...' : 'Ingrese observaciones o detalles relevantes para este trámite...'}
                required={secretariaTomaNarrativa}
                disabled={!secretariaTomaNarrativa}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', opacity: secretariaTomaNarrativa ? 1 : 0.5 }}
              />
            </div>

            {/* Audio Recording Optional */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Grabar Primera Entrevista (Opcional)</label>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                Si graba audio, debe confirmar la grabación para que se incluya automáticamente como evidencia del expediente.
              </p>
              <AudioRecorder 
                onRecordingComplete={(blob, duration) => {
                  setRecordedAudio(blob);
                  setRecordingDuration(duration);
                  console.log('Recording completed and ready for upload:', blob.size, 'bytes');
                }}
              />
              {recordedAudio && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'oklch(0.96 0.02 165)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--bosque-profundo)' }}>
                  ✅ Grabación confirmada: {(recordedAudio.size / 1024).toFixed(1)} KB · Se subirá automáticamente como evidencia
                </div>
              )}
            </div>

            {/* Denunciante / Third Party Section — solo para denuncias */}
            {requestType === 'DENUNCIA' && (
            <>
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
                  {/* Búsqueda de denunciante en registros anteriores */}
                  <div style={{ padding: '0.75rem', backgroundColor: 'oklch(0.97 0.02 200)', borderRadius: 'var(--radius)', border: '1px solid oklch(0.88 0.04 200)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
                      🔍 Buscar denunciante en registros anteriores
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={complainantSearchQuery}
                        onChange={(e) => setComplainantSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchComplainant())}
                        placeholder="Buscar por CI, nombre o apellido..."
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleSearchComplainant}
                        disabled={complainantSearching}
                        style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        {complainantSearching ? 'Buscando...' : 'Buscar'}
                      </button>
                    </div>

                    {complainantSearchExecuted && complainantSearchResults.length > 0 && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {complainantSearchResults.map((p: any) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.8125rem' }}>
                            <span>{p.firstName} {p.lastName} — CI: {p.documentNumber || 'S/D'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setComplainantFullName(`${p.firstName} ${p.lastName}`);
                                setComplainantDocumentId(p.documentNumber || '');
                                setComplainantPhone(p.phone || '');
                                setComplainantAddress(p.address || '');
                                setComplainantFromExisting(true);
                                setComplainantSearchResults([]);
                                setComplainantSearchExecuted(false);
                              }}
                              style={{ padding: '0.25rem 0.625rem', backgroundColor: 'var(--salvia)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Seleccionar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {complainantSearchExecuted && complainantSearchResults.length === 0 && !complainantSearching && (
                      <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.375rem' }}>No se encontraron registros. Complete los datos manualmente.</p>
                    )}

                    {complainantFromExisting && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--salvia)', marginTop: '0.375rem', fontWeight: 600 }}>✅ Datos cargados desde registro existente. Podés editarlos si cambiaron.</p>
                    )}
                  </div>

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

            {/* Banderas de situación especial de la denuncia */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>
                Situación Especial de la Denuncia
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={menorAutodenuncia}
                    onChange={(e) => setMenorAutodenuncia(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                  />
                  El NNA se autodenunció
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={denunciaAnonima}
                    onChange={(e) => setDenunciaAnonima(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                  />
                  Denuncia anónima
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={involucraFuncionario}
                    onChange={(e) => setInvolucraFuncionario(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                  />
                  Involucra a un funcionario público
                </label>
              </div>
            </div>

             {/* Persona Denunciada (opcional) */}
             <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
               <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
                 Persona Denunciada <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.7 }}>(opcional)</span>
               </div>

               {/* SE DESCONOCE checkbox */}
               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                   <input
                     type="checkbox"
                     checked={aggressorUnknown}
                     onChange={(e) => {
                       setAggressorUnknown(e.target.checked);
                       if (e.target.checked) {
                         setSelectedAccused(null);
                         setAccusedQuery('');
                         setAccusedResults([]);
                         setAccusedSearched(false);
                       }
                     }}
                     style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                   />
                   SE DESCONOCE
                 </label>
               </div>

                {!selectedAccused ? (
                 <>
                   <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                     <input
                       type="text"
                       value={accusedQuery}
                       onChange={(e) => setAccusedQuery(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           handleSearchAccused();
                         }
                       }}
                       placeholder="Buscar por nombre o documento del denunciado..."
                       disabled={aggressorUnknown}
                       style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', opacity: aggressorUnknown ? 0.5 : 1 }}
                     />
                     <button
                       type="button"
                       onClick={handleSearchAccused}
                       disabled={accusedSearching || aggressorUnknown}
                       style={{
                         backgroundColor: aggressorUnknown ? 'var(--border)' : 'var(--bosque-profundo)',
                         color: 'white',
                         padding: '0.5rem 1rem',
                         borderRadius: 'var(--radius)',
                         fontWeight: 600,
                         border: 'none',
                         cursor: aggressorUnknown ? 'not-allowed' : 'pointer',
                         fontSize: '0.875rem',
                         opacity: aggressorUnknown ? 0.6 : 1,
                       }}
                     >
                       {accusedSearching ? 'Buscando...' : 'Buscar'}
                     </button>
                   </div>

                  {accusedSearched && accusedResults.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {accusedResults.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            padding: '0.625rem 0.875rem',
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {p.firstName} {p.lastName}
                            <span style={{ fontWeight: 400, opacity: 0.7 }}> · {p.documentNumber || 'SIN DOCUMENTO'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedAccused(p)}
                            style={{
                              backgroundColor: 'var(--salvia)',
                              color: 'white',
                              border: 'none',
                              padding: '0.375rem 0.75rem',
                              borderRadius: 'var(--radius)',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Seleccionar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {accusedSearched && accusedResults.length === 0 && (
                    <p style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                      Sin resultados. Puede dejar vacío y registrar al denunciado más adelante.
                    </p>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', backgroundColor: 'var(--card)', border: '1px solid var(--salvia)', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    ✅ {selectedAccused.firstName} {selectedAccused.lastName}
                    <span style={{ fontWeight: 400, opacity: 0.7 }}> · {selectedAccused.documentNumber || 'SIN DOCUMENTO'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAccused(null);
                      setAccusedResults([]);
                      setAccusedSearched(false);
                    }}
                    style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
            </>
            )}

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
                disabled={submitting || !caseType || (requestType === 'DENUNCIA' && !intakeNarrative)}
                style={{
                  backgroundColor: (caseType && (requestType !== 'DENUNCIA' || intakeNarrative)) ? 'var(--bosque-profundo)' : 'var(--border)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  cursor: (caseType && (requestType !== 'DENUNCIA' || intakeNarrative)) ? 'pointer' : 'not-allowed',
                  opacity: (caseType && (requestType !== 'DENUNCIA' || intakeNarrative)) ? 1 : 0.6,
                }}
              >
                {submitting ? 'Creando Expediente...' : '✅ Completar y Crear Expediente'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
