
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class World {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222233);
        this.scene.fog = new THREE.FogExp2(0x222233, 0.02);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(50, 50, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        this.scene.add(dirLight);

        // Ground
        // Visual
        const grid = new THREE.GridHelper(200, 50, 0x444444, 0x222222);
        this.scene.add(grid);

        const planeGeo = new THREE.PlaneGeometry(200, 200);
        const planeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    updateCamera(targetPos) {
        if (!targetPos) return;
        // Smooth follow
        const offset = new THREE.Vector3(0, 8, 12); // Above and behind
        const desiredPos = targetPos.clone().add(offset);
        this.camera.position.lerp(desiredPos, 0.1);
        this.camera.lookAt(targetPos);
    }

    generateArena(seed) {
        while (this.arenaGroup.children.length > 0) {
            this.arenaGroup.remove(this.arenaGroup.children[0]);
        }

        import('./ArenaGenerator.js').then(module => {
            const gen = new module.ArenaGenerator(seed);
            const data = gen.generate();

            const boxGeo = new THREE.BoxGeometry(1, 1, 1);
            const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
            const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });

            data.forEach(o => {
                const mesh = new THREE.Mesh(o.type === 'box' ? boxGeo : cylGeo, mat);
                mesh.position.set(o.x, o.y, o.z);
                mesh.scale.set(o.w, o.h, o.d);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.arenaGroup.add(mesh);
            });
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
