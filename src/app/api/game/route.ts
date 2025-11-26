import { NextResponse } from 'next/server';
import { categorias } from '@/app/lib/data';

// In-memory storage for rooms
// In a real app, use Redis or a database
let rooms: Record<string, any> = {};

// Helper to generate room code
const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code || !rooms[code]) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json(rooms[code]);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, roomCode, playerName, settings, gameData } = body;

  if (action === 'create') {
    const newRoomCode = generateRoomCode();
    rooms[newRoomCode] = {
      code: newRoomCode,
      host: playerName,
      players: [{ name: playerName, isHost: true, isImpostor: false }],
      gameState: 'setup', // setup, lobby, playing, ended
      settings: settings || {
        numImpostors: 1,
        timeLimit: 180,
        category: 'comida'
      },
      gameData: {
        secretWord: '',
        timeLeft: 180,
        playingOrder: [],
        currentPlayerIndex: 0,
        startTime: null,
        readyPlayers: []
      },
      lastUpdated: Date.now()
    };
    return NextResponse.json({ roomCode: newRoomCode, room: rooms[newRoomCode] });
  }

  if (action === 'join') {
    if (!rooms[roomCode]) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    if (rooms[roomCode].gameState !== 'setup' && rooms[roomCode].gameState !== 'lobby') {
       return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }
    
    // Check if name exists
    if (rooms[roomCode].players.some((p: any) => p.name === playerName)) {
        return NextResponse.json({ error: 'Name already taken' }, { status: 400 });
    }

    rooms[roomCode].players.push({ name: playerName, isHost: false, isImpostor: false });
    rooms[roomCode].lastUpdated = Date.now();
    return NextResponse.json({ room: rooms[roomCode] });
  }

  if (action === 'updateSettings') {
      if (!rooms[roomCode]) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      rooms[roomCode].settings = { ...rooms[roomCode].settings, ...settings };
      rooms[roomCode].lastUpdated = Date.now();
      return NextResponse.json({ room: rooms[roomCode] });
  }

  if (action === 'startGame') {
    if (!rooms[roomCode]) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    
    const room = rooms[roomCode];
    const { category, numImpostors, timeLimit } = room.settings;
    
    // Select word
    // @ts-ignore
    const palabras = categorias[category].palabras;
    const word = palabras[Math.floor(Math.random() * palabras.length)];
    
    // Assign roles
    const playerIndices = Array.from({ length: room.players.length }, (_, i) => i);
    const impostorIndices: number[] = [];
    while (impostorIndices.length < numImpostors) {
        const idx = Math.floor(Math.random() * playerIndices.length);
        if (!impostorIndices.includes(idx)) {
            impostorIndices.push(idx);
        }
    }
    
    room.players = room.players.map((p: any, i: number) => ({
        ...p,
        isImpostor: impostorIndices.includes(i)
    }));

    // Shuffle playing order
    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);

    room.gameData = {
        secretWord: word,
        timeLeft: timeLimit,
        playingOrder: shuffledPlayers,
        currentPlayerIndex: 0,
        startTime: null, // Will be set when all players confirm
        readyPlayers: []
    };
    room.gameState = 'reveal'; // Start in reveal state
    // Let's stick to the flow: Setup -> Lobby -> Reveal (Individual) -> Playing
    // Actually, for multiplayer, 'Reveal' is usually a local state. The server game state can be 'playing', but clients show reveal first.
    // Or we can have a 'reveal' state in server. Let's say 'playing' implies game started.
    
    room.lastUpdated = Date.now();
    return NextResponse.json({ room });
  }

  if (action === 'confirmRole') {
      if (!rooms[roomCode]) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      
      const room = rooms[roomCode];
      if (!room.gameData.readyPlayers.includes(playerName)) {
          room.gameData.readyPlayers.push(playerName);
      }
      
      // Check if all players are ready
      if (room.gameData.readyPlayers.length === room.players.length) {
          room.gameState = 'playing';
          room.gameData.startTime = Date.now();
      }
      
      room.lastUpdated = Date.now();
      return NextResponse.json({ room });
  }
  
  if (action === 'updateGame') {
      // For syncing timer, next turn, etc.
      if (!rooms[roomCode]) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      if (gameData) {
          rooms[roomCode].gameData = { ...rooms[roomCode].gameData, ...gameData };
      }
      rooms[roomCode].lastUpdated = Date.now();
      return NextResponse.json({ room: rooms[roomCode] });
  }

  if (action === 'endGame') {
      if (!rooms[roomCode]) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      rooms[roomCode].gameState = 'ended';
      rooms[roomCode].lastUpdated = Date.now();
      return NextResponse.json({ room: rooms[roomCode] });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
