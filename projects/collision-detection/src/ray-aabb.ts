import { adjustCanvasForDisplay } from "~common/canvas-util";
import { Point2D, Vector2D, AABB, AABBPointCollision, Ray } from "~common/geometry";
import { createLoop } from "~common/loop";
import { createCtx2D } from "./canvas";
import { checkAABBPoint } from "./collision";
import { drawingFunctions } from "./drawing";
import { linearMotion, sinusoidalMotion } from "./motions";

export function rayAABB() {
    const W = 640;
    const H = 160;
  
    const ctx = createCtx2D("ray-collision");
    adjustCanvasForDisplay(ctx, W, H);
  
    ctx.font = "12px courier";
    ctx.textBaseline = "top";
  
    document.querySelector("#root")?.appendChild(ctx.canvas);
  

    const start = new Vector2D(40, 55)
    const diagonalMotion = linearMotion(
      start,
      new Vector2D(60, 10)
    );

    const direction = new Vector2D(50, 50)
    const ray = new Ray(start, direction);
  
    const aabb: AABB = new AABB(55, 45, 30, 12);
  
    let collisionInfo: AABBPointCollision | undefined;
  
    const drawingModule = drawingFunctions(ctx);
  
    const drawAABB = drawingModule.drawAABB;
    const drawPoint = drawingModule.drawPoint;
    const drawRay = drawingModule.drawRay;
  
    const loopModule = createLoop();
  
    function update(dt: number) {
      if (loopModule.currentFrame < 10)
        console.log("update frame", loopModule.currentFrame);
  
      diagonalMotion.update(dt);
      
      ray.origin = diagonalMotion.point
  
      // collisionInfo = checkAABBPoint(aabb, sinMotion.point);
    }
  
    function draw() {
      if (loopModule.currentFrame < 10)
        console.log("draw frame", loopModule.currentFrame);
  
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      drawRay(ray);

  
      if (collisionInfo) {
        // drawPoint(sinMotion.point, "yellow");
        drawAABB(aabb, "red");
        drawPoint(collisionInfo.collisionPoint, "green");
      } else {
        // drawPoint(sinMotion.point, "white");
        drawAABB(aabb, "white");
      }
  
      ctx.fillStyle = "white";
      ctx.fillText(
        `point: (${ray.origin.x.toFixed(2)}, ${ray.origin.y.toFixed(2)})`,
        0.5,
        0.5);
      ctx.fillText(`RAY`, 250, 0.5);
    }
  
    loopModule.setUpdate(update);
    loopModule.setDraw(draw);
  
    loopModule.start();
  }