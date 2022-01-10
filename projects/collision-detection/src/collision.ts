import { AABB, Point2D, AABBPointCollision, Vector2D } from "~common/geometry";
import { POINT_RADIUS } from "./drawing";

export function checkAABBPoint(
    aabb: AABB,
    point: Point2D
  ): AABBPointCollision | undefined {
    if (point.x < aabb.left || point.x > aabb.right) {
      return undefined;
    }
  
    if (point.y < aabb.top || point.y > aabb.bottom) {
      return undefined;
    }
  
    const pointToCenterX = aabb.center.x - point.x;
    const xPenetration = aabb.halfW - Math.abs(pointToCenterX) // [0, halfW]
    
    const pointToCenterY = aabb.center.y - point.y;
    const yPenetration = aabb.halfH - Math.abs(pointToCenterY) // [0, halfH]
  
    const additionalShift = POINT_RADIUS + .2
    const normal = new Vector2D(0, 0);
    let collisionPoint: Point2D
    if (xPenetration < yPenetration) { // exit by x
      collisionPoint = new Vector2D(aabb.center.x, point.y);
      if (pointToCenterX == 0) {
        collisionPoint.x -= aabb.halfW + additionalShift // exit by left
        normal.x = -1
      } else {
        const signX = Math.sign(pointToCenterX)
        collisionPoint.x -= signX * (aabb.halfW + additionalShift)
        normal.x = -signX
      }
  
    } else { // exit by y
      collisionPoint = new Vector2D(point.x, aabb.center.y);
      if (pointToCenterY == 0) {
        collisionPoint.y -= aabb.halfH + additionalShift // exit by the top
        normal.y = -1
      } else {
        const signY = Math.sign(pointToCenterY)
        collisionPoint.y -= signY * (aabb.halfH + additionalShift)
        normal.y = -signY
      }
    }
  
    return { collisionPoint, normal };
  
  }
  