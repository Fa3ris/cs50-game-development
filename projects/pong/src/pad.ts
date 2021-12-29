import {Pad as PadType, Position} from "./types";

export class Pad implements PadType {
    pos: Position;

    constructor({pos}: PadType) {
        this.pos = pos;
    }
}