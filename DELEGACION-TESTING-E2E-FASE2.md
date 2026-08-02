# 🎯 DELEGACIÓN: TESTING E2E + INTEGRACIÓN FRONTEND - FASE 2

**Status**: 🔴 READY TO DELEGATE  
**Fecha**: 3 Agosto 2026  
**Responsable**: Sub-agente Frontend Integration + E2E Testing  

---

## 📋 TAREA GENERAL

**Objetivo**: Validar que los 4 módulos (Legal, Psychological, Social, Transversal Tools) funcionan end-to-end con datos reales, desde la API hasta la UI.

**Entregables**:
1. ✅ Seed data ejecutado (5 casos con datos completos)
2. ✅ Frontend integrado (componentes conectados a casos reales)
3. ✅ API Testing (Swagger validación)
4. ✅ E2E Testing (Playwright)
5. ✅ Guía de testing completa

**Tiempo Estimado**: 3-4 horas  
**Modelo**: Sub-agente (código de integración simple)  
**Supervisión**: Kiro (verificación final)

---

## 🏗️ PASO 1: EJECUTAR SEED DATA

### 1.1 Generar datos de prueba para Phase 2

```bash
# Navegar a workspace
cd c:\dev\defensoria

# Ejecutar seed data (asume conexión DB local)
npx ts-node packages/db/prisma/seed-phase2-tools.ts
```

**Esperado**:
```
🌱 Starting Seed for Phase 2 Tools...
Found 10 cases to populate with tool data
📋 Seeding Legal Tools Data...
✅ Legal Tools data seeded (5 cases with discrepancies, typicality, deadlines)
🧠 Seeding Psychological Tools Data...
✅ Psychological Tools data seeded (5 cases with trauma, scales, translations)
👨‍👩‍👧‍👦 Seeding Social Tools Data...
✅ Social Tools data seeded (5 cases with family, vulnerability, environmental)
🔀 Seeding Transversal Tools Data...
✅ Transversal Tools data seeded (5 cases with timeline, anonymized reports)
🎉 All Phase 2 Tools data seeded successfully!
```

Si falla: Verificar conexión a PostgreSQL (`defensoria_admin:defensoria_dev_password@localhost:5435`)

---

## 🌐 PASO 2: INTEGRACIÓN FRONTEND

### 2.1 Crear página de testing para Legal Tools

