'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { RoleInCase, CaseType, IntakeChannel, IncidentFrequency } from '@defensoria/shared';
import { CasePartyManager } from '@/components/CasePartyManager';
import { AudioRecorder } from '@/components/audio-recorder';
import {
  Search,
  FileText,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

// Zod schema for an individual party in a case
const partyFormSchema = z.object({
  personId: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  documentNumber: z.string().optional(),
  roleInCase: z.nativeEnum(RoleInCase),
  relationship: z.string().optional(),
  schoolGrade: z.string().optional(),
  schoolName: z.string().optional(),
  livesWithDescription: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

// Zod schema for the case intake form
const intakeCaseSchema = z
  .object({
    caseType: z.nativeEnum(CaseType),
    requestType: z.enum(['DENUNCIA', 'PERMISO_VIAJE', 'NNATS', 'OPERATIVO']).default('DENUNCIA'),
    district: z.string().optional(),
    intakeNarrative: z.string().optional(),
    secretariaTomaNarrativa: z.boolean().default(true),
    menorAutodenuncia: z.boolean().default(false),
    denunciaAnonima: z.boolean().default(false),
    involucraFuncionario: z.boolean().default(false),
    // SINNA normative fields
    intakeChannel: z.nativeEnum(IntakeChannel).default(IntakeChannel.DIRECTO),
    isUrgent: z.boolean().default(false),
    hasVisibleInjuries: z.boolean().default(false),
    incidentFrequency: z.nativeEnum(IncidentFrequency).default(IncidentFrequency.PRIMERA_VEZ),
    parties: z
      .array(partyFormSchema)
      .min(1, 'Debe incluir al menos una parte involucrada')
      .refine((parties) => parties.some((p) => p.roleInCase === RoleInCase.NNA), {
        message: 'Debe incluir al menos un NNA en las partes del caso',
      }),
  })
  .superRefine((data, ctx) => {
    if (!data.menorAutodenuncia && !data.denunciaAnonima) {
      const hasComplainant = data.parties.some((p) => p.roleInCase === RoleInCase.DENUNCIANTE);
      if (!hasComplainant) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debe incluir al menos un Denunciante en las partes del caso (o activar Autodenuncia / Denuncia Anónima)',
          path: ['parties'],
        });
      }
    }
  });

