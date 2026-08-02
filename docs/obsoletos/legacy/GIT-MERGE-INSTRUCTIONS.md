# 🔀 GIT: MERGE A DEVELOP Y RELEASE

**Instrucciones paso a paso para mergear Fase 2 a develop y crear release v1.1.0**

---

## 📋 PRE-REQUISITOS

Verificar que:
- [ ] Backend build SUCCESS: `cd apps/api && npm run build`
- [ ] Frontend build SUCCESS: `cd apps/web && npm run build`
- [ ] E2E tests PASS: `cd apps/web && npm run test:e2e`
- [ ] TypeScript 0 errors: `cd apps/web && npx tsc --noEmit --skipLibCheck`
- [ ] Todos los cambios están en branch `feature/backend-tools-parallel`
- [ ] Git status limpio: `git status`

---

## 🔄 PASOS PARA MERGE

### Paso 1: Verificar Rama Actual

```bash
git branch
# Debe mostrar: * feature/backend-tools-parallel
```

### Paso 2: Actualizar branch develop (opcional pero recomendado)

```bash
git fetch origin
git checkout develop
git pull origin develop
```

### Paso 3: Volver a feature branch

```bash
git checkout feature/backend-tools-parallel
git pull origin feature/backend-tools-parallel
```

### Paso 4: Rebase en develop (opcional, para historial limpio)

```bash
git rebase develop
# Si hay conflictos, resolverlos y:
# git add .
# git rebase --continue
```

### Paso 5: Cambiar a develop

```bash
git checkout develop
```

### Paso 6: Mergear feature branch

```bash
git merge feature/backend-tools-parallel --no-ff
```

**Esto abrirá un editor para el mensaje de merge. Escribir:**

```
Merge feature/backend-tools-parallel: Fase 2 DNA Sucre Completa

- 12 endpoints backend (Legal, Psychological, Social, Transversal)
- 14 componentes React integrados
- 11 modelos de base de datos
- 27 E2E tests funcionales
- Documentación completa
- 0 TypeScript errors
- Production ready

Commits incluidos:
- Backend: 4 módulos con 12 endpoints
- Frontend: 14 componentes + API integration
- Testing: Suite E2E completa
- DB: Seed data 30+ registros

Verificado:
- Backend build: ✅ SUCCESS
- Frontend build: ✅ SUCCESS
- E2E tests: ✅ 27 PASS
- TypeScript: ✅ 0 errors
```

### Paso 7: Subir cambios a develop

```bash
git push origin develop
```

### Paso 8: Crear release tag

```bash
git tag -a v1.1.0 -m "Release v1.1.0: Fase 2 DNA Sucre - Herramientas Integradas"
```

### Paso 9: Subir tag

```bash
git push origin v1.1.0
```

### Paso 10: Eliminar rama feature (opcional)

```bash
git branch -d feature/backend-tools-parallel
git push origin --delete feature/backend-tools-parallel
```

---

## 📊 VERIFICAR MERGE

### Revisar historial

```bash
git log --oneline -10
# Debe mostrar el merge en la rama develop
```

### Revisar tags

```bash
git tag -l
# Debe mostrar: v1.1.0
```

### Revisar ramas

```bash
git branch -a
# develop debe estar actualizada
```

---

## 🔍 VERIFICAR CONTENIDO POST-MERGE

### Archivos nuevos en develop

```bash
git diff develop~1..develop --name-only | head -20
```

Debe incluir:
- `apps/api/src/modules/legal-tools/*`
- `apps/api/src/modules/psychological-tools/*`
- `apps/api/src/modules/social-tools/*`
- `apps/api/src/modules/transversal-tools/*`
- `apps/web/components/legal-tools/*`
- `apps/web/components/psychological-tools/*`
- `apps/web/components/social-tools/*`
- `apps/web/components/transversal-tools/*`
- `apps/web/app/(dashboard)/tools-demo/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/hooks/useToolsData.ts`
- `apps/web/e2e/phase2-tools.spec.ts`

### Compilar desde develop

```bash
git checkout develop

cd apps/api && npm run build
# ✅ Success

cd ../web && npm run build
# ✅ Success
```

### Ejecutar tests desde develop

```bash
cd apps/web
npm run test:e2e
# ✅ 27 passed
```

---

## 🚀 DEPLOY A STAGING (opcional)

### Si tienes CI/CD configurado

```bash
# Git automáticamente ejecutará:
# 1. npm install
# 2. npm run build
# 3. npm run test
# 4. Deploy a staging

# Ver status en
https://github.com/tuorganizacion/proyecto/actions
```

---

## 📝 REVERTIR MERGE (si algo sale mal)

