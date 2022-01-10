export type Point2D = Vector2D;

export class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Ray {
  origin: Point2D;
  direction: Vector2D;

  constructor(origin: Point2D, direction: Vector2D) {
    this.origin = origin;
    this.direction = direction;
  }
}

export class AABB {
  x: number;
  y: number;
  w: number;
  h: number;

  top: number;
  bottom: number;

  left: number;
  right: number;

  min: Point2D;
  max: Point2D;
  center: Point2D;

  halfW: number;
  halfH: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.top = y;
    this.bottom = y + h;

    this.left = x;
    this.right = x + w;

    this.min = new Vector2D(x, y);
    this.max = new Vector2D(x + w, y + h);

    this.center = new Vector2D(x + w / 2, y + h / 2);

    this.halfW = w / 2;
    this.halfH = h / 2;
  }
}

export type AABBPointCollision = {
  collisionPoint: Point2D;
  normal: Point2D;
};
