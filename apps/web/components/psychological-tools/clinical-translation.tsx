'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface TranslationPair {
  id: string;
  original: string;
  translated: string;
  keyTerms?: string[];
}

interface ClinicalTranslationProps {
  caseId: string;
  translations: TranslationPair[];
}

export const ClinicalTranslation: React.FC<ClinicalTranslationProps> = ({ caseId, translations }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--salvia)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Traducción Clínica
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Conversión de Lenguaje Técnico
        </h3>
      </div>

      {/* Translations List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {translations.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--grafito)',
              opacity: 0.6,
            }}
          >
            Sin traducciones disponibles
          </div>
        ) : (
          translations.map((translation) => (
            <div
              key={translation.id}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--papel)',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Two Column Layout */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                {/* Original */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--salvia)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Original Técnico
                  </span>

                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                      color: 'var(--grafito)',
                      lineHeight: 1.5,
                      position: 'relative',
                    }}
                  >
                    {translation.original}

                    <button
                      onClick={() => handleCopy(translation.original, `orig-${translation.id}`)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'var(--salvia)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {copiedId === `orig-${translation.id}` ? (
                        <>
                          <Check size={12} />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Translated */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--salvia)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Versión Simplificada
                  </span>

                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(73, 180, 142, 0.05)',
                      borderRadius: '4px',
                      border: '1px solid rgba(73, 180, 142, 0.3)',
                      fontSize: '0.875rem',
                      color: 'var(--grafito)',
                      lineHeight: 1.5,
                      position: 'relative',
                    }}
                  >
                    {translation.translated}

                    <button
                      onClick={() => handleCopy(translation.translated, `trans-${translation.id}`)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'var(--salvia)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {copiedId === `trans-${translation.id}` ? (
                        <>
                          <Check size={12} />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Terms */}
              {translation.keyTerms && translation.keyTerms.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--amarillo)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Términos Clave
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {translation.keyTerms.map((term, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'var(--amarillo)',
                          color: 'var(--grafito)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--grafito)',
          opacity: 0.6,
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          textAlign: 'center',
        }}
      >
        Total de traducciones: {translations.length}
      </div>
    </div>
  );
};
