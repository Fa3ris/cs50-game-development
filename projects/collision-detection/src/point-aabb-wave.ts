import { adjustCanvasForDisplay } from "~common/canvas-util";
import { Point2D, Vector2D, AABB, AABBPointCollision } from "~common/geometry";
import { createLoop } from "~common/loop";
import { createCtx2D } from "./canvas";
import { checkAABBPoint } from "./collision";
import { drawingFunctions } from "./drawing";
import { sinusoidalMotion } from "./motions";

export function pointCollisionWave() {
    const W = 640;
    const H = 160;
  
    const ctx = createCtx2D("point-collision-wavy");
    adjustCanvasForDisplay(ctx, W, H);
  
    ctx.font = "12px courier";
    ctx.textBaseline = "top";
  
    document.querySelector("#root")?.appendChild(ctx.canvas);
  
    const startPoint: Point2D = new Vector2D(50, 50);
    const sinMotion = sinusoidalMotion(startPoint);
  
    const aabb: AABB = new AABB(55, 45, 30, 12);
  
    let collisionInfo: AABBPointCollision | undefined;
  
    const drawingModule = drawingFunctions(ctx);
  
    const drawAABB = drawingModule.drawAABB;
    const drawPoint = drawingModule.drawPoint;
  
    const loopModule = createLoop();
  
    function update(dt: number) {
      if (loopModule.currentFrame < 10)
        console.log("update frame", loopModule.currentFrame);
  
      if (false && collisionInfo && sinMotion.point.y < 45 + 7) {
        return;
      }
  
      if (false && collisionInfo) {
        return;
      }
  
      sinMotion.update(dt);
  
      if (false) {
        sinMotion.point.x = aabb.center.x
        sinMotion.point.y = aabb.center.y - 1
      }
  
      collisionInfo = checkAABBPoint(aabb, sinMotion.point);
    }
  
    function draw() {
      if (loopModule.currentFrame < 10)
        console.log("draw frame", loopModule.currentFrame);
  
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
  
      if (collisionInfo) {
        drawPoint(sinMotion.point, "yellow");
        drawAABB(aabb, "red");
        drawPoint(collisionInfo.collisionPoint, "green");
      } else {
        drawPoint(sinMotion.point, "white");
        drawAABB(aabb, "white");
      }
  
      ctx.fillStyle = "white";
      ctx.fillText(
        `point: (${sinMotion.point.x.toFixed(2)}, ${sinMotion.point.y.toFixed(2)})`,
        0.5,
        0.5);
      ctx.fillText(`WAVY`, 250, 0.5);
    }
  
    loopModule.setUpdate(update);
    loopModule.setDraw(draw);
  
    loopModule.start();
  }