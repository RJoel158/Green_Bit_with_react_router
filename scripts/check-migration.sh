#!/bin/bash

# Script para verificar la migración de APIs

echo "🔍 Verificando URLs hardcodeadas restantes..."
echo ""

# Buscar URLs hardcodeadas
HARDCODED=$(grep -r "http://localhost:3000" front/src --include="*.tsx" --include="*.ts" | grep -v "api-requests.http" | wc -l)

if [ $HARDCODED -eq 0 ]; then
    echo "✅ No se encontraron URLs hardcodeadas"
else
    echo "⚠️  Se encontraron $HARDCODED URLs hardcodeadas:"
    grep -r "http://localhost:3000" front/src --include="*.tsx" --include="*.ts" -n | grep -v "api-requests.http"
fi

echo ""
echo "📊 Resumen de migración:"
echo "========================"
echo "✅ Auth: Login, Register, RegisterCollector, RegisterInstitution"
echo "✅ Password: ForgotPassword, ChangePassword"
echo "✅ Services: ranking, appointments"
echo "✅ Config: api.ts, endpoints.ts"
echo ""
echo "⏳ Pendientes:"
grep -r "http://localhost:3000" front/src --include="*.tsx" --include="*.ts" --files-with-matches | grep -v "api-requests.http" | sort | uniq

echo ""
echo "🚀 Para probar:"
echo "1. cd front && npm run dev"
echo "2. cd back && node server.js"
echo "3. Prueba login, registro, etc."