### Si necesitas deshacer el merge

```bash
# Opción 1: Revert (crea un nuevo commit que deshace los cambios)
git revert -m 1 HEAD
git push origin develop

# Opción 2: Reset (elimina el commit)
git reset --hard HEAD~1
git push origin develop --force-with-lease
```

**Nota:** Usar --force-with-lease en lugar de --force es más seguro en trabajo colaborativo.

---

## 📋 CHECKLIST FINAL

### Pre-Merge
- [ ] Backend compilado exitosamente
- [ ] Frontend compilado exitosamente
- [ ] E2E tests pasados: 27/27
- [ ] TypeScript sin errores
- [ ] Git status limpio (sin cambios sin commitear)
- [ ] Rama develop actualizada

### Merge
- [ ] Ejecutado: git merge feature/backend-tools-parallel
- [ ] Mensaje de merge descriptivo
- [ ] Cambios pushados: git push origin develop

### Post-Merge
- [ ] Verificado historial: git log
- [ ] Tag creado: v1.1.0
- [ ] Backend build exitoso en develop
- [ ] Frontend build exitoso en develop
- [ ] E2E tests pasados en develop
- [ ] Rama feature eliminada (opcional)

### Release
- [ ] Tag v1.1.0 creado y pusheado
- [ ] Notas de release creadas (si usas GitHub)
- [ ] Comunicado a stakeholders
- [ ] Documentación actualizada

---

## 🎉 DEPLOY A PRODUCCIÓN (si aplica)

### Cuando todo esté listo

```bash
# 1. Crear rama de hotfix si es necesario
git checkout -b release/v1.1.0

# 2. Cualquier ajuste final
# ... cambios ...

# 3. Mergear a main/master
git checkout main
git merge release/v1.1.0

# 4. Taggear release
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main
git push origin v1.1.0

# 5. Deploy automático (según tu CI/CD)
```

---

## 📞 TROUBLESHOOTING

### Error: "fatal: 'origin/develop' does not exist"

```bash
# Solución: Fetch del repositorio remoto
git fetch origin
git checkout develop
```

### Error: "CONFLICT in file X"

```bash
# Solución: Resolver conflictos
# 1. Abrir archivo con conflicto
# 2. Buscar marcadores de conflicto (<<< === >>>)
# 3. Elegir qué mantener
# 4. Guardar archivo
git add .
git commit -m "Resolver conflictos de merge"
```

### Error: "rejected: updates were rejected because the tip of your current branch is behind"

```bash
# Solución: Actualizar rama
git pull origin develop
git push origin develop
```

### Error: "fatal: Could not read Username"

```bash
# Solución: Configurar credenciales Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
# O usar SSH key en lugar de HTTPS
```

---

## 📖 REFERENCIAS

### Comandos Git Útiles

```bash
# Ver cambios
git diff develop..feature/backend-tools-parallel

# Ver commits no mergeados
git log develop..feature/backend-tools-parallel

# Ver estado de ramas
git branch -vv

# Ver historial gráfico
git log --oneline --graph --all

# Limpiar ramas locales
git branch -D nombrerama
```

### Documentación

- [Git Merge Docs](https://git-scm.com/docs/git-merge)
- [Git Tag Docs](https://git-scm.com/docs/git-tag)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)

---

## 🎯 RESUMEN

### Comando Rápido (versión resumida)

```bash
# 1. Asegurar que estás en feature branch
git checkout feature/backend-tools-parallel

# 2. Actualizar y mergear
git fetch origin
git checkout develop
git pull origin develop
git merge feature/backend-tools-parallel --no-ff

# 3. Escribir mensaje de merge (editor se abre automáticamente)
# Mensaje ya preparado en este documento

# 4. Subir cambios
git push origin develop

# 5. Crear release
git tag -a v1.1.0 -m "Release v1.1.0: Fase 2 DNA Sucre - Herramientas Integradas"
git push origin v1.1.0

# ¡Hecho! 🎉
```

---

## ✅ VERIFICACIÓN FINAL

Después del merge, verificar:

```bash
# En rama develop
git checkout develop
git pull origin develop

# Verificar que los archivos están
ls apps/api/src/modules/legal-tools/
ls apps/web/components/legal-tools/
ls apps/web/app/\(dashboard\)/tools-demo/

# Compilar
npm run build

# Tests
cd apps/web && npm run test:e2e

# ¡Si todo es verde, estamos listos! 🚀
```

---

**Documento creado:** 2026-08-02
**Versión:** 1.0
**Status:** ✅ Listo para ejecutar

**¡Felicidades por llegar a esta etapa! El merge está listo. 🎉**

