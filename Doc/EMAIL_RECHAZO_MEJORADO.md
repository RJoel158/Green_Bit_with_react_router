# ✅ Email de Rechazo - Mejoras Implementadas

## 📧 Resumen

Se mejoró el email de rechazo de solicitudes para hacerlo más amigable, informativo y motivar al usuario a volver a intentar el registro.

---

## 🎨 Mejoras Implementadas

### 1. **Diseño Visual Mejorado**

- ✅ Cajas de información con colores distintivos
- ✅ Iconos y emojis para mejor legibilidad
- ✅ Botón CTA "Volver a Intentar" destacado
- ✅ Responsive y profesional

### 2. **Contenido Más Amigable**

**ANTES:**

```
"Lamentamos informarte que tu solicitud no ha sido aprobada"
"Posibles razones..." (genérico)
"Puedes intentar registrarte nuevamente en el futuro"
```

**AHORA:**

```
"Tu solicitud no fue aprobada en esta ocasión"
"¡No te desanimes! Puedes volver a registrarte"
Sección específica: "¿Qué puedes hacer?"
Recomendaciones detalladas para mejorar
Botón de acción: "🔄 Volver a Intentar"
```

### 3. **Información Útil Agregada**

#### Caja de Estado (Roja)

- ❌ Estado: Solicitud Rechazada
- Tu cuenta no ha sido activada

#### Caja de Información (Azul)

- 💡 ¿Qué puedes hacer?
- ¡No te desanimes! Puedes volver a registrarte proporcionando información más completa y precisa.

#### Razones del Rechazo

- La información proporcionada está incompleta o es incorrecta
- No se pudo verificar la documentación enviada
- Los datos no cumplen con nuestros requisitos de validación
- La información de [tu perfil/tu empresa] no es clara o verificable

#### Recomendaciones Específicas

✅ Para personas:

- Asegúrate de que todos los campos estén completos
- Verifica que tu información sea correcta y actualizada
- Proporciona datos reales y verificables
- **Confirma que tus nombres y apellidos sean correctos**
- Asegúrate de usar un correo electrónico válido y activo

✅ Para instituciones:

- Asegúrate de que todos los campos estén completos
- Verifica que tu información sea correcta y actualizada
- Proporciona datos reales y verificables
- **Confirma que el NIT y nombre de empresa sean correctos**
- Asegúrate de usar un correo electrónico válido y activo

### 4. **Botón de Acción (CTA)**

```html
<a href="http://localhost:5173/register" class="retry-button">
  🔄 Volver a Intentar
</a>
```

