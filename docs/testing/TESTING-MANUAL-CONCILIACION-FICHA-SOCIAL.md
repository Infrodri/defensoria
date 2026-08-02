# 🧪 TESTING MANUAL - FICHA SOCIAL Y CONCILIACIÓN

**Fecha**: 1 de agosto de 2026  
**Objetivo**: Verificar funcionamiento completo de las correcciones legales implementadas  
**Duración Estimada**: 30-45 minutos

---

## 🎯 PRE-REQUISITOS

### Sistema Ejecutándose
```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

### URLs
- **Frontend**: http://localhost:3100
- **API**: http://localhost:4100/api
- **Base de Datos**: PostgreSQL corriendo

### Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| secretaria@dna.gob.bo | DNA2024secure | SECRETARIA |
| social@dna.gob.bo | DNA2024secure | SOCIAL |
| abogado@dna.gob.bo | DNA2024secure | ABOGADO |
| jefatura@dna.gob.bo | DNA2024secure | JEFATURA |

---

## 📋 TEST 1: FLUJO COMPLETO DE FICHA SOCIAL

### **Paso 1.1: Crear Caso como SECRETARIA**

1. Login como `secretaria@dna.gob.bo`
2. Ir a `/ingreso`
3. Crear un nuevo caso:
   ```
   Tipo: DENUNCIA_VULNERACION
   NNA: Crear nuevo
     - Nombre: Juan
     - Apellido: Pérez
     - Fecha nacimiento: 2015-03-15
   Narrativa: "Se recibe denuncia de negligencia parental..."
   ```
4. ✅ **VERIFICAR**: Caso creado con código único (ej: DNA-2026-0001)

### **Paso 1.2: Verificar Fase DERIVACION**

1. Ir a `/casos` → Click en el caso recién creado
2. ✅ **VERIFICAR**: 
   - Fase actual: **DERIVACION**
   - Riel de fases muestra DERIVACION como activo

### **Paso 1.3: Completar Ficha Social como TRABAJADOR SOCIAL**

1. Logout → Login como `social@dna.gob.bo`
2. Ir a `/casos` → Click en el caso
3. Navegar a `/casos/[id]/ficha-social`
4. ✅ **VERIFICAR**: Formulario se carga correctamente
5. Llenar la ficha:
   ```
   Sección 1 - Entrevista:
   - Fecha: Hoy
   - Lugar: Oficina Central - Sala 2
   
   Sección 2 - Descripción del Hecho:
   - Descripción: "Madre reporta que padre no aporta económicamente..."
   - Lugar incidente: Zona Sur, calle 21
   - Fecha incidente: 2026-07-25
   
   Sección 3 - Evaluación Social:
   - Estructura familiar: "Familia monoparental, madre trabaja..."
   - Situación económica: "Ingresos bajos, vive de alquiler..."
   - ☑️ Peligro inmediato: NO
   
   Sección 4 - Observaciones:
   - Observaciones: "Se identifica vulnerabilidad económica..."
   - Recomendaciones: "Gestionar apoyo económico temporal..."
   ```
6. Click **"Guardar Borrador"**
7. ✅ **VERIFICAR**: Mensaje "Ficha social guardada correctamente"
8. Volver a la ficha → Click **"Completar y Enviar"**
9. Confirmar la acción
10. ✅ **VERIFICAR**: 
    - Mensaje "Ficha social completada. El caso avanza a fase EVALUACION"
    - Redirige a `/casos/[id]`

### **Paso 1.4: Verificar Avance de Fase**

1. En el detalle del caso:
2. ✅ **VERIFICAR**:
   - Fase actual: **EVALUACION**
   - Riel de fases muestra EVALUACION como activo
   - En la bitácora aparece: "Ficha Social Completada" por SOCIAL

### **Paso 1.5: Verificar Ficha en Modo Lectura**

1. Volver a `/casos/[id]/ficha-social`
2. ✅ **VERIFICAR**:
   - Badge "COMPLETADA" visible
   - Todos los campos en modo lectura (disabled)
   - Fecha de completado visible
   - Nombre del trabajador social visible

---

## 📋 TEST 2: FLUJO DE CONCILIACIÓN CASO CONCILIABLE

### **Paso 2.1: Crear Caso de Conflicto Familiar**

1. Login como SECRETARIA
2. Crear caso:
   ```
   Tipo: DENUNCIA_VULNERACION (pero NO maltrato)
   Narrativa: "Conflicto entre padres por régimen de visitas..."
   ```
3. Completar ficha social como SOCIAL (sin peligro inmediato)

### **Paso 2.2: Evaluar Conciliabilidad como ABOGADO**

1. Login como `abogado@dna.gob.bo`
2. Ir al caso → Navegar a `/casos/[id]/conciliacion`
3. ✅ **VERIFICAR**: Página se carga, muestra "No evaluado aún"
4. Click **"Evaluar Conciliabilidad"**
5. Confirmar acción
6. ✅ **VERIFICAR**:
   - Alert: "✅ CASO CONCILIABLE"
   - Badge verde "CASO CONCILIABLE"
   - Fundamentación legal visible
   - Factores analizados:
     * Maltrato: ✅ NO
     * Autoridad Paterna: ✅ NO
     * Delito: ✅ NO

### **Paso 2.3: Verificar Cambio de Ruta de Intervención**

1. Volver al detalle del caso `/casos/[id]`
2. ✅ **VERIFICAR**:
   - Ruta de intervención: **CONCILIACION**
   - En bitácora: "Evaluación de Conciliabilidad" con razón
   - En historial de rutas: cambio a CONCILIACION con timestamp

### **Paso 2.4: Agendar Audiencia de Conciliación**

1. Volver a `/casos/[id]/conciliacion`
2. En la sección "Agendar Nueva Audiencia":
   ```
   Fecha: 2026-08-15 10:00
   Lugar: Sala de Audiencias - Defensoría Central
   ```
3. Click **"Agendar Audiencia de Conciliación"**
4. ✅ **VERIFICAR**:
   - Mensaje "Audiencia agendada correctamente"
   - Aparece en historial con badge "📅 PROGRAMADA"
   - Fecha, lugar y abogado visibles

### **Paso 2.5: Verificar Cita en Calendario**

1. Ir a `/casos/[id]` → Tab "Agenda / Citas"
2. ✅ **VERIFICAR**:
   - Cita "Audiencia de Conciliación" aparece
   - Tipo: AUDIENCIA
   - Fecha y lugar correctos

### **Paso 2.6: Registrar Resultado CON ACUERDO**

1. Volver a `/casos/[id]/conciliacion`
2. En sección "Registrar Resultado":
   ```
   Seleccionar: La audiencia programada
   ☑️ Se alcanzó un acuerdo conciliatorio
   Texto del acuerdo: "Las partes acuerdan régimen de visitas: 
   fines de semana alternos de 9:00 a 18:00..."
   ```
3. Click **"Registrar Resultado"**
4. ✅ **VERIFICAR**:
   - Mensaje "Acuerdo registrado correctamente"
   - Badge cambia a "✅ CON ACUERDO"
   - Texto del acuerdo visible en la card
   - Fecha de completado visible

### **Paso 2.7: Verificar Registro en Bitácora**

1. Ir a `/casos/[id]` → Tab "Bitácora"
2. ✅ **VERIFICAR**:
   - Entrada "Acuerdo de Conciliación Alcanzado"
   - Contenido incluye texto del acuerdo
   - Actuación está firmada automáticamente

---

## 📋 TEST 3: FLUJO DE CONCILIACIÓN CASO NO CONCILIABLE

### **Paso 3.1: Crear Caso de Maltrato**

1. Login como SECRETARIA
2. Crear caso:
   ```
   Tipo: DENUNCIA_VULNERACION
   Narrativa: "Se recibe denuncia por maltrato físico..."
   ```
3. Completar ficha social marcando peligro inmediato

### **Paso 3.2: Evaluar Conciliabilidad**

1. Login como ABOGADO
2. Ir a `/casos/[id]/conciliacion`
3. Click **"Evaluar Conciliabilidad"**
4. ✅ **VERIFICAR**:
   - Alert: "❌ CASO NO CONCILIABLE"
   - Badge rojo "CASO NO CONCILIABLE"
   - Fundamentación: "Caso de maltrato (Art. 24, no procede conciliación)"
   - Factor "Maltrato": ❌ SÍ

### **Paso 3.3: Verificar Derivación a VÍA JUDICIAL**

1. Volver a `/casos/[id]`
2. ✅ **VERIFICAR**:
   - Ruta de intervención: **VIA_JUDICIAL**
   - En bitácora: "Caso derivado a VÍA JUDICIAL"

### **Paso 3.4: Verificar que NO Aparecen Opciones de Conciliación**

1. Volver a `/casos/[id]/conciliacion`
2. ✅ **VERIFICAR**:
   - NO aparece sección "Agendar Nueva Audiencia"
   - NO aparece sección "Registrar Resultado"
   - Solo se muestra la evaluación con resultado negativo
   - Mensaje: "El caso debe proceder por VÍA JUDICIAL"

---

## 📋 TEST 4: CASO SIN ACUERDO EN CONCILIACIÓN

### **Paso 4.1: Crear Caso Conciliable**

1. Crear caso sin maltrato, completar ficha social
2. Evaluar como conciliable
3. Agendar audiencia

### **Paso 4.2: Registrar Resultado SIN ACUERDO**

1. En `/casos/[id]/conciliacion` → "Registrar Resultado"
2. Seleccionar la audiencia
3. ☐ NO marcar "Se alcanzó un acuerdo"
4. Click **"Registrar Resultado"**
5. ✅ **VERIFICAR**:
   - Alert: "Sin acuerdo. El caso se deriva a VÍA JUDICIAL"
   - Badge cambia a "❌ SIN ACUERDO"
   - NO se muestra texto de acuerdo

### **Paso 4.3: Verificar Derivación Automática**

1. Volver a `/casos/[id]`
2. ✅ **VERIFICAR**:
   - Ruta cambió a **VIA_JUDICIAL**
   - En bitácora: "Conciliación sin Acuerdo"
   - En historial de rutas: cambio a VIA_JUDICIAL con razón

---

## 📋 TEST 5: VALIDACIONES Y PERMISOS

### **Test 5.1: Acceso a Ficha Social**

1. Login como ABOGADO
2. Intentar acceder a `/casos/[id]/ficha-social`
3. ✅ **VERIFICAR**: Mensaje "Acceso Restringido - Solo TRABAJADORES SOCIALES"

### **Test 5.2: Acceso a Conciliación**

1. Login como SOCIAL
2. Intentar acceder a `/casos/[id]/conciliacion`
3. ✅ **VERIFICAR**: Mensaje "Acceso Restringido - Solo ABOGADOS"

### **Test 5.3: No Completar Ficha sin Validación**

1. Login como SOCIAL
2. Ir a `/casos/[id]/ficha-social`
3. Intentar enviar formulario incompleto (sin llenar campos requeridos)
4. ✅ **VERIFICAR**: Browser muestra errores de validación HTML5

### **Test 5.4: No Evaluar Dos Veces**

1. Caso ya evaluado como conciliable
2. Intentar `POST /api/conciliation/:caseId/evaluate` de nuevo
3. ✅ **VERIFICAR**: Error "Ya existe una evaluación..."

---

## 📋 TEST 6: API DIRECTA (Postman/Thunder Client)

### **Test 6.1: Crear Ficha Social**

```http
POST http://localhost:4100/api/social-intake/:caseId/create
Authorization: Bearer <token_de_social>
Content-Type: application/json

