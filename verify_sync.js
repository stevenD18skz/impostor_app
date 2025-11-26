
async function testGameFlow() {
  const baseUrl = 'http://localhost:3000/api/game';

  // 1. Create Room
  console.log('Creating room...');
  const createRes = await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'create', playerName: 'Host' })
  });
  const createData = await createRes.json();
  const roomCode = createData.roomCode;
  console.log('Room created:', roomCode);

  // 2. Join Player 2
  console.log('Joining Player 2...');
  await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'join', roomCode, playerName: 'Player2' })
  });

  // 3. Start Game
  console.log('Starting game...');
  const startRes = await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'startGame', roomCode })
  });
  const startData = await startRes.json();
  console.log('Game State after start:', startData.room.gameState); // Should be 'reveal'
  console.log('Ready Players:', startData.room.gameData.readyPlayers);

  // 4. Confirm Role for Host
  console.log('Confirming role for Host...');
  const confirm1Res = await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'confirmRole', roomCode, playerName: 'Host' })
  });
  const confirm1Data = await confirm1Res.json();
  console.log('Game State after Host confirm:', confirm1Data.room.gameState); // Should be 'reveal'
  console.log('Ready Players:', confirm1Data.room.gameData.readyPlayers);

  // 5. Confirm Role for Player 2
  console.log('Confirming role for Player 2...');
  const confirm2Res = await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'confirmRole', roomCode, playerName: 'Player2' })
  });
  const confirm2Data = await confirm2Res.json();
  console.log('Game State after Player 2 confirm:', confirm2Data.room.gameState); // Should be 'playing'
  console.log('Start Time:', confirm2Data.room.gameData.startTime);
}

testGameFlow();
