
import * as THREE from 'three';

export class Vehicle {
    constructor(id, team, x, z, worldScene) {
        this.id = id;
        this.team = team;
        this.mesh = new THREE.Group();

        // Chassis
        const color = team === 'red' ? 0xff0000 : 0x0000ff;
        const chassisGeo = new THREE.BoxGeometry(2, 1, 4);
        const chassisMat = new THREE.MeshLambertMaterial({ color });
        this.chassis = new THREE.Mesh(chassisGeo, chassisMat);
        this.chassis.position.y = 0.5;
        this.mesh.add(this.chassis);

        // Turret
        const turretGeo = new THREE.CylinderGeometry(0.5, 0.5, 2);
        const turretMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        this.turret = new THREE.Mesh(turretGeo, turretMat);
        this.turret.rotation.z = Math.PI / 2;
        this.turret.position.y = 1;
        this.mesh.add(this.turret);

        this.mesh.position.set(x, 1, z);
        worldScene.add(this.mesh);

        // State for interpolation
        this.targetPos = new THREE.Vector3(x, 1, z);
        this.targetQuat = new THREE.Quaternion();
    }

    update(dt) {
        // Simple Lerp
        this.mesh.position.lerp(this.targetPos, 0.2);
        this.mesh.quaternion.slerp(this.targetQuat, 0.2);
    }

    setPulse(hp) {
        // Visual damage or invincible flicker
        if (hp <= 0) this.mesh.visible = false;
        else this.mesh.visible = true;
    }

    remove(worldScene) {
        worldScene.remove(this.mesh);
    }
}
