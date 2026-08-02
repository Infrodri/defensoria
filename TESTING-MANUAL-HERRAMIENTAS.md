# 🧪 TESTING MANUAL - HERRAMIENTAS POR MÓDULO

Guía para probar manualmente cada herramienta rellenando datos reales.

---

## 🚀 SETUP INICIAL

### Terminal 1: Backend
```bash
cd c:\dev\defensoria\apps\api
npm run start:dev

# Esperado: Server running on http://localhost:4000
```

### Terminal 2: Frontend
```bash
cd c:\dev\defensoria\apps\web
npm run dev

# Esperado: ready on http://localhost:3100
```

---

## 🔑 LOGIN

### URL
```
http://localhost:3100/(auth)/login
```

### Credenciales por Rol

**ABOGADO (prueba Legal Tools):**
```
Email:    abogado@defensoria.gob.bo
Password: Password123!
```

**PSICÓLOGO (prueba Psychological Tools):**
```
Email:    psicologo@defensoria.gob.bo
Password: Password123!
```

**SOCIAL (prueba Social Tools):**
```
Email:    social@defensoria.gob.bo
Password: Password123!
```

---

## ⚖️ MÓDULO 1: LEGAL TOOLS (Abogado)

### Acceso
```
1. Login como ABOGADO
2. Menú lateral → ⚖️ Herramientas Legales
3. Se abre: http://localhost:3100/dashboard/herramientas
```

### Herramienta 1: Análisis de Discrepancias

**Endpoint:**
```
POST http://localhost:4000/api/legal-tools/discrepancies/analyze
```

**Requisitos:**
- caseId: ID de un caso existente
- transcriptionId: ID de una transcripción

**Cómo obtener IDs:**
```bash
# Opción 1: Swagger
http://localhost:4000/api/docs
GET /cases → Copiar un caseId
GET /cases/{id}/transcriptions → Copiar transcriptionId

# Opción 2: Base de datos (Prisma Studio)
npx prisma studio
# Tab: Case → Seleccionar caso → Ver id
# Tab: Transcription → Ver transcriptionId
```

**Request JSON:**
```json
{
  "caseId": "clzz2z5vq000008jz8z8z8z8z",
  "transcriptionId": "clzz2z5vq000008jz8z8z8z8z",
  "comparableDocuments": []
}
```

**Test con cURL:**
```bash
curl -X POST http://localhost:4000/api/legal-tools/discrepancies/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "caseId": "CASE_ID_HERE",
    "transcriptionId": "TRANS_ID_HERE"
  }'
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "discrepancies": [
    {
      "id": "d-1",
      "testimony1Index": 0,
      "testimony2Index": 1,
      "discrepancy": "Inconsistencia en la hora",
      "severity": "ALTA",
      "implication": "Podría indicar..."
    }
  ],
  "overallConsistencyScore": 72,
  "recommendation": "Se recomienda...",
  "analyzedAt": "2024-08-02T...",
  "analyzedBy": "Abogado"
}
```

### Herramienta 2: Tipicidad Penal

**Endpoint:**
```
POST http://localhost:4000/api/legal-tools/typicality/analyze
```

**Request JSON:**
```json
{
  "transcriptionId": "TRANS_ID_HERE",
  "caseTypeCode": "VIOLENCIA_INTRAFAMILIAR"
}
```

**caseTypeCodes válidos:**
```
ABUSO_SEXUAL
NEGLIGENCIA
ABANDONO
EXPLOTACION
TRATA
VIOLENCIA_INTRAFAMILIAR
DELITO_FINANCIERO
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "typicalCrimes": [
    {
      "id": "crime-1",
      "crimeType": "Violencia intrafamiliar",
      "articleNumber": "Article 291",
      "description": "...",
      "matchPercentage": 85,
      "aggravatingFactors": ["Menores presentes"],
      "mitigatingFactors": []
    }
  ],
  "primaryCrime": "Violencia intrafamiliar",
  "typicalityScore": 85,
  "recommendation": "...",
  "analyzedAt": "...",
  "analyzedBy": "Abogado"
}
```

