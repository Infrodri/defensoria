'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { HardDrive, Download, Users, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  office?: { name: string };
}

export default function MaintenanceAdminPage() {
  const { user } = useAuth();
  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="El módulo de respaldo (pg_dump) y transferencia masiva de expedientes es exclusivo del Administrador General." />
    );
  }

  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [fromUserId, setFromUserId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchApi<UserItem[]>('/users');
      setUsers(data || []);
    } catch {
      setUsers([]);
    }
  };

  const handleDownloadBackup = async () => {
    setDownloadingBackup(true);
    setMessage({ text: 'Generando volcado de PostgreSQL (pg_dump)... Por favor espera unos segundos.', type: 'info' });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dna_token') : '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

      const response = await fetch(`${API_URL}/system-backup/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo generar el backup. Verifica pg_dump.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `dna-sucre-backup-${timestamp}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ text: '¡Copia de seguridad descargada exitosamente en formato .sql!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al generar la copia de seguridad.', type: 'error' });
    } finally {
      setDownloadingBackup(false);
    }
  };

  const handleMassTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUserId || !toUserId) {
      setMessage({ text: 'Debe seleccionar el usuario origen y el usuario destino', type: 'error' });
      return;
    }
    if (fromUserId === toUserId) {
      setMessage({ text: 'El usuario origen y destino no pueden ser la misma persona', type: 'error' });
      return;
    }

    setTransferring(true);
    try {
      const res = await fetchApi<{ message: string; transferredCount: number }>('/cases/admin/mass-transfer', {
        method: 'POST',
        body: JSON.stringify({
          fromUserId,
          toUserId,
          reason: transferReason || 'Transferencia masiva por reestructuración administrativa',
        }),
      });

      setMessage({ text: res.message || `Se transfirieron ${res.transferredCount} expedientes activos.`, type: 'success' });
      setFromUserId('');
      setToUserId('');
      setTransferReason('');
    } catch (err: any) {
      setMessage({ text: err.message || 'No se pudo realizar la transferencia masiva.', type: 'error' });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={32} color="var(--tierra-calida)" /> Mantenimiento & Seguridad del Sistema
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Gestión de copias de seguridad locales y transferencia masiva de expedientes.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Card 1: Copia de Seguridad PostgreSQL */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={20} color="var(--tierra-calida)" /> Copia de Seguridad Local (pg_dump)
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1.25rem' }}>
              Genera un volcado en UTF-8 de la base de datos PostgreSQL de la Defensoría para respaldar expedientes, auditoría y catálogos.
            </p>

            <div style={{ backgroundColor: 'oklch(0.96 0.02 165)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid oklch(0.90 0.04 165)', fontSize: '0.8125rem', color: 'var(--grafito)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.25rem' }}>
                <CheckCircle2 size={16} color="var(--salvia)" /> Garantía Soberana
              </div>
              El archivo descargado contiene sentencias SQL que permiten restaurar la base de datos sin pérdida de caracteres especiales ni dependencia de internet.
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={downloadingBackup}
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Download size={16} />
              {downloadingBackup ? 'Generando Volcado SQL...' : 'Descargar Backup SQL'}
            </button>
          </div>
        </section>

        {/* Card 2: Transferencia Masiva de Casos */}
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--salvia)" /> Transferencia Masiva de Expedientes
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginBottom: '1.25rem' }}>
            Reasigna todos los casos activos de un funcionario que sale de la institución hacia un nuevo profesional del mismo rol.
          </p>

          <form onSubmit={handleMassTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Origen (Saliente)</label>
                <select
                  value={fromUserId}
                  onChange={(e) => setFromUserId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem', backgroundColor: 'var(--papel)' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Destino (Receptor)</label>
                <select
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8125rem', backgroundColor: 'var(--papel)' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Motivo de Transferencia</label>
              <input
                type="text"
                placeholder="Ej. Transferencia por baja de contrato"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={transferring || !fromUserId || !toUserId}
                style={{
                  backgroundColor: 'var(--salvia)',
                  color: 'white',
                  border: 'none',
                  padding: '0.625rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ArrowRight size={16} />
                {transferring ? 'Reasignando Casos...' : 'Ejecutar Transferencia Masiva'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
