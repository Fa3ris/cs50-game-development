import { Ball as BallType, Position, Vector } from "./types";
import { ballConfig } from "./config";

const {v0, acc, maxVx, maxVy} = ballConfig;

export class Ball implements BallType {
  static v0 = v0;
  static acc = acc;
  static maxVx = maxVx;
  static maxVy = maxVy;
  pos: Position;
  vel: Vector;

  constructor({ pos, vel }: BallType) {
    this.pos = pos;
    this.vel = vel;
  }

  update(dt: number) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  adjustVelocity() {
    this.vel.x = Math.min(this.vel.x, Ball.maxVx);
    this.vel.y = Math.min(this.vel.y, Ball.maxVy);
  }
}
