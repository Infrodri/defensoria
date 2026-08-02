'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Search, Bell, ShieldAlert, Building2 } from 'lucide-react';

export function Topbar() {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        flexShrink: 0,
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input
            type="text"
            placeholder="Buscar por NNA, carnet, o código DNA-YYYY-NNNN..."
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              backgroundColor: 'var(--papel)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Token de Seguridad Documental Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: 'oklch(0.96 0.02 165)',
            border: '1px solid var(--salvia)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--bosque-profundo)',
          }}
        >
          <ShieldAlert size={14} color="var(--salvia)" />
          <span>Token Seguridad: Verificado (15m)</span>
        </div>

        {/* Office Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8 }}>
          <Building2 size={16} />
          <span>{user?.office?.name || 'Oficina Central'}</span>
        </div>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          <Bell size={20} color="var(--grafito)" />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--tierra-calida)',
            }}
          />
        </button>
      </div>
    </header>
  );
}