### Herramienta 3: Vencimientos Procesales

**Endpoint:**
```
POST http://localhost:4000/api/legal-tools/deadlines/calculate
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "eventDate": "2024-08-02",
  "eventType": "DENUNCIA"
}
```

**eventTypes válidos:**
```
DENUNCIA
MEDIDAS_PROTECCION
AUDIENCIA
SENTENCIA
APELACION
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "deadlines": [
    {
      "id": "dl-1",
      "eventType": "DENUNCIA",
      "deadlineDate": "2024-09-02",
      "businessDaysRemaining": 15,
      "calendarDaysRemaining": 31,
      "legalBasis": "Article 123",
      "consequences": "Pérdida de acción",
      "priority": "ALTA"
    }
  ],
  "criticalDeadlines": 2,
  "recommendation": "...",
  "calculatedAt": "...",
  "calculatedBy": "Abogado"
}
```

---

## 🧠 MÓDULO 2: PSYCHOLOGICAL TOOLS (Psicólogo)

### Acceso
```
1. Login como PSICÓLOGO
2. Menú lateral → 🧠 Herramientas Psicológicas
3. Se abre: http://localhost:3100/dashboard/herramientas
```

### Herramienta 1: Indicadores de Trauma

**Endpoint:**
```
POST http://localhost:4000/api/psychological-tools/indicators/extract
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "transcriptionId": "TRANS_ID_HERE"
}
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "traumaLevel": "ALTO",
  "indicators": [
    {
      "id": "ind-1",
      "name": "Pesadillas recurrentes",
      "severity": "ALTA",
      "description": "El menor reporta pesadillas...",
      "evidence": "Testimonio verbal"
    }
  ],
  "overallScore": 82,
  "recommendation": "Se recomienda seguimiento psicológico intensivo",
  "analyzedAt": "...",
  "analyzedBy": "Psicólogo"
}
```

### Herramienta 2: Escalas de Riesgo

**Endpoint:**
```
POST http://localhost:4000/api/psychological-tools/risk-scales/prefill
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "transcriptionId": "TRANS_ID_HERE"
}
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "scales": [
    {
      "id": "scale-1",
      "name": "PCL-5 (TEPT)",
      "score": 45,
      "maxScore": 80,
      "interpretation": "ALTO",
      "subscales": [
        {
          "id": "sub-1",
          "name": "Re-experiencia",
          "score": 12,
          "maxScore": 20
        }
      ]
    }
  ],
  "overallClinicalRisk": "ALTO",
  "analyzedAt": "...",
  "analyzedBy": "Psicólogo"
}
```

### Herramienta 3: Traducción Clínica

**Endpoint:**
```
POST http://localhost:4000/api/psychological-tools/clinical-translator/translate
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "notesText": "Paciente muestra signos de ansiedad severa, insomnio crónico y rumiación obsesiva sobre el evento traumático. Presenta también síntomas de disociación durante entrevista."
}
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "translations": [
    {
      "id": "t-1",
      "original": "ansiedad severa",
      "translated": "Trastorno de Ansiedad Generalizada (TAG)",
      "clinicalTerm": "Severe anxiety",
      "forensicTerm": "Emotional distress impacting witness reliability",
      "explanation": "Señala alteración emocional significativa"
    }
  ],
  "keyTerms": ["TEPT", "Disociación", "Ansiedad"],
  "translatedSummary": "Menor presenta síntomas consistentes con TEPT...",
  "analyzedAt": "...",
  "analyzedBy": "Psicólogo"
}
```

### Herramienta 4: Análisis de Trauma

