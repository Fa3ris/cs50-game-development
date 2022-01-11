import { adjustCanvasForDisplay } from "~common/canvas-util";
import { AABB, AABB_AABBCollision, Vector2D } from "~common/geometry";
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
      new Vector2D(45, 50),
      new Vector2D(95, 50)
    );
  
    const staticAABB: AABB = new AABB(55, 45, 30, 12);
    const movingAABB: AABB = new AABB(75, 50, 30, 12);
  
    let collisionInfo: AABB_AABBCollision | undefined;
  
    const drawingModule = drawingFunctions(ctx);
  
    const drawAABB = drawingModule.drawAABB;
    const drawPoint = drawingModule.drawPoint;
  
    const loopModule = createLoop();
  
    function update(dt: number) {
      if (loopModule.currentFrame < 10)
        console.log("update frame", loopModule.currentFrame);
  
      horizontalMotion.update(dt)

      movingAABB.setX(horizontalMotion.point.x)
      movingAABB.setY(horizontalMotion.point.y)
  
      collisionInfo = checkAABB_AABB(staticAABB, movingAABB);
    }
  
    function draw() {
      if (loopModule.currentFrame < 10)
        console.log("draw frame", loopModule.currentFrame);
  
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
  
      if (collisionInfo) {
        drawAABB(staticAABB, "red");
        drawAABB(movingAABB, "yellow");
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