#!/bin/bash
# ==============================================================================
# Script de Despliegue de Producción - Proyecto Defensoría (Turborepo + Docker)
# Servidor Target: Ubuntu Server (ThinkPad X230) - 192.168.100.200
# Arquitectura Oficial de IA: Qwen2.5 (Texto), Nomic (Embeddings), Llama3.2 (Visión)
# ==============================================================================

set -e # Detener el script si hay algún error

echo "🚀 Iniciando despliegue de producción del proyecto Defensoría..."

# 1. Preparar el directorio y clonar/actualizar el repositorio
echo "📂 Preparando directorio base..."
mkdir -p ~/proyectos && cd ~/proyectos

if [ ! -d "defensoria" ]; then
    echo "⬇️ Clonando el repositorio por primera vez..."
    git clone https://github.com/Infrodri/defensoria.git
    cd defensoria
    git checkout fix/report-category-unification
else
    echo "🔄 El repositorio ya existe. Actualizando cambios..."
    cd defensoria
    git fetch
    git checkout fix/report-category-unification
    git pull origin fix/report-category-unification
fi

# 2. Configurar Variables de Entorno (.env)
echo "🔐 Configurando archivo de variables de entorno (.env)..."
cat << 'EOF' > .env
POSTGRES_USER=defensoria_prod
POSTGRES_PASSWORD=tu_password_seguro_db
POSTGRES_DB=defensoria_prod_db
DATABASE_URL="postgresql://defensoria_prod:tu_password_seguro_db@postgres:5432/defensoria_prod_db?schema=public"

MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=tu_password_seguro_minio

JWT_SECRET=tu_secreto_super_seguro_para_tokens

# Configuración de URLs del Monorepo
NEXT_PUBLIC_API_URL=http://192.168.100.200:4100/api
OLLAMA_HOST=http://192.168.100.200:11434

# Stack de Modelos Oficiales de la Defensoría
OLLAMA_MODEL=qwen2.5:7b-instruct-q4_K_M
OLLAMA_VISION_MODEL=llama3.2-vision
OCR_API_URL=http://localhost:8001/v1/vision
WHISPER_API_URL=http://whisper:8000/v1/audio/transcriptions
EOF

# 3. Iniciar Contenedores (Producción / Monorepo)
echo "🐳 Construyendo y levantando contenedores Docker..."
docker compose -f docker-compose.prod.yml up -d --build

# Esperar unos segundos a que la BD inicialice antes de migrar
echo "⏳ Esperando 10 segundos para que PostgreSQL esté listo..."
sleep 10

# 4. Ejecutar Esquema de Base de Datos y Semillas (Prisma ORM + pgvector)
echo "🗄️ Aplicando migraciones de base de datos..."
# Nota: Si la migración falla porque los datos ya existen, ejecutar manualmente: 
# docker exec -it defensoria_api_prod sh -c "npx prisma migrate resolve --applied [migration_name] --schema=packages/db/prisma/schema.prisma"
docker exec -it defensoria_api_prod sh -c "npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma"

echo "🌱 Inyectando semillas (Datos iniciales para roles)..."
docker exec -it defensoria_api_prod sh -c "cd packages/db && npx prisma db seed"

# 5. Descargar el Stack de Modelos Oficiales
echo "🧠 Descargando modelo de IA Local Texto (qwen2.5:7b-instruct-q4_K_M)..."
docker exec -i ia_ollama ollama pull qwen2.5:7b-instruct-q4_K_M

echo "📚 Descargando modelo de Embeddings (nomic-embed-text)..."
docker exec -i ia_ollama ollama pull nomic-embed-text

echo "👁️ Descargando modelo de Visión/OCR (llama3.2-vision)..."
docker exec -i ia_ollama ollama pull llama3.2-vision

echo "🧹 Limpiando modelos obsoletos o erróneos para liberar RAM..."
docker exec -i ia_ollama ollama rm qwen2.5-vl || true
docker exec -i ia_ollama ollama rm qwen2.5 || true

echo "✅ ========================================================="
echo "🎉 ¡Despliegue finalizado con éxito!"
echo "🌐 Puertos de Servicio Activos:"
echo "   - Frontend (Next.js):   http://192.168.100.200:3100"
echo "   - Backend (NestJS):     http://192.168.100.200:4100"
echo "   - MinIO Storage:        http://192.168.100.200:9001"
echo "   - Ollama IA API:        http://192.168.100.200:11434"
echo "   - Whisper API:          http://192.168.100.200:8000"
echo "=========================================================="
