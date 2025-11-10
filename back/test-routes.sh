#!/bin/bash

# 🧪 Script para probar todos los endpoints del backend
# =====================================================

BASE_URL="http://localhost:3000"
RESULTS_FILE="test-results-$(date +%Y%m%d_%H%M%S).json"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 TEST COMPLETO DE RUTAS BACKEND - GreenBit Recycling${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Función para hacer request y guardar resultado
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -ne "${YELLOW}Probando:${NC} $description ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extraer status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    # Verificar si la respuesta es exitosa (2xx o 3xx)
    if [[ $http_code =~ ^[23][0-9]{2}$ ]]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo "    Response: $body" | head -c 100
        echo ""
        return 1
    fi
}

# Contadores
total=0
passed=0
failed=0

# ============================================
# USERS
# ============================================
echo -e "\n${BLUE}📋 USERS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/users" "" "GET /api/users" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/users/withPerson" "" "GET /api/users/withPerson" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/users/collectors/pending" "" "GET /api/users/collectors/pending" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/users/collectors/pending/institution" "" "GET /api/users/collectors/pending/institution" && ((passed++)) || ((failed++))
((total++))

# ============================================
# RANKING
# ============================================
echo -e "\n${BLUE}🏆 RANKING${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/ranking/periods" "" "GET /api/ranking/periods" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/ranking/periods/closed" "" "GET /api/ranking/periods/closed" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/ranking/periods/active-or-last" "" "GET /api/ranking/periods/active-or-last" && ((passed++)) || ((failed++))
((total++))

# ============================================
# MATERIALS
# ============================================
echo -e "\n${BLUE}📦 MATERIALS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/material" "" "GET /api/material" && ((passed++)) || ((failed++))
((total++))

# ============================================
# ANNOUNCEMENTS
# ============================================
echo -e "\n${BLUE}📢 ANNOUNCEMENTS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/announcements" "" "GET /api/announcements" && ((passed++)) || ((failed++))
((total++))

# ============================================
# APPOINTMENTS
# ============================================
echo -e "\n${BLUE}📅 APPOINTMENTS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/appointments" "" "GET /api/appointments" && ((passed++)) || ((failed++))
((total++))

# ============================================
# REQUESTS
# ============================================
echo -e "\n${BLUE}🔗 REQUESTS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/request" "" "GET /api/request" && ((passed++)) || ((failed++))
((total++))

# ============================================
# SCORES
# ============================================
echo -e "\n${BLUE}⭐ SCORES${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/score" "" "GET /api/score" && ((passed++)) || ((failed++))
((total++))

# ============================================
# REPORTS
# ============================================
echo -e "\n${BLUE}📊 REPORTS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/reports/materials" "" "GET /api/reports/materials" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/reports/collections" "" "GET /api/reports/collections" && ((passed++)) || ((failed++))
((total++))

test_endpoint "GET" "/api/reports/appointments" "" "GET /api/reports/appointments" && ((passed++)) || ((failed++))
((total++))

# ============================================
# NOTIFICATIONS
# ============================================
echo -e "\n${BLUE}🔔 NOTIFICATIONS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/notification" "" "GET /api/notification" && ((passed++)) || ((failed++))
((total++))

# ============================================
# PERSON
# ============================================
echo -e "\n${BLUE}👤 PERSON${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/person" "" "GET /api/person" && ((passed++)) || ((failed++))
((total++))

# ============================================
# INSTITUTIONS
# ============================================
echo -e "\n${BLUE}🏢 INSTITUTIONS${NC}"
echo "─────────────────────────────────────────"

test_endpoint "GET" "/api/institution" "" "GET /api/institution" && ((passed++)) || ((failed++))
((total++))

# ============================================
# RESUMEN
# ============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 RESUMEN DE PRUEBAS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"

percentage=$((passed * 100 / total))

echo -e "Total de pruebas:  ${BLUE}$total${NC}"
echo -e "Exitosas:          ${GREEN}$passed${NC}"
echo -e "Fallidas:          ${RED}$failed${NC}"
echo -e "Porcentaje:        ${BLUE}$percentage%${NC}"

echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE${NC}"
    exit 0
else
    echo -e "${RED}❌ ALGUNAS PRUEBAS FALLARON${NC}"
    exit 1
fi
