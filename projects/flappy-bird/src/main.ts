import {
  setDraw,
  setUpdate,
  start,
  setProcessInput,
  currentFrame,
} from "~/common/loop";
import { info } from "~/common/log";
import { adjustCanvasForDisplay } from "~common/canvas-util";

/* CANVAS */
const W = 512;
const H = 288;

/* BACKGROUND */
let bgScroll = 0;
const bgScrollSpeed = 10;
const bgScaling = 1.66;
const bgBaseLoopingPoint = 568;
const bgLoopingPoint = bgBaseLoopingPoint * bgScaling;

/* GROUND */
let groundScroll = 500;
const groundScrollSpeed = 30;

let groundLoopingPoint: number

let canvas = document.querySelector("canvas");
if (!canvas) {
  canvas = document.createElement("canvas");
}

const ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d"
) as CanvasRenderingContext2D;

adjustCanvasForDisplay(ctx, W, H);

document.querySelector("#root")?.appendChild(canvas);

const frameCount = document.querySelector("#frame-count") as Element;

const images: { [index: string]: HTMLImageElement } = {};

main();

async function main() {
  images["background"] = await loadImage("background.png");
  images["ground"] = await loadImage("ground.png");

  groundLoopingPoint = (images["ground"].width / 2);

  setDraw(draw);
  setUpdate(update);
  setProcessInput(processInput);

  start();
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function draw() {
  frameCount.innerHTML = currentFrame.toString();

/*
parallax effect
ground (at the foreground) moves faster than the background
*/

  // draw background image upsaled by a factor of bgScaling to the canvas
  ctx.drawImage(
    images["background"],
    0, 0, images["background"].width, images["background"].height,
    -bgScroll, 0, bgScaling * images["background"].width, H);

  // draw ground image as-is
  ctx.drawImage(
    images["ground"],
    -groundScroll, H - images["ground"].height, images["ground"].width, images["ground"].height
  );
}

function update(dt: number) {

  // loop background and ground images when reach the looping point
  bgScroll = (bgScroll + bgScrollSpeed * dt) % bgLoopingPoint;

  groundScroll = (groundScroll + groundScrollSpeed * dt) % groundLoopingPoint;
  console.debug(bgLoopingPoint);
  console.debug(groundLoopingPoint);
  console.debug("bgscroll", -bgScroll, "groundscroll", groundScroll);
}

function processInput() {}
