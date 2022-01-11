import { AABB, Point2D, AABBPointCollision, Vector2D, Ray, AABBRayCollision, AABB_AABBCollision, SweptAABB_AABBCollision } from "~common/geometry";
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
    let resolvedPoint: Point2D
    if (xPenetration < yPenetration) { // exit by x
      resolvedPoint = new Vector2D(aabb.center.x, point.y);
      if (pointToCenterX == 0) {
        resolvedPoint.x -= aabb.halfW + additionalShift // exit by left
        normal.x = -1
      } else {
        const signX = Math.sign(pointToCenterX)
        resolvedPoint.x -= signX * (aabb.halfW + additionalShift)
        normal.x = -signX
      }
  
    } else { // exit by y
      resolvedPoint = new Vector2D(point.x, aabb.center.y);
      if (pointToCenterY == 0) {
        resolvedPoint.y -= aabb.halfH + additionalShift // exit by the top
        normal.y = -1
      } else {
        const signY = Math.sign(pointToCenterY)
        resolvedPoint.y -= signY * (aabb.halfH + additionalShift)
        normal.y = -signY
      }
    }
  
    return { resolvedPoint, normal };
  
  }



export function checkAABBRay(aabb: AABB, ray: Ray) : AABBRayCollision | undefined {


  /* 
    a segment AB is described by the equation
    S(t) = A + t*(B - A)


    find the values of t for which segment intersect the 4 edges of the AABB
    => tXMin, tXMax, tYMin, tYMax

    for left and right edge, we have x = cste
      solve cste = Ax + t * (Bx - Ax) => t = (cst - Ax) / (Bx - Ax)

    for top and bottom edge, we have y = cste
      solve cste = Ay + t * (By - Ay) => t = (cst - Ay) / (By - Ay)

    for a direction i and the opposite direction j,
    we must have tiMin <= tjMax to have a collision with the aabb

    the collision happens on tMin = max(tXMin, tYMin)
    we also have tMax = min(tXMax, tYMax)

    to be on the segment AB, we must have tMin <= 1 && tMax >= 0
  
  */

  // compute division once and use multiplication next because it is faster
  // can retain the sign even if direction equals -0 (negative zero) => -Infinity
  const divX = 1 / ray.direction.x
  const divY = 1 / ray.direction.y
  
  let tMin, tMax: number;
  if (divX >= 0) {
    tMin = (aabb.left - ray.origin.x) * divX
    tMax = (aabb.right - ray.origin.x) * divX
  } else {
    tMin = (aabb.right - ray.origin.x) * divX
    tMax = (aabb.left - ray.origin.x) * divX
  }

  let tyMin, tyMax: number
  if (divY >= 0) {
    tyMin = (aabb.top - ray.origin.y) * divY
    tyMax = (aabb.bottom - ray.origin.y) * divY
  } else {
    tyMin = (aabb.bottom - ray.origin.y) * divY
    tyMax = (aabb.top - ray.origin.y) * divY
  }

  if (tMin > tyMax || tyMin > tMax) {
    return undefined
  }

  const normal = new Vector2D(0, 0)

  if (tyMin > tMin) { // keep max tMin
    tMin = tyMin
    normal.y = -Math.sign(divY) // collision happens on top/bottom edge
  } else {
    normal.x = -Math.sign(divX) // collision happens on right/left edge
  }

  if (tyMax < tMax) { // keep min tMax
    tMax = tyMax
  }

  if (tMin > 1 || tMax < 0) {
    return undefined
  }

  const resolvedPoint = new Vector2D(
    ray.origin.x + ray.direction.x * tMin + normal.x,
    ray.origin.y + ray.direction.y * tMin + normal.y)
  
  // TODO
  // hit.delta.x = (1.0 - hit.time) * -delta.x;
  // hit.delta.y = (1.0 - hit.time) * -delta.y;

  return {
    resolvedPoint,
    normal,
    tMin
  }
}


export function checkAABB_AABB(collider: AABB, aabb: AABB): AABB_AABBCollision | undefined {

  const dCenterX = collider.center.x - aabb.center.x;
  const penetrationX = aabb.halfW + collider.halfW - Math.abs(dCenterX)

  if (penetrationX <= 0) {
    return undefined
  }

  const dCenterY = collider.center.y - aabb.center.y;
  const penetrationY = aabb.halfH + collider.halfH - Math.abs(dCenterY)

  if (penetrationY <= 0) {
    return undefined
  }

  const normal = new Vector2D(0, 0)
  const resolvedColliderPosition = new Vector2D(collider.x, collider.y)
  if (penetrationX < penetrationY) {
    const signX = Math.sign(dCenterX)
    normal.x = signX
    resolvedColliderPosition.x = collider.center.x + (penetrationX * signX) - collider.halfW
  } else {
    const signY = Math.sign(dCenterY)
    normal.y = signY
    resolvedColliderPosition.y = collider.center.y + (penetrationY * signY) - collider.halfH
  }
  return {normal, resolvedColliderPosition}
}

/** 
  compute the Minkowski difference (aabb - collider)
  
  and on the other hand (collider - collider) = zero-vector

  check if collision between aabb and ray starting from zero-vector and going to direction 

  @param direction must not be the zero vector

*/
export function checkSweptAABB_AABB(collider: AABB, direction: Vector2D, aabb: AABB): SweptAABB_AABBCollision | undefined {

  const mdLeft = aabb.left - collider.right
  const mdTop = aabb.top - collider.bottom
  const mdWidth = aabb.w + collider.w
  const mdHeight = aabb.h + collider.h
  const minkowskiDifference: AABB = new AABB(mdLeft, mdTop, mdWidth, mdHeight)

  const ray = new Ray(new Vector2D(0, 0), direction)
  
  const rayAABBCollision = checkAABBRay(minkowskiDifference, ray)

  if (rayAABBCollision) {
    const resolvedColliderPosition = new Vector2D(
      collider.x + rayAABBCollision.tMin * direction.x, 
      collider.y + rayAABBCollision.tMin * direction.y)
    return {resolvedColliderPosition, normal: rayAABBCollision.normal}
  }
  return undefined
}
  