#!/bin/bash

###############################################################################
# 🧪 SCRIPT DE PRUEBAS DE RUTAS - GREEN BIT
# 
# Ejecuta pruebas completas de todas las rutas del backend
# Uso: bash run-route-tests.sh [opción]
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_header() {
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================================================
# MAIN
# ============================================================================

print_header "GREEN BIT - PRUEBAS DE RUTAS"

# Verificar que estamos en el directorio correcto
if [ ! -f "server.js" ]; then
    print_error "server.js no encontrado. ¿Estás en la carpeta 'back'?"
    exit 1
fi

print_info "Directorio: $(pwd)"

# Menú de opciones
if [ -z "$1" ]; then
    echo -e "\n${BLUE}Selecciona una opción:${NC}\n"
    echo "  1) test:console  - Pruebas rápidas en consola"
    echo "  2) test:report   - Generar reporte HTML visual"
    echo "  3) test:full     - Ejecutar ambas pruebas"
    echo "  4) health        - Solo verificar health check"
    echo "  5) salir"
    echo ""
    read -p "Selecciona opción [1-5]: " option
else
    option=$1
fi

case $option in
    1|test:console)
        print_header "INICIANDO PRUEBAS EN CONSOLA"
        print_info "Asegúrate que el servidor está corriendo en otra terminal"
        print_info "Comando: npm start"
        echo ""
        read -p "¿El servidor está ejecutándose? (s/n): " server_running
        
        if [ "$server_running" != "s" ] && [ "$server_running" != "S" ]; then
            print_error "Por favor, inicia el servidor primero"
            exit 1
        fi
        
        sleep 2
        print_info "Iniciando pruebas..."
        node test-all-routes.js
        ;;

    2|test:report)
        print_header "GENERANDO REPORTE HTML"
        print_info "Asegúrate que el servidor está corriendo"
        echo ""
        read -p "¿El servidor está ejecutándose? (s/n): " server_running
        
        if [ "$server_running" != "s" ] && [ "$server_running" != "S" ]; then
            print_error "Por favor, inicia el servidor primero"
            exit 1
        fi
        
        sleep 2
        print_info "Generando reporte..."
        node test-routes-report.js
        
        if [ -f "routes-test-report.html" ]; then
            print_success "Reporte generado exitosamente"
            print_info "Archivo: routes-test-report.html"
            
            # Intentar abrir en navegador
            if command -v xdg-open > /dev/null; then
                xdg-open routes-test-report.html
            elif command -v open > /dev/null; then
                open routes-test-report.html
            elif command -v start > /dev/null; then
                start routes-test-report.html
            fi
        fi
        ;;

    3|test:full)
        print_header "EJECUTANDO SUITE COMPLETA"
        echo ""
        echo "Esta opción ejecutará:"
        echo "  1. Pruebas en consola"
        echo "  2. Reporte HTML"
        echo ""
        read -p "¿El servidor está ejecutándose? (s/n): " server_running
        
        if [ "$server_running" != "s" ] && [ "$server_running" != "S" ]; then
            print_error "Por favor, inicia el servidor primero"
            exit 1
        fi
        
        sleep 2
        
        print_info "Paso 1: Ejecutando pruebas en consola..."
        node test-all-routes.js
        
        echo ""
        print_info "Paso 2: Generando reporte HTML..."
        node test-routes-report.js
        
        if [ -f "routes-test-report.html" ]; then
            print_success "¡Suite completa ejecutada!"
            print_info "Reporte HTML: routes-test-report.html"
        fi
        ;;

    4|health)
        print_header "VERIFICAR HEALTH CHECK"
        print_info "Intentando conectar a http://localhost:3000/health..."
        
        if command -v curl > /dev/null; then
            if curl -s http://localhost:3000/health | grep -q "ok"; then
                print_success "¡Servidor está operativo!"
            else
                print_error "Health check falló"
                exit 1
            fi
        else
            print_warning "curl no disponible, instalando node-fetch..."
        fi
        ;;

    5|salir)
        print_info "Saliendo..."
        exit 0
        ;;

    *)
        print_error "Opción no válida: $option"
        exit 1
        ;;
esac

echo ""
print_success "¡Pruebas completadas!"
