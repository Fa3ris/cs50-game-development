import { adjustCanvasForDisplay } from "~common/canvas-util";
import { AABB, Ray, SweptAABB_AABBCollision, Vector2D } from "~common/geometry";
import { createLoop } from "~common/loop";
import { createCtx2D } from "./canvas";
import { checkSweptAABB_AABB } from "./collision";
import { drawingFunctions } from "./drawing";
import { linearMotion } from "./motions";

export function sweptAABB_AABB() {
    const W = 640;
    const H = 160;
  
    const ctx = createCtx2D("swept-aabb-aabb");
    adjustCanvasForDisplay(ctx, W, H);
  
    ctx.font = "12px courier";
    ctx.textBaseline = "top";
  
    document.querySelector("#root")?.appendChild(ctx.canvas);
  
    const staticAABB: AABB = new AABB(55, 45, 30, 12);

    const movingAABB: AABB = new AABB(10, 50, 30, 12);
    const direction = new Vector2D(20, -3)

    const futurePosition = new AABB(movingAABB.x + direction.x, movingAABB.y + direction.y, movingAABB.w, movingAABB.h )
  
    let collisionInfo: SweptAABB_AABBCollision | undefined;

    const diagonalMotion = linearMotion(
      new Vector2D(10, 45),
      new Vector2D(35, 95)
    );
  
  
    const drawingModule = drawingFunctions(ctx);
  
    const drawAABB = drawingModule.drawAABB;
    const drawPoint = drawingModule.drawPoint;
    const drawRay = drawingModule.drawRay;
  
    const loopModule = createLoop();
  
    function update(dt: number) {
      if (loopModule.currentFrame < 10)
        console.log("update frame", loopModule.currentFrame);

      diagonalMotion.update(dt)

      movingAABB.setX(diagonalMotion.point.x)
      movingAABB.setY(diagonalMotion.point.y)

      futurePosition.setX(movingAABB.x + direction.x)
      futurePosition.setY(movingAABB.y + direction.y)
  
      collisionInfo = checkSweptAABB_AABB(movingAABB, direction,  staticAABB);

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
  
      const normalRay = new Ray(movingAABB.center, direction)
        drawRay(normalRay, "white")

        ctx.setLineDash([1, 1]);
        drawAABB(futurePosition, "white")
        ctx.setLineDash([]);
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
        `point: (${movingAABB.x.toFixed(2)}, ${movingAABB.y.toFixed(2)})`,
        0.5,
        0.5);
      ctx.fillText(`SWEPT AABB-AABB`, 250, 0.5);
    }
  
    loopModule.setUpdate(update);
    loopModule.setDraw(draw);
  
    loopModule.start();
  }