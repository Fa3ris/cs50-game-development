const audio = new Audio("pong_sounds_paddle_hit.wav")

import config from "./config"; 
import ctx from "./canvas";

import { resume, setDraw, setUpdate, start, stop} from "./loop";
import { info } from "./log";


const {W, H} = config;

let debug = true;

const black = "#000";
const white = "#fff";


setDraw(draw)
setUpdate(update);
start();


const canvasDim: Position = {
  x: 0,
  y: 0,
  w: W,
  h: H,
};

const root = document.querySelector("#root");

const canvas = ctx.canvas;
root?.appendChild(canvas);


type Ball = {
  pos: Position;
  vel: Vector;
};

const angleOffset = Math.random() > 0.5 ? 0 : Math.PI;
const angle = angleOffset + (Math.random() * Math.PI) / 3;
const v0 = 70;
const vx0 = v0 * Math.cos(angle);
const vy0 = v0 * Math.sin(angle);

const ballSide = 10;
const x0 = W / 2 - ballSide / 2;
const y0 = H / 2 - ballSide / 2;
const ball: Ball = {
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
const borderOffset = 20;
const padW = 10;
const padH = 50;
const padStartY = H / 2 - 50 / 2;

const pad1: Pad = {
  pos: {
    x: borderOffset,
    y: padStartY,
    w: padW,
    h: padH,
  },
};

const pad2: Pad = {
  pos: {
    x: W - padW - borderOffset,
    y: padStartY,
    w: padW,
    h: padH,
  },
};


canvas.addEventListener("mousemove", (event) => {
  pad1.pos.y = event.offsetY;
});

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    stopOnCollision = false;
    resume()
  }
});


const acc = 1.75;
const maxVx = 3 * v0,
  maxVy = 3 * v0;
function update(dt: number): void {
  debugMsg(`update dt = ${dt} s`);
  updateBall(dt);
  const ballCollision = collideBorders(ball.pos);

  switch (ballCollision) {
    case Side.TOP:
      ball.pos.y = 0;
      ball.vel.y *= -acc;
      break;
    case Side.BOTTOM:
      ball.pos.y = H - ballSide;
      ball.vel.y *= -acc;
      break;
    case Side.RIGHT:
      ball.pos.x = W - ballSide;
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
    console.log("%cpad1 collision", "color:red; font-size: 20px", ball);
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
    debugMsg("collision borders", ballCollision);
    stop();
  }
}

let stopOnCollision = false;

function updateBall(dt: number) {
  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
}

/**
 * Si la box2 est
 *  complètement à gauche,
 *  ou complètement en haut,
 *  ou complètement à droite,
 *  ou complètement en bas,
 *  alors elle ne touche pas. Sinon, elle touche.
 * 
 * 
 * Remarque intéressante
 * dessiner un rectangle à la position (x, y) de dimension (w, h)
 * 
 * c'est dessiner un rectangle qui s'étend
 * de x à (x + w - 1),
 * puisque le premier pixel à la position x compte dans la largeur total w à dessiner
 * 
 * de même le rectangle s'étend
 * de y à (y + h - 1)
 * pour dessiner une hauteur h en prenant en compte le premier pixel situé en y
 * 
 */
function collisionAABB(box1: Position, box2: Position) {
  if (
    box2.x >= box1.x + box1.w || // trop à droite
    box2.x + box2.w <= box1.x || // trop à gauche
    box2.y >= box1.y + box1.h || // trop en bas
    box2.y + box2.h <= box1.y // trop en haut
  )
    return false;
  else return true; // collision
}


/**
 * ceci est la négation de la fonction du dessus
 * l'ordre des boîtes n'a pas d'importance,
 * si l'une touche l'autre, alors l'autre touche l'une
 * @param box1 
 * @param box2 
 * @returns 
 */
function collisionAABBV2(box1: Position, box2: Position) {
  if (
    box1.x < box2.x + box2.w &&
    box1.x + box1.w > box2.x &&
    box1.y < box2.y + box2.h &&
    box1.h + box1.y > box2.y
  ) {
    // no gap between boxes
    // collision detected!
    return true;
  } else {
    // no collision
    return false;
  }
}

function collideBorders(pos: Position): Side | null {
  if (pos.x < canvasDim.x) {
    return Side.LEFT;
  }
  if (pos.x + pos.w > canvasDim.x + canvasDim.w) {
    return Side.RIGHT;
  }

  if (pos.y < canvasDim.y) {
    return Side.TOP;
  }

  if (pos.y + pos.h > canvasDim.y + canvasDim.h) {
    return Side.BOTTOM;
  }

  return null;
}

enum Side {
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}

function draw(): void {

  resetCanvas(ctx);

  drawBall(ctx, ball);
  drawPad(ctx, pad1);
  drawPad(ctx, pad2);

ctx.save()

const textSize = 40
ctx.font = `${textSize}px VT323`;
ctx.fillStyle = white;
const hello = "Hello, Pong!"
ctx.textAlign = "center"
ctx.fillText(hello, W / 2, 50);


ctx.fillText("" + 0, W/2 - 80, H / 2);
ctx.fillText("" + 213, W/2 + 80, H / 2);
ctx.restore()
}

function resetCanvas(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = black;
  drawRect(ctx, canvasDim);
  ctx.restore();
}

function drawRect(ctx: CanvasRenderingContext2D, pos: Position) {
  ctx.fillRect(pos.x, pos.y, pos.w, pos.h);
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  debugMsg("ball", ball);
  ctx.save();
  ctx.fillStyle = white;
  drawRect(ctx, ball.pos);
  ctx.restore();
}

function drawPad(ctx: CanvasRenderingContext2D, pad: Pad) {
  debugMsg("pad", pad);
  ctx.save();
  ctx.fillStyle = white;
  drawRect(ctx, pad.pos);
  ctx.restore();
}

type Pad = {
  pos: Position;
};
type Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Vector = {
  x: number;
  y: number;
};
function debugMsg(...params: any[]) {
  if (debug) console.debug(...params);
}