{
  "interviewDate": "2026-08-01",
  "interviewLocation": "Oficina Central",
  "incidentDescription": "Test de descripción...",
  "incidentLocation": "Zona Sur",
  "incidentDate": "2026-07-25",
  "incidentWitnesses": "",
  "familyStructure": "Familia nuclear...",
  "socialEconomicSituation": "Clase media...",
  "immediateDangerAssessment": false,
  "dangerLevel": null,
  "professionalObservations": "Observaciones...",
  "initialRecommendations": "Recomendaciones..."
}
```

**Esperado**: 201 Created, retorna objeto SocialIntakeForm

### **Test 6.2: Completar Ficha**

```http
POST http://localhost:4100/api/social-intake/:formId/complete
Authorization: Bearer <token_de_social>
```

**Esperado**: 200 OK, { success: true }

### **Test 6.3: Evaluar Conciliabilidad**

```http
POST http://localhost:4100/api/conciliation/:caseId/evaluate
Authorization: Bearer <token_de_abogado>
```

**Esperado**: 200 OK, { success: true, isConciliable: boolean }

### **Test 6.4: Agendar Audiencia**

```http
POST http://localhost:4100/api/conciliation/:caseId/schedule-hearing
Authorization: Bearer <token_de_abogado>
Content-Type: application/json

