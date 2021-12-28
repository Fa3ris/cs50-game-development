import { Ball } from "./ball";
import config from "./config";
import { Pad } from "./pad";
import { Ball as BallType, Pad as PadType, Position, Side } from "./types";
import ctx from "./canvas";
import { debug, info } from "./log";
import { canvasDim } from "./canvas";
import { collideBorders, collisionAABBV2 } from "./collision";
import { stop, resume } from "./loop";

const { W, H } = config;

const black = "#000";
const white = "#fff";

const ball = createBall();
const pad1 = createPad1();
const pad2 = createPad2();

const v0 = 70;
const acc = 1.75;
const maxVx = 3 * v0,
  maxVy = 3 * v0;

let stopOnCollision = false;

const audio = new Audio("pong_sounds_paddle_hit.wav");

export function mouseMove(event: MouseEvent) {
  pad1.pos.y = event.offsetY;
}

export function keyPressed(event: KeyboardEvent) {
  if (event.key === " ") {
    stopOnCollision = false;
    resume();
  }
}

export function update(dt: number): void {
  updateBall(dt);

  const ballCollision = collideBorders(ball.pos);

  switch (ballCollision) {
    case Side.TOP:
      ball.pos.y = 0;
      ball.vel.y *= -acc;
      break;
    case Side.BOTTOM:
      ball.pos.y = H - ball.pos.h;
      ball.vel.y *= -acc;
      break;
    case Side.RIGHT:
      ball.pos.x = W - ball.pos.w;
      ball.vel.x *= -acc;
      break;
    case Side.LEFT:
      ball.pos.x = 0;
      ball.vel.x *= -acc;
      break;
  }

  const ballPad1Collision = collisionAABBV2(ball.pos, pad1.pos);

  const ballPad2Collision = collisionAABBV2(ball.pos, pad2.pos);

  if (ballPad1Collision || ballPad2Collision) {
    audio.play();
    ball.vel.x *= -acc;
    info("%cpad collision", "color:red; font-size: 20px", ball);
    stopOnCollision = true;
  }
  if (ballPad1Collision) {
    ball.pos.x = pad1.pos.x + pad1.pos.w - 1;
  }

  if (ballPad2Collision) {
    ball.pos.x = pad2.pos.x - ball.pos.w + 1;
  }

  ball.vel.x = Math.min(ball.vel.x, maxVx);
  ball.vel.y = Math.min(ball.vel.y, maxVy);

  pad2.pos.y = ball.pos.y;

  if (stopOnCollision) {
    debug("collision borders", ballCollision);
    stop();
  }
}

function updateBall(dt: number) {
  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
}

export function draw(): void {
  resetCanvas(ctx);
  drawBall(ctx, ball);
  drawPad(ctx, pad1);
  drawPad(ctx, pad2);
  drawHelloPong();
}

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

function drawHelloPong() {
  ctx.save();
  const textSize = 40;
  ctx.font = `${textSize}px VT323`;
  ctx.fillStyle = white;
  const hello = "Hello, Pong!";
  ctx.textAlign = "center";
  ctx.fillText(hello, W / 2, 50);
  ctx.fillText("" + 0, W / 2 - 80, H / 2);
  ctx.fillText("" + 213, W / 2 + 80, H / 2);
  ctx.restore();
}

/**
 * UTILS
 * @param ctx
 * @param pos
 */
function drawRect(ctx: CanvasRenderingContext2D, pos: Position) {
  ctx.fillRect(pos.x, pos.y, pos.w, pos.h);
}

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
