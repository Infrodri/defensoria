'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Bot, Copy, RefreshCw, AlertTriangle, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function AiCopilot({ context, isLegalRole }: { context: string; isLegalRole: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [riskAnalysis, setRiskAnalysis] = useState('');

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/ai/draft-legal-document', {
        method: 'POST',
        body: JSON.stringify({ context }),
      });
      setDraft(res.draft);
      toast.success('Borrador generado por IA local.');
    } catch (error: any) {
      toast.error('Error al generar borrador', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRisk = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/ai/analyze-risk', {
        method: 'POST',
        body: JSON.stringify({ narrative: context }),
      });
      setRiskAnalysis(res.analysis);
      toast.success('Análisis de riesgo generado por IA local.');
    } catch (error: any) {
      toast.error('Error al analizar riesgo', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--bosque-profundo)',
          color: 'var(--papel)',
          border: 'none',
          borderRadius: '50%',
          width: '3.5rem',
          height: '3.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 50,
        }}
        title="Copiloto Legal (IA Local)"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bosque-profundo)',
        color: 'var(--papel)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Bot size={20} />
          <span>Copiloto de IA Local</span>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--papel)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {isLegalRole && (
            <button
              onClick={handleGenerateDraft}
              disabled={loading}
              style={{
                flex: 1, padding: '0.5rem', backgroundColor: 'var(--salvia)', color: 'white',
                border: 'none', borderRadius: 'var(--radius)', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600
              }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
              Redactar Memorial
            </button>
          )}
          <button
            onClick={handleAnalyzeRisk}
            disabled={loading}
            style={{
              flex: 1, padding: '0.5rem', backgroundColor: 'var(--tierra-calida)', color: 'white',
              border: 'none', borderRadius: 'var(--radius)', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600
            }}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            Evaluar Riesgo
          </button>
        </div>

        {draft && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Borrador Sugerido:</h4>
              <button onClick={() => copyToClipboard(draft)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bosque-profundo)' }}>
                <Copy size={16} />
              </button>
            </div>
            <pre style={{
              padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
              borderLeft: '4px solid var(--salvia)'
            }}>
              {draft}
            </pre>
          </div>
        )}

        {riskAnalysis && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Indicadores de Riesgo:</h4>
              <button onClick={() => copyToClipboard(riskAnalysis)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bosque-profundo)' }}>
                <Copy size={16} />
              </button>
            </div>
            <pre style={{
              padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
              borderLeft: '4px solid var(--tierra-calida)'
            }}>
              {riskAnalysis}
            </pre>
          </div>
        )}
      </div>

      <div style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.8, textAlign: 'center' }}>
        Resultados generados por IA. Toda información debe ser verificada y validada por el profesional a cargo.
      </div>
    </div>
  );
}
