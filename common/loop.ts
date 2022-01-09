import { debug, info } from "./log";

/**
 * CALLBACKS
 */
let update: (dt: number) => void = () => {}
export function setUpdate(callback: (dt: number) => void) {
  update = callback;
}

let draw: () => void = () => {}
export function setDraw(callback: () => void) {
  draw = callback;
}

let processInput: () => void = () => {}
export function setProcessInput(callback: () => void) {
  processInput = callback;
}


/**
 * CONSTANTS
 */

/**
 * one step time of an update in seconds
 */
export const step = 1 / 60;
const maxAccumulator = 10 * step;
const limitFrame = false;
const maxFrames = 100;


/**
 * VARS
 */
let lastMillis: number;
let accumulator = 0;
export let currentFrame = 1;
let requestNextFrame: boolean;

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
      processInput();
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

  debug('next frame', requestNextFrame)
  if (requestNextFrame) requestAnimationFrame(gameLoop);
}

export function start() {
  requestNextFrame = true;
  gameLoop(performance.now())
}

// modular version - used to run multiple loops
export function createLoop() {


  /**
 * CALLBACKS
 */
let update: (dt: number) => void = () => {}
function setUpdate(callback: (dt: number) => void) {
  update = callback;
}

let draw: () => void = () => {}
function setDraw(callback: () => void) {
  draw = callback;
}

let processInput: () => void = () => {}
function setProcessInput(callback: () => void) {
  processInput = callback;
}



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
 let requestNextFrame: boolean;
 
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
       processInput();
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
 
   debug('next frame', requestNextFrame)
   if (requestNextFrame) requestAnimationFrame(gameLoop);
 }
 
 function start() {
   requestNextFrame = true;
   gameLoop(performance.now())
 }


 return {
   start,
   setDraw,
   setUpdate,
   setProcessInput,
   get currentFrame() {
     return currentFrame
   },
   step
 }

}