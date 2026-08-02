# 🧪 ESTADO DE TESTING - PHASE 2 HERRAMIENTAS

## ✅ COMPLETADO

### 1. **Correcciones de Sistema**
- ✅ Puerto 4100 liberado (proceso node terminado)
- ✅ API reiniciada correctamente en `http://localhost:4100/api`
- ✅ Referencias a `/tools-demo` eliminadas del sidebar
- ✅ Carpeta `/tools-demo` eliminada
- ✅ Navegación actualizada a `/herramientas` (ruta real)
- ✅ Tests e2e actualizados para usar `/herramientas`

### 2. **Documentación de Usuario Creada**
- ✅ **GUIA-ABOGADO.md**: Herramientas legales completas con casos de uso
- ✅ **GUIA-PSICOLOGO.md**: Herramientas psicológicas con protocolos clínicos
- ✅ **GUIA-SOCIAL.md**: Herramientas sociales con evaluación sociofamiliar
- ✅ **GUIA-JEFATURA.md**: Supervisión, coordinación y gestión de equipo
- ✅ **README.md actualizado**: Estructura completa de guías

### 3. **Guías Existentes (ya creadas anteriormente)**
- ✅ **FLUJO-COMPLETO-CASO-REAL.md**: Proceso completo desde denuncia hasta cierre
- ✅ **GUIA-SECRETARIA.md**: Ingreso de casos y documentación inicial
- ✅ **GUIA-ADMINISTRADOR.md**: Gestión completa del sistema

---

## 📋 TESTING PENDIENTE

### **SUITE 1: Verificación de Acceso por Roles** 🔴 LISTO PARA TESTING
**Objetivo**: Confirmar que cada rol ve solo sus herramientas asignadas

**Testing Manual Requerido**:
```
1. Login como ADMINISTRADOR → http://localhost:3100/herramientas
   ✓ Debe ver TODAS las herramientas (Legal, Psych, Social, Transversal)
   ✓ Verificar que no aparece error 403
   ✓ Confirmar tooltips funcionan
   ✓ Verificar badges de estado

2. Login como JEFATURA → http://localhost:3100/herramientas  
   ✓ Debe ver TODAS las herramientas (igual que ADMINISTRADOR)
   ✓ Verificar permisos de lectura/escritura

3. Login como ABOGADO → http://localhost:3100/herramientas
   ✓ Debe ver solo: Herramientas LEGALES y TRANSVERSALES
   ✓ NO debe ver: Herramientas PSYCH ni SOCIAL
   ✓ Verificar tooltips específicos

4. Login como PSICOLOGO → http://localhost:3100/herramientas
   ✓ Debe ver solo: Herramientas PSICOLÓGICAS y TRANSVERSALES
   ✓ NO debe ver: Herramientas LEGALES ni SOCIAL

5. Login como SOCIAL → http://localhost:3100/herramientas  
   ✓ Debe ver solo: Herramientas SOCIALES y TRANSVERSALES
   ✓ NO debe ver: Herramientas LEGALES ni PSYCH

6. Login como SECRETARIA → http://localhost:3100/herramientas
   ✓ Debe ver mensaje: "No tienes herramientas asignadas"
   ✓ O redirigir a su panel de trabajo
```

**Archivos para revisar en consola del navegador**:
- Buscar: `console.log('[DEBUG Herramientas]')`
- Debe mostrar: rol del usuario y herramientas disponibles

---

### **SUITE 2: Tooltips y UX** 🔴 LISTO PARA TESTING
**Objetivo**: Verificar que los tooltips y badges funcionan correctamente

**Testing Manual**:
```
1. Hover sobre título de cualquier herramienta
   ✓ Debe aparecer tooltip con:
     - Descripción clara
     - Pasos de uso (numerados)
     - Beneficios concretos

2. Verificar Badge de estado en cada herramienta
   ✓ "ACTIVA" (verde) - Si tiene datos
   ✓ "DISPONIBLE" (azul) - Si no tiene datos pero usuario puede usar
   ✓ "SIN ACCESO" (gris) - Si no tiene permiso

3. Verificar Tips cuando no hay datos
   ✓ Debe mostrar sugerencias de cuándo usar la herramienta
   ✓ Debe tener botón de acción claro
```

