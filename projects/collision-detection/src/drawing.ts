import { AABB, Point2D, Ray } from "~common/geometry";


export const POINT_RADIUS = .5;
export const TAU = 2 * Math.PI

export function drawingFunctions(ctx: CanvasRenderingContext2D) {
    function drawPoint(point: Point2D, fillColor: string = "white") {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, POINT_RADIUS, 0, TAU);
      ctx.fill();
    }
  
    function drawAABB(aabb: AABB, strokeColor: string = "white") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.1;
      ctx.strokeRect(aabb.x, aabb.y, aabb.w, aabb.h);
    }
  
    function drawRay(ray: Ray, strokeColor: string = "white") {
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(ray.origin.x, ray.origin.y);
  
      ctx.lineTo(ray.origin.x + ray.direction.x, ray.origin.y + ray.direction.y);
  
      ctx.stroke();
  
      drawPoint(ray.origin, "fuchsia");
    }
  
    return {
      drawPoint,
      drawAABB,
      drawRay,
    };
  }