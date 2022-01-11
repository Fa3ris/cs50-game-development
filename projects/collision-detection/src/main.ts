import { adjustCanvasForDisplay } from "~common/canvas-util";
import { AABB, Point2D, AABBPointCollision, Vector2D, Ray } from "~common/geometry";
import { createLoop } from "~common/loop";
import { AABB_AABB } from "./aabb-aabb";
import { createCtx2D } from "./canvas";
import { checkAABBPoint } from "./collision";
import { drawingFunctions, POINT_RADIUS } from "./drawing";
import { linearMotion, sinusoidalMotion } from "./motions";
import { pointCollisionHorizontal } from "./point-aabb-horizontal";
import { pointCollisionVertical } from "./point-aabb-vertical";
import { pointCollisionWave } from "./point-aabb-wave";
import { rayAABB } from "./ray-aabb";
import { sweptAABB_AABB } from "./swept-aabb-aabb";

// TODO
// calculate normal vectors of segment - 2 possible directions
// If we define dx = x2 - x1 and dy = y2 - y1, then the normals are (-dy, dx) and (dy, -dx)
// https://stackoverflow.com/questions/1243614/how-do-i-calculate-the-normal-vector-of-a-line-segment


// RUN EXAMPLES
sweptAABB_AABB()
AABB_AABB()
rayAABB()
pointCollisionVertical()
pointCollisionHorizontal()
pointCollisionWave();
generalExample();

function generalExample() {
  const W = 640;
  const H = 160;
  const ctx = createCtx2D("point-collision");

  adjustCanvasForDisplay(ctx, W, H);

  ctx.font = "12px courier";
  ctx.textBaseline = "top";

  document.querySelector("#root")?.appendChild(ctx.canvas);

  const startPoint: Point2D = new Vector2D(50, 50);
  const sinMotion = sinusoidalMotion(startPoint);
  let collisionInfo: AABBPointCollision | undefined;

  const aabb: AABB = new AABB(55, 45, 30, 12);

  const ray = new Ray(new Vector2D(10, 10), new Vector2D(50, 50));

  const horizontalMotion = linearMotion(
    new Vector2D(45, 50),
    new Vector2D(95, 50)
  );
  const verticalMotion = linearMotion(
    new Vector2D(75, 35),
    new Vector2D(75, 65)
  );

  const drawingModule = drawingFunctions(ctx);

  const drawAABB = drawingModule.drawAABB;
  const drawPoint = drawingModule.drawPoint;
  const drawRay = drawingModule.drawRay;

  const loopModule = createLoop();

  function update(dt: number) {
    if (loopModule.currentFrame < 10)
      console.log("update frame", loopModule.currentFrame);

    if (false && collisionInfo && sinMotion.point.y < 45 + 7) {
      return;
    }

    horizontalMotion.update(dt);
    verticalMotion.update(dt);

    sinMotion.update(dt);

    const collide = checkAABBPoint(aabb, sinMotion.point);

    collisionInfo = collide;
  }

  function draw() {
    if (loopModule.currentFrame < 10)
      console.log("draw frame", loopModule.currentFrame);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    drawRay(ray);

    if (collisionInfo) {
      drawPoint(collisionInfo.resolvedPoint, "green");
      drawPoint(sinMotion.point, "yellow");
      drawAABB(aabb, "red");
    } else {
      drawPoint(sinMotion.point, "white");
      drawAABB(aabb, "white");
    }

    drawPoint(horizontalMotion.point, "blue");
    drawPoint(verticalMotion.point, "pink");

    ctx.fillStyle = "white";
    ctx.fillText(
      `point: (${sinMotion.point.x.toFixed(2)}, ${sinMotion.point.y.toFixed(2)})`,
      0.5,
      0.5
    );
    ctx.fillText(`GENERIC`, 250, 0.5);
  }

  loopModule.setUpdate(update);
  loopModule.setDraw(draw);

  loopModule.start();
}