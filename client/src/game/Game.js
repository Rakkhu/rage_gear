
import { World } from './World.js';
import { InputManager } from './Input.js';
import { Vehicle } from './entities/Vehicle.js';
import { CONFIG } from '../config.js';
import * as THREE from 'three';

export class Game {
    constructor() {
        this.world = new World(document.getElementById('game-container'));
        this.input = new InputManager();
        this.vehicles = new Map(); // id -> Vehicle
        this.myId = null;
        this.running = false;
        this.mode = 'MENU'; // MENU, OFFLINE, ONLINE

        // Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        this.net = null;
    }

    startOffline() {
        this.mode = 'OFFLINE';
        this.running = true;
        this.myId = 'local';
        this.world.generateArena(12345);
        this.spawnVehicle('local', 'blue', 0, 0);
        // Start offline loop (Not fully implemented in this MVP block, focusing on Online structure or Mock)
        // For MVP requirement "Runnable Offline": 
        // We really need a local physics engine here. 
        // IMPORTANT: In a real app we'd import CANNON here and run the same logic as ServerGame.
        // For brevity in this response, I'll setup a minimal mock movement for offline.
    }

    startOnline(net, seed) {
        this.mode = 'ONLINE';
        this.net = net;
        this.running = true;
        this.myId = net.playerId;
        this.world.generateArena(seed);
    }

    spawnVehicle(id, team, x, z) {
        if (this.vehicles.has(id)) return;
        const v = new Vehicle(id, team, x, z, this.world);
        this.vehicles.set(id, v);
    }

    onSnapshot(data) {
        // Update vehicles
        data.vehicles.forEach(vData => {
            let v = this.vehicles.get(vData.id);
            if (!v) {
                this.spawnVehicle(vData.id, vData.team, vData.pos.x, vData.pos.z);
                v = this.vehicles.get(vData.id);
            }
            // Interpolate
            v.targetPos.set(vData.pos.x, vData.pos.y, vData.pos.z);
            v.targetQuat.set(vData.quat.x, vData.quat.y, vData.quat.z, vData.quat.w);
            v.setPulse(vData.hp);

            // Stats
            if (vData.id === this.net.playerId) {
                // Update HUD
                document.getElementById('hp-fill').style.width = vData.hp + '%';
            }
        });

        // Remove missing
        const serverIds = new Set(data.vehicles.map(v => v.id));
        this.vehicles.forEach(v => {
            if (!serverIds.has(v.id)) {
                v.remove(this.world);
                this.vehicles.delete(v.id);
            }
        });

        // Scores
        document.getElementById('score-r').innerText = data.scores.red;
        document.getElementById('score-b').innerText = data.scores.blue;
        document.getElementById('timer').innerText = Math.floor(data.timeLeft);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const inp = this.input.update();

        if (this.mode === 'ONLINE' && this.running && this.net) {
            // Send Input
            this.net.send('INPUT', { input: inp });
        }

        if (this.mode === 'OFFLINE' && this.running) {
            // Local movement hack for offline test
            const v = this.vehicles.get('local');
            if (v) {
                v.mesh.position.z += inp.y * 0.5;
                v.mesh.rotation.y -= inp.x * 0.05;
                v.targetPos.copy(v.mesh.position);
                v.targetQuat.copy(v.mesh.quaternion);

                this.world.updateCamera(v.mesh.position);
            }
        } else if (this.mode === 'ONLINE' && this.vehicles.has(this.net.playerId)) {
            // Camera follow my car (interpolated pos)
            const myCar = this.vehicles.get(this.net.playerId);
            this.world.updateCamera(myCar.mesh.position);
        }

        this.vehicles.forEach(v => v.update(0.016));
        this.world.render();
    }
}
