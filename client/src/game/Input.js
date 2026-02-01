
export class InputManager {
    constructor() {
        this.input = { x: 0, y: 0, fire: false, boost: false, rocket: false, aimDir: { x: 0, z: 1 } };
        this.keys = {};
        this.isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent) || (window.innerWidth < 800 && 'ontouchstart' in window);

        if (!this.isMobile) {
            this.setupDesktop();
        } else {
            this.setupMobile();
        }
    }

    setupDesktop() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.input.fire = true;
            if (e.button === 2) this.input.rocket = true;
        });
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.input.fire = false;
            // Rocket is tap usually, but flag clear
            if (e.button === 2) this.input.rocket = false;
        });

        // Raycast logic handled in Game update usually using mouse pos
        this.mousePos = { x: 0, y: 0 };
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    setupMobile() {
        // Simple Touch logic wrapper
        const leftZone = document.getElementById('joy-left');
        const rightZone = document.getElementById('joy-right');

        // Helper for simple virtual joystick
        const trackJoystick = (elem, outputKeyX, outputKeyY) => {
            let startX, startY;
            elem.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].clientX;
                startY = e.changedTouches[0].clientY;
                e.preventDefault();
            });
            elem.addEventListener('touchmove', (e) => {
                const dx = e.changedTouches[0].clientX - startX;
                const dy = e.changedTouches[0].clientY - startY;
                // Normalize clamp -50 to 50
                this.input[outputKeyX] = Math.max(-1, Math.min(1, dx / 40));
                this.input[outputKeyY] = Math.max(-1, Math.min(1, -dy / 40)); // Y inverted for forward
            });
            elem.addEventListener('touchend', () => {
                this.input[outputKeyX] = 0;
                this.input[outputKeyY] = 0;
            });
        };

        trackJoystick(leftZone, 'x', 'y');
        // Right stick for aim (vector)
        // For simplicity, just store raw vector in "aimInput" and process later

        // Buttons
        const bindBtn = (id, key) => {
            const btn = document.getElementById(id);
            btn.addEventListener('touchstart', (e) => { this.input[key] = true; e.preventDefault(); });
            btn.addEventListener('touchend', (e) => { this.input[key] = false; e.preventDefault(); });
        };
        bindBtn('btn-fire', 'fire');
        bindBtn('btn-boost', 'boost');
        bindBtn('btn-rocket', 'rocket');
    }

    update() {
        if (!this.isMobile) {
            this.input.y = (this.keys['KeyW'] || this.keys['ArrowUp'] ? 1 : 0) - (this.keys['KeyS'] || this.keys['ArrowDown'] ? 1 : 0);
            this.input.x = (this.keys['KeyA'] || this.keys['ArrowLeft'] ? 1 : 0) - (this.keys['KeyD'] || this.keys['ArrowRight'] ? 1 : 0);
            this.input.boost = this.keys['ShiftLeft'];
            // Rocket input clear if it was a frame trigger
        }
        return this.input;
    }
}
