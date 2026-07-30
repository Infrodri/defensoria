'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  UserPlus,
  Users,
  Calendar,
  ShieldCheck,
  Key,
  LogOut,
  Shield,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  JEFATURA: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Expedientes', href: '/casos', icon: FileText },
    { label: 'Ingesta de Caso', href: '/ingesta-caso', icon: UserPlus },
    { label: 'Balanceo de Equipo', href: '/equipo', icon: Users },
    { label: 'Auditoría', href: '/auditoria', icon: ShieldCheck },
    { label: 'Permisos', href: '/permisos', icon: Key },
  ],
  SECRETARIA: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Ingesta de Caso', href: '/ingesta-caso', icon: UserPlus },
    { label: 'Agenda Centralizada', href: '/agenda', icon: Calendar },
    { label: 'Expedientes', href: '/casos', icon: FileText },
  ],
  ABOGADO: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Mis Casos Asignados', href: '/casos', icon: FileText },
    { label: 'Copilot Jurídico', href: '/copilot', icon: ShieldCheck },
  ],
  PSICOLOGO: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Mis Casos Asignados', href: '/casos', icon: FileText },
    { label: 'Indicadores de Riesgo', href: '/riesgo', icon: ShieldCheck },
  ],
  SOCIAL: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Mis Casos Asignados', href: '/casos', icon: FileText },
    { label: 'Directorio de Derivación', href: '/derivacion', icon: Users },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role || 'JEFATURA';
  const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.JEFATURA;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bosque-profundo)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        minHeight: '100vh',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', marginBottom: '2rem' }}>
          <Shield size={28} color="var(--tierra-calida)" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.05em' }}>DNA SUCRE</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Gestión de Casos</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'oklch(0.45 0.06 175)' : 'transparent',
                  color: isActive ? 'white' : 'oklch(0.90 0 0)',
                  textDecoration: 'none',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--tierra-calida)' : 'currentColor'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ borderTop: '1px solid oklch(0.45 0.06 175)', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, color: 'var(--tierra-calida)', fontWeight: 600 }}>
            {user?.role}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'oklch(0.85 0 0)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <LogOut size={16} /> Salir del sistema
        </button>
      </div>
    </aside>
  );
}
