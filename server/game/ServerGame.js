
import * as CANNON from 'cannon-es';
import { CONFIG } from '../config.js';
import { ServerVehicle, ServerProjectile } from './ServerEntities.js';
import { SeededRNG } from '../utils.js';
import { ArenaGenerator } from './ArenaGenerator.js';

export class ServerGame {
    constructor(lobby) {
        this.lobby = lobby;
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.vehicles = new Map(); // playerId -> ServerVehicle
        this.projectiles = new Map(); // id -> ServerProjectile

        this.lastTime = Date.now();
        this.interval = null;

        this.matchTime = CONFIG.MATCH_DURATION;
        this.scores = { red: 0, blue: 0 };
        this.zoneRadius = CONFIG.ZONE.START_RADIUS;

        this.spawnPoints = {
            red: [{ x: -40, z: -40 }, { x: -30, z: -40 }],
            blue: [{ x: 40, z: 40 }, { x: 30, z: 40 }]
        };

        this.rng = new SeededRNG(lobby.settings.seed);

        // Generate Arena Collision (simplified static bodies for server)
        // For MVP server just needs floor and boundaries to stop vehicles falling
        // Ideally we generate same procedural blocks. 
        // We will add basic floor and walls here.
        this.setupArena();

        this.frameCount = 0;
    }

    setupArena() {
        // Ground
        const groundBody = new CANNON.Body({ type: CANNON.Body.STATIC });
        groundBody.addShape(new CANNON.Plane());
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);

        // Generator
        const gen = new ArenaGenerator(this.lobby.settings.seed);
        const obstacles = gen.generate();

        obstacles.forEach(o => {
            const shape = o.type === 'box'
                ? new CANNON.Box(new CANNON.Vec3(o.w / 2, o.h / 2, o.d / 2))
                : new CANNON.Cylinder(o.w / 2, o.w / 2, o.h, 8);

            const body = new CANNON.Body({ mass: 0 }); // Static
            body.addShape(shape);
            body.position.set(o.x, o.y, o.z);
            if (o.type === 'cylinder') body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

            this.world.addBody(body);
        });
    }

    start() {
        // Spawn players
        this.lobby.players.forEach(p => {
            // Assign Team if not assigned (Simple alternating)
            const team = (this.vehicles.size % 2 === 0) ? 'red' : 'blue';
            this.spawnPlayer(p.id, team);
        });

        this.interval = setInterval(() => this.update(), 1000 / CONFIG.PHYSICS_RATE);
    }

    spawnPlayer(id, team) {
        const start = this.spawnPoints[team][0]; // Randomize slightly
        const v = new ServerVehicle(id, team, { x: start.x, z: start.z }, this.world);
        this.vehicles.set(id, v);
    }

    removePlayer(id) {
        if (this.vehicles.has(id)) {
            this.world.removeBody(this.vehicles.get(id).body);
            this.vehicles.delete(id);
        }
    }

    handleInput(id, input) {
        const v = this.vehicles.get(id);
        if (v) {
            v.input = input;
            // Handle Shooting here or in update?
            if (input.fire) { /* Fire MG logic (Raycast) */ }
            if (input.rocket) { /* Fire Rocket logic */ }
        }
    }

    update() {
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Step Physics
        this.world.step(1 / CONFIG.PHYSICS_RATE, dt, 3);

        // Update Entities
        this.vehicles.forEach(v => v.update(dt));

        // Zone Logic
        if (this.matchTime > 0) {
            this.matchTime -= dt;
            // Shrink Zone
            const progress = 1 - (this.matchTime / CONFIG.MATCH_DURATION); // 0 to 1 (actually duration is limit)
            // ...
        }

        // Broadcast Snapshots at 20Hz
        this.frameCount++;
        if (this.frameCount % (60 / CONFIG.SERVER_TICK_RATE) === 0) {
            const snapshot = {
                type: 'SNAPSHOT',
                time: now,
                vehicles: Array.from(this.vehicles.values()).map(v => ({
                    id: v.id,
                    pos: v.body.position,
                    quat: v.body.quaternion,
                    hp: v.hp,
                    team: v.team
                })),
                projectiles: [],
                zone: { radius: this.zoneRadius },
                scores: this.scores,
                timeLeft: this.matchTime
            };
            this.broadcast(snapshot);
        }
    }

    broadcast(msg) {
        const data = JSON.stringify(msg);
        this.lobby.players.forEach(p => {
            if (p.ws.readyState === 1) p.ws.send(data);
        });
    }
}
