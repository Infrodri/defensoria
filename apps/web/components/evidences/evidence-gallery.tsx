'use client';

import React, { useState, useEffect } from 'react';
import { Upload, File, Lock, X, Play, FileText, Image as ImageIcon, Music, Video, Shield, FileText as TranscriptionIcon } from 'lucide-react';
import { SecurityTokenModal } from '../security/security-token-modal';
import { fetchApi } from '@/lib/api';

interface EvidenceGalleryProps {
  caseId: string;
  evidences: any[];
  onEvidenceUploaded: () => void;
  canUpload?: boolean; // solo profesionales asignados
}

// ─── Utilidades de tipo de archivo ────────────────────────────────────────────

function getMimeCategory(mimeType: string): 'audio' | 'video' | 'image' | 'document' {
  if (!mimeType) return 'document';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  return 'document';
}

function getFileIcon(mimeType: string) {
  const cat = getMimeCategory(mimeType);
  const size = 20;
  if (cat === 'audio')    return <Music  size={size} color="#6366F1" />;
  if (cat === 'video')    return <Video  size={size} color="#EF4444" />;
  if (cat === 'image')    return <ImageIcon size={size} color="#F59E0B" />;
  return                         <FileText size={size} color="var(--bosque-profundo)" />;
}

function getCategoryLabel(mimeType: string) {
  const cat = getMimeCategory(mimeType);
  return { audio: '🎙️ Audio', video: '🎥 Video', image: '🖼️ Imagen', document: '📄 Documento' }[cat];
}

// ─── Modal Visor Flotante ──────────────────────────────────────────────────────

interface ViewerModalProps {
  evidence: any;
  streamUrl: string;
  onClose: () => void;
}