---

### **SUITE 3: Flujo Real de Caso** 🟡 REQUIERE DATOS
**Objetivo**: Probar flujo completo desde denuncia hasta uso de herramientas

**Pre-requisitos**:
- Base de datos con al menos 1 caso de prueba
- Usuario SECRETARIA, JEFATURA y al menos 1 PROFESIONAL

**Flujo a testear** (según FLUJO-COMPLETO-CASO-REAL.md):
```
FASE 1: SECRETARIA ingresa caso nuevo
  → http://localhost:3100/ingreso
  ✓ Crear NNA
  ✓ Crear caso
  ✓ Adjuntar documentos básicos
  ✓ Guardar con estado "PENDIENTE_ASIGNACIÓN"

FASE 2: JEFATURA asigna caso
  → http://localhost:3100/casos
  ✓ Buscar caso "PENDIENTE_ASIGNACIÓN"
  ✓ Asignar a ABOGADO o PSICOLOGO o SOCIAL
  ✓ Verificar cambio de estado a "EN_PROCESO"

FASE 3: PROFESIONAL trabaja el caso
  → http://localhost:3100/casos (ver caso asignado)
  → http://localhost:3100/herramientas (usar herramientas)
  
  Si es ABOGADO:
    ✓ Usar "Tipicidad Penal"
    ✓ Usar "Plazos Procesales"
    ✓ Generar informe legal
  
  Si es PSICOLOGO:
    ✓ Usar "Indicadores de Trauma"
    ✓ Usar "Escalas de Riesgo"
    ✓ Generar informe psicológico
  
  Si es SOCIAL:
    ✓ Usar "Mapa Familiar"
    ✓ Usar "Vulnerabilidad Social"
    ✓ Generar informe social

FASE 4: Verificar en expediente
  → http://localhost:3100/casos/[CASO_ID]
  ✓ Ver análisis generados
  ✓ Ver documentos adjuntados
  ✓ Ver timeline de acciones
```

---

## 🔧 ARCHIVOS DE TESTING AUTOMATIZADO

### **Tests E2E Actualizados**:
```
Archivo: apps/web/e2e/phase2-tools.spec.ts
Ubicación de cambios:
  - Línea 70: Cambió /tools-demo → /herramientas
  - Línea 76: Variable isAtToolsDemo → isAtHerramientas
  - Línea 91: Comentario actualizado
```

**Para ejecutar tests E2E**:
```powershell
# NO EJECUTAR AHORA - Solo referencia
cd apps/web
npm run test:e2e
```

### **Tests Unitarios de Servicios**:
```
⚠️ NOTA: Los siguientes tests tienen fallos PREEXISTENTES (no causados por cambios actuales):
  - apps/api/src/modules/legal-tools/legal-tools.service.spec.ts
  - apps/api/src/modules/psychological-tools/psychological-tools.service.spec.ts
  - apps/api/src/modules/social-tools/social-tools.service.spec.ts

Fallos: Mock incompleto de RAGService
Acción: Registrado para corrección futura (no es bloqueante para testing funcional)
```

---

## 📊 URLS DE TESTING

### **Aplicación Web** (Frontend):
```
http://localhost:3100/ingreso          - Login
http://localhost:3100/panel            - Dashboard
http://localhost:3100/casos            - Expedientes
http://localhost:3100/herramientas     - Herramientas Phase 2 (RUTA REAL)
http://localhost:3100/admin/tools-verification  - Panel de verificación Admin
```

### **API** (Backend):
```
http://localhost:4100/api              - Base API
http://localhost:4100/api/docs         - Swagger Documentation
```

---

## 🎯 PRÓXIMOS PASOS PARA EL USUARIO

