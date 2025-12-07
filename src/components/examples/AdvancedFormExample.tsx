import { useState } from 'react';
import { validateFields, validators, runValidators } from '@/utils/validation';

/**
 * EJEMPLO AVANZADO: Componente con validación de múltiples campos
 * Muestra errores específicos para cada campo
 */
export default function AdvancedFormExample() {
    const [formData, setFormData] = useState({
        playerName: '',
        roomCode: '',
        email: ''
    });

    // Opción A: Un solo estado de error (mensaje general)
    const [error, setError] = useState('');

    // Opción B: Errores por campo (más específico)
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // ============================================
    // MÉTODO 1: Validación Simple (un error a la vez)
    // ============================================
    const handleSubmitSimple = () => {
        // Validar nombre
        const nameError = validators.playerName(formData.playerName);
        if (nameError) {
            setError(nameError);
            return;
        }

        // Validar código
        const codeError = validators.roomCode(formData.roomCode);
        if (codeError) {
            setError(codeError);
            return;
        }

        // Todo válido
        setError('');
        console.log('Formulario válido!', formData);
    };

    // ============================================
    // MÉTODO 2: Validación con runValidators
    // ============================================
    const handleSubmitWithRunValidators = () => {
        // Validar nombre con múltiples reglas
        const nameError = runValidators(formData.playerName, [
            (v) => validators.required(v, 'El nombre es requerido'),
            (v) => validators.minLength(v, 2, 'El nombre es muy corto'),
            (v) => validators.maxLength(v, 20, 'El nombre es muy largo')
        ]);

        if (nameError) {
            setError(nameError);
            return;
        }

        // Validar código
        const codeError = runValidators(formData.roomCode, [
            (v) => validators.required(v, 'El código es requerido'),
            (v) => validators.roomCode(v)
        ]);

        if (codeError) {
            setError(codeError);
            return;
        }

        setError('');
        console.log('Formulario válido!', formData);
    };

    // ============================================
    // MÉTODO 3: Validación de Múltiples Campos (RECOMENDADO)
    // ============================================
    const handleSubmitMultipleErrors = () => {
        const errors = validateFields({
            playerName: {
                value: formData.playerName,
                required: true,
                minLength: 2,
                maxLength: 20,
                messages: {
                    required: 'Por favor ingresa tu nombre',
                    minLength: 'El nombre debe tener al menos 2 caracteres',
                    maxLength: 'El nombre no puede tener más de 20 caracteres'
                }
            },
            roomCode: {
                value: formData.roomCode,
                required: true,
                pattern: /^[A-Z0-9]{6}$/,
                messages: {
                    required: 'Por favor ingresa el código de la sala',
                    pattern: 'El código debe tener 6 caracteres (letras y números)'
                }
            },
            email: {
                value: formData.email,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    pattern: 'Email inválido'
                }
            }
        });

        // Si hay errores, mostrarlos
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            // También puedes mostrar el primer error como mensaje general
            setError(Object.values(errors)[0]);
            return;
        }

        // Limpiar errores
        setFieldErrors({});
        setError('');
        console.log('Formulario válido!', formData);
    };

    // ============================================
    // MÉTODO 4: Validación en Tiempo Real
    // ============================================
    const validateFieldOnChange = (fieldName: string, value: string) => {
        let error = '';

        switch (fieldName) {
            case 'playerName':
                error = validators.playerName(value) || '';
                break;
            case 'roomCode':
                error = validators.roomCode(value) || '';
                break;
            case 'email':
                error = validators.email(value) || '';
                break;
        }

        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Validar en tiempo real (opcional)
        validateFieldOnChange(field, value);
    };

    return (
        <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold">Ejemplo de Validación Avanzada</h2>

            {/* Mensaje de error general */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl">
                    ❌ {error}
                </div>
            )}

            {/* Campo: Nombre */}
            <div>
                <label className="block text-white mb-2">Nombre</label>
                <input
                    type="text"
                    value={formData.playerName}
                    onChange={(e) => handleChange('playerName', e.target.value)}
                    className={`w-full px-4 py-2 rounded ${fieldErrors.playerName ? 'border-2 border-red-500' : 'border border-gray-300'
                        }`}
                />
                {/* Error específico del campo */}
                {fieldErrors.playerName && (
                    <p className="text-red-400 text-sm mt-1">⚠️ {fieldErrors.playerName}</p>
                )}
            </div>

            {/* Campo: Código de Sala */}
            <div>
                <label className="block text-white mb-2">Código de Sala</label>
                <input
                    type="text"
                    value={formData.roomCode}
                    onChange={(e) => handleChange('roomCode', e.target.value.toUpperCase())}
                    className={`w-full px-4 py-2 rounded uppercase ${fieldErrors.roomCode ? 'border-2 border-red-500' : 'border border-gray-300'
                        }`}
                    maxLength={6}
                />
                {fieldErrors.roomCode && (
                    <p className="text-red-400 text-sm mt-1">⚠️ {fieldErrors.roomCode}</p>
                )}
            </div>

            {/* Campo: Email (opcional) */}
            <div>
                <label className="block text-white mb-2">Email (opcional)</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-2 rounded ${fieldErrors.email ? 'border-2 border-red-500' : 'border border-gray-300'
                        }`}
                />
                {fieldErrors.email && (
                    <p className="text-red-400 text-sm mt-1">⚠️ {fieldErrors.email}</p>
                )}
            </div>

            {/* Botones para probar diferentes métodos */}
            <div className="space-y-2">
                <button
                    onClick={handleSubmitSimple}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Método 1: Validación Simple
                </button>

                <button
                    onClick={handleSubmitWithRunValidators}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                    Método 2: Con runValidators
                </button>

                <button
                    onClick={handleSubmitMultipleErrors}
                    className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                >
                    Método 3: Múltiples Errores (Recomendado)
                </button>
            </div>

            {/* Mostrar todos los errores */}
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
        </div>
    );
}
