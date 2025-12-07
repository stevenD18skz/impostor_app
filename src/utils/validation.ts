// 🎯 Sistema de Validación Avanzado
// Este archivo contiene utilidades reutilizables para validación de formularios

// ============================================
// OPCIÓN 1: Sistema de Validación con Reglas
// ============================================

export type ValidationRule = {
    field: string;
    value: any;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    message: string;
};

/**
 * Valida un conjunto de reglas y retorna el primer error encontrado
 * @param rules - Array de reglas de validación
 * @returns string con el mensaje de error o null si todo es válido
 */
export const validate = (rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
        // Validar campo requerido
        if (rule.required && (!rule.value || rule.value.trim() === '')) {
            return rule.message;
        }

        // Si el campo está vacío y no es requerido, saltar otras validaciones
        if (!rule.value || rule.value.trim() === '') {
            continue;
        }

        // Validar longitud mínima
        if (rule.minLength && rule.value.length < rule.minLength) {
            return `${rule.field} debe tener al menos ${rule.minLength} caracteres`;
        }

        // Validar longitud máxima
        if (rule.maxLength && rule.value.length > rule.maxLength) {
            return `${rule.field} no puede tener más de ${rule.maxLength} caracteres`;
        }

        // Validar patrón (regex)
        if (rule.pattern && !rule.pattern.test(rule.value)) {
            return rule.message;
        }

        // Validación personalizada
        if (rule.custom && !rule.custom(rule.value)) {
            return rule.message;
        }
    }
    return null;
};

// ============================================
// OPCIÓN 2: Sistema con Objeto de Errores
// ============================================

export type ValidationErrors = {
    [field: string]: string;
};

export type FieldValidation = {
    value: any;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    messages?: {
        required?: string;
        minLength?: string;
        maxLength?: string;
        pattern?: string;
        custom?: string;
    };
};

/**
 * Valida múltiples campos y retorna un objeto con todos los errores
 * @param fields - Objeto con las validaciones de cada campo
 * @returns Objeto con los errores de cada campo (vacío si no hay errores)
 */
export const validateFields = (
    fields: { [fieldName: string]: FieldValidation }
): ValidationErrors => {
    const errors: ValidationErrors = {};

    for (const [fieldName, validation] of Object.entries(fields)) {
        const { value, required, minLength, maxLength, pattern, custom, messages } = validation;

        // Validar campo requerido
        if (required && (!value || value.trim() === '')) {
            errors[fieldName] = messages?.required || `${fieldName} es requerido`;
            continue;
        }

        // Si el campo está vacío y no es requerido, saltar otras validaciones
        if (!value || value.trim() === '') {
            continue;
        }

        // Validar longitud mínima
        if (minLength && value.length < minLength) {
            errors[fieldName] = messages?.minLength || `Debe tener al menos ${minLength} caracteres`;
            continue;
        }

        // Validar longitud máxima
        if (maxLength && value.length > maxLength) {
            errors[fieldName] = messages?.maxLength || `No puede tener más de ${maxLength} caracteres`;
            continue;
        }

        // Validar patrón
        if (pattern && !pattern.test(value)) {
            errors[fieldName] = messages?.pattern || `Formato inválido`;
            continue;
        }

        // Validación personalizada
        if (custom && !custom(value)) {
            errors[fieldName] = messages?.custom || `Valor inválido`;
        }
    }

    return errors;
};

// ============================================
// OPCIÓN 3: Validadores Predefinidos (Helpers)
// ============================================

export const validators = {
    required: (value: any, message = 'Este campo es requerido') => {
        if (!value || value.trim() === '') {
            return message;
        }
        return null;
    },

    minLength: (value: string, min: number, message?: string) => {
        if (value && value.length < min) {
            return message || `Debe tener al menos ${min} caracteres`;
        }
        return null;
    },

    maxLength: (value: string, max: number, message?: string) => {
        if (value && value.length > max) {
            return message || `No puede tener más de ${max} caracteres`;
        }
        return null;
    },

    pattern: (value: string, regex: RegExp, message = 'Formato inválido') => {
        if (value && !regex.test(value)) {
            return message;
        }
        return null;
    },

    email: (value: string, message = 'Email inválido') => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            return message;
        }
        return null;
    },

    roomCode: (value: string, message = 'El código debe tener 6 caracteres') => {
        const codeRegex = /^[A-Z0-9]{6}$/;
        if (value && !codeRegex.test(value)) {
            return message;
        }
        return null;
    },

    playerName: (value: string) => {
        if (!value || value.trim() === '') {
            return 'El nombre es requerido';
        }
        if (value.length < 2) {
            return 'El nombre debe tener al menos 2 caracteres';
        }
        if (value.length > 20) {
            return 'El nombre no puede tener más de 20 caracteres';
        }
        return null;
    }
};

/**
 * Ejecuta múltiples validadores en un valor
 * @param value - Valor a validar
 * @param validatorFns - Array de funciones validadoras
 * @returns Primer mensaje de error encontrado o null
 */
export const runValidators = (
    value: any,
    validatorFns: Array<(value: any) => string | null>
): string | null => {
    for (const validator of validatorFns) {
        const error = validator(value);
        if (error) return error;
    }
    return null;
};

// ============================================
// EJEMPLO DE USO
// ============================================

/*
// OPCIÓN 1: Usando validate()
const error = validate([
  {
    field: 'Nombre',
    value: playerName,
    required: true,
    minLength: 2,
    message: 'Por favor ingresa tu nombre'
  }
]);

if (error) {
  setError(error);
  return;
}

// OPCIÓN 2: Usando validateFields()
const errors = validateFields({
  playerName: {
    value: playerName,
    required: true,
    minLength: 2,
    maxLength: 20,
    messages: {
      required: 'El nombre es requerido',
      minLength: 'El nombre es muy corto'
    }
  },
  roomCode: {
    value: roomCode,
    required: true,
    pattern: /^[A-Z0-9]{6}$/,
    messages: {
      required: 'El código es requerido',
      pattern: 'Código inválido'
    }
  }
});

if (Object.keys(errors).length > 0) {
  setErrors(errors);
  return;
}

// OPCIÓN 3: Usando validators helpers
const nameError = validators.playerName(playerName);
const codeError = validators.roomCode(roomCode);

if (nameError) {
  setError(nameError);
  return;
}

// OPCIÓN 4: Usando runValidators
const error = runValidators(playerName, [
  validators.required,
  (v) => validators.minLength(v, 2),
  (v) => validators.maxLength(v, 20)
]);

if (error) {
  setError(error);
  return;
}
*/
