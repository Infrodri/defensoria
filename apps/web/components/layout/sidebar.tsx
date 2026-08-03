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
  LogOut,
  Shield,
  Building2,
  BrainCircuit,
  Database,
  BookOpen,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  // ─── ADMINISTRADOR ───────────────────────────────────────────────
  // Cargos: Secretaria de Desarrollo GAM / Directora DNA Sucre
  ADMINISTRADOR: [
    { label: 'Panel General',        href: '/panel',                     icon: LayoutDashboard },
    { label: 'Agenda y Citas',       href: '/agenda',                    icon: Calendar },
    { label: 'Expedientes',          href: '/casos',                     icon: FileText },
    { label: 'Inicio de caso',      href: '/ingesta-caso',              icon: UserPlus },
    { label: 'Inspecciones',         href: '/inspecciones',              icon: ShieldCheck },
    { label: 'Reportes GAM',         href: '/reportes',                  icon: FileText },
    { label: 'Balanceo de Equipo',   href: '/equipo',                    icon: Users },
    { label: 'Personal & Permisos',  href: '/permisos',                  icon: Users },
    { label: 'Oficinas y Distritos', href: '/oficinas',                  icon: Building2 },
    { label: 'Auditoría Total',      href: '/auditoria',                 icon: ShieldCheck },
    { label: 'Herramientas',         href: '/herramientas',              icon: ShieldCheck },
    { label: 'Verificar Herramientas', href: '/admin/tools-verification', icon: BrainCircuit },
    { label: 'Configuración IA',     href: '/panel/admin/ia',            icon: BrainCircuit },
    { label: 'Base de Conocimiento', href: '/panel/admin/conocimiento',  icon: Database },
    { label: 'Disciplinas',          href: '/panel/admin/disciplinas',   icon: BookOpen },
    { label: 'Catálogos',            href: '/panel/admin/catalogos',     icon: Building2 },
    { label: 'Mantenimiento',        href: '/panel/admin/mantenimiento', icon: Shield },
  ],

  // ─── JEFATURA ────────────────────────────────────────────────────
  // Cargos: Jefe/a de Defensorías / Coordinadora/or Distrital
  // NO tiene: Config IA, Base Conocimiento, Catálogos, Mantenimiento, Permisos
  JEFATURA: [
    { label: 'Panel General',              href: '/panel',          icon: LayoutDashboard },
    { label: 'Agenda y Citas',             href: '/agenda',         icon: Calendar },
    { label: 'Expedientes',                href: '/casos',          icon: FileText },
    { label: 'Inicio de caso',             href: '/ingesta-caso',   icon: UserPlus },
    { label: 'Inspecciones',               href: '/inspecciones',   icon: ShieldCheck },
    { label: 'Reportes de Inhabilitación', href: '/reportes',       icon: ClipboardList },
    { label: 'Balanceo de Equipo',         href: '/equipo',         icon: Users },
    { label: 'Herramientas',               href: '/herramientas',   icon: ShieldCheck },
    { label: 'Auditoría',                  href: '/auditoria',      icon: ShieldCheck },
  ],

  // ─── SECRETARIA ──────────────────────────────────────────────────
  // Cargos: Secretaria/o / Auxiliar Administrativo
  SECRETARIA: [
    { label: 'Panel General',   href: '/panel',        icon: LayoutDashboard },
    { label: 'Agenda y Citas',  href: '/agenda',       icon: Calendar },
    { label: 'Inicio de caso', href: '/ingesta-caso', icon: UserPlus },
    { label: 'Inspecciones',    href: '/inspecciones', icon: ShieldCheck },
    { label: 'Expedientes',     href: '/casos',        icon: FileText },
  ],

  // ─── ABOGADO ─────────────────────────────────────────────────────
  ABOGADO: [
    { label: 'Panel General',        href: '/panel',              icon: LayoutDashboard },
    { label: 'Mis Casos Asignados',  href: '/casos',              icon: FileText },
    { label: 'Herramientas Legales', href: '/herramientas',       icon: ShieldCheck },
    { label: 'Inspecciones',         href: '/inspecciones',       icon: ShieldCheck },
    { label: 'Copiloto IA',          href: '/copilot',            icon: BrainCircuit },
  ],

  // ─── PSICOLOGO ───────────────────────────────────────────────────
  PSICOLOGO: [
    { label: 'Panel General',         href: '/panel',             icon: LayoutDashboard },
    { label: 'Mis Casos Asignados',   href: '/casos',             icon: FileText },
    { label: 'Herramientas Psicológicas', href: '/herramientas',  icon: BrainCircuit },
    { label: 'Indicadores de Riesgo', href: '/riesgo',            icon: ShieldCheck },
    { label: 'Copiloto IA',           href: '/copilot',           icon: BrainCircuit },
  ],

  // ─── SOCIAL ──────────────────────────────────────────────────────
  SOCIAL: [
    { label: 'Panel General',         href: '/panel',             icon: LayoutDashboard },
    { label: 'Mis Casos Asignados',   href: '/casos',             icon: FileText },
    { label: 'Herramientas Sociales', href: '/herramientas',      icon: Users },
    { label: 'Directorio Derivación', href: '/derivacion',        icon: Users },
    { label: 'Copiloto IA',           href: '/copilot',           icon: BrainCircuit },
  ],

  // ─── REFERENTE_TUTOR ─────────────────────────────────────────────
  // Tutor legal del NNA. Vista mínima: solo el expediente asignado.
  // El portal completo está en /portal (ruta separada del dashboard).
  REFERENTE_TUTOR: [
    { label: 'Estado del Caso',    href: '/casos',    icon: FileText },
    { label: 'Mis Citas',          href: '/agenda',   icon: Calendar },
    { label: 'Portal del Tutor',   href: '/portal',   icon: ExternalLink },
  ],
};

