import { NextResponse } from 'next/server';
import { categorias } from '@/app/lib/data';
import { supabase } from '@/lib/supabase';

// Helper to generate room code
const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper to map Supabase room data to frontend format
const mapRoomData = (room: any, players: any[]) => ({
  ...room,
  gameState: room.game_state,
  gameData: room.game_data,
  lastUpdated: room.last_updated,
  players: (players || []).map(p => ({
    ...p,
    is_host: p.is_host,
    is_impostor: p.is_impostor
  }))
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
  }

  // Obtener la sala de Supabase
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Obtener los jugadores de la sala
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', room.id);

  if (playersError) {
    return NextResponse.json({ error: 'Error fetching players' }, { status: 500 });
  }

  return NextResponse.json(mapRoomData(room, players));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, roomCode, playerName, settings, gameData } = body;

  if (action === 'create') {
    const newRoomCode = generateRoomCode();

    // Crear la sala en Supabase
    const { data: newRoom, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code: newRoomCode,
        host: playerName,
        game_state: 'setup',
        settings: settings || {
          numImpostors: 1,
          timeLimit: 180,
          category: 'comida'
        },
        game_data: {
          secretWord: '',
          timeLeft: 180,
          playingOrder: [],
          currentPlayerIndex: 0,
          startTime: null,
          readyPlayers: []
        }
      })
      .select()
      .single();

    if (roomError || !newRoom) {
      return NextResponse.json({ error: 'Error creating room' }, { status: 500 });
    }

    // Crear el jugador anfitrión
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: newRoom.id,
        name: playerName,
        is_host: true,
        is_impostor: false
      });

    if (playerError) {
      return NextResponse.json({ error: 'Error creating player' }, { status: 500 });
    }

    // Obtener los jugadores
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', newRoom.id);

    return NextResponse.json({
      roomCode: newRoomCode,
      room: mapRoomData(newRoom, players || [])
    });
  }

  if (action === 'join') {
    console.log(`[JOIN] Attempting to join room: ${roomCode} as ${playerName}`);
    // Buscar la sala
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      console.log(`[JOIN] Room not found or error:`, roomError);
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.game_state !== 'setup' && room.game_state !== 'lobby') {
      console.log(`[JOIN] Game already started: ${room.game_state}`);
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    // Verificar si el nombre ya existe
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('name', playerName)
      .single();

    if (existingPlayer) {
      console.log(`[JOIN] Name already taken: ${playerName}`);
      return NextResponse.json({ error: 'Name already taken' }, { status: 400 });
    }

    // Agregar el jugador
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        name: playerName,
        is_host: false,
        is_impostor: false
      });

    if (playerError) {
      console.log(`[JOIN] Error creating player:`, playerError);
      return NextResponse.json({ error: 'Error joining room' }, { status: 500 });
    }

    // Obtener todos los jugadores actualizados
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    return NextResponse.json({ room: mapRoomData(room, players || []) });
  }

  if (action === 'updateSettings') {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Actualizar configuración
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        settings: { ...room.settings, ...settings }
      })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }

    // Obtener sala actualizada con jugadores
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    return NextResponse.json({ room: mapRoomData(updatedRoom, players || []) });
  }

  if (action === 'startGame') {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    if (playersError || !players) {
      return NextResponse.json({ error: 'Error fetching players' }, { status: 500 });
    }

    const { category, numImpostors, timeLimit } = room.settings as any;

    // Seleccionar palabra
    // @ts-ignore
    const palabras = categorias[category].palabras;
    const word = palabras[Math.floor(Math.random() * palabras.length)];

    // Asignar roles
    const playerIndices = Array.from({ length: players.length }, (_, i) => i);
    const impostorIndices: number[] = [];
    while (impostorIndices.length < numImpostors) {
      const idx = Math.floor(Math.random() * playerIndices.length);
      if (!impostorIndices.includes(idx)) {
        impostorIndices.push(idx);
      }
    }

    // Actualizar jugadores con roles
    for (let i = 0; i < players.length; i++) {
      await supabase
        .from('players')
        .update({ is_impostor: impostorIndices.includes(i) })
        .eq('id', players[i].id);
    }

    // Obtener jugadores actualizados
    const { data: updatedPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    // Mezclar orden de juego
    const shuffledPlayers = [...(updatedPlayers || [])].sort(() => Math.random() - 0.5);

    // Actualizar sala con datos del juego
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        game_state: 'reveal',
        game_data: {
          secretWord: word,
          timeLeft: timeLimit,
          playingOrder: shuffledPlayers,
          currentPlayerIndex: 0,
          startTime: null,
          readyPlayers: []
        }
      })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error starting game' }, { status: 500 });
    }

    // Obtener sala actualizada
    const { data: finalRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    return NextResponse.json({ room: mapRoomData(finalRoom, updatedPlayers || []) });
  }

  if (action === 'confirmRole') {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const gameData = room.game_data as any;
    const readyPlayers = gameData.readyPlayers || [];

    if (!readyPlayers.includes(playerName)) {
      readyPlayers.push(playerName);
    }

    // Obtener jugadores para verificar si todos están listos
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    const allReady = readyPlayers.length === (players?.length || 0);

    // Actualizar sala
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        game_state: allReady ? 'playing' : room.game_state,
        game_data: {
          ...gameData,
          readyPlayers,
          startTime: allReady ? Date.now() : gameData.startTime
        }
      })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error confirming role' }, { status: 500 });
    }

    // Obtener sala actualizada
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    return NextResponse.json({ room: mapRoomData(updatedRoom, players || []) });
  }

  if (action === 'updateGame') {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (gameData) {
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          game_data: { ...(room.game_data as any), ...gameData }
        })
        .eq('id', room.id);

      if (updateError) {
        return NextResponse.json({ error: 'Error updating game' }, { status: 500 });
      }
    }

    // Obtener sala actualizada
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    return NextResponse.json({ room: mapRoomData(updatedRoom, players || []) });
  }

  if (action === 'endGame') {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('rooms')
      .update({ game_state: 'ended' })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error ending game' }, { status: 500 });
    }

    // Obtener sala actualizada
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    return NextResponse.json({ room: mapRoomData(updatedRoom, players || []) });
  }

  if (action === 'resetGame') {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    if (playersError || !players) {
      return NextResponse.json({ error: 'Error fetching players' }, { status: 500 });
    }

    // Resetear todos los jugadores como NO impostores
    for (let i = 0; i < players.length; i++) {
      await supabase
        .from('players')
        .update({ is_impostor: false })
        .eq('id', players[i].id);
    }

    // Obtener jugadores actualizados
    const { data: updatedPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id);

    const { timeLimit } = room.settings as any;

    // Resetear sala al estado 'setup' con datos vacíos
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        game_state: 'setup',
        game_data: {
          secretWord: '',
          timeLeft: timeLimit || 180,
          playingOrder: [],
          currentPlayerIndex: 0,
          startTime: null,
          readyPlayers: []
        }
      })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error resetting game' }, { status: 500 });
    }

    // Obtener sala actualizada
    const { data: finalRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    return NextResponse.json({ room: mapRoomData(finalRoom, updatedPlayers || []) });
  }



  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
