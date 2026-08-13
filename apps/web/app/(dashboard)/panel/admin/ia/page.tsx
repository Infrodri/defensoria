'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { BrainCircuit, Save, RefreshCw, Cpu, Volume2, Image as ImageIcon, Shield, Activity } from 'lucide-react';
export default function AiConfigPage() {
  const { user } = useAuth();
  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La configuración de los modelos de IA local (Ollama/Whisper) es exclusiva del Administrador General." />
    );
  }

  const [llmModel, setLlmModel] = useState('qwen2.5:7b');
  const [embedModel, setEmbedModel] = useState('nomic-embed-text');
  const [whisperEndpoint, setWhisperEndpoint] = useState('http://localhost:8000/v1/audio/transcriptions');
  const [whisperModel, setWhisperModel] = useState('whisper-1');
  const [ocrEndpoint, setOcrEndpoint] = useState('http://localhost:8000/v1/vision');
  const [ocrModel, setOcrModel] = useState('qwen2.5-vl:7b');
  const [serviceHealth, setServiceHealth] = useState<Record<string, 'ok' | 'degraded' | 'unknown'>>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchOllamaModels = async () => {
    setLoadingModels(true);
    try {
      const data = await fetchApi<{ models: string[] }>('/ai-config/models');
      setAvailableModels(data.models || ['qwen2.5:7b', 'nomic-embed-text']);
    } catch {
      setAvailableModels(['qwen2.5:7b', 'nomic-embed-text']);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchServiceHealth = async () => {
    try {
      const health = await fetchApi<Record<string, 'ok' | 'degraded' | 'unknown'>>('/ai-config/health');
      setServiceHealth(health);
    } catch {
      setServiceHealth({ whisper: 'degraded', ocr: 'degraded', ollama: 'degraded' });
    }
  };

  const startServices = async () => {
    try {
      await fetchApi('/ai-config/start-services', { method: 'POST' });
      setMessage({ text: 'Servicios IA iniciados. Espera unos segundos mientras se preparan.', type: 'success' });
      setTimeout(fetchServiceHealth, 5000);
    } catch (err) {
      setMessage({ text: 'Error al intentar iniciar servicios: ' + (err instanceof Error ? err.message : 'Error desconocido'), type: 'error' });
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await fetchApi<Record<string, string>>('/ai-config');
      if (settings.textModel) setLlmModel(settings.textModel);
      if (settings.embeddingModel) setEmbedModel(settings.embeddingModel);
      if (settings.whisperEndpoint) setWhisperEndpoint(settings.whisperEndpoint);
      if (settings.whisperModel) setWhisperModel(settings.whisperModel);
      if (settings.ocrEndpoint) setOcrEndpoint(settings.ocrEndpoint);
      if (settings.ocrModel) setOcrModel(settings.ocrModel);
    } catch {
      // Use defaults if settings table not seeded yet
    }
  };

  useEffect(() => {
    loadSettings();
    fetchOllamaModels();
    fetchServiceHealth();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await fetchApi('/ai-config', {
        method: 'PUT',
        body: JSON.stringify({
          textModel: llmModel,
          embeddingModel: embedModel,
          whisperEndpoint: whisperEndpoint,
          whisperModel: whisperModel,
          ocrEndpoint: ocrEndpoint,
          ocrModel: ocrModel,
        }),
      });

      setMessage({ text: '¡Configuración de IA guardada exitosamente!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al guardar la configuración', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BrainCircuit size={32} color="var(--tierra-calida)" /> Configuración de Inteligencia Artificial
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Parametrización local de motores de razonamiento jurídico, vectorización RAG y transcripción (100% soberano).
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

      {/* Service Health */}
      <section style={{
        backgroundColor: 'var(--card)',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color={serviceHealth.whisper === 'ok' ? 'var(--salvia)' : serviceHealth.whisper === 'degraded' ? 'var(--tierra-calida)' : 'var(--grafito)'} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Whisper</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: serviceHealth.whisper === 'ok' ? 'oklch(0.92 0.08 140)' : serviceHealth.whisper === 'degraded' ? 'oklch(0.92 0.08 30)' : 'oklch(0.92 0.05 60)',
            color: serviceHealth.whisper === 'ok' ? 'oklch(0.3 0.1 140)' : serviceHealth.whisper === 'degraded' ? 'oklch(0.3 0.1 30)' : 'oklch(0.3 0.1 60)',
          }}>
            {serviceHealth.whisper === 'ok' ? 'Activo' : serviceHealth.whisper === 'degraded' ? 'Degradado' : 'Sin datos'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color={serviceHealth.ocr === 'ok' ? 'var(--salvia)' : serviceHealth.ocr === 'degraded' ? 'var(--tierra-calida)' : 'var(--grafito)'} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Visión (Ollama)</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: serviceHealth.ocr === 'ok' ? 'oklch(0.92 0.08 140)' : serviceHealth.ocr === 'degraded' ? 'oklch(0.92 0.08 30)' : 'oklch(0.92 0.05 60)',
            color: serviceHealth.ocr === 'ok' ? 'oklch(0.3 0.1 140)' : serviceHealth.ocr === 'degraded' ? 'oklch(0.3 0.1 30)' : 'oklch(0.3 0.1 60)',
          }}>
            {serviceHealth.ocr === 'ok' ? 'Activo' : serviceHealth.ocr === 'degraded' ? 'Degradado' : 'Sin datos'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color={serviceHealth.ollama === 'ok' ? 'var(--salvia)' : serviceHealth.ollama === 'degraded' ? 'var(--tierra-calida)' : 'var(--grafito)'} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Ollama</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: serviceHealth.ollama === 'ok' ? 'oklch(0.92 0.08 140)' : serviceHealth.ollama === 'degraded' ? 'oklch(0.92 0.08 30)' : 'oklch(0.92 0.05 60)',
            color: serviceHealth.ollama === 'ok' ? 'oklch(0.3 0.1 140)' : serviceHealth.ollama === 'degraded' ? 'oklch(0.3 0.1 30)' : 'oklch(0.3 0.1 60)',
          }}>
            {serviceHealth.ollama === 'ok' ? 'Activo' : serviceHealth.ollama === 'degraded' ? 'Degradado' : 'Sin datos'}
          </span>
        </div>
        <button
          type="button"
          onClick={fetchServiceHealth}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--salvia)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <RefreshCw size={12} /> Refrescar
        </button>
      </section>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* LLM Card */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Cpu size={20} color="var(--salvia)" /> Modelo de Texto y Razonamiento Jurídico
            </h2>
            <button
              type="button"
              onClick={fetchOllamaModels}
              disabled={loadingModels}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--salvia)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RefreshCw size={14} className={loadingModels ? 'animate-spin' : ''} /> Detectar Ollama Local
            </button>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
            Selecciona el modelo de lenguaje que procesará las consultas del Copiloto Jurídico y redactará borradores de informes.
          </p>

          <select
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--papel)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </section>

        {/* Embeddings Card */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={20} color="var(--tierra-calida)" /> Modelo de Vectores y Embeddings (RAG)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
            Utilizado para convertir fragmentos de la Ley 548 y normativas en coordenadas matemáticas dentro de PostgreSQL (pgvector).
          </p>

          <select
            value={embedModel}
            onChange={(e) => setEmbedModel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--papel)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </section>

        {/* Whisper Card */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Volume2 size={20} color="var(--bosque-profundo)" /> Endpoint Transcripción de Audio (Whisper)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
            URL del microservicio o contenedor Docker local que convierte audios de entrevistas a texto.
          </p>

          <input
            type="text"
            value={whisperEndpoint}
            onChange={(e) => setWhisperEndpoint(e.target.value)}
            placeholder="http://localhost:8000/v1/audio/transcriptions"
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--papel)',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </section>

        {/* Vision Card */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ImageIcon size={20} color="var(--tierra-calida)" /> Modelo de Visión (Ollama)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
            Selecciona el modelo visual que analizará imágenes y documentos escaneados.
          </p>

          <select
            value={ocrModel}
            onChange={(e) => setOcrModel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--papel)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <option value="">-- Ninguno (Desactivar) --</option>
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Preferencias de IA'}
          </button>
        </div>
      </form>
    </div>
  );
}