{
  "scheduledDate": "2026-08-15T10:00:00Z",
  "location": "Sala de Audiencias"
}
```

**Esperado**: 201 Created, retorna ConciliationProcess

---

## ✅ CHECKLIST FINAL

### Backend
- [ ] Modelo `SocialIntakeForm` existe en base de datos
- [ ] Modelo `ConciliationEvaluation` existe en base de datos
- [ ] Modelo `ConciliationProcess` existe en base de datos
- [ ] Endpoints `/api/social-intake/*` responden correctamente
- [ ] Endpoints `/api/conciliation/*` responden correctamente
- [ ] Validación de roles funciona (403 si no autorizado)
- [ ] Transacciones Prisma funcionan (fase avanza atómicamente)
- [ ] ActionLog se crea automáticamente

### Frontend
- [ ] Página `/casos/[id]/ficha-social` carga correctamente
- [ ] Página `/casos/[id]/conciliacion` carga correctamente
- [ ] Formularios se pueden llenar
- [ ] Botones funcionan y hacen requests a API
- [ ] Validaciones de frontend funcionan
- [ ] Estados de carga se muestran (submitting, evaluating, etc.)
- [ ] Alerts se muestran con mensajes correctos
- [ ] Modo lectura funciona en ficha completada
- [ ] Historial de audiencias se muestra correctamente

### Flujo Legal
- [ ] SECRETARIA crea caso en fase DERIVACION
- [ ] SOCIAL completa ficha → caso avanza a EVALUACION
- [ ] ABOGADO evalúa conciliabilidad → cambia ruta de intervención
- [ ] Si conciliable → puede agendar audiencias
- [ ] Si no conciliable → NO puede agendar, ruta es VIA_JUDICIAL
- [ ] Con acuerdo → se registra texto, caso sigue en CONCILIACION
- [ ] Sin acuerdo → caso se deriva a VIA_JUDICIAL automáticamente

### Trazabilidad
- [ ] Ficha social registra quién la completó y cuándo
- [ ] Evaluación registra quién evaluó y cuándo
- [ ] Audiencias registran abogado responsable
- [ ] ActionLog registra todas las acciones
- [ ] InterventionPathHistory registra cambios de ruta

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Case not found"
**Solución**: Verificar que el caseId en la URL sea válido

### Error: "Solo TRABAJADOR SOCIAL puede..."
**Solución**: Verificar que estás logueado con el usuario correcto

### Error: "El caso no está en fase DERIVACION"
**Solución**: El caso ya avanzó de fase, crear uno nuevo

### Error: "Ya existe una evaluación..."
**Solución**: No se puede evaluar dos veces, usar otro caso

### Frontend no carga
**Solución**: Verificar que `npm run dev` esté corriendo en ambos directorios

### API no responde
**Solución**: Verificar que PostgreSQL esté corriendo y DATABASE_URL sea correcto

---

## 📊 MÉTRICAS DE ÉXITO

### 100% de Casos de Prueba Pasados
- ✅ Test 1: Flujo de ficha social
- ✅ Test 2: Conciliación conciliable
- ✅ Test 3: Conciliación no conciliable
- ✅ Test 4: Sin acuerdo en conciliación
- ✅ Test 5: Validaciones y permisos
- ✅ Test 6: API directa

### Cumplimiento Legal Verificado
- ✅ Art. 25: Trabajador Social elabora ficha social
- ✅ Art. 24: Prohibición de conciliación en maltrato
- ✅ Art. 26-27: Proceso de conciliación implementado

---

**FIN DEL TESTING MANUAL**
