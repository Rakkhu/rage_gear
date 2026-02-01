
import { SeededRNG } from '../utils.js';

export class ArenaGenerator {
    constructor(seed) {
        this.rng = new SeededRNG(seed);
        this.obstacles = [];
    }

    generate() {
        // Simple Grid Layout
        // 100x100 area
        const count = 20;
        for (let i = 0; i < count; i++) {
            const w = this.rng.range(2, 6);
            const d = this.rng.range(2, 6);
            const h = this.rng.range(1, 4);

            // Random pos, keep away from center spawn (0,0 is safe?)
            // Spawns are at +/- 40
            let x = this.rng.range(-30, 30);
            let z = this.rng.range(-20, 20);

            // Avoid center
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;

            const type = this.rng.next() > 0.5 ? 'box' : 'cylinder';

            this.obstacles.push({ type, x, y: h / 2, z, w, h, d });

            // Mirror
            this.obstacles.push({ type, x: -x, y: h / 2, z: -z, w, h, d });
        }
        return this.obstacles;
    }
}
