# Guía de Configuración de Supabase Realtime

## ✅ Pasos para Habilitar Realtime

### 1. Habilitar Realtime en las Tablas

Debes habilitar Realtime en las tablas `rooms` y `players` en tu proyecto de Supabase.

#### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navega a **Database** → **Replication** (en el menú lateral)
3. Encuentra las tablas `rooms` y `players` en la lista
4. **Activa el toggle** para cada tabla en la columna "REALTIME"
5. Las tablas deben mostrar un checkmark verde ✓

#### Opción B: Mediante SQL

Ejecuta este SQL en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Habilitar Realtime en la tabla rooms
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Habilitar Realtime en la tabla players
ALTER PUBLICATION supabase_realtime ADD TABLE players;
```

### 2. Verificar la Configuración

Para verificar que Realtime está habilitado, ejecuta:

```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

Deberías ver:
```
 schemaname | tablename 
------------+-----------
 public     | rooms
 public     | players
```

### 3. Verificar en la Aplicación

Después de habilitar Realtime:

1. Abre la consola del navegador (F12)
2. Únete a una sala
3. Deberías ver logs como:
   ```
   [Realtime] Subscribing to room: ABC123
   [Realtime] Successfully subscribed to room updates
   ```

## 🔍 Cómo Funciona el Sistema Realtime

### Sistema Anterior (Polling)
- ⏱️ Actualizaciones cada 2 segundos
- 📡 Peticiones HTTP constantes
- ⚠️ Retraso de hasta 2 segundos

### Sistema Nuevo (Realtime)
- ⚡ Actualizaciones instantáneas
- 🔌 Conexión WebSocket persistente
- ✅ Sin retraso perceptible

### Flujo de Actualización

```
1. Host presiona "Iniciar Juego"
   ↓
2. API actualiza tabla 'rooms' en Supabase
   ↓
3. Supabase emite evento de cambio vía WebSocket
   ↓
4. Hook useRealtimeRoom recibe el evento
   ↓
5. Hook llama a fetchRoomData()
   ↓
6. Todos los jugadores ven la actualización INSTANTÁNEAMENTE
```

## 🔧 Troubleshooting

### Problema: No recibo actualizaciones en tiempo real

1. **Verificar que Realtime está habilitado:**
   - Revisa el Dashboard → Database → Replication
   - Las tablas deben tener el toggle verde

2. **Verificar políticas RLS:**
   - Las políticas de seguridad deben permitir SELECT en ambas tablas
   - Ya están configuradas en tu `supabase_schema.sql`

3. **Verificar en la consola del navegador:**
   - Busca logs de `[Realtime]`
   - Busca errores de conexión

4. **Verificar conexión a internet:**
   - Realtime usa WebSockets, algunos firewalls pueden bloquearlos

### Problema: "CHANNEL_ERROR" en consola

Esto puede significar:
- Realtime no está habilitado en las tablas
- Hay un problema con las credenciales de Supabase
- El plan gratuito de Supabase tiene límites (revisa tu cuota)

### Problema: Las actualizaciones funcionan pero son lentas

- Verifica tu conexión a internet
- Supabase puede tener latencia según tu ubicación geográfica
- El plan gratuito puede tener limitaciones de velocidad

## 📊 Comparación de Rendimiento

| Métrica | Polling (Antes) | Realtime (Ahora) |
|---------|-----------------|------------------|
| Latencia | 0-2000ms | ~50-200ms |
| Peticiones HTTP | Alto | Bajo |
| Uso de datos | Medio | Bajo |
| Escalabilidad | Baja | Alta |
| Complejidad | Simple | Media |

## 🎯 Próximos Pasos Opcionales

1. **Optimizar el refetch:**
   - Actualmente, cada cambio hace un fetch completo
   - Podrías optimizar para solo actualizar los datos cambiados

2. **Agregar reconexión automática:**
   - Si la conexión se pierde, intentar reconectar

3. **Agregar indicador de conexión:**
   - Mostrar al usuario si está conectado en tiempo real

## ⚠️ Limitaciones del Plan Gratuito de Supabase

- **Conexiones concurrentes:** Hasta 200 simultáneas
- **Mensajes por mes:** 2 millones
- **Bandwidth:** 5GB transferencia total

Si tu aplicación crece, considera upgrade.

## 📝 Notas Adicionales

- Los eventos de Realtime solo incluyen IDs, por eso hacemos `fetchRoomData()`
- Esto es normal y recomendado por Supabase
- Para optimizar, podrías cachear datos y solo actualizar lo cambiado
