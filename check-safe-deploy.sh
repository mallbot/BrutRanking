#!/bin/bash

# Script de verificación de seguridad antes de desplegar
# Este script NO hace cambios, solo verifica que sea seguro desplegar

set -e

echo "🔍 Verificando seguridad del despliegue..."
echo ""

ERRORS=0
WARNINGS=0

# Cargar variables de entorno si existe .env
if [ -f .env ]; then
    source .env
    echo "✓ Archivo .env encontrado"
else
    echo "⚠️  No se encontró .env, usando valores por defecto"
    WARNINGS=$((WARNINGS + 1))
    HOST_PORT=${HOST_PORT:-3000}
    CONTAINER_NAME=${CONTAINER_NAME:-brutranking-app}
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  VERIFICACIONES DE SEGURIDAD"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Verificar que Docker esté disponible
echo "1. Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "   ❌ ERROR: Docker no está instalado"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✓ Docker está instalado"
    docker --version
fi

echo ""

# 2. Verificar que Docker esté corriendo
echo "2. Verificando que Docker esté activo..."
if ! docker ps &> /dev/null; then
    echo "   ❌ ERROR: Docker daemon no está corriendo"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✓ Docker daemon está activo"
fi

echo ""

# 3. Verificar conflictos de puertos
echo "3. Verificando puerto ${HOST_PORT}..."
if netstat -tuln 2>/dev/null | grep -q ":${HOST_PORT} " || ss -tuln 2>/dev/null | grep -q ":${HOST_PORT} "; then
    echo "   ❌ ERROR: El puerto ${HOST_PORT} ya está en uso"
    echo "   Contenedores usando el puerto:"
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "${HOST_PORT}"
    echo ""
    echo "   Solución: Cambia HOST_PORT en el archivo .env"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✓ Puerto ${HOST_PORT} disponible"
fi

echo ""

# 4. Verificar conflictos de nombre de contenedor
echo "4. Verificando nombre de contenedor '${CONTAINER_NAME}'..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "   ⚠️  ADVERTENCIA: Ya existe un contenedor con el nombre '${CONTAINER_NAME}'"
    docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
    echo ""
    echo "   Esto detendrá el contenedor existente."
    echo "   Si NO es tu intención, cambia CONTAINER_NAME en .env"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ Nombre de contenedor disponible"
fi

echo ""

# 5. Verificar otros contenedores corriendo
echo "5. Verificando otros contenedores en producción..."
RUNNING_CONTAINERS=$(docker ps --format '{{.Names}}' | wc -l)
if [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    echo "   ⚠️  Hay ${RUNNING_CONTAINERS} contenedor(es) corriendo en este sistema:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "   ✓ Este despliegue SOLO afectará al contenedor '${CONTAINER_NAME}'"
    echo "   ✓ Los demás contenedores NO se verán afectados"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ No hay otros contenedores corriendo"
fi

echo ""

# 6. Verificar espacio en disco
echo "6. Verificando espacio en disco..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "   ❌ ERROR: Espacio en disco crítico (${DISK_USAGE}% usado)"
    ERRORS=$((ERRORS + 1))
elif [ "$DISK_USAGE" -gt 80 ]; then
    echo "   ⚠️  ADVERTENCIA: Poco espacio en disco (${DISK_USAGE}% usado)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ Espacio en disco suficiente (${DISK_USAGE}% usado)"
fi

echo ""

# 7. Verificar que los directorios de datos existan o puedan crearse
echo "7. Verificando directorios de datos..."
DATA_DIR="${DATA_PATH:-./data}"
UPLOADS_DIR="${UPLOADS_PATH:-./uploads}"

if [ ! -d "$DATA_DIR" ]; then
    echo "   ⚠️  El directorio $DATA_DIR no existe (se creará)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ Directorio $DATA_DIR existe"
fi

if [ ! -d "$UPLOADS_DIR" ]; then
    echo "   ⚠️  El directorio $UPLOADS_DIR no existe (se creará)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ Directorio $UPLOADS_DIR existe"
fi

echo ""

# 8. Verificar redes Docker
echo "8. Verificando redes Docker..."
NETWORK_NAME=${NETWORK_NAME:-brutranking-network}
if docker network ls | grep -q "$NETWORK_NAME"; then
    echo "   ⚠️  La red '$NETWORK_NAME' ya existe"
    echo "   Se reutilizará la red existente"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ La red '$NETWORK_NAME' se creará"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  RESUMEN"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Se encontraron $ERRORS error(es) CRÍTICO(S)"
    echo "❌ NO ES SEGURO CONTINUAR CON EL DESPLIEGUE"
    echo ""
    echo "Por favor, resuelve los errores antes de desplegar."
    exit 1
fi

if [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Se encontraron $WARNINGS advertencia(s)"
    echo "✓ Es seguro continuar, pero revisa las advertencias"
else
    echo "✅ Todo OK - Es seguro desplegar"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Para desplegar, ejecuta:"
echo "  ./docker-start.sh"
echo ""
echo "O manualmente:"
echo "  docker-compose up -d"
echo ""

exit 0
