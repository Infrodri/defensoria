# 🔍 VERIFICACIÓN - HERRAMIENTAS POR PROFESIONAL

Guía rápida para verificar que todo funciona correctamente.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Endpoints de herramientas funcionando
- [ ] Base de datos con datos seeded
- [ ] API responde en `http://localhost:4000/api`

### Frontend
- [ ] Sistema de permisos (`role-access.ts`) ✅ CREADO
- [ ] Componente protegido (`ProtectedTool.tsx`) ✅ CREADO  
- [ ] Página de herramientas (`/herramientas`) ✅ CREADO
- [ ] Menú actualizado (`sidebar.tsx`) ✅ CREADO

---

## 🚀 PRUEBAS RÁPIDAS

### Test 1: Abogado accede a Herramientas Legales

```
1. Abre: http://localhost:3100/(auth)/login
2. Email: abogado@defensoria.gob.bo
3. Password: Password123!
4. Click en "Ingresar"

VERIFICAR:
✅ Login exitoso
✅ Redirige a /dashboard/panel
✅ En menú lateral aparece: "⚖️ Herramientas Legales"
✅ Click abre: http://localhost:3100/dashboard/herramientas
✅ Muestra:
   - Módulo: "Herramientas Legales" con 3 tools
   - Módulo: "Herramientas Psicológicas" (LECTURA)
   - Módulo: "Herramientas Sociales" (LECTURA)
   - Módulo: "Herramientas Transversales" (LECTURA/EDICIÓN)
```

**Esperado:** 
```
Legal Tools:
├─ Análisis de Discrepancias     [Lectura/Edición]
├─ Tipicidad Penal               [Lectura/Edición]
└─ Vencimientos Procesales       [Lectura/Edición]

Psychological Tools:
├─ Indicadores de Trauma         [Lectura]
├─ Escalas de Riesgo             [Lectura]
├─ Traducción Clínica            [Lectura]
└─ Análisis de Trauma            [Lectura]

Social Tools:
├─ Estructura Familiar           [Lectura]
├─ Evaluación Vulnerabilidad     [Lectura]
└─ Mapeo Ambiental               [Lectura]

Transversal Tools:
├─ Línea de Tiempo Unificada     [Lectura/Edición]
└─ Reporte Anonimizado           [Lectura/Edición]
```

---

### Test 2: Psicólogo accede a Herramientas Psicológicas

```
1. Logout del abogado (click en usuario → Cerrar sesión)
2. Email: psicologo@defensoria.gob.bo
3. Password: Password123!
4. Click en "Ingresar"

VERIFICAR:
✅ Login exitoso
✅ En menú lateral aparece: "🧠 Herramientas Psicológicas"
✅ Click abre: http://localhost:3100/dashboard/herramientas
✅ Muestra:
   - Módulo: "Herramientas Psicológicas" con 4 tools (EDICIÓN)
   - Otros módulos en LECTURA
```

**Esperado:**
```
Psychological Tools:
├─ Indicadores de Trauma         [Lectura/Edición]
├─ Escalas de Riesgo             [Lectura/Edición]
├─ Traducción Clínica            [Lectura/Edición]
└─ Análisis de Trauma            [Lectura/Edición]

Legal Tools:
├─ Análisis de Discrepancias     [Lectura]
├─ Tipicidad Penal               [Lectura]
└─ Vencimientos Procesales       [Lectura]

(y otros módulos en lectura)
```

---

### Test 3: Trabajador Social accede a Herramientas Sociales

```
1. Logout del psicólogo
2. Email: social@defensoria.gob.bo
3. Password: Password123!
4. Click en "Ingresar"

VERIFICAR:
✅ Login exitoso
✅ En menú lateral aparece: "👥 Herramientas Sociales"
✅ Click abre: http://localhost:3100/dashboard/herramientas
✅ Muestra:
   - Módulo: "Herramientas Sociales" con 3 tools (EDICIÓN)
   - Otros módulos en LECTURA
```

**Esperado:**
```
Social Tools:
├─ Estructura Familiar           [Lectura/Edición]
├─ Evaluación Vulnerabilidad     [Lectura/Edición]
└─ Mapeo Ambiental               [Lectura/Edición]

Psychological Tools:
├─ Indicadores de Trauma         [Lectura]
├─ Escalas de Riesgo             [Lectura]
├─ Traducción Clínica            [Lectura]
└─ Análisis de Trauma            [Lectura]

(y otros módulos en lectura)
```

---

## 🎨 VERIFICACIÓN VISUAL

### Menú Lateral - ABOGADO
```
┌─────────────────────┐
│ DNA SUCRE           │
│ Gestión de Caso     │
├─────────────────────┤
│ ⊠ Panel General     │ ← Aquí
│ 📅 Agenda y Citas   │
│ 📄 Mis Casos...     │
│ ⚖️ HERRAMIENTAS...  │ ← NUEVO
│ 🛡️ Inspecciones    │
│ 🤖 Copiloto IA     │
├─────────────────────┤
│ [Carlos Mendoza]    │
│ Abogado             │
│ 🚪 Cerrar sesión    │
└─────────────────────┘
```

### Menú Lateral - PSICÓLOGO
```
┌─────────────────────┐
│ DNA SUCRE           │
│ Gestión de Caso     │
├─────────────────────┤
│ ⊠ Panel General     │
│ 📅 Agenda y Citas   │
│ 📄 Mis Casos...     │
│ 🧠 HERRAMIENTAS...  │ ← NUEVO (diferente)
│ 📊 Indicadores...   │
│ 🤖 Copiloto IA     │
├─────────────────────┤
│ [Sofía Ríos]        │
│ Psicólogo           │
│ 🚪 Cerrar sesión    │
└─────────────────────┘
```

