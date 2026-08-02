'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { Role } from '@defensoria/shared';
import { Users, Shield, Plus, Edit2, Key, CheckCircle2, XCircle, Search, Building2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  officeId?: string;
  office?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    assignedCaseTeam: number;
  };
}

interface OfficeItem {
  id: string;
  code: string;
  name: string;
}

interface SystemModuleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  isCustom: boolean;
  permissions: Record<string, string>;
}

export default function PermisosPage() {
  const { user: currentUser } = useAuth();
  
  if (currentUser?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La gestión de personal, roles y la matriz RBAC son exclusivas del Administrador General (Secretaria de Desarrollo / Directora DNA)." />
    );
  }

  const [activeTab, setActiveTab] = useState<'usuarios' | 'matrix'>('usuarios');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [modules, setModules] = useState<SystemModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  
  // User Form fields
  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formRole, setFormRole] = useState<Role>(Role.ABOGADO);
  const [formOfficeId, setFormOfficeId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPassword, setFormPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Module Modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SystemModuleItem | null>(null);
  const [modCode, setModCode] = useState('');
  const [modName, setModName] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modPermissions, setModPermissions] = useState<Record<string, string>>({
    ADMINISTRADOR: '✅ Total',
    JEFATURA: '❌',
    ABOGADO: '❌',
    PSICOLOGO: '❌',
    SOCIAL: '❌',
    SECRETARIA: '❌',
  });

  const loadData = async () => {
    try {
      const [usersData, officesData, modulesData] = await Promise.all([
        fetchApi('/users'),
        fetchApi('/offices'),
        fetchApi('/system-modules'),
      ]);
      setUsers(usersData);
      setOffices(officesData);
      setModules(modulesData);
    } catch (err: any) {
      toast.error('Error al cargar datos del sistema', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormFirstName('');
    setFormLastName('');
    setFormRole(Role.ABOGADO);
    setFormOfficeId(offices[0]?.id || '');
    setFormPassword('Password123!');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setFormEmail(u.email);
    setFormFirstName(u.firstName);
    setFormLastName(u.lastName);
    setFormRole(u.role);
    setFormOfficeId(u.officeId || offices[0]?.id || '');
    setFormIsActive(u.isActive);
    setIsModalOpen(true);
  };

  const openResetModal = (u: UserItem) => {
    setEditingUser(u);
    setFormPassword('Password123!');
    setIsResetModalOpen(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim() || (!editingUser && !formEmail.trim())) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await fetchApi(`/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            firstName: formFirstName,
            lastName: formLastName,
            role: formRole,
            officeId: formOfficeId,
            isActive: formIsActive,
          }),
        });
        toast.success('Funcionario actualizado exitosamente');
      } else {
        await fetchApi('/users', {
          method: 'POST',
          body: JSON.stringify({
            email: formEmail,
            firstName: formFirstName,
            lastName: formLastName,
            role: formRole,
            officeId: formOfficeId,
            password: formPassword,
          }),
        });
        toast.success('Funcionario registrado exitosamente');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Error al guardar datos del funcionario', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      await fetchApi(`/users/${editingUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: formPassword }),
      });
      toast.success(`Contraseña restablecida para ${editingUser.email}`);
      setIsResetModalOpen(false);
    } catch (err: any) {
      toast.error('Error al restablecer contraseña', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Module CRUD handlers
  const openCreateModuleModal = () => {
    setEditingModule(null);
    setModCode('');
    setModName('');
    setModDesc('');
    setModPermissions({
      ADMINISTRADOR: '✅ Total',
      JEFATURA: '❌',
      ABOGADO: '❌',
      PSICOLOGO: '❌',
      SOCIAL: '❌',
      SECRETARIA: '❌',
    });
    setIsModuleModalOpen(true);
  };

  const openEditModuleModal = (m: SystemModuleItem) => {
    setEditingModule(m);
    setModCode(m.code);
    setModName(m.name);
    setModDesc(m.description || '');
    setModPermissions(m.permissions || {});
    setIsModuleModalOpen(true);
  };

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modName.trim() || (!editingModule && !modCode.trim())) {
      toast.error('Nombre y código del módulo son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      if (editingModule) {
        await fetchApi(`/system-modules/${editingModule.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: modName,
            description: modDesc,
            permissions: modPermissions,
          }),
        });
        toast.success('Módulo y matriz de permisos actualizados');
      } else {
        await fetchApi('/system-modules', {
          method: 'POST',
          body: JSON.stringify({
            code: modCode,
            name: modName,
            description: modDesc,
            permissions: modPermissions,
          }),
        });
        toast.success('Nuevo módulo de sistema creado exitosamente');
      }

      setIsModuleModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Error al guardar el módulo', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (m: SystemModuleItem) => {
    if (!m.isCustom) {
      toast.error('Los módulos nativos no se pueden eliminar');
      return;
    }

    if (!confirm(`¿Eliminar el módulo "${m.name}"?`)) return;

    try {
      await fetchApi(`/system-modules/${m.id}`, { method: 'DELETE' });
      toast.success('Módulo eliminado correctamente');
      loadData();
    } catch (err: any) {
      toast.error('Error al eliminar módulo', { description: err.message });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.office?.name && u.office.name.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
            Usuarios, Roles & Permisos (RBAC)
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Administración del personal de las defensorías distritales y matriz de seguridad
          </p>
        </div>

        {(currentUser?.role === 'ADMINISTRADOR' || currentUser?.role === 'JEFATURA') && (
          <button
            onClick={openCreateModal}
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px oklch(0.25 0.08 165 / 0.2)',
            }}
          >
            <Plus size={18} /> Registrar Nuevo Funcionario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('usuarios')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'usuarios' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'usuarios' ? 700 : 500,
            color: activeTab === 'usuarios' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={18} /> Personal y Funcionarios ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'matrix' ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'matrix' ? 700 : 500,
            color: activeTab === 'matrix' ? 'var(--bosque-profundo)' : 'var(--grafito)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Shield size={18} /> Matriz de Permisos RBAC
        </button>
      </div>

      {/* Tab Content: Usuarios */}
      {activeTab === 'usuarios' && (
        <div>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o distrito..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem 0.625rem 2.5rem',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--grafito)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--grafito)',
                fontWeight: 600,
              }}
            >
              <option value="ALL">Todos los Roles</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="JEFATURA">Jefatura de Unidad</option>
              <option value="ABOGADO">Abogado/a</option>
              <option value="PSICOLOGO">Psicólogo/a</option>
              <option value="SOCIAL">Trabajador/a Social</option>
              <option value="SECRETARIA">Secretaría</option>
            </select>
          </div>

          {/* Tabla de Usuarios */}
          {loading ? (
            <p style={{ opacity: 0.6 }}>Cargando funcionarios...</p>
          ) : (
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'oklch(0.96 0.02 165)', borderBottom: '1px solid var(--border)', color: 'var(--bosque-profundo)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Funcionario</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Rol Operativo</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Oficina / Distrito</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Casos Activos</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Estado</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                            {u.firstName} {u.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{u.email}</div>
                        </td>

                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.625rem',
                              borderRadius: '12px',
                              backgroundColor:
                                u.role === 'ADMINISTRADOR' ? 'oklch(0.92 0.06 300)' :
                                u.role === 'JEFATURA' ? 'oklch(0.92 0.04 175)' :
                                u.role === 'ABOGADO' ? 'oklch(0.94 0.04 220)' :
                                u.role === 'PSICOLOGO' ? 'oklch(0.94 0.04 65)' :
                                u.role === 'SOCIAL' ? 'oklch(0.94 0.04 140)' : 'oklch(0.94 0.02 165)',
                              color: 'var(--bosque-profundo)',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Building2 size={15} color="var(--salvia)" />
                            <span>{u.office?.name || 'Sin asignación'}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--grafito)' }}>
                          {u._count?.assignedCaseTeam || 0}
                        </td>

                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              backgroundColor: u.isActive ? 'oklch(0.94 0.04 140)' : 'oklch(0.94 0.04 30)',
                              color: u.isActive ? 'oklch(0.35 0.12 140)' : 'oklch(0.4 0.15 30)',
                            }}
                          >
                            {u.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {u.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openEditModal(u)}
                              title="Editar Perfil / Rol / Distrito"
                              style={{
                                padding: '0.35rem 0.625rem',
                                backgroundColor: 'oklch(0.96 0.02 165)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--bosque-profundo)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Edit2 size={13} /> Editar
                            </button>

                            <button
                              onClick={() => openResetModal(u)}
                              title="Restablecer Contraseña"
                              style={{
                                padding: '0.35rem 0.625rem',
                                backgroundColor: 'oklch(0.96 0.03 65)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--tierra-calida)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Key size={13} /> Clave
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Matriz de Permisos RBAC */}
      {activeTab === 'matrix' && (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
                Matriz Institucional de Seguridad y Control de Acceso (RBAC)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
                Configuración dinámica de módulos y reglas de autorización para cada rol
              </p>
            </div>

            {currentUser?.role === 'ADMINISTRADOR' && (
              <button
                onClick={openCreateModuleModal}
                style={{
                  backgroundColor: 'var(--bosque-profundo)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  boxShadow: '0 4px 12px oklch(0.25 0.08 165 / 0.2)',
                }}
              >
                <Plus size={16} /> Crear Nuevo Módulo
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'oklch(0.96 0.02 165)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.875rem', textAlign: 'left', fontWeight: 800 }}>Módulo / Acción</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>ADMINISTRADOR</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>JEFATURA</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>ABOGADO</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>PSICÓLOGO</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>SOCIAL</th>
                  <th style={{ padding: '0.875rem', fontWeight: 800 }}>SECRETARÍA</th>
                  {currentUser?.role === 'ADMINISTRADOR' && <th style={{ padding: '0.875rem', fontWeight: 800, textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 0.75rem', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m.name}
                        <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', fontWeight: 700, backgroundColor: 'oklch(0.94 0.02 165)', color: 'var(--salvia)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {m.code}
                        </span>
                      </div>
                      {m.description && <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.15rem' }}>{m.description}</div>}
                    </td>

                    <td style={{ padding: '0.75rem', fontWeight: 700, color: m.permissions?.ADMINISTRADOR?.includes('✅') ? 'green' : 'inherit' }}>
                      {m.permissions?.ADMINISTRADOR || '✅ Total'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: m.permissions?.JEFATURA?.includes('✅') ? 'green' : m.permissions?.JEFATURA === '❌' ? 'red' : 'inherit' }}>
                      {m.permissions?.JEFATURA || '❌'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: m.permissions?.ABOGADO?.includes('📋') ? 'orange' : m.permissions?.ABOGADO?.includes('✅') ? 'green' : m.permissions?.ABOGADO === '❌' ? 'red' : 'inherit' }}>
                      {m.permissions?.ABOGADO || '❌'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: m.permissions?.PSICOLOGO?.includes('📋') ? 'orange' : m.permissions?.PSICOLOGO?.includes('✅') ? 'green' : m.permissions?.PSICOLOGO === '❌' ? 'red' : 'inherit' }}>
                      {m.permissions?.PSICOLOGO || '❌'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: m.permissions?.SOCIAL?.includes('📋') ? 'orange' : m.permissions?.SOCIAL?.includes('✅') ? 'green' : m.permissions?.SOCIAL === '❌' ? 'red' : 'inherit' }}>
                      {m.permissions?.SOCIAL || '❌'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: m.permissions?.SECRETARIA?.includes('✅') ? 'green' : m.permissions?.SECRETARIA === '❌' ? 'red' : 'inherit' }}>
                      {m.permissions?.SECRETARIA || '❌'}
                    </td>

                    {currentUser?.role === 'ADMINISTRADOR' && (
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          <button
                            onClick={() => openEditModuleModal(m)}
                            title="Editar Módulo / Permisos RBAC"
                            style={{
                              padding: '0.3rem 0.5rem',
                              backgroundColor: 'oklch(0.96 0.02 165)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: 'var(--bosque-profundo)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Edit2 size={12} /> Permisos
                          </button>
                          {m.isCustom && (
                            <button
                              onClick={() => handleDeleteModule(m)}
                              title="Eliminar Módulo Personalizado"
                              style={{
                                padding: '0.3rem 0.5rem',
                                backgroundColor: 'oklch(0.94 0.04 30)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: 'oklch(0.4 0.15 30)',
                              }}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Formulario Usuario */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--card)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', padding: '1.25rem 1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                {editingUser ? `Editar Funcionario: ${editingUser.firstName} ${editingUser.lastName}` : 'Registrar Nuevo Funcionario'}
              </h2>
            </div>

            <form onSubmit={handleSubmitUser} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Correo Institucional (@defensoria.gob.bo)
                  </label>
                  <input
                    type="email"
                    placeholder="usuario@defensoria.gob.bo"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Nombres
                  </label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Apellidos
                  </label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Rol Operativo
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                  >
                    <option value={Role.ADMINISTRADOR}>Administrador</option>
                    <option value={Role.JEFATURA}>Jefatura de Unidad</option>
                    <option value={Role.ABOGADO}>Abogado/a</option>
                    <option value={Role.PSICOLOGO}>Psicólogo/a</option>
                    <option value={Role.SOCIAL}>Trabajador/a Social</option>
                    <option value={Role.SECRETARIA}>Secretaría</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Oficina / Distrito Asignado
                  </label>
                  <select
                    value={formOfficeId}
                    onChange={(e) => setFormOfficeId(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                  >
                    {offices.map((off) => (
                      <option key={off.id} value={off.id}>
                        [{off.code}] {off.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Contraseña Inicial
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {editingUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="userActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <label htmlFor="userActive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grafito)' }}>
                    Funcionario Habilitado Operativamente
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.625rem 1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Guardando...' : editingUser ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restablecer Clave */}
      {isResetModalOpen && editingUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--card)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--tierra-calida)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Restablecer Contraseña</h2>
            </div>

            <form onSubmit={handleResetPassword} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', margin: 0 }}>
                Ingrese la nueva contraseña para <strong>{editingUser.firstName} {editingUser.lastName}</strong> ({editingUser.email}):
              </p>

              <input
                type="text"
                placeholder="Nueva Contraseña"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  style={{ padding: '0.625rem 1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--tierra-calida)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Restableciendo...' : 'Restablecer Clave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Módulo & Permisos RBAC */}
      {isModuleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '620px', backgroundColor: 'var(--card)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                {editingModule ? `Editar Módulo: ${editingModule.name}` : 'Crear Nuevo Módulo de Sistema'}
              </h2>
            </div>

            <form onSubmit={handleSubmitModule} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
              {!editingModule && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                    Código Único del Módulo (Ej. MOD_INFRACTORES)
                  </label>
                  <input
                    type="text"
                    placeholder="MOD_INFRACTORES"
                    value={modCode}
                    onChange={(e) => setModCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                  Nombre del Módulo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Módulo de Gestión de Medidas Cautelares"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.375rem' }}>
                  Descripción Operativa (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Control y seguimiento de medidas dictadas por el Juzgado"
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>
                  Configuración de Reglas de Acceso (Matriz RBAC por Rol)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  {['ADMINISTRADOR', 'JEFATURA', 'ABOGADO', 'PSICOLOGO', 'SOCIAL', 'SECRETARIA'].map((role) => (
                    <div key={role}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.25rem' }}>
                        {role}
                      </label>
                      <select
                        value={modPermissions[role] || '❌'}
                        onChange={(e) => setModPermissions({ ...modPermissions, [role]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 600, boxSizing: 'border-box' }}
                      >
                        <option value="✅ Total">✅ Total (Acceso completo)</option>
                        <option value="✅">✅ Permitido</option>
                        <option value="📋 Asignados">📋 Asignados (Solo casos asignados)</option>
                        <option value="Lectura">Lectura (Solo consulta)</option>
                        <option value="✅ Titular">✅ Titular (Acceso exclusivo)</option>
                        <option value="❌">❌ Denegado</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  style={{ padding: '0.625rem 1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Guardando...' : editingModule ? 'Actualizar Módulo' : 'Crear Módulo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
