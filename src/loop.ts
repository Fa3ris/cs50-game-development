import { debug, info } from "./log";


/**
 * CALLBACKS
 */
let update: (dt: number) => void;

let draw: () => void;


/**
 * CONSTANTS
 */

/**
 * one step time of an update in seconds
 */
const step = 1 / 60;
const maxAccumulator = 10 * step;
const limitFrame = false;
const maxFrames = 100;


/**
 * VARS
 */
let lastMillis: number;
let accumulator = 0;

let currentFrame = 1;

let requestNextFrame = true;

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
    debug("accumulator", accumulator);
    while (accumulator > step) {
      update(step);
      accumulator -= step;
    }
    debug("draw frame", currentFrame);
    draw();
    currentFrame++;
  } else {
    debug(`skip\nlast time ${lastMillis}\ntime ${time}`);
  }

  lastMillis = time;

  if (currentFrame > maxFrames && limitFrame) requestNextFrame = false;

  info("requestNextFrame", requestNextFrame)
  if (requestNextFrame) requestAnimationFrame(gameLoop);
}

export function setUpdate(callback: (dt: number) => void) {
  update = callback;
}

export function setDraw(callback: () => void) {
  draw = callback;
}

export function stop() {
  requestNextFrame = false;
  lastMillis = 0;
  accumulator = 0;
}

export function resume() {
  requestNextFrame = true;
  gameLoop(performance.now())
}

export function start() {
  gameLoop(performance.now())
}