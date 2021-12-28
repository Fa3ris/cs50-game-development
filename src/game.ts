import { Ball } from "./ball";
import ctx, { canvasDim } from "./canvas";
import { collideBorders, collisionAABBV2 } from "./collision";
import { canvasConfig, debugConfig } from "./config";
import { debug } from "./log";
import { resume, stop } from "./loop";
import { Pad } from "./pad";
import { Ball as BallType, Pad as PadType, Position, Side } from "./types";

const { W, H } = canvasConfig;

const black = "#000";
const white = "#fff";

const ball = createBall();
const pad1 = createPad1();
const pad2 = createPad2();

const audio = new Audio("pong_sounds_paddle_hit.wav");

export function mouseMove(event: MouseEvent) {
  pad1.pos.y = event.offsetY;
}

export function keyPressed(event: KeyboardEvent) {
  if (event.key === " ") {
    resume();
  }
}

export function update(dt: number): void {
  ball.update(dt);

  // player pad responds to mouse event

  // AI pad follows ball strictly
  pad2.pos.y = ball.pos.y;

  const borderCollision = collideBorders(ball.pos);

  if (borderCollision != null) {
    debug("collision border", borderCollision);
    updateAfterBorderCollision(borderCollision);
  }

  const ballPad1Collision = collisionAABBV2(ball.pos, pad1.pos);

  const ballPad2Collision = collisionAABBV2(ball.pos, pad2.pos);

  const padCollision = ballPad1Collision || ballPad2Collision;

  if (padCollision) {
    audio.play();
    debug("%cpad collision", "color:red; font-size: 20px", ball);
  }

  if (ballPad1Collision) {
    updateAfterPad1Collision();
  }

  if (ballPad2Collision) {
    updateAfterPad2Collision();
  }

  ball.adjustVelocity();

  if (padCollision && debugConfig.stopOnCollision) {
    stop();
  }
}

/**
 * UPDATE AFTER COLLISION
 */

function updateAfterPad1Collision() {
  ball.vel.x *= -Ball.acc;
  ball.pos.x = pad1.pos.x + pad1.pos.w - 1;
}

function updateAfterPad2Collision() {
  ball.vel.x *= -Ball.acc;
  ball.pos.x = pad2.pos.x - ball.pos.w + 1;
}

function updateAfterBorderCollision(ballCollision: Side) {
  switch (ballCollision) {
    case Side.TOP:
      ball.pos.y = 0;
      ball.vel.y *= -Ball.acc;
      break;
    case Side.BOTTOM:
      ball.pos.y = H - ball.pos.h;
      ball.vel.y *= -Ball.acc;
      break;
    case Side.RIGHT:
      ball.pos.x = W - ball.pos.w;
      ball.vel.x *= -Ball.acc;
      break;
    case Side.LEFT:
      ball.pos.x = 0;
      ball.vel.x *= -Ball.acc;
      break;
  }
}

export function draw(): void {
  resetCanvas(ctx);
  drawBall(ctx, ball);
  drawPad(ctx, pad1);
  drawPad(ctx, pad2);
  drawHelloPongAndScore();
}

/**
 * DRAW FUNCTIONS
 *
 */

function resetCanvas(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = black;
  drawRect(ctx, canvasDim);
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  debug("ball", ball);
  ctx.save();
  ctx.fillStyle = white;
  drawRect(ctx, ball.pos);
  ctx.restore();
}

function drawPad(ctx: CanvasRenderingContext2D, pad: Pad) {
  debug("pad", pad);
  ctx.save();
  ctx.fillStyle = white;
  drawRect(ctx, pad.pos);
  ctx.restore();
}

function drawHelloPongAndScore() {
  ctx.save();
  const textSize = 40;
  ctx.font = `${textSize}px VT323`;
  ctx.fillStyle = white;
  const hello = "Hello, Pong!";
  ctx.textAlign = "center";
  ctx.fillText(hello, W / 2, 50);
  drawScore();
  ctx.restore();
}

function drawScore() {
  ctx.fillText("" + 0, W / 2 - 80, H / 2);
  ctx.fillText("" + 214, W / 2 + 80, H / 2);
}

function drawRect(ctx: CanvasRenderingContext2D, pos: Position) {
  ctx.fillRect(pos.x, pos.y, pos.w, pos.h);
}

/**
 * FACTORIES
 *
 */

function createBall(): Ball {
  const angleOffset = Math.random() > 0.5 ? 0 : Math.PI;
  const angle = angleOffset + (Math.random() * Math.PI) / 3;
  const v0 = 70;
  const vx0 = v0 * Math.cos(angle);
  const vy0 = v0 * Math.sin(angle);

  const ballSide = 10;
  const x0 = W / 2 - ballSide / 2;
  const y0 = H / 2 - ballSide / 2;

  const ballInit: BallType = {
    pos: {
      x: x0,
      y: y0,
      w: ballSide,
      h: ballSide,
    },
    vel: {
      x: vx0,
      y: vy0,
    },
  };

  return new Ball(ballInit);
}

function createPad1() {
  const borderOffset = 20;
  const padW = 10;
  const padH = 50;
  const padStartY = H / 2 - 50 / 2;
  const pad1Init: PadType = {
    pos: {
      x: borderOffset,
      y: padStartY,
      w: padW,
      h: padH,
    },
  };
  return new Pad(pad1Init);
}

function createPad2() {
  const borderOffset = 20;
  const padW = 10;
  const padH = 50;
  const padStartY = H / 2 - 50 / 2;
  const pad2Init: PadType = {
    pos: {
      x: W - padW - borderOffset,
      y: padStartY,
      w: padW,
      h: padH,
    },
  };
  return new Pad(pad2Init);
}