type IntakeCaseFormValues = z.infer<typeof intakeCaseSchema>;

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

  // Audio Recording State
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Form Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize react-hook-form with Zod validation
  const methods = useForm<IntakeCaseFormValues>({
    resolver: zodResolver(intakeCaseSchema),
    defaultValues: {
      caseType: CaseType.DENUNCIA_VULNERACION,
      requestType: 'DENUNCIA',
      district: '',
      intakeNarrative: '',
      secretariaTomaNarrativa: true,
      menorAutodenuncia: false,
      denunciaAnonima: false,
      involucraFuncionario: false,
      intakeChannel: IntakeChannel.DIRECTO,
      isUrgent: false,
      hasVisibleInjuries: false,
      incidentFrequency: IncidentFrequency.PRIMERA_VEZ,
      parties: [
        {
          firstName: '',
          lastName: '',
          documentNumber: '',
          roleInCase: RoleInCase.NNA,
          relationship: '',
          schoolGrade: '',
          schoolName: '',
          livesWithDescription: '',
          isPrimary: true,
        },
      ],
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const requestType = watch('requestType');
  const caseType = watch('caseType');
  const secretariaTomaNarrativa = watch('secretariaTomaNarrativa');

  // Load catalogs on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const catalog = await fetchApi('/catalogs/CASE_TYPES');
        setCaseTypeCatalog(catalog);

        if (catalog?.items && catalog.items.length > 0) {
          setValue('caseType', catalog.items[0].value);
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
  }, [setValue]);

  // Handle Step 1 Anti-Duplication Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchExecuted(true);
    try {
      const results = await fetchApi(`/persons/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Select existing NNA in Step 1
  const handleSelectExistingPerson = (person: any) => {
    const currentParties = methods.getValues('parties') || [];
    const nnaParty = {
      personId: person.id,
      firstName: person.firstName || '',
      lastName: person.lastName || '',
      documentNumber: person.documentNumber || '',
      roleInCase: RoleInCase.NNA,
      relationship: '',
      schoolGrade: '',
      schoolName: '',
      livesWithDescription: '',
      isPrimary: true,
    };

    if (currentParties.length > 0) {
      currentParties[0] = nnaParty;
      setValue('parties', currentParties);
    } else {
      setValue('parties', [nnaParty]);
    }
    setStep(2);
  };

  // Start registration for new NNA in Step 1
  const handleStartNewPersonRegistration = () => {
    let firstName = '';
    let lastName = '';
    let docNumber = '';

    const queryTrimmed = searchQuery.trim();
    if (!isNaN(Number(queryTrimmed)) && queryTrimmed.length > 0) {
      docNumber = queryTrimmed;
    } else if (queryTrimmed) {
      const parts = queryTrimmed.split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const currentParties = methods.getValues('parties') || [];
    const nnaParty = {
      firstName,
      lastName,
      documentNumber: docNumber,
      roleInCase: RoleInCase.NNA,
      relationship: '',
      schoolGrade: '',
      schoolName: '',
      livesWithDescription: '',
      isPrimary: true,
    };

    if (currentParties.length > 0) {
      currentParties[0] = nnaParty;
      setValue('parties', currentParties);
    } else {
      setValue('parties', [nnaParty]);
    }
    setStep(2);
  };

  // Submit intake form data
  const onSubmit = async (values: IntakeCaseFormValues) => {
    setError(null);
    setSubmitting(true);

    try {
      const effectiveCaseType = values.requestType !== 'DENUNCIA' ? CaseType.DENUNCIA_VULNERACION : values.caseType;

      const casePayload = {
        caseType: effectiveCaseType,
        intakeNarrative: values.intakeNarrative || undefined,
        menorAutodenuncia: values.requestType !== 'DENUNCIA' ? false : values.menorAutodenuncia,
        denunciaAnonima: values.requestType !== 'DENUNCIA' ? false : values.denunciaAnonima,
        involucraFuncionario: values.requestType !== 'DENUNCIA' ? false : values.involucraFuncionario,
        district: values.district || undefined,
        intakeChannel: values.intakeChannel,
        isUrgent: values.isUrgent,
        hasVisibleInjuries: values.hasVisibleInjuries,
        incidentFrequency: values.incidentFrequency,
        parties: values.parties.map((party) => ({
          personId: party.personId || undefined,
          firstName: party.firstName?.trim() || undefined,
          lastName: party.lastName?.trim() || undefined,
          documentNumber: party.documentNumber?.trim() || undefined,
          roleInCase: party.roleInCase,
          isPrimary: party.isPrimary ?? (party.roleInCase === RoleInCase.NNA),
          relationship: party.relationship?.trim() || undefined,
          schoolGrade: party.schoolGrade?.trim() || undefined,
          schoolName: party.schoolName?.trim() || undefined,
          livesWithDescription: party.livesWithDescription?.trim() || undefined,
        })),
      };

      const newCase = await fetchApi('/cases', {
        method: 'POST',
        body: JSON.stringify(casePayload),
      });

      // Upload recorded audio evidence if provided
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
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            throw new Error(errData.message || `Upload error ${uploadRes.status}`);
          }
        } catch (audioErr: any) {
          console.warn('Audio upload failed but case was created:', audioErr);
        }
      }

      if (values.requestType === 'DENUNCIA') {
        router.push(`/casos/${newCase.id}`);
      } else if (values.requestType === 'PERMISO_VIAJE') {
        router.push(`/casos/${newCase.id}?tab=tramites&subtab=permiso-viaje`);
      } else if (values.requestType === 'NNATS') {
        router.push(`/casos/${newCase.id}?tab=tramites&subtab=nnats`);
      } else {
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
            Antes de abrir un expediente nuevo, es <strong>obligatorio</strong> buscar si el NNA o su familia ya tienen registros previos en el sistema para no revictimizar ni duplicar información.
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
                    Sin antecedente encontrado para &quot;{searchQuery}&quot;
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
                    Se confirmó en auditoría que no existe registro previo de este NNA. Puedes proceder con el registro de un nuevo titular.
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
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              backgroundColor: 'var(--card)',
              padding: '2rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
              Registro de Datos del Expediente y Partes Involucradas
            </h2>

            {error && (
              <div style={{ backgroundColor: 'oklch(0.95 0.05 28)', color: 'var(--riesgo-alto)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {errors.parties && (
              <div style={{ backgroundColor: 'oklch(0.95 0.05 28)', color: 'var(--riesgo-alto)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                {errors.parties.root?.message || errors.parties.message || 'Por favor verifique las partes involucradas. Se requiere al menos un NNA y un Denunciante.'}
              </div>
            )}

            {/* Request Type Selector */}
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
                      setValue('requestType', opt.value);
                      if (opt.value !== 'DENUNCIA') {
                        setValue('caseType', CaseType.DENUNCIA_VULNERACION);
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

            {/* District Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Distrito de Origen
              </label>
              <select
                {...register('district')}
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

            {/* SINNA Normative Fields Block */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
                Datos Normativos SINNA (Canal, Urgencia y Reincidencia)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Intake Channel */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Canal de Ingreso (SINNA) *
                  </label>
                  <select
                    {...register('intakeChannel')}
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value={IntakeChannel.DIRECTO}>Directo / Recepción DNA</option>
                    <option value={IntakeChannel.FISCALIA}>Fiscalía General del Estado</option>
                    <option value={IntakeChannel.FELCV}>FELCV (Fuerza Especial Lucha Contra la Violencia)</option>
                    <option value={IntakeChannel.FELCC}>FELCC (Fuerza Especial Lucha Contra el Crimen)</option>
                    <option value={IntakeChannel.JUZGADO}>Juzgado de Niñez y Adolescencia / Público</option>
                    <option value={IntakeChannel.UNIDAD_EDUCATIVA}>Unidad Educativa / Colegio</option>
                    <option value={IntakeChannel.CENTRO_SALUD}>Centro de Salud / Hospital</option>
                    <option value={IntakeChannel.SEDEGES}>SEDEGES</option>
                    <option value={IntakeChannel.SLIM}>SLIM (Servicio Legal Integral Municipal)</option>
                    <option value={IntakeChannel.OTRA_DEFENSORIA}>Otra Defensoría</option>
                    <option value={IntakeChannel.OTRO}>Otro Canal</option>
                  </select>
                </div>

                {/* Incident Frequency */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Frecuencia del Incidente *
                  </label>
                  <select
                    {...register('incidentFrequency')}
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value={IncidentFrequency.PRIMERA_VEZ}>Primera Vez</option>
                    <option value={IncidentFrequency.REINCIDENCIA_NO_DENUNCIADA}>Reincidencia No Denunciada Previamente</option>
                    <option value={IncidentFrequency.REINCIDENCIA_DENUNCIADA}>Reincidencia Denunciada Previamente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    {...register('isUrgent')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--riesgo-alto)' }}
                  />
                  <span>🚨 Riesgo Inminente (Atención Urgente)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    {...register('hasVisibleInjuries')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--riesgo-alto)' }}
                  />
                  <span>🩹 Daños Visibles / Lesiones Físicas</span>
                </label>
              </div>
            </div>

            {/* Case Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {requestType === 'DENUNCIA' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Tipo de Trámite / Caso</label>
                  {catalogsLoading ? (
                    <div style={{ padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--grafito)', opacity: 0.6 }}>
                      Cargando tipos de caso...
                    </div>
                  ) : (
                    <select
                      {...register('caseType')}
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
                    {...register('secretariaTomaNarrativa')}
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
                  {...register('intakeNarrative')}
                  placeholder={requestType === 'DENUNCIA' ? 'Describa objetivamente los hechos reportados durante la primera recepción...' : 'Ingrese observaciones o detalles relevantes para este trámite...'}
                  disabled={!secretariaTomaNarrativa}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', opacity: secretariaTomaNarrativa ? 1 : 0.5 }}
                />
              </div>

              {/* Audio Recording Optional */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Grabar Primera Entrevista (Opcional)</label>
                  {!secretariaTomaNarrativa && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--salvia)', fontWeight: 600 }}>
                      💡 Puedes grabar aunque no tomes la narrativa escrita
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                  Si graba audio, debe confirmar la grabación para que se incluya automáticamente como evidencia del expediente.
                </p>
                <AudioRecorder 
                  onRecordingComplete={(blob, duration) => {
                    setRecordedAudio(blob);
                    setRecordingDuration(duration);
                  }}
                />
                {recordedAudio && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'oklch(0.96 0.02 165)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--bosque-profundo)' }}>
                    ✅ Grabación confirmada: {(recordedAudio.size / 1024).toFixed(1)} KB · Se subirá automáticamente como evidencia
                  </div>
                )}
              </div>

              {/* Case Party Manager Integration */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <CasePartyManager />
              </div>

              {/* Special Complaint Conditions */}
              {requestType === 'DENUNCIA' && (
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>
                    Situación Especial de la Denuncia
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        {...register('menorAutodenuncia')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                      />
                      El NNA se autodenunció
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        {...register('denunciaAnonima')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                      />
                      Denuncia anónima
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        {...register('involucraFuncionario')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--salvia)' }}
                      />
                      Involucra a un funcionario público
                    </label>
                  </div>
                </div>
              )}

              {/* Form Navigation Actions */}
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
                  disabled={submitting || !caseType}
                  style={{
                    backgroundColor: caseType ? 'var(--bosque-profundo)' : 'var(--border)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    cursor: caseType ? 'pointer' : 'not-allowed',
                    opacity: caseType ? 1 : 0.6,
                  }}
                >
                  {submitting ? 'Creando Expediente...' : '✅ Completar y Crear Expediente'}
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
