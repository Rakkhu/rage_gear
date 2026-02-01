
import { Game } from './game/Game.js';
import { NetClient } from './game/net/NetClient.js';

window.onload = async () => {
    const game = new Game();
    window.game = game; // Debugging

    // DOM Elements
    const screens = {
        main: document.getElementById('menu-main'),
        lobby: document.getElementById('menu-lobby'),
        end: document.getElementById('menu-end'),
        hud: document.getElementById('hud')
    };

    const showScreen = (name) => {
        Object.values(screens).forEach(s => s.classList.add('hidden'));
        if (screens[name]) screens[name].classList.remove('hidden');
    };

    // Buttons
    document.getElementById('btn-offline').onclick = () => {
        game.startOffline();
        showScreen('hud');
    };

    const net = new NetClient();

    document.getElementById('btn-create').onclick = async () => {
        if (!net.connected) await connectServer();
        net.send('CREATE_LOBBY', {});
    };

    document.getElementById('btn-join').onclick = async () => {
        const code = document.getElementById('input-code').value.toUpperCase();
        if (code.length < 5) return;
        if (!net.connected) await connectServer();
        net.send('JOIN_LOBBY', { code });
    };

    document.getElementById('btn-start').onclick = () => {
        net.send('START_MATCH', {});
    };

    async function connectServer() {
        let url = import.meta.env.VITE_WS_URL;

        if (!url) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = 3000;
            url = `${protocol}//${host}:${port}`;
        }

        console.log('Connecting to', url);
        await net.connect(url);

        net.onMessage = (msg) => {
            switch (msg.type) {
                case 'LOBBY_CREATED':
                case 'LOBBY_JOINED':
                    showScreen('lobby');
                    document.getElementById('lobby-code').innerText = msg.code;
                    if (msg.type === 'LOBBY_CREATED') document.getElementById('btn-start').classList.remove('hidden');
                    break;
                case 'MATCH_START':
                    game.startOnline(net, msg.seed);
                    showScreen('hud');
                    break;
                case 'SNAPSHOT':
                    game.onSnapshot(msg);
                    break;
            }
        };
    }
};