### Menú Lateral - SOCIAL
```
┌─────────────────────┐
│ DNA SUCRE           │
│ Gestión de Caso     │
├─────────────────────┤
│ ⊠ Panel General     │
│ 📅 Agenda y Citas   │
│ 📄 Mis Casos...     │
│ 👥 HERRAMIENTAS...  │ ← NUEVO (diferente)
│ 👤 Directorio...    │
│ 🤖 Copiloto IA     │
├─────────────────────┤
│ [Roberto Quinteros] │
│ Trabajo Social      │
│ 🚪 Cerrar sesión    │
└─────────────────────┘
```

---

## 📱 PÁGINA DE HERRAMIENTAS

```
┌────────────────────────────────────────────────────┐
│ 🔧 Herramientas de Análisis                        │
│ Profesional: Carlos Mendoza • Rol: ABOGADO        │
└────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ ⚖️ HERRAMIENTAS LEGALES   │  │ 🧠 HERRAMIENTAS PSIC...  │
├──────────────────────────┤  ├──────────────────────────┤
│ ⚖️ Análisis de Disc...   │  │ 🧠 Indicadores Trauma   │
│ Identifica inconsist...  │  │ Extrae indicadores de..│
│                    [RW]  │  │                    [R]  │
│                          │  │                          │
│ 📋 Tipicidad Penal       │  │ 📊 Escalas de Riesgo    │
│ Analiza si se ajusta... │  │ Pre-llena escalas...   │
│                    [RW]  │  │                    [R]  │
│                          │  │                          │
│ ⏰ Vencimientos...       │  │ 💬 Traducción Clínica   │
│ Calcula plazos legales..│  │ Traduce notas clínicas..│
│                    [RW]  │  │                    [R]  │
│                          │  │                          │
│ [Acceder al Módulo →]   │  │ [Acceder al Módulo →]   │
└──────────────────────────┘  └──────────────────────────┘

(... más módulos)

┌────────────────────────────────────────────────────┐
│ 💡 Información:                                    │
│ Las herramientas te permiten realizar análisis... │
└────────────────────────────────────────────────────┘
```

---

## 🔧 VERIFICACIÓN TÉCNICA

### 1. Compilación TypeScript
```bash
cd apps/web
npx tsc --noEmit --skipLibCheck

ESPERADO: ✅ Sin errores
```

### 2. Build Frontend
```bash
npm run build

ESPERADO: ✅ Build exitoso
```

### 3. Archivos Creados
```bash
ls -la apps/web/lib/role-access.ts
# ✅ Existe

ls -la apps/web/components/common/ProtectedTool.tsx
# ✅ Existe

ls -la apps/web/app/\(dashboard\)/herramientas/page.tsx
# ✅ Existe
```

### 4. Menú Actualizado
```bash
grep -n "Herramientas" apps/web/components/layout/sidebar.tsx

ESPERADO: 
  85:    { label: 'Herramientas Legales', href: '/herramientas', icon: ShieldCheck },
  96:    { label: 'Herramientas Psicológicas', href: '/herramientas', icon: BrainCircuit },
  107:   { label: 'Herramientas Sociales', href: '/herramientas', icon: Users },
```

---

## 🚨 TROUBLESHOOTING

### Problema: Menú no muestra "Herramientas"
**Solución:**
```bash
1. Limpiar cache del navegador (Ctrl+Shift+Del)
2. Hacer build nuevamente: npm run build
3. Reiniciar servidor: npm run dev
4. Verificar que role-access.ts está importado
```

### Problema: Error "Cannot find module role-access"
**Solución:**
```bash
1. Verificar archivo existe: ls apps/web/lib/role-access.ts
2. Si no existe, ejecutar:
   cd apps/web
   git checkout -- lib/role-access.ts
3. O recrear: copiar contenido del documento
```

### Problema: Página /herramientas abre pero no carga
**Solución:**
```bash
1. Revisar consola del navegador (F12 → Console)
2. Buscar errores de importación
3. Verificar que ProtectedTool.tsx existe
4. Verificar permisos del usuario
```

### Problema: No aparece icono de rol correcto
**Solución:**
```bash
1. Verificar role en auth-context
2. Validar que rol coincida exactamente: 'ABOGADO', 'PSICOLOGO', 'SOCIAL'
3. Revisar que mayúsculas sean correctas
```

---

## ✅ SEÑAL DE ÉXITO

Sabrás que todo funciona cuando:

1. ✅ Cada rol ve su entrada de menú específica (⚖️, 🧠, 👥)
2. ✅ Página /herramientas carga sin errores
3. ✅ Se muestran solo herramientas autorizadas
4. ✅ Permisos se muestran correctamente (RW vs R)
5. ✅ Cambiar de usuario cambia las herramientas disponibles

---

## 📊 RESUMEN DE CAMBIOS

| Componente | Cambio | Ubicación |
|-----------|--------|-----------|
| Permisos | ✅ Creado | `lib/role-access.ts` |
| Protección | ✅ Creado | `components/common/ProtectedTool.tsx` |
| Página | ✅ Creado | `app/(dashboard)/herramientas/page.tsx` |
| Menú | ✅ Actualizado | `components/layout/sidebar.tsx` |

---

## 🎯 PRÓXIMOS PASOS

1. **Verificar todo funciona** siguiendo pruebas arriba
2. **Conectar componentes** a página /herramientas
3. **Agregar funcionalidad de edición**
4. **Integrar con IA para solicitudes**
5. **Agregar guards en backend**

---

**¡Ahora cada profesional tiene su módulo de herramientas en el menú! 🚀**

