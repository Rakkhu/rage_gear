
export class NetClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.onMessage = null; // Callback
        this.playerId = null;
    }

    connect(url) {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(url);
            this.ws.onopen = () => {
                this.connected = true;
                resolve();
            };
            this.ws.onerror = (e) => reject(e);
            this.ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (this.onMessage) this.onMessage(data);
            };
        });
    }

    send(type, payload) {
        if (this.connected) {
            this.ws.send(JSON.stringify({ type, ...payload }));
        }
    }
}
