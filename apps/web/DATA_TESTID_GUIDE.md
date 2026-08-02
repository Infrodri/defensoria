# 🎯 Data-TestID Guide - Phase 2 Tools

Guía para agregar atributos `data-testid` a componentes para facilitar testing E2E.

---

## ¿Por qué data-testid?

Los atributos `data-testid` son selectores específicamente diseñados para testing:

```typescript
// ✅ BUENO - data-testid
await page.locator('[data-testid="legal-panel"]').isVisible();

// ❌ MALO - Selectores frágiles
await page.locator('.panel-container .tools-wrapper > div').isVisible();
```

Ventajas:
- No cambian con CSS
- Semánticamente claros
- Desacoplados de estilos
- Fáciles de mantener

---

## Componentes a Actualizar

### Legal Tools

#### LegalToolsPanel
```tsx
<div data-testid="legal-tools-panel">
  <DiscrepancyAnalysis data-testid="legal-discrepancies" />
  <PenalTypicality data-testid="legal-penal-typicality" />
  <ProcessualDeadlines data-testid="legal-deadlines" />
</div>
```

#### DiscrepancyAnalysis
```tsx
<div data-testid="discrepancy-analysis">
  <div data-testid="discrepancy-item" key={discrepancy.id}>
    <span data-testid={`severity-${discrepancy.severity}`}>
      {discrepancy.severity}
    </span>
  </div>
</div>
```

### Psychological Tools

#### PsychologicalToolsPanel
```tsx
<div data-testid="psychological-tools-panel">
  <TraumaIndicators data-testid="trauma-indicators" />
  <RiskScales data-testid="risk-scales" />
  <ClinicalTranslation data-testid="clinical-translation" />
</div>
```

#### TraumaIndicators
```tsx
<div data-testid="trauma-indicators-container">
  <div data-testid="trauma-indicator-item" key={indicator.id}>
    <span data-testid={`severity-${indicator.severity}`}>
      {indicator.severity}
    </span>
  </div>
</div>
```

### Social Tools

#### SocialToolsPanel
```tsx
<div data-testid="social-tools-panel">
  <FamilyStructure data-testid="family-structure" />
  <VulnerabilityAssessment data-testid="vulnerability-assessment" />
</div>
```

#### FamilyStructure
```tsx
<div data-testid="family-structure-container">
  <div data-testid="family-member-item" key={member.id}>
    {member.name} ({member.relationship})
  </div>
</div>
```

### Transversal Tools

#### TransversalToolsPanel
```tsx
<div data-testid="transversal-tools-panel">
  <UnifiedTimeline data-testid="unified-timeline" />
  <AnonymizedReport data-testid="anonymized-report" />
</div>
```

#### UnifiedTimeline
```tsx
<div data-testid="timeline-container">
  <div data-testid="timeline-event" key={event.id}>
    <span data-testid={`event-type-${event.type}`}>
      {event.type}
    </span>
  </div>
</div>
```

---

## Convención de Nombres

### Formato Base
```
data-testid="<component>-<element>"
```

### Ejemplos

```typescript
// Containers
data-testid="legal-tools-panel"
data-testid="discrepancy-analysis"
data-testid="trauma-indicators"
data-testid="family-structure"
data-testid="timeline-container"

// Items
data-testid="discrepancy-item"
data-testid="trauma-indicator-item"
data-testid="family-member-item"
data-testid="timeline-event"

// Status/Severity
data-testid="severity-ALTA"
data-testid="severity-MEDIA"
data-testid="severity-BAJA"
data-testid="status-EN_TIEMPO"

// Controls
data-testid="load-button"
data-testid="case-selector"
data-testid="tab-legal"
data-testid="error-container"

// Headers/Labels
data-testid="page-title"
data-testid="user-info"
data-testid="loading-spinner"
```

---

## Cómo Agregar data-testid

### Paso 1: Identificar Elementos Clave

Elementos que necesitan `data-testid`:
- Containers principales
- Items listados
- Elementos con estado (loading, error)
- Elementos interactivos importantes
- Elementos con valores dinámicos

### Paso 2: Actualizar Componentes

**Antes:**
```tsx
export function DiscrepancyAnalysis({ discrepancies }) {
  return (
    <div>
      <h2>Análisis de Discrepancias</h2>
      {discrepancies.map((d) => (
        <div key={d.id}>
          <span>{d.severity}</span>
        </div>
      ))}
    </div>
  );
}
```

**Después:**
```tsx
export function DiscrepancyAnalysis({ discrepancies }) {
  return (
    <div data-testid="discrepancy-analysis">
      <h2 data-testid="analysis-title">Análisis de Discrepancias</h2>
      {discrepancies.map((d) => (
        <div key={d.id} data-testid="discrepancy-item">
          <span data-testid={`severity-${d.severity}`}>{d.severity}</span>
        </div>
      ))}
    </div>
  );
}
```