### **1. TESTING INMEDIATO** (Usuario debe hacer):
```bash
# 1. Verificar que el frontend esté corriendo
# Si no está, iniciar:
cd c:\dev\defensoria
npm run dev --workspace=@defensoria/web

# 2. Abrir navegador en modo incógnito
# Chrome: Ctrl + Shift + N
# Edge: Ctrl + Shift + P

# 3. Acceder a: http://localhost:3100/ingreso

# 4. Hacer login con diferentes roles y probar según SUITE 1
```

### **2. REPORTAR RESULTADOS** (Usuario debe enviar):
```
Para cada rol testeado, reportar:
  ✓ Rol: [ADMINISTRADOR/JEFATURA/ABOGADO/PSICOLOGO/SOCIAL/SECRETARIA]
  ✓ URL testeada: http://localhost:3100/herramientas
  ✓ Herramientas visibles: [Lista]
  ✓ Errores en consola: [Sí/No - copiar si hay]
  ✓ Tooltips funcionan: [Sí/No]
  ✓ Badges aparecen: [Sí/No]
  ✓ Capturas de pantalla: [Adjuntar]
```

### **3. DESPUÉS DEL TESTING**:
```
Una vez confirmado que funciona:
  → Remover console.log de debug
  → Ejecutar tests E2E
  → Generar reporte final
```

---

## 🐛 ERRORES CONOCIDOS Y SOLUCIONES

### **Error: "listen EADDRINUSE: address already in use :::4100"**
**Solución**: ✅ YA CORREGIDO
```powershell
# Si vuelve a ocurrir:
netstat -ano | Select-String ":4100"
Stop-Process -Id [PID] -Force
```

### **Error: "403 Forbidden al usar herramientas"**
**Causa**: Hardcode de rol en services (YA CORREGIDO)
**Verificación**: Revisar logs de API para confirmar que usa `user.role` del token

### **Error: "No se ven tooltips"**
**Verificar**:
1. Archivo existe: `apps/web/components/ui/tooltip.tsx`
2. Importado en: `apps/web/app/(dashboard)/herramientas/page.tsx`
3. TOOL_DESCRIPTIONS tiene campo `steps` en: `apps/web/lib/role-access.ts`

---

## 📁 ARCHIVOS MODIFICADOS EN ESTA SESIÓN

```
✅ apps/web/components/layout/sidebar.tsx
   - Línea ~11: /tools-demo → /herramientas (ADMINISTRADOR)
   - Línea ~148: /tools-demo → /herramientas (NAV_GROUPS_ADMINISTRADOR)

✅ apps/web/app/(dashboard)/tools-demo/
   - ELIMINADA completamente

✅ apps/web/e2e/phase2-tools.spec.ts
   - Línea 70-76: Actualizado a /herramientas
   - Línea 91: Comentario actualizado

✅ GUIAS-USUARIO-HERRAMIENTAS/
   - GUIA-ABOGADO.md (CREADO)
   - GUIA-PSICOLOGO.md (CREADO)
   - GUIA-SOCIAL.md (CREADO)
   - GUIA-JEFATURA.md (CREADO)
   - README.md (ACTUALIZADO)

✅ TESTING-PHASE2-STATUS.md (ESTE ARCHIVO)
```

---

## 🚀 ESTADO DEL SISTEMA

```
✅ API: CORRIENDO en puerto 4100
✅ Frontend: Debe estar en puerto 3100 (verificar)
✅ Database: Prisma debe estar conectado
✅ Navegación: Actualizada a rutas reales
✅ Documentación: Completa para todos los roles
```

**LISTO PARA TESTING MANUAL** 🎯

---

## 📝 NOTAS IMPORTANTES

1. **No ejecutar tests automáticos aún**: Primero hacer testing manual
2. **Usar modo incógnito**: Para evitar cache del navegador
3. **Revisar consola**: Buscar logs de debug para diagnosticar problemas
4. **Documentar con capturas**: Facilita identificar problemas visuales
5. **Seguir guías de usuario**: Usar las guías creadas como referencia

**¿Listo para testing?** El usuario debe ahora hacer el testing manual según SUITE 1, SUITE 2 y reportar resultados.