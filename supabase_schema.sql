-- Tabla para almacenar las salas/rooms del juego
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  host VARCHAR(100) NOT NULL,
  game_state VARCHAR(20) DEFAULT 'setup' CHECK (game_state IN ('setup', 'lobby', 'reveal', 'playing', 'ended')),
  settings JSONB DEFAULT '{
    "numImpostors": 1,
    "timeLimit": 180,
    "category": "comida"
  }'::jsonb,
  game_data JSONB DEFAULT '{
    "secretWord": "",
    "timeLeft": 180,
    "playingOrder": [],
    "currentPlayerIndex": 0,
    "startTime": null,
    "readyPlayers": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar los jugadores
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_host BOOLEAN DEFAULT false,
  is_impostor BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, name)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);

-- Función para actualizar automáticamente last_updated
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_updated automáticamente
CREATE TRIGGER update_rooms_last_updated
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Habilitar Row Level Security (RLS) - Opcional pero recomendado
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permite lectura y escritura a todos por ahora)
-- Puedes personalizarlas según tus necesidades
CREATE POLICY "Allow all operations on rooms" ON rooms
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true);