- Verde GreenBit (#14A24F)
- Centrado y visible
- Link directo a registro
- Responsive

### 5. **Sección de Soporte**

```
📞 ¿Necesitas ayuda?
Si consideras que esto es un error o deseas obtener más información
sobre tu solicitud, no dudes en contactar con nuestro equipo de soporte.
```

---

## 🔧 Aspectos Técnicos

### Archivo Modificado

**`back/Services/emailService.js`**

#### Función: `getRejectionEmailTemplate(nombre, apellidos, userType)`

**Parámetros:**

- `nombre`: String - Nombre o razón social
- `apellidos`: String - Apellidos (vacío para instituciones)
- `userType`: String - 'persona' o 'institucion'

**Variables dinámicas:**

```javascript
const tipoUsuario = userType === "institucion" ? "empresa" : "persona";
const articuloTipo = userType === "institucion" ? "tu empresa" : "tu perfil";
```

**Lógica condicional:**

```javascript
${userType === 'institucion'
  ? '<li>Confirma que el NIT y nombre de empresa sean correctos</li>'
  : '<li>Confirma que tus nombres y apellidos sean correctos</li>'}
```

### Función: `sendRejectionEmail(to, nombre, apellidos, userType)`

**Cambios:**

- ✅ Logs detallados con timestamp
- ✅ Subject mejorado: "Solicitud de Cuenta **No Aprobada**" (más amigable)
- ✅ Consistencia con otras funciones de email

**Logs implementados:**

```javascript
[DEBUG] sendRejectionEmail - INICIO {
  to: 'user@example.com',
  nombre: 'Juan',
  apellidos: 'Pérez',
  userType: 'persona',
  timestamp: '2025-11-05T...'
}
✅ Email de rechazo ENVIADO EXITOSAMENTE a user@example.com: <messageId>
```

---

## 📊 Flujo Completo

### Para Persona:

```
1. Admin rechaza solicitud desde panel
   ↓
2. userController.rejectUser() se ejecuta
   ↓
3. userModel.rejectUserWithPersona() actualiza DB (state = 2)
   ↓
4. sendRejectionEmail() envía email (NO bloqueante)
   ↓
5. Usuario recibe email con:
   - Estado de rechazo
   - Razones posibles
   - Recomendaciones específicas
   - Botón "Volver a Intentar"
   - Link a soporte
```

### Para Institución:

```
1. Admin rechaza solicitud desde panel
   ↓
2. userController.rejectInstitution() se ejecuta
   ↓
3. userModel.rejectUserWithInstitution() actualiza DB (state = 2)
   ↓
4. sendRejectionEmail() envía email (NO bloqueante)
   ↓
5. Usuario recibe email con:
   - Estado de rechazo
   - Razones posibles
   - Recomendaciones específicas (incluye NIT)
   - Botón "Volver a Intentar"
   - Link a soporte
```

---

## 🎯 Objetivos Logrados

### UX Mejorada

- ✅ Mensaje más amigable y menos negativo
- ✅ Tono motivador en lugar de definitivo
- ✅ Información clara sobre qué hacer
- ✅ Camino claro para volver a intentar

### Información Útil

- ✅ Razones específicas del rechazo
- ✅ Recomendaciones accionables
- ✅ Diferenciación entre persona/institución
- ✅ Contacto para soporte

### Call to Action

- ✅ Botón destacado "Volver a Intentar"
- ✅ Link directo a registro
- ✅ Visible y fácil de usar

### Branding

- ✅ Colores GreenBit consistentes
- ✅ Logo/nombre de la aplicación
- ✅ Mensaje de marca: "Juntos por un planeta más limpio 🌱"

---

## 🧪 Pruebas Recomendadas

### 1. Probar Rechazo de Persona

```bash
# 1. Registrar usuario persona
# 2. Ir a Admin → Solicitudes de Acceso → Persona
# 3. Rechazar la solicitud
# 4. Verificar email recibido
# 5. Comprobar:
   ✓ Subject: "Solicitud de Cuenta No Aprobada"
   ✓ Contenido menciona "persona"
   ✓ Recomendación: "nombres y apellidos"
   ✓ Botón "Volver a Intentar" funciona
```

### 2. Probar Rechazo de Institución

```bash
# 1. Registrar usuario institución
# 2. Ir a Admin → Solicitudes de Acceso → Empresa
# 3. Rechazar la solicitud
# 4. Verificar email recibido
# 5. Comprobar:
   ✓ Subject: "Solicitud de Cuenta No Aprobada"
   ✓ Contenido menciona "empresa"
   ✓ Recomendación: "NIT y nombre de empresa"
   ✓ Botón "Volver a Intentar" funciona
```

### 3. Verificar Logs Backend

```
[INFO] rejectUser - start { userId: 123, timestamp: '...' }
[TIMING] rejectUserWithPersona tomó: 25ms
[DEBUG] sendRejectionEmail - INICIO {
  to: 'user@example.com',
  nombre: 'Juan',
  apellidos: 'Pérez',
  userType: 'persona',
  timestamp: '...'
}
[TIMING] rejectUser - tiempo total: 45ms
✅ Email de rechazo ENVIADO EXITOSAMENTE a user@example.com
```

---

## 📱 Vista Previa del Email

### Desktop

```
┌─────────────────────────────────────────┐
│          GreenBit Background            │
├─────────────────────────────────────────┤
│   Solicitud No Aprobada                 │
│   Tu solicitud no fue aprobada...       │
├─────────────────────────────────────────┤
│ Hola Juan Pérez,                        │
│ Gracias por tu interés...               │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ ❌ Estado: Solicitud Rechazada    │  │
│ │ Tu cuenta no ha sido activada     │  │
│ └───────────────────────────────────┘  │
│                                         │
│ 📋 Posibles razones del rechazo:       │
│ • Información incompleta...             │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 💡 ¿Qué puedes hacer?             │  │
│ │ ¡No te desanimes! Puedes...       │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ✅ Recomendaciones:                     │
│ • Completa todos los campos             │
│                                         │
│        ┌─────────────────────┐         │
│        │ 🔄 Volver a Intentar │         │
│        └─────────────────────┘         │
│                                         │
│ 📞 ¿Necesitas ayuda?                   │
│ Contacta con soporte...                 │
│                                         │
│ GreenBit - Juntos por un planeta 🌱    │
└─────────────────────────────────────────┘
```

### Mobile (Responsive)

- Texto se adapta
- Botón CTA al 100% del ancho
- Padding reducido
- Font-size optimizado

---

## ⚙️ Configuración

### URL del Botón

**Actual:** `http://localhost:5173/register`

**Para Producción:** Cambiar a:

```javascript
<a href="https://greenbit.com/register" class="retry-button">
```

**Ubicación:** `back/Services/emailService.js` línea ~187

---

## 📝 Notas Importantes

### Sin Credenciales

✅ Este email NO incluye credenciales (correcto)  
✅ Solo se envía cuando se rechaza la solicitud  
✅ El usuario debe volver a registrarse desde cero

### Estado en DB

- Usuario rechazado: `state = 2`
- Usuario NO puede hacer login
- Usuario NO tiene acceso al sistema

### Diferencia con Email de Aprobación

| Rechazo             | Aprobación        |
| ------------------- | ----------------- |
| Sin credenciales    | Con credenciales  |
| Motiva a reintentar | Activa la cuenta  |
| State = 2           | State = 1         |
| No puede login      | Puede hacer login |

---

## 🔮 Mejoras Futuras Sugeridas

1. **Razón específica de rechazo**

   - Admin puede seleccionar razón al rechazar
   - Email muestra la razón exacta

2. **Feedback estructurado**

   - Campo de comentarios del admin
   - Se incluye en el email

3. **Tracking**

   - Registrar si el usuario hace clic en "Volver a Intentar"
   - Analytics de conversión de rechazados

4. **Email de seguimiento**

   - Enviar recordatorio después de 7 días
   - "¿Sigues interesado? Vuelve a intentar"

5. **Chat en vivo**
   - Link directo a WhatsApp/Chat para consultas
   - Soporte inmediato para rechazados

---

**Fecha:** 5 de noviembre de 2025  
**Estado:** ✅ Implementado  
**Próximo paso:** Probar en desarrollo
