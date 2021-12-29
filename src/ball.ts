import { Ball as BallType, Position, Vector } from "./types";
import { ballConfig } from "./config";
import { debug, info } from "./log";

const {v0, acc, maxVx, maxVy} = ballConfig;

export class Ball implements BallType {
  static v0 = v0;
  static acc = acc;
  static maxVx = maxVx;
  static maxVy = maxVy;
  pos: Position;
  vel: Vector;
  accel: Vector = {x: 0, y: 0}

  constructor({ pos, vel }: BallType) {
    this.pos = pos;
    this.vel = vel;
  }

  update(dt: number) {

    debug('before update', JSON.stringify(this))

    this.vel.x += this.accel.x * dt;
    this.vel.y += this.accel.y * dt

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    debug('after update', JSON.stringify(this))


    this.accel.x = 0;
    this.accel.y = 0;
  }

  adjustVelocity() {
    this.vel.x = Math.sign(this.vel.x) * Math.min(Math.abs(this.vel.x), Ball.maxVx);
    this.vel.y = Math.sign(this.vel.y) * Math.min(Math.abs(this.vel.y), Ball.maxVy);
  }

  applyForce(accel: Vector) {
    this.accel.x += accel.x;
    this.accel.y += accel.y
  }
}
