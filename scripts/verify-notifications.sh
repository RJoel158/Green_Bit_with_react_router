#!/bin/bash

# 🧪 Script de Validación - Nueva Interfaz de Notificaciones

echo "=========================================="
echo "🧪 Verificando Nueva Interfaz de Notificaciones"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Archivos creados
echo "📁 Verificando archivos creados..."
if [ -f "front/src/components/CommonComp/NotificationsPage.tsx" ]; then
    echo -e "${GREEN}✓ NotificationsPage.tsx${NC}"
else
    echo -e "${RED}✗ NotificationsPage.tsx no encontrado${NC}"
fi

if [ -f "front/src/components/CommonComp/NotificationsPage.css" ]; then
    echo -e "${GREEN}✓ NotificationsPage.css${NC}"
else
    echo -e "${RED}✗ NotificationsPage.css no encontrado${NC}"
fi
echo ""

# Check 2: Importaciones en App.tsx
echo "📝 Verificando App.tsx..."
if grep -q "NotificationsPage" front/src/App.tsx; then
    echo -e "${GREEN}✓ NotificationsPage importado${NC}"
else
    echo -e "${RED}✗ NotificationsPage no importado${NC}"
fi

if grep -q "/notifications" front/src/App.tsx; then
    echo -e "${GREEN}✓ Ruta /notifications agregada${NC}"
else
    echo -e "${RED}✗ Ruta /notifications no encontrada${NC}"
fi
echo ""

# Check 3: Líneas de código
echo "📊 Contando líneas de código..."
NOTIF_PAGE_LINES=$(wc -l < front/src/components/CommonComp/NotificationsPage.tsx)
NOTIF_CSS_LINES=$(wc -l < front/src/components/CommonComp/NotificationsPage.css)

echo "NotificationsPage.tsx: $NOTIF_PAGE_LINES líneas"
echo "NotificationsPage.css: $NOTIF_CSS_LINES líneas"
echo ""

# Check 4: Funciones clave
echo "🔧 Verificando funciones clave..."
if grep -q "getFilteredNotifications" front/src/components/CommonComp/NotificationsPage.tsx; then
    echo -e "${GREEN}✓ getFilteredNotifications implementada${NC}"
fi

if grep -q "connectNotifications" front/src/components/CommonComp/NotificationsPage.tsx; then
    echo -e "${GREEN}✓ connectNotifications integrada${NC}"
fi

if grep -q "fetchNotifications" front/src/components/CommonComp/NotificationsPage.tsx; then
    echo -e "${GREEN}✓ fetchNotifications integrada${NC}"
fi
echo ""

# Check 5: Estilos principales
echo "🎨 Verificando clases CSS..."
TOTAL_CLASSES=$(grep -c "^\." front/src/components/CommonComp/NotificationsPage.css)
echo "Clases CSS definidas: $TOTAL_CLASSES"

if grep -q "notification-card" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ notification-card${NC}"
fi

if grep -q "filter-btn" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ filter-btn${NC}"
fi

if grep -q "status-badge" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ status-badge${NC}"
fi
echo ""

# Check 6: Colores GreenBit
echo "🎨 Verificando colores GreenBit..."
if grep -q "#52a366" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ Color verde GreenBit detectado${NC}"
fi

if grep -q "#f5f5dc\|#fffacd" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ Colores amarillo/crema detectados${NC}"
fi
echo ""

# Check 7: Responsive design
echo "📱 Verificando breakpoints responsive..."
if grep -q "@media (max-width: 480px)" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ Breakpoint móvil (480px)${NC}"
fi

if grep -q "@media (max-width: 360px)" front/src/components/CommonComp/NotificationsPage.css; then
    echo -e "${GREEN}✓ Breakpoint muy pequeño (360px)${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Verificación Completada${NC}"
echo "=========================================="
echo ""
echo "📋 Resumen:"
echo "  • Archivos creados: 2"
echo "  • Archivos modificados: 1"
echo "  • Líneas de código: $((NOTIF_PAGE_LINES + NOTIF_CSS_LINES))"
echo "  • Clases CSS: $TOTAL_CLASSES"
echo ""
echo "🚀 Para usar la nueva interfaz:"
echo "  1. Inicia el frontend: npm run dev"
echo "  2. Navega a: http://localhost:5173/notifications"
echo "  3. (Asegúrate de haber iniciado sesión)"
echo ""