**Endpoint:**
```
POST http://localhost:4000/api/psychological-tools/trauma/analyze
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "indicadores": [
    "pesadillas_recurrentes",
    "ansiedad_social",
    "hipervigilancia",
    "flashbacks"
  ]
}
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "cumulativeTraumaLevel": "CRÍTICO",
  "exposureCount": 4,
  "traumaType": "TEPT complejo",
  "accumulationFactors": [
    "Exposición prolongada",
    "Víctima vulnerable",
    "Falta de apoyo"
  ],
  "overallScore": 92,
  "recommendation": "Intervención inmediata recomendada",
  "analyzedAt": "...",
  "analyzedBy": "Psicólogo"
}
```

---

## 👥 MÓDULO 3: SOCIAL TOOLS (Trabajador Social)

### Acceso
```
1. Login como SOCIAL
2. Menú lateral → 👥 Herramientas Sociales
3. Se abre: http://localhost:3100/dashboard/herramientas
```

### Herramienta 1: Estructura Familiar

**Endpoint:**
```
POST http://localhost:4000/api/social-tools/familymap/generate
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "transcriptionId": "TRANS_ID_HERE"
}
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "nnaName": "Carlos",
  "nuclearFamily": [
    {
      "id": "fm-1",
      "name": "María García",
      "relationship": "Madre",
      "age": 38,
      "livesWithNNA": true,
      "socialVulnerabilities": ["Desempleo", "Vivienda precaria"]
    }
  ],
  "extendedFamily": [
    {
      "id": "fm-2",
      "name": "Ana García",
      "relationship": "Abuela",
      "age": 65,
      "livesWithNNA": false,
      "socialVulnerabilities": []
    }
  ],
  "familyDynamics": "Familia con conflictividad moderada...",
  "vulnerabilities": ["Pobreza", "Vivienda precaria"],
  "analyzedAt": "...",
  "analyzedBy": "Trabajador Social"
}
```

### Herramienta 2: Evaluación Vulnerabilidad

**Endpoint:**
```
POST http://localhost:4000/api/social-tools/vulnerability/calculate
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "ingresos": 500,
  "vivienda": "PRECARIA",
  "cargasFamiliares": 3
}
```

**vivienda válidos:**
```
PRECARIA
INFORMAL
INADECUADA
PROPIA
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "vulnerabilityScore": 78,
  "vulnerabilityLevel": "ALTO",
  "riskFactors": [
    {
      "id": "rf-1",
      "name": "Pobreza extrema",
      "severity": "ALTA",
      "description": "Ingresos por debajo del mínimo",
      "description": "Acceso a programas de apoyo social"
    }
  ],
  "supportPrograms": [
    {
      "id": "sp-1",
      "name": "Bono Juana Azurduy",
      "type": "ASIGNACION",
      "availability": "DISPONIBLE"
    }
  ],
  "recommendations": "Se recomienda inscripción en...",
  "analyzedAt": "...",
  "analyzedBy": "Trabajador Social"
}
```

### Herramienta 3: Mapeo Ambiental

**Endpoint:**
```
POST http://localhost:4000/api/social-tools/environmental/map
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "transcriptionId": "TRANS_ID_HERE"
}
```

**Esperado:**
```json
{
  "analysisId": "uuid",
  "caseId": "case-id",
  "environmentalFactors": [
    {
      "id": "ef-1",
      "category": "SEGURIDAD",
      "factor": "Violencia comunitaria",
      "severity": "ALTA",
      "mitigationStrategy": "Apoyo psicosocial comunitario"
    }
  ],
  "riskProfile": "Entorno de alto riesgo...",
  "protectionFactors": [
    "Presencia de escuela cercana",
    "Centro de salud accesible"
  ],
  "recommendations": "Intervenciones comunitarias...",
  "analyzedAt": "...",
  "analyzedBy": "Trabajador Social"
}
```

---

## 🔗 MÓDULO 4: TRANSVERSAL TOOLS (Todos)

### Acceso
```
1. Login con cualquier rol
2. Menú lateral → (tu herramienta)
3. Desplazarse hasta "Herramientas Transversales"
```

### Herramienta 1: Línea de Tiempo Unificada

**Endpoint:**
```
POST http://localhost:4000/api/transversal-tools/timeline/unified
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE"
}
```

