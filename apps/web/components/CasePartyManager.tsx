'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PersonDirectorySearch } from './PersonDirectorySearch';
import { Plus, User, School, Home, Users, X, Search, Shield } from 'lucide-react';

export function CasePartyManager() {
  const { register, control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parties',
  });

  // Estado para la pestaña seleccionada actualmente
  const [activeTab, setActiveTab] = useState<number>(0);

  // Escuchar los datos para actualizar los títulos de las pestañas dinámicamente
  const watchParties = watch('parties') || [];

  // Ajustar la pestaña activa si se elimina un elemento
  useEffect(() => {
    if (activeTab >= fields.length && fields.length > 0) {
      setActiveTab(fields.length - 1);
    }
  }, [fields.length, activeTab]);

  const handleSelectPerson = (index: number, person: any) => {
    if (!person) return;
    if (person.firstName) setValue(`parties.${index}.firstName`, person.firstName);
    if (person.lastName) setValue(`parties.${index}.lastName`, person.lastName);
    if (person.documentNumber) setValue(`parties.${index}.documentNumber`, person.documentNumber);
    if (person.id) setValue(`parties.${index}.personId`, person.id);
    if (person.relationship) setValue(`parties.${index}.relationship`, person.relationship);
    if (person.roleInCase) setValue(`parties.${index}.roleInCase`, person.roleInCase);
    if (person.schoolGrade) setValue(`parties.${index}.schoolGrade`, person.schoolGrade);
    if (person.schoolName) setValue(`parties.${index}.schoolName`, person.schoolName);
    if (person.livesWithDescription) setValue(`parties.${index}.livesWithDescription`, person.livesWithDescription);
  };

  const handleAddParty = () => {
    append({
      firstName: '',
      lastName: '',
      documentNumber: '',
      roleInCase: 'NNA',
      relationship: '',
      schoolGrade: '',
      schoolName: '',
      livesWithDescription: '',
    });
    setActiveTab(fields.length);
  };

  const handleRemoveParty = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    remove(index);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'var(--bosque-profundo)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: 0,
          }}
        >
          <Users size={22} color="var(--tierra-calida)" />
          Partes Involucradas en el Caso
        </h3>
      </div>

      {fields.length === 0 ? (
        /* Estado Vacío */
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--papel)',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
            No se han agregado partes involucradas al expediente.
          </p>
          <button
            type="button"
            onClick={handleAddParty}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'white',
              backgroundColor: 'var(--bosque-profundo)',
              borderRadius: 'var(--radius)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Agregar Primera Parte
          </button>
        </div>
      ) : (
        /* Vistas con Pestañas */
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--card)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Barra de Pestañas */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--papel)',
              overflowX: 'auto',
              padding: '0.375rem 0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1 }}>
              {fields.map((field, index) => {
                const currentData = watchParties[index] || {};
                const name = `${currentData.firstName || ''} ${currentData.lastName || ''}`.trim();
                const role = currentData.roleInCase || 'Parte';
                const label = name ? name : `${role} #${index + 1}`;
                const isActive = activeTab === index;

                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => setActiveTab(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 'var(--radius)',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backgroundColor: isActive ? 'var(--card)' : 'transparent',
                      color: isActive ? 'var(--bosque-profundo)' : 'var(--grafito)',
                      border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    <User size={14} color={isActive ? 'var(--bosque-profundo)' : 'var(--salvia)'} />
                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {label}
                    </span>
                    <span
                      onClick={(e) => handleRemoveParty(index, e)}
                      style={{
                        padding: '0.15rem',
                        borderRadius: '50%',
                        color: 'var(--grafito)',
                        opacity: 0.6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '0.25rem',
                        transition: 'color 0.15s ease',
                      }}
                      title="Eliminar esta parte"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'oklch(0.5 0.18 28)';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--grafito)';
                        e.currentTarget.style.opacity = '0.6';
                      }}
                    >
                      <X size={12} />
                    </span>
                  </button>
                );
              })}

              {/* Botón Más (+) */}
              <button
                type="button"
                onClick={handleAddParty}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.375rem 0.625rem',
                  color: 'var(--bosque-profundo)',
                  backgroundColor: 'var(--card)',
                  border: '1px dashed var(--salvia)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginLeft: '0.25rem',
                }}
                title="Agregar otra parte (+)"
              >
                <Plus size={14} style={{ marginRight: '0.25rem' }} /> Agregar
              </button>
            </div>
          </div>

          {/* Contenido del Formulario de la Pestaña Activa */}
          {fields.map((field, index) => {
            if (index !== activeTab) return null;

            const roleInCase = watch(`parties.${index}.roleInCase`);
            const isNNA = roleInCase === 'NNA';

            return (
              <div key={field.id} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Autocompletar */}
                <div
                  style={{
                    backgroundColor: 'var(--papel)',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--grafito)',
                      marginBottom: '0.375rem',
                    }}
                  >
                    🔍 Buscar en el registro para autocompletar datos existentes
                  </label>
                  <PersonDirectorySearch
                    onSelect={(person) => handleSelectPerson(index, person)}
                    placeholder="Escriba C.I. o nombres para buscar..."
                  />
                </div>

                {/* Campos Principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                      Rol en el Caso *
                    </label>
                    <select
                      {...register(`parties.${index}.roleInCase`)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        color: 'var(--grafito)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="NNA">VÍCTIMA (NNA)</option>
                      <option value="DENUNCIANTE">DENUNCIANTE / PROMOTOR</option>
                      <option value="DENUNCIADO">DENUNCIADO / SINDICADO</option>
                      <option value="TUTOR">TUTOR / REFERENTE</option>
                      <option value="TESTIGO">TESTIGO</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                      Nombres *
                    </label>
                    <input
                      type="text"
                      {...register(`parties.${index}.firstName`)}
                      placeholder="Nombres de la persona"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        color: 'var(--grafito)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      {...register(`parties.${index}.lastName`)}
                      placeholder="Apellidos de la persona"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        color: 'var(--grafito)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                      N° Documento / C.I.
                    </label>
                    <input
                      type="text"
                      {...register(`parties.${index}.documentNumber`)}
                      placeholder="Número de C.I. (sin extensión)"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        color: 'var(--grafito)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                      Vínculo / Parentesco
                    </label>
                    <input
                      type="text"
                      {...register(`parties.${index}.relationship`)}
                      placeholder="Ej. Padre, Madre, Padrastro, Vecino"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--card)',
                        color: 'var(--grafito)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Campos Condicionales para NNA */}
                {isNNA && (
                  <div
                    style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--bosque-profundo)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      <School size={16} color="var(--bosque-profundo)" />
                      Información Específica del NNA (Escolaridad y Domicilio)
                    </span>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: 'var(--papel)',
                        padding: '0.875rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                          Unidad Educativa / Colegio
                        </label>
                        <input
                          type="text"
                          {...register(`parties.${index}.schoolName`)}
                          placeholder="Ej. U.E. Mariscal Sucre"
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'var(--card)',
                            color: 'var(--grafito)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                          Curso / Grado Escolar
                        </label>
                        <input
                          type="text"
                          {...register(`parties.${index}.schoolGrade`)}
                          placeholder="Ej. 5to de Primaria"
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'var(--card)',
                            color: 'var(--grafito)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                          ¿Con quién vive el menor?
                        </label>
                        <input
                          type="text"
                          {...register(`parties.${index}.livesWithDescription`)}
                          placeholder="Ej. Vive con la madre y abuela materna"
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'var(--card)',
                            color: 'var(--grafito)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CasePartyManager;