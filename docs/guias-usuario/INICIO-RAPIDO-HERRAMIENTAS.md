# ⚡ INICIO RÁPIDO - HERRAMIENTAS POR PROFESIONAL

**3 pasos para ver las herramientas en acción**

---

## 🔧 PASO 1: COMPILAR Y EJECUTAR

### Terminal 1 - Backend (si no está corriendo)
```bash
cd c:\dev\defensoria\apps\api
npm run start:dev
# Esperado: Server running on http://localhost:4100
```

### Terminal 2 - Frontend
```bash
cd c:\dev\defensoria\apps\web
npm run build
npm run dev
# Esperado: ready - started server on 0.0.0.0:3100
```

---

## 🔑 PASO 2: ACCEDER COMO ABOGADO

### Abre navegador
```
URL: http://localhost:3100/(auth)/ingreso
```

### Ingresa credenciales
```
Email:    abogado@defensoria.gob.bo
Password: Password123!
```

### Haz click en "Ingresar"

**Esperado:** Se redirige a dashboard `/panel`

---

## 👀 PASO 3: VER MENÚ DE HERRAMIENTAS

### En el menú lateral izquierdo, verás:

```
📋 DNA SUCRE
├─ ⊠ Panel General
├─ 📄 Mis Casos Asignados
├─ ⚖️ Herramientas Legales          ← AQUÍ (NUEVO)
├─ 🛡️ Inspecciones
└─ 🤖 Copiloto IA
```

### Haz click en "⚖️ Herramientas Legales"

**Resultado:** Se abre página `/herramientas` mostrando:

```
═══════════════════════════════════════════════════════════
🔧 HERRAMIENTAS DE ANÁLISIS
Profesional: Carlos Mendoza • Rol: ABOGADO
═══════════════════════════════════════════════════════════

┌─────────────────────────┐  ┌─────────────────────────┐
│ ⚖️ HERRAMIENTAS LEGALES │  │ 🧠 HERRAMIENTAS PSICO.. │
│ (3 herramientas)        │  │ (4 herramientas)        │
│                         │  │                         │
│ ⚖️ Análisis de          │  │ 🧠 Indicadores de       │
│    Discrepancias        │  │    Trauma               │
│ [Lectura/Edición]       │  │ [Lectura]               │
│                         │  │                         │
│ 📋 Tipicidad Penal      │  │ 📊 Escalas de Riesgo    │
│ [Lectura/Edición]       │  │ [Lectura]               │
│                         │  │                         │
│ ⏰ Vencimientos         │  │ 💬 Traducción Clínica   │
│    Procesales           │  │ [Lectura]               │
│ [Lectura/Edición]       │  │                         │
│                         │  │ 🔍 Análisis de Trauma   │
│ [Acceder al Módulo →]   │  │ [Lectura]               │
│                         │  │                         │
└─────────────────────────┘  │ [Acceder al Módulo →]   │
                             └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ 👥 HERRAMIENTAS SOCIAL  │  │ 🔗 TRANSVERSALES        │
│ (3 herramientas)        │  │ (2 herramientas)        │
│ [Lectura]               │  │ [Lectura/Edición]       │
│                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘
```

---

## 🔄 CAMBIAR A OTRO ROL

### Para ver Psicólogo:
```bash
1. En esquina superior derecha: Click en [Carlos Mendoza]
2. Selecciona "Cerrar sesión"
3. Vuelve a Login con:
   
   Email:    psicologo@defensoria.gob.bo
   Password: Password123!
   
4. Verás en menú: 🧠 Herramientas Psicológicas (diferente)
```

### Para ver Trabajador Social:
```bash
Email:    social@defensoria.gob.bo
Password: Password123!

Menú mostrará: 👥 Herramientas Sociales
```

---

## 📊 COMPARATIVA DE MENÚS

### Menú del ABOGADO
```
⊠ Panel General
📄 Mis Casos Asignados
⚖️ Herramientas Legales     ← Acceso TOTAL
🛡️ Inspecciones
🤖 Copiloto IA
```

### Menú del PSICÓLOGO
```
⊠ Panel General
📄 Mis Casos Asignados
🧠 Herramientas Psicológicas ← Acceso TOTAL
📊 Indicadores de Riesgo
🤖 Copiloto IA
```

### Menú del TRABAJADOR SOCIAL
```
⊠ Panel General
📄 Mis Casos Asignados
👥 Herramientas Sociales    ← Acceso TOTAL
👤 Directorio Derivación
🤖 Copiloto IA
```

---

## ✅ VERIFICACIÓN RÁPIDA

Marca lo que veas funcionar:

- [ ] Abogado ve "⚖️ Herramientas Legales"
- [ ] Psicólogo ve "🧠 Herramientas Psicológicas"
- [ ] Trabajador Social ve "👥 Herramientas Sociales"
- [ ] Página /herramientas carga sin errores
- [ ] Se muestran módulos según rol
- [ ] Permisos muestran RW o R correctamente
- [ ] Cambiar de usuario cambia herramientas

---

## 🚀 PRÓXIMOS PASOS

Una vez que todo esté funcionando:

1. **Conectar componentes** - Agregar funcionalidad a cada herramienta
2. **Edición y guardado** - Permitir modificar análisis
3. **Integración IA** - Solicitar análisis a IA por rol
4. **Backend Guards** - Proteger endpoints con @Roles()
5. **Testing** - E2E tests para cada rol

---

## 💡 TIPS

### Para ver en tiempo real cambios:
```bash
# En terminal de frontend
npm run dev

# El servidor recarga automáticamente con cambios
```

### Para debuggear permisos:
```javascript
// Abre consola del navegador (F12 → Console)
// Y ejecuta:
localStorage.getItem('dna_token')  // Ver token
// O revisa Network → GraphQL/API calls
```

### Si no ves cambios:
```bash
1. Ctrl+Shift+R (recarga completa, no caché)
2. O abre en pestaña anónima
3. O limpiar localStorage:
   localStorage.clear()
```

---

## 🎉 ¡LISTO!

**Ya tienes el sistema de herramientas por profesional funcionando.**

Ahora cada usuario puede:
- ✅ Ver menú específico de su rol
- ✅ Acceder a herramientas autorizadas
- ✅ Ver permisos (lectura vs edición)
- ✅ Consultar herramientas de otros equipos

---

**Tiempo estimado:** 5 minutos para compilar + 2 minutos para verificar = **7 minutos totales**

¿Todo funcionando? ¡Felicidades! 🎊