**Esperado:**
```json
{
  "timelineId": "uuid",
  "caseId": "case-id",
  "events": [
    {
      "id": "evt-1",
      "date": "2024-01-15",
      "title": "Denuncia inicial",
      "description": "Se recibe denuncia por negligencia",
      "type": "legal",
      "documentId": "doc-001"
    },
    {
      "id": "evt-2",
      "date": "2024-01-18",
      "title": "Evaluación psicológica",
      "description": "Realización de evaluación inicial",
      "type": "psychological",
      "metadata": { "evaluador": "Dr. López" }
    }
  ],
  "analyzedAt": "..."
}
```

### Herramienta 2: Reporte Anonimizado

**Endpoint:**
```
POST http://localhost:4000/api/transversal-tools/anonymizer/anonymize
```

**Request JSON:**
```json
{
  "caseId": "CASE_ID_HERE",
  "reporteId": "REPORTE_ID_HERE"
}
```

**Esperado:**
```json
{
  "anonymizationId": "uuid",
  "caseId": "case-id",
  "reportId": "reporte-id",
  "reportContent": "El NNA [ANONIMIZADO] de [ANONIMIZADO] años...",
  "anonymizationRules": [
    {
      "id": "rule-1",
      "original": "Carlos García López",
      "replacement": "[ANONIMIZADO-001]",
      "occurrences": 5
    }
  ],
  "confidentialityLevel": "ALTAMENTE_CONFIDENCIAL",
  "generatedAt": "...",
  "generatedBy": "Usuario"
}
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Legal Tools
- [ ] Discrepancias: Endpoint responde
- [ ] Tipicidad: Endpoint responde
- [ ] Deadlines: Endpoint responde

### Psychological Tools
- [ ] Indicadores: Endpoint responde
- [ ] Escalas: Endpoint responde
- [ ] Traducción: Endpoint responde
- [ ] Trauma: Endpoint responde

### Social Tools
- [ ] Familia: Endpoint responde
- [ ] Vulnerabilidad: Endpoint responde
- [ ] Ambiental: Endpoint responde

### Transversal Tools
- [ ] Timeline: Endpoint responde
- [ ] Anonimizar: Endpoint responde

---

## 🛠️ HERRAMIENTAS PARA TESTING

### Postman
```
1. Descargar: https://www.postman.com/downloads/
2. Crear colección con URLs arriba
3. Agregar headers: Authorization: Bearer TOKEN
```

### cURL (Terminal)
```bash
# Obtener token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"abogado@defensoria.gob.bo","password":"Password123!"}'

# Usar token en siguiente request
curl -X POST http://localhost:4000/api/legal-tools/discrepancies/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d {...}
```

### Swagger UI
```
http://localhost:4000/api/docs

Ventajas:
✅ Interfaz visual
✅ Auto-complete
✅ Documentación inline
✅ Respuestas formateadas
```

---

## 🚨 TROUBLESHOOTING

### Error: "Unauthorized"
**Solución:**
```bash
1. Verificar token está en Authorization header
2. Token debe estar con "Bearer " prefijo
3. Verificar token no esté expirado
```

### Error: "Case not found"
**Solución:**
```bash
1. Usar IDs reales de BD
2. Obtener de Swagger: GET /cases
3. O desde Prisma Studio
```

### Error: "CORS error"
**Solución:**
```bash
1. Backend debe tener CORS habilitado
2. Frontend en http://localhost:3100
3. API en http://localhost:4000
```

### Endpoint devuelve null/vacío
**Solución:**
```bash
1. Verificar datos de entrada son válidos
2. Revisar logs del backend
3. Comprobar BD tiene datos seeded
```

---

## 💡 TIPS

- **Usa Swagger primero** para entender estructura de requests
- **Copia responses** para entender qué esperar
- **Prueba con datos reales** de tu BD
- **Guarda tokens** en variable para reutilizar
- **Toma screenshots** de respuestas exitosas

---

**¡Listo para testing manual! 🎯**

