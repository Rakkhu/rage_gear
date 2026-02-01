
import { v4 as uuidv4 } from 'uuid';

export class Lobby {
    constructor(id, hostId) {
        this.id = id;
        this.hostId = hostId;
        this.players = new Map(); // id -> player
        this.state = 'LOBBY'; // LOBBY, PLAYING, ENDED
        this.teams = { red: [], blue: [] }; // Squad slots
        this.game = null; // ServerGame instance
        this.settings = {
            squadsPerTeam: 2, // Default
            seed: Math.floor(Math.random() * 100000)
        };
    }

    addPlayer(ws, playerId) {
        this.players.set(playerId, { id: playerId, ws, name: 'Player ' + playerId.substr(0, 4), team: null, squad: null, slot: null, isBot: false });
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        // Remove from teams
        ['red', 'blue'].forEach(team => {
            // Logic to clear slot
        });
    }
}

export class LobbyManager {
    constructor() {
        this.lobbies = new Map();
    }

    createLobby(hostId) {
        const id = Math.random().toString(36).substring(2, 7).toUpperCase();
        const lobby = new Lobby(id, hostId);
        this.lobbies.set(id, lobby);
        return lobby;
    }

    getLobby(id) {
        return this.lobbies.get(id);
    }

    joinLobby(id, player) {
        const lobby = this.lobbies.get(id);
        if (lobby) {
            lobby.addPlayer(player.ws, player.id);
            return lobby;
        }
        return null;
    }
}
