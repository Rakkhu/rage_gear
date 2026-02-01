
import * as CANNON from 'cannon-es';
import { CONFIG } from '../config.js';

export class Entity {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.body = null;
        this.toRemove = false;
    }
}

export class ServerVehicle extends Entity {
    constructor(id, team, startPos, world) {
        super(id, 'vehicle');
        this.team = team;
        this.hp = CONFIG.VEHICLE.HP;
        this.boostStamina = 100;
        this.input = { x: 0, y: 0, brake: false, boost: false, fire: false, rocket: false, aimDir: { x: 0, z: 1 } };

        // Cannon Body
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        this.body = new CANNON.Body({ mass: 150 });
        this.body.addShape(chassisShape);
        this.body.position.set(startPos.x, 2, startPos.z);
        this.body.angularDamping = 0.5;
        this.body.linearDamping = 0.1; // Air resistance
        world.addBody(this.body);

        // Vehicle physics simplified (RaycastVehicle is complex to setup in 1 file without helpers, so using RigidBody with force application for Arcade feel)
        this.maxSpeed = CONFIG.VEHICLE.SPEED;
        this.acceleration = 2000;
        this.steerValue = 0;
    }

    update(dt) {
        // Arcade Drive Physics
        // Joystick Y = Throttle
        const forward = new CANNON.Vec3(0, 0, 1);
        this.body.quaternion.vmult(forward, forward);

        // Boost
        let speed = this.maxSpeed;
        if (this.input.boost && this.boostStamina > 0) {
            speed = CONFIG.VEHICLE.BOOST_SPEED;
            this.boostStamina -= dt * 30;
        } else {
            this.boostStamina = Math.min(100, this.boostStamina + dt * 10);
        }

        // Apply Force
        const throttle = this.input.y; // -1 to 1
        if (Math.abs(throttle) > 0.1) {
            const force = new CANNON.Vec3(forward.x * throttle * this.acceleration, 0, forward.z * throttle * this.acceleration);
            this.body.applyForce(force, this.body.position);
        }

        // Steering (Rotate body angular velocity)
        const steer = this.input.x;
        if (Math.abs(steer) > 0.1) {
            // Only steer if moving
            const vel = this.body.velocity.length();
            if (vel > 1) {
                const turnSpeed = 2.0;
                this.body.angularVelocity.y -= steer * turnSpeed * dt * (throttle > 0 ? 1 : -1);
            }
        }

        // Prevent flipping: Correct upright
        const up = new CANNON.Vec3(0, 1, 0); // Global up
        const localUp = new CANNON.Vec3(0, 1, 0);
        this.body.quaternion.vmult(localUp, localUp);
        // If localUp.y is too low, we are tipping. Apply torque to right. (Simplified: Just clamp rotation or raycast)
        // For MVP: Simple reset if upside down? Or angular damping handles it.

        // Cap speed
        if (this.body.velocity.length() > speed) {
            this.body.velocity.scale(speed / this.body.velocity.length(), this.body.velocity);
        }
    }
}

export class ServerProjectile extends Entity {
    constructor(id, ownerId, type, pos, dir, world) {
        super(id, 'projectile');
        this.ownerId = ownerId;
        this.projectileType = type; // 'rocket'
        this.damage = CONFIG.WEAPONS.ROCKET.DAMAGE;

        const speed = CONFIG.WEAPONS.ROCKET.SPEED;
        const radius = 0.3;

        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(new CANNON.Sphere(radius));
        this.body.position.copy(pos);
        this.body.velocity.set(dir.x * speed, dir.y * speed, dir.z * speed);
        // Projectiles trigger events on collide
        this.body.isTrigger = true;

        world.addBody(this.body);
    }
}
