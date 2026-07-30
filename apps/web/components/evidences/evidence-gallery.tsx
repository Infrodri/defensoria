'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Upload, File, ShieldAlert, Download, Lock, CheckCircle2 } from 'lucide-react';
import { SecurityTokenModal } from '../security/security-token-modal';

interface EvidenceGalleryProps {
  caseId: string;
  evidences: any[];
  onEvidenceUploaded: () => void;
}

export function EvidenceGallery({ caseId, evidences, onEvidenceUploaded }: EvidenceGalleryProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Security token modal state
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('caseId', caseId);
      formData.append('file', file);
      formData.append('isSensitive', isSensitive ? 'true' : 'false');
      if (description) formData.append('description', description);

      const token = localStorage.getItem('dna_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api'}/evidences/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir archivo');
      }

      setFile(null);
      setDescription('');
      setIsSensitive(false);
      onEvidenceUploaded();
      alert('Evidencia subida correctamente a MinIO con hash SHA-256 de integridad.');
    } catch (err: any) {
      alert(err.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (evidence: any) => {
    const secToken = localStorage.getItem('dna_security_token');

    if (evidence.isSensitive && !secToken) {
      setPendingDownloadId(evidence.id);
      setShowSecurityModal(true);
      return;
    }

    // Trigger download from API
    const token = localStorage.getItem('dna_token');
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api'}/evidences/${evidence.id}/download`, '_blank');
  };

  const handleSecurityTokenSuccess = (token: string) => {
    setShowSecurityModal(false);
    if (pendingDownloadId) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api'}/evidences/${pendingDownloadId}/download`, '_blank');
      setPendingDownloadId(null);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <SecurityTokenModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onSuccess={handleSecurityTokenSuccess}
      />

      {/* Evidences List */}
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Evidencias y Cadena de Custodia (MinIO Object Storage)
        </h3>

        {evidences.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No hay archivos adjuntos en la cadena de custodia de este expediente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {evidences.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <File size={18} color="var(--bosque-profundo)" />
                    <span style={{ fontWeight: 700, color: 'var(--bosque-profundo)', fontSize: '0.95rem' }}>
                      {item.fileName}
                    </span>
                    {item.isSensitive && (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--tierra-calida)', color: 'white', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={12} /> SENSIBLE (Token Requerido)
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                    Tamaño: {(item.fileSize / (1024 * 1024)).toFixed(2)} MB · Subido por: {item.uploader?.firstName} {item.uploader?.lastName}
                  </div>

                  {/* SHA-256 Integrity Checksum */}
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--salvia)', marginTop: '0.375rem', wordBreak: 'break-all' }}>
                    SHA-256: {item.fileHash}
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(item)}
                  style={{
                    backgroundColor: 'var(--bosque-profundo)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Download size={16} /> Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Adjuntar Nueva Evidencia
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Seleccionar Archivo (Máx 50MB)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4"
              required
              style={{ width: '100%', fontSize: '0.875rem' }}
            />
            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
              Formatos permitidos: PDF, JPG, PNG, DOCX, MP3, MP4
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Descripción / Referencia Probatoria
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Fotografía de constitución en domicilio..."
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isSensitive"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
            />
            <label htmlFor="isSensitive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tierra-calida)' }}>
              Marcar como Evidencia Sensible (Exige Token de Seguridad)
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.625rem',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Upload size={16} /> {uploading ? 'Calculando SHA-256 y Subiendo...' : 'Subir a MinIO'}
          </button>
        </div>
      </form>
    </div>
  );
}