const NAV_GROUPS_ADMINISTRADOR: NavGroup[] = [
  {
    groupLabel: 'Operación',
    items: [
      { label: 'Panel General',       href: '/panel',        icon: LayoutDashboard },
      { label: 'Agenda y Citas',      href: '/agenda',       icon: Calendar },
      { label: 'Expedientes',         href: '/casos',        icon: FileText },
      { label: 'Inicio de caso',     href: '/ingesta-caso', icon: UserPlus },
      { label: 'Inspecciones',        href: '/inspecciones', icon: ShieldCheck },
      { label: 'Reportes GAM',        href: '/reportes',     icon: FileText },
      { label: 'Balanceo de Equipo',  href: '/equipo',       icon: Users },
    ],
  },
  {
    groupLabel: 'Gestión Institucional',
    items: [
      { label: 'Personal & Permisos',        href: '/permisos',    icon: Users },
      { label: 'Oficinas y Distritos',        href: '/oficinas',    icon: Building2 },
      { label: 'Auditoría Total',             href: '/auditoria',   icon: ShieldCheck },
      { label: 'Reportes Inhabilitaciones',   href: '/reportes',    icon: ClipboardList },
    ],
  },
  {
    groupLabel: 'Sistema',
    items: [
      { label: 'Herramientas',           href: '/herramientas',              icon: ShieldCheck },
      { label: 'Verificar Herramientas', href: '/admin/tools-verification', icon: BrainCircuit },
      { label: 'Configuración IA',     href: '/panel/admin/ia',            icon: BrainCircuit },
      { label: 'Base de Conocimiento', href: '/panel/admin/conocimiento',  icon: Database },
      { label: 'Disciplinas',          href: '/panel/admin/disciplinas',   icon: BookOpen },
      { label: 'Catálogos',            href: '/panel/admin/catalogos',     icon: Building2 },
      { label: 'Mantenimiento',        href: '/panel/admin/mantenimiento', icon: Shield },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role || 'SECRETARIA';
  const isAdmin = role === 'ADMINISTRADOR';
  const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.SECRETARIA;

  // Helper para renderizar un ítem (evita duplicar JSX)
  const renderItem = (item: NavItem, groupLabel?: string) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={groupLabel ? `${item.href}-${groupLabel}` : item.href}
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
  };

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
        height: '100vh',
        flexShrink: 0,
        boxSizing: 'border-box',
        overflowY: 'auto',
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
          {isAdmin
            ? NAV_GROUPS_ADMINISTRADOR.map((group) => (
                <div key={group.groupLabel} style={{ marginBottom: '0.25rem' }}>
                  <div style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'oklch(0.65 0.04 175)',
                    padding: '0.75rem 0.875rem 0.375rem',
                  }}>
                    {group.groupLabel}
                  </div>
                  {group.items.map((item) => renderItem(item, group.groupLabel))}
                </div>
              ))
            : navItems.map((item) => renderItem(item))
          }
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
