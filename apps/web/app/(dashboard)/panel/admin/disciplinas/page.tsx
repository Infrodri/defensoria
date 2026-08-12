'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { BookOpen, Layers, Upload, Eye, Loader2, Plus, Pencil, Trash2, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ReportType {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
  templateFilePath?: string;
  content?: string;
  template?: { templateFilePath?: string; content?: string };
}

interface Discipline {
  id: string;
  name: string;
  code: string;
  description?: string;
  reportTypes: ReportType[];
}

interface Instrument {
  id: string;
  name: string;
  description?: string;
  disciplineId?: string;
  discipline?: { id: string; name: string };
  instrumentType?: string;
  templateFilePath?: string;
  content?: string;
  structuredContent?: { templateFilePath?: string; content?: string };
}

const ROLE_COLOR: Record<string, string> = {
  ABOGADO:   'bg-[oklch(0.94_0.04_220)]',
  PSICOLOGO: 'bg-[oklch(0.94_0.04_65)]',
  SOCIAL:    'bg-[oklch(0.94_0.04_140)]',
};

const REPORT_TYPE_LABEL: Record<string, string> = {
  INFORME_JURIDICO:    'Jurídico',
  INFORME_PSICOLOGICO: 'Psicológico',
  INFORME_PSICOSOCIAL: 'Psicosocial',
  INFORME_SOCIAL:      'Social',
};

const getTemplateFilePath = (item: any): string | undefined => {
  if (item?.template?.buffer && item?.template?.mimeType) {
    return `data:${item.template.mimeType};base64,${item.template.buffer}`;
  }
  if (item?.templateFilePath) return item.templateFilePath;
  if (item?.template && typeof item.template === 'object' && item.template.templateFilePath) {
    return item.template.templateFilePath;
  }
  if (item?.structuredContent && typeof item.structuredContent === 'object' && item.structuredContent.templateFilePath) {
    return item.structuredContent.templateFilePath;
  }
  return undefined;
};

const getTemplateContent = (item: any): string | undefined => {
  if (item?.content) return item.content;
  if (item?.template && typeof item.template === 'object' && item.template.content) {
    return item.template.content;
  }
  if (item?.structuredContent && typeof item.structuredContent === 'object' && item.structuredContent.content) {
    return item.structuredContent.content;
  }
  return undefined;
};

