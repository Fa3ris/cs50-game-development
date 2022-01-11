import { adjustCanvasForDisplay } from "~common/canvas-util";
import { AABB, AABB_AABBCollision, Ray, Vector2D } from "~common/geometry";
import { createLoop } from "~common/loop";
import { createCtx2D } from "./canvas";
import { checkAABB_AABB } from "./collision";
import { drawingFunctions } from "./drawing";
import { linearMotion } from "./motions";

export function AABB_AABB() {
    const W = 640;
    const H = 160;
  
    const ctx = createCtx2D("aabb-aabb");
    adjustCanvasForDisplay(ctx, W, H);
  
    ctx.font = "12px courier";
    ctx.textBaseline = "top";
  
    document.querySelector("#root")?.appendChild(ctx.canvas);
  
    const horizontalMotion = linearMotion(
      new Vector2D(20, 40),
      new Vector2D(95, 40)
    );
  
    const staticAABB: AABB = new AABB(55, 45, 30, 12);
    const movingAABB: AABB = new AABB(75, 50, 30, 12);
  
    let collisionInfo: AABB_AABBCollision | undefined;
  
    const drawingModule = drawingFunctions(ctx);
  
    const drawAABB = drawingModule.drawAABB;
    const drawPoint = drawingModule.drawPoint;
    const drawRay = drawingModule.drawRay;
  
    const loopModule = createLoop();
  
    function update(dt: number) {
      if (loopModule.currentFrame < 10)
        console.log("update frame", loopModule.currentFrame);

      horizontalMotion.update(dt)

      movingAABB.setX(horizontalMotion.point.x)
      movingAABB.setY(horizontalMotion.point.y)
  
      collisionInfo = checkAABB_AABB(movingAABB, staticAABB);

      if (collisionInfo) {
        if (loopModule.currentFrame < 10) {
          console.log(collisionInfo)
        }
      }
    }
  
    function draw() {
      if (loopModule.currentFrame < 10)
        console.log("draw frame", loopModule.currentFrame);
  
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
  
      if (collisionInfo) {
        drawAABB(staticAABB, "red");
        drawAABB(movingAABB, "yellow");
        const resolvedAABB = new AABB(
          collisionInfo.resolvedColliderPosition.x, collisionInfo.resolvedColliderPosition.y,
           movingAABB.w, movingAABB.h)

        const startRay = new Vector2D(staticAABB.center.x + staticAABB.halfW * collisionInfo.normal.x,
        staticAABB.center.y + staticAABB.halfH * collisionInfo.normal.y)
        
        const normalRay = new Ray(startRay, new Vector2D(collisionInfo.normal.x * 10, collisionInfo.normal.y * 10) )
        drawRay(normalRay, "white")
        drawAABB(resolvedAABB, "orange")
      } else {
        drawAABB(staticAABB, "white");
        drawAABB(movingAABB, "green");
      }
  
      ctx.fillStyle = "white";
      ctx.fillText(
        `point: (${horizontalMotion.point.x.toFixed(2)}, ${horizontalMotion.point.y.toFixed(2)})`,
        0.5,
        0.5);
      ctx.fillText(`AABB-AABB`, 250, 0.5);
    }
  
    loopModule.setUpdate(update);
    loopModule.setDraw(draw);
  
    loopModule.start();
  }