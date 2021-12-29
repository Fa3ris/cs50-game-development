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
    this.vel.x = Math.min(this.vel.x, Ball.maxVx);
    this.vel.y = Math.min(this.vel.y, Ball.maxVy);
  }

  reboundVertical(accel?: Vector) {
    debug('rebound vertical before', accel, JSON.stringify(this))
    this.vel.y *= -1;

    debug('rebound vertical after', accel, JSON.stringify(this))
    if (!accel) return

    debug('update accel')
    this.accel.x += accel.x;
    this.accel.y += accel.y;
  }

  reboundHorizontal(accel?: Vector) {
    debug('rebound horizontal before', accel, JSON.stringify(this))
    this.vel.x *= -1; // reverse direction

    debug('rebound horizontal after', accel, JSON.stringify(this))
    if (!accel) return

    this.accel.x += accel.x;
    this.accel.y += accel.y;
  }
}
