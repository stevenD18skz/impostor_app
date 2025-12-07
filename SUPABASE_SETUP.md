# Guía de Configuración de Supabase

Esta guía te ayudará a conectar tu aplicación Impostor con Supabase.

## 📋 Pasos para Configurar Supabase

### 1. Crear las Tablas en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el panel lateral, haz clic en **SQL Editor**
3. Copia y pega el contenido del archivo `supabase_schema.sql`
4. Haz clic en **Run** para ejecutar el script

Esto creará:
- Tabla `rooms` para almacenar las salas del juego
- Tabla `players` para almacenar los jugadores
- Índices para mejorar el rendimiento
- Triggers para actualizar automáticamente `last_updated`
- Políticas de seguridad (RLS)

### 2. Obtener las Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) > **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como `https://tu-proyecto.supabase.co`)
   - **anon public** key (la clave pública)

### 3. Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz de tu proyecto
2. Agrega las siguientes variables con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> ⚠️ **Importante**: Nunca subas el archivo `.env.local` a Git. Ya está incluido en `.gitignore`

### 4. Reiniciar el Servidor de Desarrollo

Después de configurar las variables de entorno, reinicia tu servidor:

```bash
npm run dev
```

## 🗂️ Estructura de la Base de Datos

### Tabla `rooms`
- `id`: UUID único de la sala
- `code`: Código de 6 caracteres para unirse
- `host`: Nombre del anfitrión
- `game_state`: Estado del juego (setup, lobby, reveal, playing, ended)
- `settings`: Configuración del juego (JSON)
- `game_data`: Datos del juego en curso (JSON)
- `created_at`: Fecha de creación
- `last_updated`: Última actualización

### Tabla `players`
- `id`: UUID único del jugador
- `room_id`: Referencia a la sala
- `name`: Nombre del jugador
- `is_host`: Si es el anfitrión
- `is_impostor`: Si es impostor
- `created_at`: Fecha de creación

## 🔄 Migración del Código

El archivo `src/app/api/game/route.ts` ha sido actualizado para usar Supabase en lugar de almacenamiento en memoria.

### Cambios principales:
- ✅ Todas las operaciones ahora usan Supabase
- ✅ Los datos persisten entre reinicios del servidor
- ✅ Soporte para múltiples instancias del servidor
- ✅ Mejor manejo de errores

## 🧪 Verificar la Conexión

Para verificar que todo funciona correctamente:

1. Inicia tu aplicación: `npm run dev`
2. Crea una nueva sala
3. Ve a Supabase > **Table Editor** > `rooms`
4. Deberías ver la sala creada

## 🔒 Seguridad (Opcional)

Las políticas de RLS actuales permiten todas las operaciones. Para producción, considera:

1. Implementar autenticación de usuarios
2. Restringir operaciones según el usuario
3. Validar permisos del anfitrión

Ejemplo de política más restrictiva:

```sql
-- Solo el anfitrión puede actualizar la configuración
CREATE POLICY "Only host can update settings" ON rooms
  FOR UPDATE USING (auth.uid() = host_user_id);
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
