# 🎯 Sistema de Validación Profesional

Este proyecto incluye un sistema de validación robusto y reutilizable que elimina la necesidad de múltiples `if` statements.

## 📁 Archivos

- **`src/utils/validation.ts`** - Utilidades de validación reutilizables
- **`src/components/examples/AdvancedFormExample.tsx`** - Ejemplos de uso
- **`src/components/GameSetup.tsx`** - Implementación real en el proyecto

---

## 🚀 Métodos de Validación

### **Método 1: Validación Simple con `validate()`**

✅ **Mejor para:** Validación rápida, un error a la vez

```typescript
import { validate } from '@/utils/validation';

const error = validate([
  {
    field: 'Nombre',
    value: playerName,
    required: true,
    minLength: 2,
    maxLength: 20,
    message: 'Por favor ingresa tu nombre (mínimo 2 caracteres)'
  },
  {
    field: 'Código',
    value: roomCode,
    required: true,
    pattern: /^[A-Z0-9]{6}$/,
    message: 'El código debe tener 6 caracteres'
  }
]);

if (error) {
  setError(error);
  return;
}
```

**Ventajas:**
- ✅ Simple y directo
- ✅ Retorna el primer error encontrado
- ✅ Fácil de entender

**Desventajas:**
- ❌ Solo muestra un error a la vez
- ❌ El usuario debe corregir uno por uno

---

### **Método 2: Validación con Múltiples Errores `validateFields()`**

✅ **Mejor para:** Formularios complejos, mostrar todos los errores

```typescript
import { validateFields } from '@/utils/validation';

const errors = validateFields({
  playerName: {
    value: playerName,
    required: true,
    minLength: 2,
    maxLength: 20,
    messages: {
      required: 'El nombre es requerido',
      minLength: 'Muy corto',
      maxLength: 'Muy largo'
    }
  },
  roomCode: {
    value: roomCode,
    required: true,
    pattern: /^[A-Z0-9]{6}$/,
    messages: {
      required: 'El código es requerido',
      pattern: 'Formato inválido'
    }
  }
});

if (Object.keys(errors).length > 0) {
  setFieldErrors(errors); // { playerName: "error", roomCode: "error" }
  return;
}
```

**Ventajas:**
- ✅ Muestra todos los errores a la vez
- ✅ Mejor UX (el usuario ve todo lo que falta)
- ✅ Perfecto para validación en tiempo real

**Desventajas:**
- ❌ Requiere más código en el UI para mostrar cada error

---

### **Método 3: Validadores Predefinidos `validators`**

✅ **Mejor para:** Validaciones comunes reutilizables

```typescript
import { validators } from '@/utils/validation';

// Validar nombre
const nameError = validators.playerName(playerName);
if (nameError) {
  setError(nameError);
  return;
}

// Validar código de sala
const codeError = validators.roomCode(roomCode);
if (codeError) {
  setError(codeError);
  return;
}

// Validar email
const emailError = validators.email(email);
if (emailError) {
  setError(emailError);
  return;
}
```

**Validadores disponibles:**
- `validators.required(value, message?)`
- `validators.minLength(value, min, message?)`
- `validators.maxLength(value, max, message?)`
- `validators.pattern(value, regex, message?)`
- `validators.email(value, message?)`
- `validators.roomCode(value, message?)`
- `validators.playerName(value)` - Validación completa de nombre

**Ventajas:**
- ✅ Muy reutilizable
- ✅ Fácil de testear
- ✅ Código limpio

---

### **Método 4: Composición con `runValidators()`**

✅ **Mejor para:** Combinar múltiples validaciones en un campo

```typescript
import { runValidators, validators } from '@/utils/validation';

const error = runValidators(playerName, [
  (v) => validators.required(v, 'El nombre es requerido'),
  (v) => validators.minLength(v, 2, 'Muy corto'),
  (v) => validators.maxLength(v, 20, 'Muy largo'),
  (v) => v.includes(' ') ? null : 'Debe incluir apellido'
]);

if (error) {
  setError(error);
  return;
}
```

