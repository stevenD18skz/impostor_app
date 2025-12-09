import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook personalizado para manejar actualizaciones en tiempo real del juego
 * Escucha cambios en las tablas 'rooms' y 'players' de Supabase
 * OPTIMIZADO: Solo hace peticiones cuando realmente hay cambios
 */
export function useRealtimeRoom(
    roomCode: string | null,
    isMultiplayer: boolean,
    playerName: string,
    onRoomUpdate: (room: any) => void,
    onPlayerUpdate: (player: any) => void
) {
    const roomIdRef = useRef<string | null>(null);

    // Función para obtener datos actualizados de la sala
    const fetchRoomData = useCallback(async () => {
        if (!roomCode) return;

        try {
            console.log('[Realtime] 📡 Fetching room data due to change...');
            const res = await fetch(`/api/game?code=${roomCode}`);
            if (res.ok) {
                const data = await res.json();

                // Guardar room_id para filtrar eventos de jugadores
                if (data.id) {
                    roomIdRef.current = data.id;
                }

                onRoomUpdate(data);

                // Actualizar también myPlayer
                if (data.players && playerName) {
                    const updatedPlayer = data.players.find((p: any) => p.name === playerName);
                    if (updatedPlayer) {
                        onPlayerUpdate(updatedPlayer);
                    }
                }
            } else {
                console.error("Error fetching room data");
            }
        } catch (error) {
            console.error("Error fetching room:", error);
        }
    }, [roomCode, playerName, onRoomUpdate, onPlayerUpdate]);

    useEffect(() => {
        if (!roomCode || !isMultiplayer) return;

        console.log(`[Realtime] 🔌 Subscribing to room: ${roomCode}`);

        // Fetch inicial SOLO UNA VEZ al conectarse
        fetchRoomData();

        // Crear canal de Realtime para la sala específica
        const channel = supabase
            .channel(`room-${roomCode}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Escuchar INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'rooms',
                    filter: `code=eq.${roomCode}` // Solo cambios en esta sala
                },
                (payload) => {
                    console.log('[Realtime] 🎮 Room changed:', payload.eventType);

                    // Solo hacer fetch cuando HAY un cambio real
                    // Esto es MUCHO más eficiente que el polling
                    fetchRoomData();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'players'
                },
                (payload) => {
                    // Filtrar solo eventos de nuestra sala
                    const playerData = (payload.new || payload.old) as any;

                    // Si es de nuestra sala, actualizar
                    if (!roomIdRef.current || playerData?.room_id === roomIdRef.current) {
                        console.log('[Realtime] 👤 Player changed:', payload.eventType);
                        fetchRoomData();
                    } else {
                        // Ignorar cambios de otras salas sin hacer fetch
                        console.log('[Realtime] ⏭️ Ignoring player change from different room');
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] ✅ Successfully subscribed - NO MORE POLLING!');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[Realtime] ❌ Error subscribing to channel');
                } else if (status === 'TIMED_OUT') {
                    console.error('[Realtime] ⏱️ Subscription timed out');
                } else if (status === 'CLOSED') {
                    console.log('[Realtime] 🔌 Channel closed');
                }
            });

        // Cleanup: desuscribirse cuando el componente se desmonte
        return () => {
            console.log(`[Realtime] 👋 Unsubscribing from room: ${roomCode}`);
            supabase.removeChannel(channel);
        };
    }, [roomCode, isMultiplayer, fetchRoomData]);

    // Retornar función para hacer fetch manual si es necesario
    return { fetchRoomData };
}