**Archivo**: `apps/web/app/(dashboard)/legal-tools-demo/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LegalToolsPanel } from '@/components/legal-tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ToolsData {
  legalAnalysis?: any;
  psychAnalysis?: any;
  socialAnalysis?: any;
  transversalAnalysis?: any;
}

export default function LegalToolsDemoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<string>('');
  const [toolsData, setToolsData] = useState<ToolsData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Cargar lista de casos
    const loadCases = async () => {
      try {
        const response = await fetch('/api/cases', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCases(data || []);
          if (data && data.length > 0) {
            setCaseId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading cases:', err);
      }
    };

    loadCases();
  }, [user, router]);

  const loadToolsData = async () => {
    if (!caseId) {
      setError('Selecciona un caso primero');
      return;
    }

    setLoading(true);
    setError(null);
    setToolsData({});

    const token = localStorage.getItem('token');

    try {
      // Cargar Legal Tools
      const legalRes = await fetch(`/api/legal-tools/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (legalRes.ok) {
        setToolsData((prev) => ({
          ...prev,
          legalAnalysis: await legalRes.json(),
        }));
      }

      // Cargar Psychological Tools
      const psychRes = await fetch(`/api/psychological-tools/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (psychRes.ok) {
        setToolsData((prev) => ({
          ...prev,
          psychAnalysis: await psychRes.json(),
        }));
      }

      // Cargar Social Tools
      const socialRes = await fetch(`/api/social-tools/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (socialRes.ok) {
        setToolsData((prev) => ({
          ...prev,
          socialAnalysis: await socialRes.json(),
        }));
      }

      // Cargar Transversal Tools
      const transRes = await fetch(`/api/transversal-tools/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (transRes.ok) {
        setToolsData((prev) => ({
          ...prev,
          transversalAnalysis: await transRes.json(),
        }));
      }
    } catch (err) {
      setError(`Error cargando datos: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Phase 2 Tools - Demostración E2E</h1>
        <p className="text-gray-600 mt-2">
          Integración completa: API Backend → React Frontend
        </p>
      </div>

      {/* Case Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Caso de Prueba</CardTitle>
          <CardDescription>
            Carga datos de un expediente existente en la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={caseId}
            onChange={(e) => {
              setCaseId(e.target.value);
              setToolsData({});
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Selecciona un caso --</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseCode} - {c.caseType}
              </option>
            ))}
          </select>

          <button
            onClick={loadToolsData}
            disabled={!caseId || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Cargando...' : 'Cargar Herramientas'}
          </button>

          {error && (
            <div className="flex gap-2 items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tools Display */}
      {Object.keys(toolsData).length > 0 && (
        <Tabs defaultValue="legal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="legal">
              <div className="flex items-center gap-2">
                {toolsData.legalAnalysis && <CheckCircle2 size={16} className="text-green-600" />}
                Legal
              </div>
            </TabsTrigger>
            <TabsTrigger value="psychological">
              <div className="flex items-center gap-2">
                {toolsData.psychAnalysis && <CheckCircle2 size={16} className="text-green-600" />}
                Psych
              </div>
            </TabsTrigger>
            <TabsTrigger value="social">
              <div className="flex items-center gap-2">
                {toolsData.socialAnalysis && <CheckCircle2 size={16} className="text-green-600" />}
                Social
              </div>
            </TabsTrigger>
            <TabsTrigger value="transversal">
              <div className="flex items-center gap-2">
                {toolsData.transversalAnalysis && <CheckCircle2 size={16} className="text-green-600" />}
                Transv
              </div>
            </TabsTrigger>
          </TabsList>

          {toolsData.legalAnalysis && (
            <TabsContent value="legal" className="space-y-4">
              <LegalToolsPanel caseId={caseId} {...toolsData.legalAnalysis} />
            </TabsContent>
          )}

          {toolsData.psychAnalysis && (
            <TabsContent value="psychological" className="space-y-4">
              {/* <PsychologicalToolsPanel caseId={caseId} {...toolsData.psychAnalysis} /> */}
              <Card>
                <CardHeader>
                  <CardTitle>Psychological Tools (Data Loaded)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto p-4 bg-gray-50 rounded">
                    {JSON.stringify(toolsData.psychAnalysis, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {toolsData.socialAnalysis && (
            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Tools (Data Loaded)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto p-4 bg-gray-50 rounded">
                    {JSON.stringify(toolsData.socialAnalysis, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {toolsData.transversalAnalysis && (
            <TabsContent value="transversal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transversal Tools (Data Loaded)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto p-4 bg-gray-50 rounded">
                    {JSON.stringify(toolsData.transversalAnalysis, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
```

---

## 🧪 PASO 3: API TESTING (SWAGGER)

### 3.1 Verificar endpoints en Swagger

```bash
# Iniciar backend
cd apps/api
npm run start:dev

# Luego abrir: http://localhost:4000/api/docs
```

**Endpoints a validar** (todos deben retornar 200 + datos):

```bash
# Auth
POST /auth/login
  Body: { email: "abogado@defensoria.gob.bo", password: "Password123!" }
  Expected: { access_token: "...", user: {...} }

# Legal Tools (reemplazar <CASE_ID> con UUID real)
POST /legal-tools/discrepancies/analyze
  Body: { caseId: "<CASE_ID>" }
  Expected: { riskLevel: "ALTO", inconsistencies: [...] }

POST /legal-tools/typicality/analyze
  Body: { caseId: "<CASE_ID>" }
  Expected: { primaryCrime: "...", potentialCrimes: [...] }

POST /legal-tools/deadlines/calculate
  Body: { caseId: "<CASE_ID>" }
  Expected: { deadlines: [...] }

# Psychological Tools
POST /psychological-tools/indicators/extract
POST /psychological-tools/risk-scales/prefill
POST /psychological-tools/clinical-translator/translate

# Social Tools
POST /social-tools/familymap/generate
POST /social-tools/vulnerability/calculate
POST /social-tools/environmental/map

# Transversal Tools
POST /transversal-tools/timeline/unified
POST /transversal-tools/anonymizer/anonymize
```

**Verificación**: Cada endpoint retorna 200 OK + estructura JSON válida

---

## 📊 PASO 4: E2E TESTING (PLAYWRIGHT)

### 4.1 Crear spec E2E

**Archivo**: `apps/web/e2e/phase2-tools.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:4000';

test.describe('Phase 2 Tools - E2E Testing', () => {
  let authToken: string;
  let caseId: string;

  test.beforeAll(async () => {
    // Login y obtener token
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abogado@defensoria.gob.bo',
        password: 'Password123!',
      }),
    });
    const data = await response.json();
    authToken = data.access_token;
  });

  test('00. Verificar seed data ejecutado', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/cases`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const cases = await response.json();
    expect(cases.length).toBeGreaterThan(0);
    caseId = cases[0].id;
  });

  test('01. Legal Tools - Discrepancies', async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/legal-tools/discrepancies/analyze`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { caseId },
      }
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('riskLevel');
    expect(data).toHaveProperty('consistencyScore');
    expect(data).toHaveProperty('discrepancies');
  });

  test('02. Legal Tools - Typicality', async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/legal-tools/typicality/analyze`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { caseId },
      }
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('primaryCrime');
    expect(data).toHaveProperty('potentialCrimes');
  });

  test('03. Psychological Tools - Indicators', async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/psychological-tools/indicators/extract`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { caseId },
      }
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('traumaLevel');
    expect(data).toHaveProperty('indicators');
  });

  test('04. Social Tools - Family Structure', async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/social-tools/familymap/generate`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { caseId },
      }
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('familyStructure');
    expect(data).toHaveProperty('vulnerabilities');
  });

  test('05. Transversal - Timeline', async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/transversal-tools/timeline/unified`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { caseId },
      }
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('events');
    expect(Array.isArray(data.events)).toBeTruthy();
  });

  test('06. Frontend - Legal Tools Demo Page Loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'abogado@defensoria.gob.bo');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL('**/panel');

    await page.goto(`${BASE_URL}/legal-tools-demo`);
    await expect(page).toHaveTitle(/Legal Tools/i);
    await expect(page.locator('text=Demostración E2E')).toBeVisible();
  });

  test('07. Frontend - Load and Display Tools', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'abogado@defensoria.gob.bo');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Ingresar")');

    // Go to demo page
    await page.goto(`${BASE_URL}/legal-tools-demo`);

    // Select case and load tools
    const selectElement = page.locator('select');
    await selectElement.first().selectOption(caseId);
    await page.click('button:has-text("Cargar Herramientas")');

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Verify all tabs are present
    await expect(page.locator('text=Legal')).toBeVisible();
    await expect(page.locator('text=Psych')).toBeVisible();
    await expect(page.locator('text=Social')).toBeVisible();
    await expect(page.locator('text=Transv')).toBeVisible();
  });
});
```

### 4.2 Ejecutar E2E Tests

```bash
# Asegurar backend y frontend corriendo
cd apps/web
npx playwright test e2e/phase2-tools.spec.ts

# Resultado esperado: 7/7 tests PASS
```

---

## ✅ PASO 5: CREAR GUÍA DE TESTING

**Archivo**: `GUIA-TESTING-FASE2-E2E.md`

Incluir:
- Checklist de verificación
- URLs de testing
- Credenciales de prueba
- Screenshots de validación
- Troubleshooting común

---

## 📋 CHECKLIST DE ENTREGA

- [ ] Seed data ejecutado sin errores
- [ ] 5+ casos con datos completos en BD
- [ ] Frontend page para demo creada
- [ ] Todos los endpoints verificados en Swagger
- [ ] E2E tests creados y PASS (7/7)
- [ ] Guía de testing completa
- [ ] Git commits realizados
- [ ] Verificación compilación: `npx tsc --noEmit = 0 errors`
- [ ] Build exitoso: `npm run build = OK`

---

## 🎯 RESULTADO ESPERADO

```
✅ Seed data con 5 casos + herramientas
✅ API responde correctamente (12 endpoints)
✅ Frontend carga y renderiza datos
✅ E2E tests validan flujos completos
✅ 0 errores de compilación
✅ 100% funcional end-to-end
```

---

**Delegación lista para ejecutar. ¿Comenzamos?**
