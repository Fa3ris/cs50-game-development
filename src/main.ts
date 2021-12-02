const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 600;
canvas.height = 400;

const ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d"
) as CanvasRenderingContext2D;

if (!ctx) {
  throw new Error("cannot get 2d rendeting context");
}

const black = "#000";
const white = "#fff";

ctx.fillStyle = black;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const root = document.querySelector("#root");

let debug = true;

root?.appendChild(canvas);

let lastMillis: number;

/**
 * one step time of an update in seconds
 */
const step = 1 / 60;

debugMsg("step", step)

let accumulator = 0;

const maxAccumulator = 10 * step;

const maxFrames = 10;
let currentFrame = 1;

let requestNextFrame = true;

type Ball = {
  pos: Position;
};

const ball: Ball = {
  pos: {
    x: 10,
    y: 20,
    w: 10,
    h: 10,
  },
};
gameLoop(performance.now());

/**
 * objective: call update with fixed step time for accurate simulation
 * accumulate sort of 'time debt' to simulate
 *
 * when finished simulating we draw once
 *
 * avoid big step times for example when user change tab
 *
 *
 * idea: cap the accumulator ?
 * maxAccValue = 10 * steps
 * acc = Min(acc, maxAccvalue)
 *
 * @param time current time relative to time origin
 * time origin = beginning of the current document's
 */
function gameLoop(time: DOMHighResTimeStamp): void {
  // skip first loops to let time accumulate for one frame
  if (lastMillis) {
    const elapsed = (time - lastMillis) / 1000;
    accumulator += elapsed;
    accumulator = Math.min(accumulator, maxAccumulator);
    debugMsg("accumulator", accumulator);
    while (accumulator > step) {
      update(step);
      accumulator -= step;
    }
    draw();
    currentFrame++;
  } else {
    debugMsg(`skip\nlast time ${lastMillis}\ntime ${time}`);
  }

  lastMillis = time;

  if (currentFrame > maxFrames) requestNextFrame = false;

  if (requestNextFrame) requestAnimationFrame(gameLoop);
}

function update(dt: number): void {
  debugMsg(`update dt = ${dt} s`);
}

function draw(): void {
  debugMsg("draw frame", currentFrame);
  
  drawBall(ctx, ball);
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

type Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function debugMsg(...params: any[]) {
  if (debug) console.debug(...params);
}
