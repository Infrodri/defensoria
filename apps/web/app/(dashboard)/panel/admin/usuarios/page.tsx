'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { UserCog, Plus, Save, XCircle, CheckCircle2, Trash2, RefreshCw, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  officeId?: string | null;
  disciplineId?: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

const ROLES: { value: string; label: string; color: string }[] = [
  { value: 'ADMINISTRADOR', label: 'Administrador General', color: 'oklch(0.93 0.04 220)' },
  { value: 'JEFATURA', label: 'Jefatura de Unidad', color: 'oklch(0.93 0.04 175)' },
  { value: 'ABOGADO', label: 'Abogado', color: 'oklch(0.94 0.04 220)' },
  { value: 'PSICOLOGO', label: 'Psicólogo', color: 'oklch(0.94 0.04 65)' },
  { value: 'SOCIAL', label: 'Trabajador Social', color: 'oklch(0.94 0.04 140)' },
  { value: 'SECRETARIA', label: 'Secretaría', color: 'oklch(0.94 0.04 30)' },
];

export default function UsuariosAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<UserItem>>({});
  const [saving, setSaving] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: '', userName: '' });
  const [deleting, setDeleting] = useState(false);

  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La administración de usuarios del sistema es exclusiva del Administrador General." />
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<UserItem[]>('/admin/usuarios');
      setUsers(data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', role: '', isActive: true });
    setEditingUser(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (u: UserItem) => {
    setEditingUser(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, isActive: u.isActive, officeId: u.officeId, disciplineId: u.disciplineId });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.role) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await fetchApi(`/admin/usuarios/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await fetchApi('/admin/usuarios', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        toast.success('Usuario creado correctamente');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;

    setDeleting(true);
    try {
      await fetchApi(`/admin/usuarios/${deleteDialog.userId}`, { method: 'DELETE' });
      toast.success('Usuario eliminado correctamente');
      setDeleteDialog({ isOpen: false, userId: '', userName: '' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find((r) => r.value === role) || { value: role, label: role, color: 'var(--papel)' };
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserCog size={32} color="var(--tierra-calida)" /> Gestión de Usuarios del Sistema
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Administra cuentas profesionales, roles y permisos de acceso a la plataforma defensoria.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={openCreateForm}
          style={{
            backgroundColor: 'var(--bosque-profundo)',
            color: 'white',
            border: 'none',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Plus size={16} /> Nuevo Usuario
        </button>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--grafito)',
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <UserCog size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
          <p>No hay usuarios registrados en el sistema.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Usuario</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Email</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Rol</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Último Acceso</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roleInfo = getRoleInfo(u.role);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--bosque-profundo)' }}>
                        {u.firstName} {u.lastName}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', opacity: 0.8 }}>{u.email}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '12px', backgroundColor: roleInfo.color, color: 'var(--bosque-profundo)' }}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {u.isActive ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.12 140)', backgroundColor: 'oklch(0.92 0.06 140)', padding: '0.25rem 0.5rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={12} /> Activo
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.12 30)', backgroundColor: 'oklch(0.92 0.06 30)', padding: '0.25rem 0.5rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <XCircle size={12} /> Inactivo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', opacity: 0.6, fontSize: '0.8125rem' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-BO') : 'Nunca'}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => openEditForm(u)}
                        style={{
                          backgroundColor: 'var(--papel)',
                          border: '1px solid var(--border)',
                          color: 'var(--bosque-profundo)',
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDialog({ isOpen: true, userId: u.id, userName: `${u.firstName} ${u.lastName}` })}
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
                          gap: '0.2rem',
                        }}
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button type="button" onClick={closeForm} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--grafito)' }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre</label>
                  <input type="text" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Apellido</label>
                  <input type="text" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
                <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@ejemplo.com" style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rol</label>
                <select value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.875rem' }}>
                  <option value="">Selecciona un rol</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <span style={{ fontSize: '0.875rem' }}>Usuario activo</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={closeForm} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '2px solid #7f1d1d', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trash2 size={32} color="#7f1d1d" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7f1d1d' }}>¿Eliminar usuario?</h2>
              <p style={{ color: 'var(--grafito)', margin: 0, marginTop: '0.5rem' }}>Esta acción no se puede deshacer. Se eliminará <strong>{deleteDialog.userName}</strong> del sistema.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeleteDialog({ isOpen: false, userId: '', userName: '' })} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
              <button type="button" onClick={handleDelete} disabled={deleting} style={{ backgroundColor: '#7f1d1d', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={14} /> {deleting ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
