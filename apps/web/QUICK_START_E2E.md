# ⚡ QUICK START - E2E TESTS

Inicio rápido para ejecutar los E2E tests de Phase 2.

---

## 1️⃣ PREPARAR AMBIENTE

### Terminal 1 - Backend API
```bash
cd apps/api
npm run start:dev
# Esperado: "Server running on http://localhost:4000"
```

### Terminal 2 - Base de Datos (si es necesario)
```bash
npx prisma db seed
# Esperado: "✓ Seed completed successfully"
```

### Terminal 3 - Frontend
```bash
cd apps/web
npm run dev
# Esperado: "ready - started server on 0.0.0.0:3100"
```

---

## 2️⃣ EJECUTAR TESTS

### Opción A: Todos los tests (Recomendado)
```bash
cd apps/web
npm run test:e2e
```

**Esperado: 27+ tests PASS ✅**

### Opción B: Interface Visual (Mejor para desarrollo)
```bash
cd apps/web
npm run test:e2e:ui
```

Se abrirá interface visual donde ves los tests en tiempo real.

### Opción C: Un test específico
```bash
cd apps/web
npx playwright test -g "Login válido"
```

### Opción D: Modo Debug (Debugging)
```bash
cd apps/web
npm run test:e2e:debug
```

Se abre Playwright Inspector para debuggear paso a paso.

---

## 3️⃣ VERIFICAR RESULTADOS

### Ver Reporte HTML
```bash
cd apps/web
npm run test:e2e:report
```

Se abrirá automáticamente en el navegador.

### Ver Errores
```bash
# Los errores se muestran en la terminal
# Si hay fallos, revisa test-results/
```

---

## 📋 CREDENCIALES

```
Email: abogado@defensoria.gob.bo
Password: Password123!
```

---

## 🔗 URLS

- **Frontend:** http://localhost:3100
- **API:** http://localhost:4000/api
- **Swagger:** http://localhost:4000/api/docs
- **Tools Demo:** http://localhost:3100/tools-demo

---

## ✅ CHECKLIST

- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 3100
- [ ] BD con seed data
- [ ] Ejecuté: `npm run test:e2e`
- [ ] Todos los tests PASS
- [ ] Reviré reporte: `npm run test:e2e:report`

---

## ⚠️ Si algo falla

### "Port already in use"
```bash
# Encontrar proceso
lsof -i :3100

# Matarlo
kill -9 <PID>
```

### "No cases available"
```bash
npx prisma db seed
```

### "Test timeout"
```bash
# Ejecutar con más debug info
npm run test:e2e:ui

# Verificar que servicios están corriendo
# En terminal separada: curl http://localhost:4000/api
```

### "Connection refused"
```bash
# Verificar Backend
curl http://localhost:4000/api
# Debería devolver respuesta (no error)

# Si falla, iniciar Backend:
cd apps/api && npm run start:dev
```

---

## 📖 Más Información

- Ver detalles: [TESTING_GUIDE_PHASE2.md](./TESTING_GUIDE_PHASE2.md)
- Ver ejemplos: [e2e/README.md](./e2e/README.md)
- Ver helpers: [e2e/helpers.ts](./e2e/helpers.ts)

---

## 🎯 Próximos Pasos

1. ✅ Ejecuta tests: `npm run test:e2e`
2. ✅ Verifica reportes: `npm run test:e2e:report`
3. ✅ Revisa TESTING_GUIDE_PHASE2.md para más detalles
4. ✅ Usa `npm run test:e2e:ui` para desarrollo

---

**¡Listo para ejecutar! 🚀**

```bash
cd apps/web && npm run test:e2e
```
