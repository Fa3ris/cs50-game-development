import { adjustCanvasForDisplay } from "~common/canvas-util";
import { AABB, AABBPointCollision, Vector2D } from "~common/geometry";
import { createLoop } from "~common/loop";
import { createCtx2D } from "./canvas";
import { checkAABBPoint } from "./collision";
import { drawingFunctions } from "./drawing";
import { linearMotion } from "./motions";

export function pointCollisionVertical() {
    const W = 640;
    const H = 160;
    const ctx = createCtx2D("point-collision-vertical");
  
    adjustCanvasForDisplay(ctx, W, H);
  
    ctx.font = "12px courier";
    ctx.textBaseline = "top";
  
    document.querySelector("#root")?.appendChild(ctx.canvas);
  
    let collisionInfo: AABBPointCollision | undefined;
  
    const aabb: AABB = new AABB(55, 45, 30, 12);
  
    const verticalMotion = linearMotion(
      new Vector2D(75, 35),
      new Vector2D(75, 65)
    );
  
    const drawingModule = drawingFunctions(ctx);
  
    const drawAABB = drawingModule.drawAABB;
    const drawPoint = drawingModule.drawPoint;
  
    const loopModule = createLoop();
  
    function update(dt: number) {
      if (loopModule.currentFrame < 10)
        console.log("update frame", loopModule.currentFrame);
  
  
      verticalMotion.update(dt);
  
  
      const collide = checkAABBPoint(aabb, verticalMotion.point);
  
      collisionInfo = collide;
    }
  
    function draw() {
      if (loopModule.currentFrame < 10)
        console.log("draw frame", loopModule.currentFrame);
  
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
  
  
      if (collisionInfo) {
        drawPoint(collisionInfo.resolvedPoint, "green");
        drawPoint(verticalMotion.point, "yellow");
        drawAABB(aabb, "red");
      } else {
        drawPoint(verticalMotion.point, "white");
        drawAABB(aabb, "white");
      }
  
      ctx.fillStyle = "white";
      ctx.fillText(
        `point: (${verticalMotion.point.x.toFixed(2)}, ${verticalMotion.point.y.toFixed(2)})`,
        0.5,
        0.5
      );
      ctx.fillText(`VERTICAL`, 250, 0.5);
    }
  
    loopModule.setUpdate(update);
    loopModule.setDraw(draw);
  
    loopModule.start();
  }
  