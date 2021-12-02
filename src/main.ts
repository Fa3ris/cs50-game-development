const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 400;
canvas.height = 800;

const root = document.querySelector("#root");

const debug = false;

root?.appendChild(canvas);

let lastMillis: number;

/**
 * one step time of an update in seconds
 */
const step = 1 / 60;

let accumulator = 0;

const maxAccumulator = 10 * step;

gameLoop();

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
 * @param time
 */
function gameLoop(time: DOMHighResTimeStamp = 0): void {
  // skip first call
  if (lastMillis) {
    const elapsed = (time - lastMillis) / 1000;
    accumulator += elapsed;
    accumulator = Math.min(accumulator, maxAccumulator);
    if (debug) console.debug(accumulator);
    while (accumulator > step) {
      update(step);
      accumulator -= step;
    }
    draw();
  }

  lastMillis = time;
  requestAnimationFrame(gameLoop);
}

function update(dt: number): void {
  if (debug) console.debug(`update dt = ${dt} s`);
}

function draw(): void {
  if (debug) console.debug("draw");
}
