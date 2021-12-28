import {Ball as BallType, Position, Vector} from "./types";

export class Ball implements BallType {
    pos: Position;
    vel: Vector;


    constructor({pos, vel}: BallType) {
        this.pos = pos;
        this.vel = vel;
    }


    update(dt: number) {

    }
}