**Ventajas:**
- ✅ Muy flexible
- ✅ Permite validaciones personalizadas inline
- ✅ Fácil de extender

---

## 🎨 Ejemplos de UI

### Mostrar Error General

```tsx
{error && (
  <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl">
    ❌ {error}
  </div>
)}
```

### Mostrar Errores por Campo

```tsx
<input
  type="text"
  value={playerName}
  onChange={(e) => setPlayerName(e.target.value)}
  className={`w-full px-4 py-2 rounded ${
    fieldErrors.playerName ? 'border-2 border-red-500' : 'border border-gray-300'
  }`}
/>
{fieldErrors.playerName && (
  <p className="text-red-400 text-sm mt-1">⚠️ {fieldErrors.playerName}</p>
)}
```

### Mostrar Lista de Todos los Errores

```tsx
{Object.keys(fieldErrors).length > 0 && (
  <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded">
    <h3 className="font-bold mb-2">Errores encontrados:</h3>
    <ul className="list-disc list-inside">
      {Object.entries(fieldErrors).map(([field, error]) => (
        <li key={field} className="text-yellow-100">
          <strong>{field}:</strong> {error}
        </li>
      ))}
    </ul>
  </div>
)}
```

---

## 🔧 Validación en Tiempo Real

```typescript
const validateFieldOnChange = (fieldName: string, value: string) => {
  let error = '';

  switch (fieldName) {
    case 'playerName':
      error = validators.playerName(value) || '';
      break;
    case 'roomCode':
      error = validators.roomCode(value) || '';
      break;
  }

  setFieldErrors(prev => ({
    ...prev,
    [fieldName]: error
  }));
};

const handleChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  validateFieldOnChange(field, value);
};
```

---

## 📊 Comparación de Métodos

| Método | Simplicidad | Errores Múltiples | Reutilizable | UX |
|--------|-------------|-------------------|--------------|-----|
| `validate()` | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ | ⭐⭐⭐ |
| `validateFields()` | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `validators` | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| `runValidators()` | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 💡 Recomendaciones

### Para formularios simples (1-2 campos):
```typescript
const error = validators.playerName(playerName);
if (error) {
  setError(error);
  return;
}
```

### Para formularios medianos (3-5 campos):
```typescript
const error = validate([
  { field: 'Nombre', value: name, required: true, message: '...' },
  { field: 'Email', value: email, pattern: /.../, message: '...' }
]);
```

### Para formularios complejos (5+ campos):
```typescript
const errors = validateFields({
  name: { value: name, required: true, ... },
  email: { value: email, pattern: /.../, ... },
  // ... más campos
});
```

---

## 🎓 Crear Validadores Personalizados

```typescript
// En validation.ts
export const validators = {
  // ... validadores existentes
  
  // Validador personalizado
  uniqueUsername: async (value: string) => {
    const exists = await checkUsernameExists(value);
    if (exists) {
      return 'Este nombre de usuario ya existe';
    }
    return null;
  },
  
  strongPassword: (value: string) => {
    if (value.length < 8) return 'Muy corta';
    if (!/[A-Z]/.test(value)) return 'Debe tener mayúsculas';
    if (!/[0-9]/.test(value)) return 'Debe tener números';
    return null;
  }
};
```

---

## 🚀 Próximos Pasos

1. ✅ Ya implementado en `GameSetup.tsx`
2. 📝 Revisar `AdvancedFormExample.tsx` para más ejemplos
3. 🔧 Crear tus propios validadores personalizados
4. 🎨 Personalizar los mensajes de error según tu diseño

---

## 📚 Recursos

- [Documentación de TypeScript](https://www.typescriptlang.org/)
- [Patrones de Validación](https://regex101.com/)
- [React Hook Form](https://react-hook-form.com/) - Librería alternativa más completa
