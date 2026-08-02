'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Users, Shield, UserCheck, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EquipoPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load team users
    fetchApi('/auth/me')
      .then(() => {
        // Mock team view or load users
        setUsers([
          { id: '1', firstName: 'Carlos', lastName: 'Mendoza', role: 'ABOGADO', activeCases: 4 },
          { id: '2', firstName: 'Sofía', lastName: 'Ríos', role: 'PSICOLOGO', activeCases: 6 },
          { id: '3', firstName: 'Roberto', lastName: 'Quinteros', role: 'SOCIAL', activeCases: 5 },
          { id: '4', firstName: 'Mariana', lastName: 'Soliz', role: 'SECRETARIA', activeCases: 0 },
        ]);
      })
      .catch(() => toast.error('Error al cargar equipo'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Balanceo de Equipo Interdisciplinario
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Gestión de carga laboral de los profesionales asignados en la Defensoría Central Sucre
        </p>
      </div>

      {loading ? (
        <div style={{ opacity: 0.6 }}>Cargando equipo profesional...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {users.map((member) => (
            <div
              key={member.id}
              style={{
                backgroundColor: 'var(--card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: 'var(--papel)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Users size={20} color="var(--bosque-profundo)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
                    {member.firstName} {member.lastName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)' }}>
                    {member.role}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Casos Activos Asignados</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
                  {member.activeCases}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