export default function DisciplinasPage() {
  const { user } = useAuth();
  
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'instrumentos'>('disciplinas');
  
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [viewDocument, setViewDocument] = useState<{ title: string; url?: string; content?: string } | null>(null);

  // Modal States
  const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [disciplineForm, setDisciplineForm] = useState({ name: '', code: '', description: '' });
  const [savingDiscipline, setSavingDiscipline] = useState(false);

  // For instrument, maybe keep logic but hide it? "Keep all existing state variables and API call logic in disciplinas/page.tsx just wire them into the new UI."
  // Wait, if I'm showing Tipos de Informe Habilitados in the right column, I could also show Instrumentos in the right column? 
  // Let's stick to adding the reportTypes form as requested.

  const [instrumentModalOpen, setInstrumentModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [instrumentForm, setInstrumentForm] = useState({
    name: '',
    disciplineId: '',
    instrumentType: 'EVALUACION',
    description: '',
  });
  const [savingInstrument, setSavingInstrument] = useState(false);

  const [reportTypeModalOpen, setReportTypeModalOpen] = useState(false);
  const [selectedDisciplineForReport, setSelectedDisciplineForReport] = useState<Discipline | null>(null);
  const [reportTypeForm, setReportTypeForm] = useState({
    name: '',
    code: '',
    category: 'INFORME_PSICOLOGICO',
    description: '',
  });
  const [savingReportType, setSavingReportType] = useState(false);
  const [editingReportType, setEditingReportType] = useState<ReportType | null>(null);

  const openEditReportType = (rt: ReportType) => {
    setEditingReportType(rt);
    setReportTypeForm({
      name: rt.name,
      code: rt.code,
      category: rt.category || 'INFORME_PSICOLOGICO',
      description: rt.description || '',
    });
  };

  const cancelEditReportType = () => {
    setEditingReportType(null);
    setReportTypeForm({ name: '', code: '', category: 'INFORME_PSICOLOGICO', description: '' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadTargetRef = useRef<{ id: string; type: 'template' | 'instrument' } | null>(null);

  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La configuración de disciplinas profesionales e instrumentos es exclusiva del Administrador General." />
    );
  }

  const loadData = async () => {
    try {
      const [disc, inst] = await Promise.all([
        fetchApi('/disciplines'),
        fetchApi('/instruments'),
      ]);
      const loadedDisciplines = Array.isArray(disc) ? disc : [];
      setDisciplines(loadedDisciplines);
      setInstruments(Array.isArray(inst) ? inst : []);
      
      if (loadedDisciplines.length > 0 && !selectedDiscipline) {
        setSelectedDiscipline(loadedDisciplines[0]);
      } else if (selectedDiscipline && loadedDisciplines) {
        const updated = loadedDisciplines.find((c) => c.id === selectedDiscipline.id);
        if (updated) setSelectedDiscipline(updated);
      }
    } catch (err: any) {
      toast.error('Error al cargar datos', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Discipline Modal Handlers
  const openCreateDiscipline = () => {
    setEditingDiscipline(null);
    setDisciplineForm({ name: '', code: '', description: '' });
    setDisciplineModalOpen(true);
  };

  const openEditDiscipline = (d: Discipline) => {
    setEditingDiscipline(d);
    setDisciplineForm({
      name: d.name || '',
      code: d.code || '',
      description: d.description || '',
    });
    setDisciplineModalOpen(true);
  };

  const handleSaveDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineForm.name.trim() || !disciplineForm.code.trim()) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    setSavingDiscipline(true);
    try {
      if (editingDiscipline) {
        await fetchApi(`/disciplines/${editingDiscipline.id}`, {
          method: 'PATCH',
          body: JSON.stringify(disciplineForm),
        });
        toast.success('Disciplina actualizada correctamente');
      } else {
        await fetchApi('/disciplines', {
          method: 'POST',
          body: JSON.stringify(disciplineForm),
        });
        toast.success('Disciplina creada correctamente');
      }
      setDisciplineModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error('Error al guardar disciplina', { description: err.message });
    } finally {
      setSavingDiscipline(false);
    }
  };

  const handleDeleteDiscipline = async (id: string, name: string) => {
    if (window.confirm('¿Seguro que desea desactivar este registro?')) {
      try {
        await fetchApi(`/disciplines/${id}`, { method: 'DELETE' });
        toast.success('Disciplina desactivada correctamente');
        await loadData();
      } catch (err: any) {
        toast.error('Error al desactivar disciplina', { description: err.message });
      }
    }
  };

  // Instrument Handlers
  const openCreateInstrument = () => {
    setEditingInstrument(null);
    setInstrumentForm({
      name: '',
      disciplineId: disciplines[0]?.id || '',
      instrumentType: 'EVALUACION',
      description: '',
    });
    setInstrumentModalOpen(true);
  };

  const openEditInstrument = (i: Instrument) => {
    setEditingInstrument(i);
    setInstrumentForm({
      name: i.name || '',
      disciplineId: i.disciplineId || i.discipline?.id || disciplines[0]?.id || '',
      instrumentType: i.instrumentType || 'EVALUACION',
      description: i.description || '',
    });
    setInstrumentModalOpen(true);
  };

  const handleSaveInstrument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrumentForm.name.trim() || !instrumentForm.disciplineId) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    setSavingInstrument(true);
    try {
      if (editingInstrument) {
        await fetchApi(`/instruments/${editingInstrument.id}`, {
          method: 'PATCH',
          body: JSON.stringify(instrumentForm),
        });
        toast.success('Instrumento actualizado correctamente');
      } else {
        await fetchApi('/instruments', {
          method: 'POST',
          body: JSON.stringify(instrumentForm),
        });
        toast.success('Instrumento creado correctamente');
      }
      setInstrumentModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error('Error al guardar instrumento', { description: err.message });
    } finally {
      setSavingInstrument(false);
    }
  };

  const handleDeleteInstrument = async (id: string, name: string) => {
    if (window.confirm('¿Seguro que desea desactivar este registro?')) {
      try {
        await fetchApi(`/instruments/${id}`, { method: 'DELETE' });
        toast.success('Instrumento desactivado correctamente');
        await loadData();
      } catch (err: any) {
        toast.error('Error al desactivar instrumento', { description: err.message });
      }
    }
  };

  const openCreateReportType = (d: Discipline) => {
    setSelectedDisciplineForReport(d);
    setReportTypeForm({
      name: '',
      code: '',
      category: d.code === 'PSICOLOGO' ? 'INFORME_PSICOLOGICO' : d.code === 'SOCIAL' ? 'INFORME_SOCIAL' : 'INFORME_JURIDICO',
      description: '',
    });
    setReportTypeModalOpen(true);
  };

  const handleSaveReportType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscipline || !reportTypeForm.name.trim() || !reportTypeForm.code.trim()) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    setSavingReportType(true);
    try {
      if (editingReportType) {
        await fetchApi(`/instruments/${editingReportType.id}`, {
          method: 'PATCH',
          body: JSON.stringify(reportTypeForm),
        });
        toast.success('Tipo de informe actualizado correctamente');
      } else {
        await fetchApi(`/disciplines/${selectedDiscipline.id}/report-types`, {
          method: 'POST',
          body: JSON.stringify(reportTypeForm),
        });
        toast.success('Tipo de informe agregado correctamente');
      }
      setEditingReportType(null);
      setReportTypeForm({ name: '', code: '', category: 'INFORME_PSICOLOGICO', description: '' });
      await loadData();
    } catch (err: any) {
      toast.error('Error al guardar tipo de informe', { description: err.message });
    } finally {
      setSavingReportType(false);
    }
  };

  const handleDeleteReportType = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este tipo de informe?')) return;
    try {
      await fetchApi(`/instruments/${id}`, { method: 'DELETE' });
      toast.success('Tipo de informe eliminado');
      await loadData();
    } catch (err: any) {
      toast.error('Error al eliminar', { description: err.message });
    }
  };

  const handleSelectFile = (id: string, type: 'template' | 'instrument') => {
    activeUploadTargetRef.current = { id, type };
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = activeUploadTargetRef.current;
    if (!file || !target) return;

    const { id, type } = target;
    setUploadingId(id);

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = type === 'template'
      ? `/disciplines/report-types/${id}/upload`
      : `/instruments/${id}/upload`;

    try {
      await fetchApi(endpoint, {
        method: 'POST',
        body: formData,
      });
      toast.success(type === 'template' ? 'Modelo subido correctamente' : 'Plantilla subida correctamente');
      await loadData();
    } catch (err: any) {
      toast.error('Error al subir archivo', { description: err.message || 'Ocurrió un error inesperado' });
    } finally {
      setUploadingId(null);
      activeUploadTargetRef.current = null;
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={32} color="var(--tierra-calida)" /> Disciplinas e Instrumentos
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Configuración de las especialidades profesionales y sus herramientas de evaluación por expediente.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('disciplinas')}
          style={{ padding: '0.75rem 1rem', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer', color: activeTab === 'disciplinas' ? 'var(--bosque-profundo)' : 'var(--grafito)', borderBottom: activeTab === 'disciplinas' ? '2px solid var(--bosque-profundo)' : '2px solid transparent', opacity: activeTab === 'disciplinas' ? 1 : 0.7 }}
        >
          Disciplinas Profesionales
        </button>
        <button
          onClick={() => setActiveTab('instrumentos')}
          style={{ padding: '0.75rem 1rem', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer', color: activeTab === 'instrumentos' ? 'var(--bosque-profundo)' : 'var(--grafito)', borderBottom: activeTab === 'instrumentos' ? '2px solid var(--bosque-profundo)' : '2px solid transparent', opacity: activeTab === 'instrumentos' ? 1 : 0.7 }}
        >
          Tipos de Instrumentos
        </button>
      </div>

      {activeTab === 'disciplinas' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Disciplinas List */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
              Disciplinas Profesionales
            </h2>
            <button
              type="button"
              onClick={openCreateDiscipline}
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Plus size={14} /> Crear Disciplina
            </button>
          </div>

          {loading ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando disciplinas...</p>
          ) : disciplines.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>No existen disciplinas aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {disciplines.map((disc) => (
                <button
                  key={disc.id}
                  type="button"
                  onClick={() => setSelectedDiscipline(disc)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedDiscipline?.id === disc.id ? 'oklch(0.92 0.04 175)' : 'var(--papel)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>{disc.name}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>{disc.code}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--border)', padding: '0.15rem 0.4rem', borderRadius: '8px' }}>
                    {disc.reportTypes?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Detail & Instruments/Report Types */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
          {selectedDiscipline ? (
            <div>
              <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={20} color="var(--salvia)" /> {selectedDiscipline.name}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
                  Código Técnico: <code style={{ fontFamily: 'monospace', backgroundColor: 'var(--papel)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{selectedDiscipline.code}</code>
                  {selectedDiscipline.description && ` — ${selectedDiscipline.description}`}
                </p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => openEditDiscipline(selectedDiscipline)}
                        style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                        <Pencil size={12} /> Editar
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteDiscipline(selectedDiscipline.id, selectedDiscipline.name)}
                        style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'oklch(0.5 0.15 30)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                        <Trash2 size={12} /> Desactivar
                    </button>
                </div>
              </header>

              {/* Form New Report Type */}
              <form onSubmit={handleSaveReportType} style={{ backgroundColor: 'var(--papel)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--bosque-profundo)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{editingReportType ? 'Editar Tipo de Informe' : 'Agregar Nuevo Tipo de Informe'}</span>
                  {editingReportType && (
                    <button type="button" onClick={cancelEditReportType} style={{ background: 'none', border: 'none', color: 'var(--grafito)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Cancelar</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Informe Psicológico Inicial"
                      value={reportTypeForm.name}
                      onChange={(e) => setReportTypeForm({ ...reportTypeForm, name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Código Único</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. PSI_INFORME_INICIAL"
                      value={reportTypeForm.code}
                      onChange={(e) => setReportTypeForm({ ...reportTypeForm, code: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={savingReportType}
                    style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {savingReportType ? <Loader2 size={14} className="animate-spin" /> : (editingReportType ? <Pencil size={14} /> : <Plus size={14} />)} {editingReportType ? 'Guardar Cambios' : 'Agregar Tipo'}
                  </button>
                </div>
              </form>

              {/* Items Table (Report Types) */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>Tipos de Informe Habilitados</h3>
                {selectedDiscipline.reportTypes?.length === 0 ? (
                  <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Esta disciplina no contiene tipos de informe aún.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--papel)' }}>
                        <th style={{ padding: '0.625rem' }}>Nombre</th>
                        <th style={{ padding: '0.625rem' }}>Código</th>
                        <th style={{ padding: '0.625rem' }}>Modelo / Plantilla</th>
                        <th style={{ padding: '0.625rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDiscipline.reportTypes?.map((rt) => {
                        const filePath = getTemplateFilePath(rt);
                        const content = getTemplateContent(rt);
                        const isUploading = uploadingId === rt.id;
                        return (
                        <tr key={rt.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: editingReportType?.id === rt.id ? 'oklch(0.92 0.04 175)' : 'transparent' }}>
                          <td style={{ padding: '0.625rem', fontWeight: 600 }}>{rt.name}</td>
                          <td style={{ padding: '0.625rem', fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.7 }}>{rt.code}</td>
                          <td style={{ padding: '0.625rem', display: 'flex', gap: '0.5rem' }}>
                             {(filePath || content) && (
                              <button
                                type="button"
                                onClick={() => setViewDocument({ title: rt.name, url: filePath, content })}
                                style={{ backgroundColor: 'var(--salvia)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                title="Ver modelo"
                              >
                                <Eye size={12} /> Ver
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={isUploading}
                              onClick={() => handleSelectFile(rt.id, 'template')}
                              style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: isUploading ? 0.7 : 1 }}
                              title="Subir modelo"
                            >
                              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Subir Modelo
                            </button>
                          </td>
                          <td style={{ padding: '0.625rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => openEditReportType(rt)}
                              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--grafito)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReportType(rt.id)}
                              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'oklch(0.5 0.15 30)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Trash2 size={12} /> Desactivar
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '3rem 0' }}>Selecciona una disciplina en el panel izquierdo.</p>
          )}
        </section>
      </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Instrumento</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Disciplina</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {instruments.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    No hay instrumentos registrados.
                  </td>
                </tr>
              ) : instruments.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>{i.name}</td>
                  <td style={{ padding: '0.875rem 1.25rem', opacity: 0.8 }}>{i.discipline?.name || '—'}</td>
                  <td style={{ padding: '0.875rem 1.25rem', opacity: 0.7 }}>{i.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Discipline Modal */}
      {disciplineModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem', width: '100%', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
              {editingDiscipline ? 'Editar Disciplina' : 'Crear Disciplina'}
            </h3>
            <form onSubmit={handleSaveDiscipline} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre</label>
                <input
                  type="text"
                  required
                  value={disciplineForm.name}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Código Rol</label>
                <input
                  type="text"
                  required
                  value={disciplineForm.code}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Descripción</label>
                <textarea
                  value={disciplineForm.description}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setDisciplineModalOpen(false)}
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDiscipline}
                  style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {savingDiscipline ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editingDiscipline ? 'Guardar Cambios' : 'Crear Disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal Overlay */}
      {viewDocument && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={() => setViewDocument(null)}
        >
          <div
            style={{ backgroundColor: 'var(--card)', color: 'var(--grafito)', borderRadius: 'var(--radius)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--papel)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
                {viewDocument.title}
              </h3>
              <button
                type="button"
                onClick={() => setViewDocument(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grafito)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {viewDocument.content ? (
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {viewDocument.content}
                  </ReactMarkdown>
                </div>
              ) : viewDocument.url ? (
                <iframe
                  src={viewDocument.url}
                  style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '4px' }}
                  title={viewDocument.title}
                />
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.6, padding: '2rem 0' }}>
                  No hay documento
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