### Paso 3: Usar en Tests

```typescript
test('Discrepancies render correctly', async ({ page }) => {
  // Usar data-testid en lugar de selectores complejos
  const analysis = page.locator('[data-testid="discrepancy-analysis"]');
  await expect(analysis).toBeVisible();

  const items = page.locator('[data-testid="discrepancy-item"]');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);

  // Verificar severidad específica
  const highSeverity = page.locator('[data-testid="severity-ALTA"]');
  expect(await highSeverity.count()).toBeGreaterThanOrEqual(0);
});
```

---

## Archivos a Modificar

### Priority 1 (Crítico)
- [ ] `legal-tools/legal-tools-panel.tsx`
- [ ] `psychological-tools/psychological-tools-panel.tsx`
- [ ] `social-tools/social-tools-panel.tsx`
- [ ] `transversal-tools/transversal-tools-panel.tsx`

### Priority 2 (Alto)
- [ ] `legal-tools/discrepancy-analysis.tsx`
- [ ] `psychological-tools/trauma-indicators.tsx`
- [ ] `social-tools/family-structure.tsx`
- [ ] `transversal-tools/unified-timeline.tsx`

### Priority 3 (Medio)
- [ ] Todos los demás componentes en legal-tools/
- [ ] Todos los demás componentes en psychological-tools/
- [ ] Todos los demás componentes en social-tools/
- [ ] Todos los demás componentes en transversal-tools/

---

## Ejemplo Completo

### Antes

```tsx
// legal-tools/legal-tools-panel.tsx
export function LegalToolsPanel({ caseId, discrepancyAnalysis }) {
  return (
    <div className="legal-tools">
      <div className="panel-header">
        <h2>Análisis Legal</h2>
      </div>
      <div className="panel-content">
        <DiscrepancyAnalysis discrepancies={discrepancyAnalysis.discrepancies} />
        <PenalTypicality crimes={discrepancyAnalysis.crimes} />
        <ProcessualDeadlines deadlines={discrepancyAnalysis.deadlines} />
      </div>
    </div>
  );
}
```

### Después

```tsx
// legal-tools/legal-tools-panel.tsx
export function LegalToolsPanel({ caseId, discrepancyAnalysis }) {
  return (
    <div className="legal-tools" data-testid="legal-tools-panel">
      <div className="panel-header">
        <h2 data-testid="legal-panel-title">Análisis Legal</h2>
      </div>
      <div className="panel-content" data-testid="legal-panel-content">
        <DiscrepancyAnalysis 
          discrepancies={discrepancyAnalysis.discrepancies}
          data-testid="legal-discrepancies"
        />
        <PenalTypicality 
          crimes={discrepancyAnalysis.crimes}
          data-testid="legal-penal-typicality"
        />
        <ProcessualDeadlines 
          deadlines={discrepancyAnalysis.deadlines}
          data-testid="legal-deadlines"
        />
      </div>
    </div>
  );
}
```

---

## Validación

### Verificar que data-testid existen

```bash
# Buscar data-testid en componentes
grep -r "data-testid" apps/web/components/

# Contar data-testid
grep -r "data-testid" apps/web/components/ | wc -l
```

### Tests usando data-testid

```bash
# Ejecutar tests que usan data-testid
npm run test:e2e -- -g "data-testid"
```

---

## Checklist

### Legal Tools Panel
- [ ] `legal-tools-panel` agregado
- [ ] `legal-discrepancies` agregado
- [ ] `legal-penal-typicality` agregado
- [ ] `legal-deadlines` agregado
- [ ] `discrepancy-item` agregado
- [ ] `severity-*` agregados

### Psychological Tools Panel
- [ ] `psychological-tools-panel` agregado
- [ ] `trauma-indicators` agregado
- [ ] `risk-scales` agregado
- [ ] `clinical-translation` agregado
- [ ] `trauma-indicator-item` agregado
- [ ] `severity-*` agregados

### Social Tools Panel
- [ ] `social-tools-panel` agregado
- [ ] `family-structure` agregado
- [ ] `vulnerability-assessment` agregado
- [ ] `family-member-item` agregado
- [ ] Relationship types agregados

### Transversal Tools Panel
- [ ] `transversal-tools-panel` agregado
- [ ] `unified-timeline` agregado
- [ ] `anonymized-report` agregado
- [ ] `timeline-event` agregado
- [ ] `event-type-*` agregados

### Page Elements
- [ ] `page-title` agregado
- [ ] `case-selector` agregado
- [ ] `load-button` agregado
- [ ] `tab-buttons` agregados
- [ ] `user-info` agregado
- [ ] `error-container` agregado
- [ ] `loading-spinner` agregado

---

## Recursos

- [Playwright Locators](https://playwright.dev/docs/locators)
- [data-testid Best Practices](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

---

**Creado:** 2024-02-15
**Versión:** 1.0.0
**Status:** 📋 Implementation Pending
