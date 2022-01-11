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

    this.min = new Vector2D(this.left, this.top);
    this.max = new Vector2D(this.right, this.bottom);

    this.halfW = w / 2;
    this.halfH = h / 2;
    this.center = new Vector2D(x + this.halfW, y + this.halfH);

  }

  setX(x: number) {
    this.x = x;
    this.left = x;
    this.right = x + this.w;

    this.min.x = this.left
    this.max.x = this.right
    this.center.x = x + this.halfW
  }

  setY(y: number) {
    this.y = y;
    this.top = y;
    this.bottom = y + this.h;

    this.min.y = this.top
    this.max.y = this.bottom
    this.center.y = y + this.halfH
  }
}

export type AABBPointCollision = {
  /**
   * where to place the point to remove collision
   */
  resolvedPoint: Point2D;
  /**
   * the normal vector to the AABB edge that collided
   */
  normal: Point2D;
};


export type AABBRayCollision = {
  resolvedPoint: Point2D,
  normal: Point2D,
}


export type AABB_AABBCollision = {}