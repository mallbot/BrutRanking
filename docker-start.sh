#!/bin/bash

# Script SEGURO para iniciar BrutRanking con Docker
# Este script SOLO afecta al contenedor de BrutRanking
# NO afecta a otros contenedores en producción

set -e

echo "═══════════════════════════════════════════════════════"
echo "  🧹 BRUTRANKING - DESPLIEGUE SEGURO"
echo "═══════════════════════════════════════════════════════"
echo ""

# Cargar variables de entorno si existe .env
if [ -f .env ]; then
    source .env
    echo "✓ Configuración cargada desde .env"
else
    echo "⚠️  No se encontró .env, creando desde ejemplo..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Archivo .env creado desde .env.example"
        echo "⚠️  IMPORTANTE: Revisa y ajusta .env antes de continuar"
        echo ""
        read -p "¿Deseas continuar con los valores por defecto? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Saliendo. Por favor edita .env y vuelve a ejecutar."
            exit 0
        fi
    fi
fi

HOST_PORT=${HOST_PORT:-3000}
CONTAINER_NAME=${CONTAINER_NAME:-brutranking-app}

echo ""
echo "───────────────────────────────────────────────────────"
echo "  PASO 1: VERIFICACIONES DE SEGURIDAD"
echo "───────────────────────────────────────────────────────"
echo ""

# Ejecutar verificaciones de seguridad
if [ -f ./check-safe-deploy.sh ]; then
    chmod +x ./check-safe-deploy.sh
    if ! ./check-safe-deploy.sh; then
        echo ""
        echo "❌ Las verificaciones de seguridad fallaron"
        echo "❌ NO es seguro continuar"
        exit 1
    fi
else
    echo "⚠️  Script de verificación no encontrado, continuando..."
fi

echo ""
echo "───────────────────────────────────────────────────────"
echo "  PASO 2: PREPARACIÓN"
echo "───────────────────────────────────────────────────────"
echo ""

# Crear directorios si no existen
DATA_DIR="${DATA_PATH:-./data}"
UPLOADS_DIR="${UPLOADS_PATH:-./uploads}"

echo "Creando directorios necesarios..."
mkdir -p "$DATA_DIR" "$UPLOADS_DIR"
echo "✓ Directorios creados"

echo ""
echo "───────────────────────────────────────────────────────"
echo "  PASO 3: DETENER CONTENEDOR ANTERIOR (si existe)"
echo "───────────────────────────────────────────────────────"
echo ""

# IMPORTANTE: Solo detenemos NUESTRO contenedor, no otros
echo "Buscando contenedor existente: ${CONTAINER_NAME}..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  Contenedor existente encontrado, deteniéndolo..."

    # Usar docker-compose down SOLO afecta a los servicios de este docker-compose.yml
    if command -v docker-compose &> /dev/null; then
        docker-compose down 2>/dev/null || true
    elif docker compose version &> /dev/null; then
        docker compose down 2>/dev/null || true
    else
        # Fallback: detener solo NUESTRO contenedor por nombre
        docker stop "${CONTAINER_NAME}" 2>/dev/null || true
        docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    fi

    echo "✓ Contenedor anterior detenido"
else
    echo "✓ No hay contenedor anterior"
fi

echo ""
echo "───────────────────────────────────────────────────────"
echo "  PASO 4: CONSTRUIR IMAGEN"
echo "───────────────────────────────────────────────────────"
echo ""

echo "🔨 Construyendo imagen Docker..."
if command -v docker-compose &> /dev/null; then
    docker-compose build
elif docker compose version &> /dev/null; then
    docker compose build
else
    echo "❌ Error: Docker Compose no está disponible"
    exit 1
fi

echo "✓ Imagen construida"

echo ""
echo "───────────────────────────────────────────────────────"
echo "  PASO 5: INICIAR CONTENEDOR"
echo "───────────────────────────────────────────────────────"
echo ""

echo "🚀 Iniciando contenedor..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
elif docker compose version &> /dev/null; then
    docker compose up -d
fi

echo "✓ Contenedor iniciado"

echo ""
echo "───────────────────────────────────────────────────────"
echo "  PASO 6: VERIFICACIÓN FINAL"
echo "───────────────────────────────────────────────────────"
echo ""

echo "⏳ Esperando a que el servicio esté listo..."
sleep 5

# Verificar que el contenedor está corriendo
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "✓ Contenedor está corriendo"

    # Verificar salud del contenedor
    echo ""
    echo "Estado del contenedor:"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✅ DESPLIEGUE EXITOSO"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "📱 Accede a:"
    echo "   Dashboard público:       http://localhost:${HOST_PORT}"
    echo "   Panel de administración: http://localhost:${HOST_PORT}/admin.html"
    echo ""
    echo "📊 Comandos útiles:"
    echo "   Ver logs:     docker logs -f ${CONTAINER_NAME}"
    echo "   Ver estado:   docker ps --filter name=${CONTAINER_NAME}"
    echo "   Detener:      docker-compose down"
    echo "   Reiniciar:    docker-compose restart"
    echo ""
    echo "⚠️  NOTA: Este despliegue NO afecta a otros contenedores"
    echo ""
else
    echo ""
    echo "❌ Error: El contenedor no se inició correctamente"
    echo ""
    echo "Verifica los logs:"
    echo "  docker logs ${CONTAINER_NAME}"
    echo ""
    exit 1
fi