function ViewerModal({ evidence, streamUrl, onClose }: ViewerModalProps) {
  const cat = getMimeCategory(evidence.mimeType);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
        padding: '1.5rem',
      }}
    >
      <div style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '2px solid var(--border)',
        width: '100%',
        maxWidth: cat === 'document' ? '700px' : '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bosque-profundo)',
          color: 'white',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            {getFileIcon(evidence.mimeType)}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {evidence.fileName}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.125rem' }}>
                {getCategoryLabel(evidence.mimeType)} · {(evidence.fileSize / (1024 * 1024)).toFixed(2)} MB
                {evidence.isSensitive && <span style={{ marginLeft: '0.5rem', color: '#FCD34D', fontWeight: 700 }}>🔒 SENSIBLE</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer',
              borderRadius: '6px', padding: '0.375rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={20} color="white" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!streamUrl ? (
            <div style={{ textAlign: 'center', color: 'var(--grafito)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
              <div style={{ fontWeight: 600 }}>Cargando archivo...</div>
            </div>
          ) : cat === 'audio' ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎙️</div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem', color: 'var(--bosque-profundo)' }}>
                {evidence.fileName}
              </div>
              <audio
                controls
                autoPlay={false}
                style={{ width: '100%', maxWidth: '520px' }}
                src={streamUrl}
              >
                Tu navegador no soporta reproducción de audio.
              </audio>
              {evidence.description && (
                <div style={{ marginTop: '1.25rem', fontStyle: 'italic', fontSize: '0.875rem', opacity: 0.7 }}>
                  📝 {evidence.description}
                </div>
              )}
            </div>
          ) : cat === 'video' ? (
            <video
              controls
              autoPlay={false}
              style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 'var(--radius)' }}
              src={streamUrl}
            >
              Tu navegador no soporta reproducción de video.
            </video>
          ) : cat === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streamUrl}
              alt={evidence.fileName}
              style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 'var(--radius)' }}
            />
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📄</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--bosque-profundo)' }}>
                {evidence.fileName}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', marginBottom: '1.5rem' }}>
                La previsualización de documentos no está disponible. Descarga el archivo para verlo.
              </p>
              <a
                href={streamUrl}
                download={evidence.fileName}
                style={{
                  backgroundColor: 'var(--bosque-profundo)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                ⬇️ Descargar {evidence.fileName}
              </a>
            </div>
          )}
        </div>

        {/* Footer — hash SHA-256 */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--papel)',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          color: 'var(--salvia)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflow: 'hidden',
        }}>
          <Shield size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            SHA-256: {evidence.fileHash}
          </span>
          <span style={{ flexShrink: 0, opacity: 0.6, fontSize: '0.65rem' }}>
            Subido por {evidence.uploader?.firstName} {evidence.uploader?.lastName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Transcripción ──────────────────────────────────────────────────────
interface TranscriptionModalProps {
  transcriptionText: string;
  evidenceName: string;
  onClose: () => void;
  isImage?: boolean;
}

function TranscriptionModal({ transcriptionText, evidenceName, onClose, isImage = false }: TranscriptionModalProps) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
        padding: '1.5rem',
      }}
    >
      <div style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '2px solid var(--border)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bosque-profundo)',
          color: 'white',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <TranscriptionIcon size={20} color="var(--tierra-calida)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isImage ? 'Descripción y OCR:' : 'Transcripción:'} {evidenceName}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.125rem' }}>
                Contenido extraído automáticamente
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer',
              borderRadius: '6px', padding: '0.375rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={20} color="white" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--papel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--bosque-profundo)',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
          }}>
            {transcriptionText || 'No hay transcripción disponible.'}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--papel)',
          fontSize: '0.75rem',
          color: 'var(--grafito)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{isImage ? 'Generado con IA de visión (Ollama)' : 'Generado con Whisper (ASR)'}</span>
          <button
            onClick={() => navigator.clipboard.writeText(transcriptionText)}
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <FileText size={14} /> Copiar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export function EvidenceGallery({ caseId, evidences, onEvidenceUploaded, canUpload = true }: EvidenceGalleryProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Visor flotante
  const [viewerEvidence, setViewerEvidence] = useState<any | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [viewerLoading, setViewerLoading] = useState(false);

  // Token de seguridad para evidencias sensibles
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingViewEvidence, setPendingViewEvidence] = useState<any | null>(null);

  // Transcripción
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [transcriptionEvidenceName, setTranscriptionEvidenceName] = useState<string>('');
  const [transcriptionEvidenceIsImage, setTranscriptionEvidenceIsImage] = useState<boolean>(false);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [transcriptionStatuses, setTranscriptionStatuses] = useState<Record<string, { status: string; hasText: boolean }>>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

  const getStreamUrl = (evidenceId: string) =>
    `${API_URL}/evidences/${evidenceId}/download`;

  // Cargar estados de transcripción/análisis para evidencias de audio/video/imagen
  const loadTranscriptionStatuses = async () => {
    const audioVideoEvidences = evidences.filter((e: any) => {
      const cat = getMimeCategory(e.mimeType);
      return cat === 'audio' || cat === 'video' || cat === 'image';
    });
    if (audioVideoEvidences.length === 0) return;

    const token = localStorage.getItem('dna_token');
    try {
      const statuses: Record<string, { status: string; hasText: boolean }> = {};
      await Promise.all(
        audioVideoEvidences.map(async (evidence: any) => {
          try {
            const res = await fetch(`${API_URL}/knowledge/transcription/status/${evidence.id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) {
              const data = await res.json();
              statuses[evidence.id] = { status: data.status, hasText: data.hasText };
            } else {
              statuses[evidence.id] = { status: 'NO_INICIADA', hasText: false };
            }
          } catch {
            statuses[evidence.id] = { status: 'ERROR', hasText: false };
          }
        })
      );
      setTranscriptionStatuses(statuses);
    } catch {
      // Silencioso
    }
  };

  // Cargar al montar y cuando cambien evidencias
  useEffect(() => {
    loadTranscriptionStatuses();
  }, [evidences]);

  // Auto-encolar evidencias del caso al abrir (IA trabaja una por una en segundo plano)
  useEffect(() => {
    if (!caseId) return;
    const token = localStorage.getItem('dna_token');
    fetch(`${API_URL}/knowledge/queue-case`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ caseId }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && (data.enqueued > 0 || data.queue?.length > 0)) {
          // Refrescar estados después de encolar (muestra PENDIENTE/posición)
          setTimeout(loadTranscriptionStatuses, 400);
        }
      })
      .catch(() => { /* silencioso: la cola es best-effort */ });
  }, [caseId]);

  // Obtener transcripción/análisis; si no está hecho, iniciarlo
  const handleViewTranscription = async (evidence: any) => {
    setTranscriptionLoading(true);
    try {
      const token = localStorage.getItem('dna_token');
      const cat = getMimeCategory(evidence.mimeType);
      const isImage = cat === 'image';

      // 0. Si ya hay otra tarea de IA en curso, avisar y no disparar otra
      const aiStatusRes = await fetch(`${API_URL}/knowledge/ai-status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (aiStatusRes && aiStatusRes.ok) {
        const aiStatus = await aiStatusRes.json();
        if (aiStatus.busy) {
          alert(`Hay otra petición de IA en curso (${aiStatus.task || 'procesamiento'}). Esperá a que termine para no saturar el equipo.`);
          return;
        }
      }

      // 1. Verificar estado actual
      const statusRes = await fetch(`${API_URL}/knowledge/transcription/status/${evidence.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const statusData = statusRes.ok ? await statusRes.json() : { status: 'NO_INICIADA' };

      // 2. Ya analizado/transcrito → mostrar el texto
      if (statusData.status === 'COMPLETADA' && statusData.hasText) {
        const textRes = await fetch(`${API_URL}/knowledge/transcription/evidence/${evidence.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!textRes.ok) throw new Error('No se pudo cargar el texto');
        const data = await textRes.json();
        setTranscriptionText(data.text || '');
        setTranscriptionEvidenceName(evidence.fileName);
        setTranscriptionEvidenceIsImage(isImage);
        return;
      }

      // 3. En cola o procesando → avisar y esperar (la IA trabaja uno por uno)
      if (statusData.status === 'PENDIENTE' || statusData.status === 'PROCESSING') {
        alert('Esta evidencia está en la cola de procesamiento de IA. Se procesa una por una en segundo plano; volvé a intentar en unos minutos.');
        return;
      }

      // 4. Falló antes → confirmar reintento
      if (statusData.status === 'ERROR') {
        if (!window.confirm('El análisis anterior falló. ¿Desea intentar nuevamente?')) return;
      }

      if (statusData.status !== 'NO_INICIADA' && statusData.status !== 'ERROR') {
        alert('No hay información de análisis para esta evidencia.');
        return;
      }

      // 5. No iniciado → INICIAR marcando PENDIENTE en la UI
      setTranscriptionStatuses((prev) => ({ ...prev, [evidence.id]: { status: 'PENDIENTE', hasText: false } }));

      let data: any;
      if (isImage) {
        // Imagen: el backend recupera el binario desde MinIO y llama al modelo de visión
        const analyzeRes = await fetch(`${API_URL}/knowledge/analyze-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ evidenceId: evidence.id }),
        });
        if (!analyzeRes.ok) {
          const err = await analyzeRes.json().catch(() => ({}));
          setTranscriptionStatuses((prev) => ({ ...prev, [evidence.id]: { status: 'ERROR', hasText: false } }));
          alert(err.message || 'No se pudo iniciar el análisis de la imagen. Verifique que el servicio de visión esté disponible.');
          return;
        }
        data = await analyzeRes.json();
      } else {
        // Audio/video: descargar el archivo y reenviarlo a Whisper
        const fileRes = await fetch(`${API_URL}/evidences/${evidence.id}/download`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!fileRes.ok) throw new Error('No se pudo cargar el archivo');
        const blob = await fileRes.blob();
        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('evidenceId', evidence.id);
        formData.append('file', blob, evidence.fileName);

        const transcribeRes = await fetch(`${API_URL}/knowledge/transcribe`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!transcribeRes.ok) {
          const err = await transcribeRes.json().catch(() => ({}));
          setTranscriptionStatuses((prev) => ({ ...prev, [evidence.id]: { status: 'ERROR', hasText: false } }));
          alert(err.message || 'No se pudo iniciar la transcripción. Verifique que el servicio esté disponible.');
          return;
        }
        data = await transcribeRes.json();
      }

      // 6. Refrescar estado real desde el servidor
      const statusRes2 = await fetch(`${API_URL}/knowledge/transcription/status/${evidence.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (statusRes2 && statusRes2.ok) {
        const sd = await statusRes2.json();
        setTranscriptionStatuses((prev) => ({ ...prev, [evidence.id]: { status: sd.status, hasText: sd.hasText } }));
        if (sd.status === 'COMPLETADA' && (data.text || sd.text)) {
          setTranscriptionText(data.text || sd.text || '');
          setTranscriptionEvidenceName(evidence.fileName);
          setTranscriptionEvidenceIsImage(isImage);
        }
      } else {
        setTranscriptionStatuses((prev) => ({ ...prev, [evidence.id]: { status: data.status || 'COMPLETADA', hasText: !!data.text } }));
        if (data.text) {
          setTranscriptionText(data.text);
          setTranscriptionEvidenceName(evidence.fileName);
          setTranscriptionEvidenceIsImage(isImage);
        }
      }
    } catch (err) {
      alert('❌ No se pudo iniciar el análisis.');
    } finally {
      setTranscriptionLoading(false);
    }
  };

  // Abrir visor (con chequeo de evidencia sensible)
  // En entornos de prueba (dev / flag TEST) se deshabilita el gateo del token:
  // el usuario ve la imagen sensible directamente sin re-confirmar contraseña.
  const handleView = (evidence: any) => {
    const securityTokenDisabled =
      process.env.NEXT_PUBLIC_DISABLE_SECURITY_TOKEN === 'true' || process.env.NODE_ENV !== 'production';

    if (!securityTokenDisabled && evidence.isSensitive) {
      const secToken = localStorage.getItem('dna_security_token');
      if (!secToken) {
        setPendingViewEvidence(evidence);
        setShowSecurityModal(true);
        return;
      }
    }
    openViewer(evidence);
  };

  const openViewer = async (evidence: any) => {
    setViewerLoading(true);
    setViewerEvidence(evidence); // mostrar modal con spinner inmediatamente
    try {
      const token = localStorage.getItem('dna_token');
      const res = await fetch(`${API_URL}/evidences/${evidence.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('No se pudo cargar el archivo');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setViewerUrl(objectUrl);
    } catch (err) {
      setViewerEvidence(null);
      alert('❌ No se pudo cargar el archivo para visualización.');
    } finally {
      setViewerLoading(false);
    }
  };

  const handleSecurityTokenSuccess = () => {
    setShowSecurityModal(false);
    if (pendingViewEvidence) {
      openViewer(pendingViewEvidence);
      setPendingViewEvidence(null);
    }
  };

  // Subir evidencia (solo append, nunca reemplaza ni borra)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('caseId', caseId);
      formData.append('file', file);
      formData.append('isSensitive', isSensitive ? 'true' : 'false');
      if (description) formData.append('description', description);

      const token = localStorage.getItem('dna_token');
      const response = await fetch(`${API_URL}/evidences/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al subir archivo');
      }

      setFile(null);
      setDescription('');
      setIsSensitive(false);
      // Reset file input
      const input = document.getElementById('evidence-file-input') as HTMLInputElement;
      if (input) input.value = '';

      onEvidenceUploaded();
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* ─── Modal visor flotante ─── */}
      {viewerEvidence && (
        <ViewerModal
          evidence={viewerEvidence}
          streamUrl={viewerUrl}
          onClose={() => {
            URL.revokeObjectURL(viewerUrl); // liberar memoria
            setViewerEvidence(null);
            setViewerUrl('');
          }}
        />
      )}

      {/* ─── Modal token de seguridad ─── */}
      <SecurityTokenModal
        isOpen={showSecurityModal}
        onClose={() => { setShowSecurityModal(false); setPendingViewEvidence(null); }}
        onSuccess={handleSecurityTokenSuccess}
      />

      {/* ─── Modal transcripción ─── */}
      {transcriptionText && (
        <TranscriptionModal
          transcriptionText={transcriptionText}
          evidenceName={transcriptionEvidenceName}
          isImage={transcriptionEvidenceIsImage}
          onClose={() => { setTranscriptionText(''); setTranscriptionEvidenceName(''); setTranscriptionEvidenceIsImage(false); }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: canUpload ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>

        {/* ─── Lista de evidencias (SOLO LECTURA) ─── */}
        <div style={{
          backgroundColor: 'var(--card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={18} color="var(--salvia)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
              Cadena de Custodia — Evidencias
            </h3>
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--salvia)',
              backgroundColor: 'oklch(0.96 0.02 165)',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              border: '1px solid var(--salvia)',
            }}>
              🔒 Solo lectura · {evidences.length} archivo{evidences.length !== 1 ? 's' : ''}
            </span>
          </div>

          {evidences.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem 1rem',
              color: 'var(--grafito)', opacity: 0.6,
            }}>
              <File size={40} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                No hay evidencias adjuntas a este expediente.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {evidences.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--papel)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${
                      getMimeCategory(item.mimeType) === 'audio'    ? '#6366F1' :
                      getMimeCategory(item.mimeType) === 'video'    ? '#EF4444' :
                      getMimeCategory(item.mimeType) === 'image'    ? '#F59E0B' :
                      'var(--salvia)'
                    }`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {getFileIcon(item.mimeType)}
                      <span style={{ fontWeight: 700, color: 'var(--bosque-profundo)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.fileName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--grafito)', opacity: 0.7, flexShrink: 0 }}>
                        {getCategoryLabel(item.mimeType)}
                      </span>
                      {/* Badge estado transcripción/análisis (audio, video, imagen) */}
                      {(() => {
                        const cat = getMimeCategory(item.mimeType);
                        if (cat !== 'audio' && cat !== 'video' && cat !== 'image') return null;
                        const ts = transcriptionStatuses[item.id];
                        if (!ts) return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '10px', backgroundColor: 'var(--border)', color: 'var(--grafito)', fontWeight: 600 }}>⏳ Cargando...</span>;
                        const isCompleted = ts.status === 'COMPLETADA' && ts.hasText;
                        const isProcessing = ts.status === 'PROCESSING';
                        const isPending = ts.status === 'PENDIENTE';
                        const isError = ts.status === 'ERROR';
                        const isNotStarted = ts.status === 'NO_INICIADA';
                        const label = cat === 'image'
                          ? (isCompleted ? 'Analizado' : isProcessing ? 'Procesando...' : isPending ? 'En cola' : isError ? 'Error' : 'Sin analizar')
                          : (isCompleted ? 'Transcrito' : isProcessing ? 'Procesando...' : isPending ? 'En cola' : isError ? 'Error' : 'Sin transcribir');
                        return (
                          <span style={{
                            fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '10px',
                            backgroundColor: isCompleted ? 'oklch(0.96 0.02 165)' : (isProcessing || isPending) ? 'oklch(0.95 0.04 65)' : isError ? 'oklch(0.95 0.05 28)' : 'var(--border)',
                            color: isCompleted ? 'var(--salvia)' : (isProcessing || isPending) ? 'var(--tierra-calida)' : isError ? 'var(--riesgo-alto)' : 'var(--grafito)',
                            fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                          }}>
                            {isCompleted && <span>✅</span>}
                            {isProcessing && <span>⚙️</span>}
                            {isPending && <span>⏳</span>}
                            {isError && <span>❌</span>}
                            {isNotStarted && <span>○</span>}
                            {label}
                          </span>
                        );
                      })()}
                      {item.isSensitive && (
                        <span style={{
                          fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px',
                          backgroundColor: 'var(--tierra-calida)', color: 'white',
                          fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                          flexShrink: 0,
                        }}>
                          <Lock size={10} /> SENSIBLE
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '0.3rem' }}>
                      {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                      {' · '}Subido por {item.uploader?.firstName} {item.uploader?.lastName}
                      {item.description && (
                        <span> · <em>{item.description}</em></span>
                      )}
                    </div>

                    <div style={{
                      fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--salvia)',
                      marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      SHA-256: {item.fileHash}
                    </div>
                  </div>

                  {/* Botón VER — sin borrar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleView(item)}
                      style={{
                        backgroundColor: 'var(--bosque-profundo)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      <Play size={14} />
                      {getMimeCategory(item.mimeType) === 'audio' ? 'Escuchar' :
                       getMimeCategory(item.mimeType) === 'video' ? 'Reproducir' :
                       getMimeCategory(item.mimeType) === 'image' ? 'Ver imagen' :
                       'Ver / Descargar'}
                    </button>
                    {/* Botón VER TRANSCRIPCIÓN/ANÁLISIS — audio, video e imagen */}
                    {(() => {
                      const cat = getMimeCategory(item.mimeType);
                      if (cat !== 'audio' && cat !== 'video' && cat !== 'image') return null;
                      const isImage = cat === 'image';
                      return (
                        <button
                          onClick={() => handleViewTranscription(item)}
                          disabled={transcriptionLoading}
                          style={{
                            backgroundColor: 'var(--tierra-calida)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: transcriptionLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            opacity: transcriptionLoading ? 0.7 : 1,
                          }}
                        >
                          <TranscriptionIcon size={14} />
                          {transcriptionLoading
                            ? 'Procesando...'
                            : (() => {
                                const ts = transcriptionStatuses[item.id];
                                if (ts && ts.status === 'NO_INICIADA') return isImage ? 'Analizar imagen' : 'Transcribir';
                                if (ts && ts.status === 'ERROR') return 'Reintentar';
                                return isImage ? 'Ver Descripción' : 'Ver Transcripción';
                              })()}
                        </button>
                      );
                    })()}
                  </div>
                  {/* NO hay botón de borrar — inmutabilidad legal */}
                </div>
              ))}
            </div>
          )}

          {/* Aviso inmutabilidad */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'oklch(0.96 0.02 165)',
            border: '1px solid var(--salvia)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            color: 'var(--bosque-profundo)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Shield size={14} color="var(--salvia)" />
            <span>
              <strong>Cadena de custodia protegida.</strong> Las evidencias no pueden ser eliminadas ni modificadas.
              Cada archivo está firmado con hash SHA-256 para garantizar integridad probatoria.
            </span>
          </div>
        </div>

        {/* ─── Formulario de subida (solo si canUpload) ─── */}
        {canUpload && (
          <form
            onSubmit={handleUpload}
            style={{
              backgroundColor: 'var(--card)',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              <Upload size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Agregar Evidencia
            </h3>

            {uploadError && (
              <div style={{
                backgroundColor: 'oklch(0.95 0.05 28)',
                color: 'var(--riesgo-alto)',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}>
                ❌ {uploadError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Archivo (Máx 50 MB)
                </label>
                <input
                  id="evidence-file-input"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4,.m4a,.webm,.wav,.ogg"
                  required
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.25rem' }}>
                  PDF · JPG · PNG · DOCX · MP3 · MP4 · M4A · WebM · WAV · OGG
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Descripción / Referencia
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Fotografía de visita domiciliaria..."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isSensitive"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                />
                <label htmlFor="isSensitive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tierra-calida)', cursor: 'pointer' }}>
                  🔒 Evidencia Sensible (exige token)
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                style={{
                  backgroundColor: file && !uploading ? 'var(--bosque-profundo)' : 'var(--border)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  border: 'none',
                  cursor: file && !uploading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <Upload size={16} />
                {uploading ? '⏳ Calculando SHA-256 y subiendo...' : '⬆️ Subir evidencia'}
              </button>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'oklch(0.96 0.02 165)',
              border: '1px solid var(--salvia)',
              borderRadius: 'var(--radius)',
              fontSize: '0.7rem',
              color: 'var(--bosque-profundo)',
            }}>
              ⚠️ Una vez subida, la evidencia <strong>no puede eliminarse</strong> para preservar la integridad probatoria.
            </div>
          </form>
        )}
      </div>
    </>
  );
}
