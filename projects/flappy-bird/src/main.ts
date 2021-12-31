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

const groundLoopingPoint = W


// maybe remove
type Vector2D = {
    x: number;
    y: number;
}

// maybe remove
type Bird = {
    pos: Vector2D;
    vel: Vector2D;
    accel: Vector2D;
}

/* BIRD */
const bird = {
    yPos: H/2,
    yVel: 0,
    yAccel: 0,
}


let canvas = document.querySelector("canvas");
if (!canvas) {
  canvas = document.createElement("canvas");
}

const ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d"
) as CanvasRenderingContext2D;

adjustCanvasForDisplay(ctx, W, H);

document.querySelector("#root")?.appendChild(canvas);

const keys: {[index: string]: boolean } = {}


document.addEventListener("keydown", function(e) {
    if (e.key === " ") {
        console.debug("space pressed")
    }

    if (keys[e.key] == undefined) {
        keys[e.key] = false
    }
})

document.addEventListener("keyup", function(e) {
    delete keys[e.key]
})



const frameCount = document.querySelector("#frame-count") as Element;
const yPosStat = document.querySelector("#yPos") as Element;
const yVelStat = document.querySelector("#yVel") as Element;
const yAccelStat = document.querySelector("#yAccel") as Element;

const images: { [index: string]: HTMLImageElement } = {};

main();

async function main() {
  images["background"] = await loadImage("background.png");
  images["ground"] = await loadImage("ground.png");
  images["bird"] = await loadImage("bird.png");


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

    ctx.clearRect(0, 0, W, H)
  frameCount.innerHTML = currentFrame.toString();

  yVelStat.innerHTML = bird.yVel.toString()
  yPosStat.innerHTML = bird.yPos.toString()

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

  // draw bird
  ctx.drawImage(
      images["bird"], W/2 - 70, bird.yPos
  )
}

// Adjust values
const G = 100

const maxUpSpeed = -50

const impulse = -5000

function update(dt: number) {

  bird.yAccel += G

  yAccelStat.innerHTML = bird.yAccel.toString()

  bird.yVel += bird.yAccel * dt

  bird.yVel = Math.max(bird.yVel, maxUpSpeed)
  bird.yPos += bird.yVel * dt
  bird.yAccel = 0

  // loop background and ground images when reach the looping point
  bgScroll = (bgScroll + bgScrollSpeed * dt) % bgLoopingPoint;

  groundScroll = (groundScroll + groundScrollSpeed * dt) % groundLoopingPoint;
  console.debug(bgLoopingPoint);
  console.debug(groundLoopingPoint);
  console.debug("bgscroll", -bgScroll, "groundscroll", groundScroll);
}

function processInput() {
    if (keys[" "] != undefined && keys[" "] == false) {
        keys[" "] = true
        console.debug("jump")
        bird.yAccel += impulse
    }

}
