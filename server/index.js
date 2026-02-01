
import { WebSocketServer } from 'ws';
import { LobbyManager } from './lobby/LobbyManager.js';
import { ServerGame } from './game/ServerGame.js';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });
const lobbyManager = new LobbyManager();

console.log(`Rage Road Server running on port ${PORT}`);

wss.on('connection', (ws) => {
    const playerId = Math.random().toString(36).substring(2, 10);
    let currentLobby = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, playerId, data);
        } catch (e) {
            console.error('Invalid message', e);
        }
    });

    ws.on('close', () => {
        if (currentLobby) {
            currentLobby.game?.removePlayer(playerId);
            // lobbyManager.leave(currentLobby.id, playerId);
        }
    });

    function handleMessage(ws, pid, data) {
        // Types: CREATE_LOBBY, JOIN_LOBBY, SET_TEAM, START_MATCH, INPUT
        switch (data.type) {
            case 'CREATE_LOBBY':
                const lobby = lobbyManager.createLobby(pid);
                currentLobby = lobby;
                lobby.addPlayer(ws, pid);
                ws.send(JSON.stringify({ type: 'LOBBY_CREATED', code: lobby.id, playerId: pid }));
                break;

            case 'JOIN_LOBBY':
                const joinLobby = lobbyManager.getLobby(data.code);
                if (joinLobby) {
                    currentLobby = joinLobby;
                    joinLobby.addPlayer(ws, pid);
                    ws.send(JSON.stringify({ type: 'LOBBY_JOINED', code: joinLobby.id, playerId: pid, settings: joinLobby.settings }));
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', msg: 'Lobby not found' }));
                }
                break;

            case 'START_MATCH':
                if (currentLobby && currentLobby.hostId === pid) {
                    currentLobby.state = 'PLAYING';
                    // Initialize Game
                    currentLobby.game = new ServerGame(currentLobby);
                    currentLobby.game.start();
                    // Broadcast Start
                    broadcastToLobby(currentLobby, { type: 'MATCH_START', seed: currentLobby.settings.seed });
                }
                break;

            case 'INPUT':
                if (currentLobby && currentLobby.game) {
                    currentLobby.game.handleInput(pid, data.input);
                }
                break;
        }
    }
});

function broadcastToLobby(lobby, msg) {
    const str = JSON.stringify(msg);
    lobby.players.forEach(p => {
        if (p.ws.readyState === 1) p.ws.send(str);
    });
}
