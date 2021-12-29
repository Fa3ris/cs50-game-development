export type Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Vector = {
  x: number;
  y: number;
};

export type Pad = {
  pos: Position;
};

export type Ball = {
  pos: Position;
  vel: Vector;
};

export enum Side {
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}

export enum Player {
  ONE,
  TWO
}