'use client';

import React, { useState, useRef, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { Database, FileUp, FileText, CheckCircle2, XCircle, RefreshCw, Link as LinkIcon, Trash2 } from 'lucide-react';
interface LegalDoc {
  id: string;
  title: string;
  isActive: boolean;
  version?: string;
  createdAt: string;
  _count?: { chunks: number };
}

export default function KnowledgeUploadPage() {
  const { user } = useAuth();
  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La gestión de la base de conocimiento jurídico (RAG) es exclusiva del Administrador General." />
    );
  }

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'pdf' | 'url'>('url');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<LegalDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Estado para el diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    docId: string;
    docTitle: string;
  }>({ isOpen: false, docId: '', docTitle: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await fetchApi<LegalDoc[]>('/knowledge/documents');
      setDocuments(data || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const isMd = selected.name.toLowerCase().endsWith('.md');
      
      if (selected.type !== 'application/pdf' && !isMd) {
        setMessage({ text: 'Solo se admiten documentos en formato PDF o Markdown (.md)', type: 'error' });
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.(pdf|md)$/i, ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage({ text: 'Debe proporcionar un título y seleccionar un archivo PDF', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Procesando PDF e inyectando a la base vectorial (puede tomar unos minutos)...', type: 'info' });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dna_token') : '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

      const isMarkdown = file.name.toLowerCase().endsWith('.md');
      const endpoint = isMarkdown ? '/knowledge/upload-markdown' : '/knowledge/upload';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al subir ${isMarkdown ? 'Markdown' : 'PDF'}`);
      }

      const resData = await response.json();
      setMessage({
        text: `¡Documento ingerido con éxito! Se extrajeron ${resData.chunksProcessed || resData.articlesDetected || 'varios'} fragmentos.`,
        type: 'success',
      });

      setFile(null);
      setTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
    } catch (err: any) {
      setMessage({ text: err.message || 'Hubo un error al procesar el documento PDF', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) {
      setMessage({ text: 'Debe proporcionar un título y una URL', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Descargando web, procesando e inyectando a la base vectorial (puede tomar un momento)...', type: 'info' });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dna_token') : '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

      const response = await fetch(`${API_URL}/knowledge/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al procesar URL');
      }

      const resData = await response.json();
      setMessage({
        text: `¡URL ingerida con éxito! Se extrajeron ${resData.chunksProcessed} fragmentos.`,
        type: 'success',
      });

      setUrl('');
      setTitle('');
      fetchDocuments();
    } catch (err: any) {
      setMessage({ text: err.message || 'Hubo un error al procesar la URL', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/knowledge/documents/${id}/toggle-status`, { method: 'PATCH' });
      setMessage({
        text: `Estado del documento ${currentStatus ? 'desactivado (derogado)' : 'activado (vigente)'}`,
        type: 'success',
      });
      fetchDocuments();
    } catch {
      setMessage({ text: 'No se pudo cambiar el estado del documento', type: 'error' });
    }
  };

  const handleViewChunks = async (docId: string) => {
    setSelectedDocId(docId);
    setLoadingChunks(true);
    try {
      const data = await fetchApi<any[]>(`/knowledge/documents/${docId}/chunks`);
      setChunks(data || []);
    } catch {
      setMessage({ text: 'Error al cargar los fragmentos', type: 'error' });
      setChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDialog.docId) return;
    
    setDeleting(true);
    try {
      await fetchApi(`/knowledge/documents/${deleteDialog.docId}`, { method: 'DELETE' });
      setMessage({
        text: `Documento "${deleteDialog.docTitle}" eliminado permanentemente (incluyendo embeddings)`,
        type: 'success',
      });
      setDeleteDialog({ isOpen: false, docId: '', docTitle: '' });
      fetchDocuments(); // Refrescar la lista
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al eliminar el documento', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (docId: string, docTitle: string) => {
    setDeleteDialog({ isOpen: true, docId, docTitle });
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={32} color="var(--tierra-calida)" /> Base de Conocimiento (RAG)
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Alimenta la inteligencia artificial con leyes, manuales o protocolos en PDF y administra su vigencia jurídica.
        </p>
      </header>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? 'oklch(0.92 0.08 140)' : message.type === 'error' ? 'oklch(0.92 0.08 30)' : 'oklch(0.92 0.04 220)',
          color: message.type === 'success' ? 'oklch(0.3 0.1 140)' : message.type === 'error' ? 'oklch(0.3 0.1 30)' : 'oklch(0.3 0.1 220)',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Upload Form */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
            Inyectar Nuevo Documento Legal
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1rem' }}>
            Selecciona la fuente del documento. Recomendamos "Enlace Web" para leyes (Lexivox) ya que la IA lo lee mejor.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--papel)', padding: '0.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('url')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                backgroundColor: activeTab === 'url' ? 'var(--card)' : 'transparent',
                color: activeTab === 'url' ? 'var(--bosque-profundo)' : 'var(--grafito)',
                fontWeight: activeTab === 'url' ? 700 : 500,
                borderRadius: 'calc(var(--radius) - 2px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                boxShadow: activeTab === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <LinkIcon size={16} /> Enlace Web (Lexivox)
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                backgroundColor: activeTab === 'pdf' ? 'var(--card)' : 'transparent',
                color: activeTab === 'pdf' ? 'var(--bosque-profundo)' : 'var(--grafito)',
                fontWeight: activeTab === 'pdf' ? 700 : 500,
                borderRadius: 'calc(var(--radius) - 2px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                boxShadow: activeTab === 'pdf' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <FileUp size={16} /> Archivo PDF / MD
            </button>
          </div>

          <form onSubmit={activeTab === 'pdf' ? handleUpload : handleUrlUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Título del Documento
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Ley 348 Integral contra la Violencia"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--papel)',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {activeTab === 'url' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  URL / Enlace de la Ley (ej. Lexivox)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.lexivox.org/norms/..."
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--papel)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Archivo PDF o Markdown (.md)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    height: '90px',
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--papel)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <FileUp size={24} color="var(--grafito)" style={{ opacity: 0.6 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8 }}>Clic para buscar PDF o .MD</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="application/pdf,.md,text/markdown"
                  onChange={handleFileChange}
                />

                {file && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--salvia)', fontWeight: 600 }}>
                    <FileText size={16} /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading || (activeTab === 'pdf' ? !file : !url) || !title}
                style={{
                  backgroundColor: 'var(--bosque-profundo)',
                  color: 'white',
                  padding: '0.625rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Procesando...' : 'Procesar e Inyectar'}
              </button>
            </div>
          </form>
        </section>

        {/* Informative Card */}
        <section style={{ backgroundColor: 'oklch(0.96 0.02 165)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid oklch(0.90 0.04 165)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            ¿Cómo funciona el RAG Soberano?
          </h2>
          <ul style={{ fontSize: '0.8125rem', color: 'var(--grafito)', lineHeight: 1.6, paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong>1. Lectura:</strong> Extrae el texto plano del PDF localmente sin salir a la nube.</li>
            <li><strong>2. Chunking:</strong> Divide el documento en párrafos independientes.</li>
            <li><strong>3. Embeddings:</strong> Ollama convierte cada párrafo en vectores en PostgreSQL (pgvector).</li>
            <li><strong>4. Vigencia:</strong> Puedes dar de baja normativas derogadas para que la IA no las utilice.</li>
          </ul>
        </section>
      </div>

      {/* Indexed Documents Table */}
      <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
              Documentos Legales Indexados
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.2rem' }}>
              Catálogo de normativas cargadas en la memoria RAG de la IA
            </p>
          </div>
          <button
            type="button"
            onClick={fetchDocuments}
            disabled={loadingDocs}
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
            <RefreshCw size={14} className={loadingDocs ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>

        {loadingDocs ? (
          <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando base de conocimiento...</p>
        ) : documents.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>No hay documentos indexados aún.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--papel)' }}>
                  <th style={{ padding: '0.75rem' }}>Título</th>
                  <th style={{ padding: '0.75rem' }}>Fecha Ingesta</th>
                  <th style={{ padding: '0.75rem' }}>Chunks</th>
                  <th style={{ padding: '0.75rem' }}>Estado RAG</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{doc.title}</td>
                    <td style={{ padding: '0.75rem', opacity: 0.8 }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem' }}>{doc._count?.chunks || 0} fragmentos</td>
                    <td style={{ padding: '0.75rem' }}>
                      {doc.isActive ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.12 140)', backgroundColor: 'oklch(0.92 0.06 140)', padding: '0.25rem 0.5rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Vigente
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.12 30)', backgroundColor: 'oklch(0.92 0.06 30)', padding: '0.25rem 0.5rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <XCircle size={12} /> Derogado
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleViewChunks(doc.id)}
                        style={{
                          backgroundColor: 'var(--papel)',
                          color: 'var(--bosque-profundo)',
                          border: '1px solid var(--border)',
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Ver Chunks
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(doc.id, doc.isActive)}
                        style={{
                          backgroundColor: doc.isActive ? 'transparent' : 'var(--bosque-profundo)',
                          color: doc.isActive ? 'var(--grafito)' : 'white',
                          border: doc.isActive ? '1px solid var(--border)' : 'none',
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {doc.isActive ? 'Dar de Baja' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteDialog(doc.id, doc.title)}
                        style={{
                          backgroundColor: '#7f1d1d',
                          color: 'white',
                          border: 'none',
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title="Eliminar permanentemente (incluyendo embeddings)"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de confirmación de eliminación */}
      {deleteDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '500px', border: '2px solid #7f1d1d', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trash2 size={32} color="#7f1d1d" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7f1d1d', margin: 0, marginBottom: '0.5rem' }}>
                ¿Eliminar permanentemente?
              </h2>
              <p style={{ color: 'var(--grafito)', margin: 0, marginBottom: '1rem', lineHeight: 1.5 }}>
                Esta acción <strong>no se puede deshacer</strong>. Se eliminará:
              </p>
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#7f1d1d', marginBottom: '0.5rem' }}>
                "{deleteDialog.docTitle}"
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#991b1b', fontSize: '0.875rem' }}>
                <li>El documento y todos sus metadatos</li>
                <li>Todos los chunks (fragmentos) indexados</li>
                <li>Todos los embeddings vectoriales</li>
                <li>Referencias en la memoria RAG de la IA</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteDialog({ isOpen: false, docId: '', docTitle: '' })}
                disabled={deleting}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--grafito)',
                  border: '1px solid var(--border)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                disabled={deleting}
                style={{
                  backgroundColor: '#7f1d1d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {deleting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Eliminar Permanentemente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de fragmentos */}
      {selectedDocId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: '-1.5rem', backgroundColor: 'var(--card)', padding: '1rem 0', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>Fragmentos Indexados (Chunks)</h2>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8 }}>Visualización de lo que la IA "lee" en crudo</p>
              </div>
              <button onClick={() => setSelectedDocId(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--grafito)' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            {loadingChunks ? (
              <p style={{ opacity: 0.6, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Cargando fragmentos...</p>
            ) : chunks.length === 0 ? (
              <p style={{ opacity: 0.6, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No se encontraron fragmentos para este documento.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chunks.map((chunk, i) => (
                  <div key={chunk.id} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--papel)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--salvia)', fontSize: '0.875rem' }}>Chunk #{i + 1}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7, fontFamily: 'monospace' }}>ID: {chunk.id.split('-')[0]}...</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--grafito)', whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.6 }}>{chunk.content}</p>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)', fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7, fontFamily: 'monospace' }}>
                      Meta: {JSON.stringify(chunk.metadata)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
