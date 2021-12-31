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

// specific to image
const bgBaseLoopingPoint = 568;
const bgLoopingPoint = bgBaseLoopingPoint * bgScaling;

/* GROUND */
let groundScroll = 500;
const groundScrollSpeed = 30;

const groundLoopingPoint = W


// calculated from image
const pipeCenterX = 35
const pipeCenterY = 215


/* BIRD */
const bird = {
    xPos :W/2 - 70, 
    yPos: H/2,
    dy: 0,
    jump: false
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
const dyStat = document.querySelector("#dy") as Element;

const images: { [index: string]: HTMLImageElement } = {};

main();

async function main() {
  images["background"] = await loadImage("background.png");
  images["ground"] = await loadImage("ground.png");
  images["bird"] = await loadImage("bird.png");
  images["pipe"] = await loadImage("pipe.png");


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

const gapH = 100;

const gapStart = 50

type PipePair = {
    x: number,
    gapStart: number
}

function draw() {

    ctx.clearRect(0, 0, W, H)
  frameCount.innerHTML = currentFrame.toString();

  dyStat.innerHTML = bird.dy.toString()
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


    // UPPER PIPE
    const targetY = -images["pipe"].height + gapStart
    ctx.save()
    ctx.translate(targetX + pipeCenterX, targetY + pipeCenterY) // translate to center of pipe image where it will be drawn
    ctx.rotate(Math.PI)
    ctx.drawImage(images["pipe"], - pipeCenterX, - pipeCenterY) // draw image from negative value, because it is relative to center of the pipe image
    ctx.restore()

    // LOWER PIPE
    ctx.drawImage(
        images["pipe"], targetX, gapStart + gapH, 
    )

  // draw ground image as-is
  ctx.drawImage(
    images["ground"],
    -groundScroll, H - images["ground"].height, images["ground"].width, images["ground"].height
  );

  // draw bird
  ctx.drawImage(
      images["bird"], bird.xPos, bird.yPos
  )

  // draw hitbox
  if (collideLow || collideUpper) {
    
    ctx.save()
    ctx.strokeStyle = collideLow ? "red" : "blue"

    ctx.strokeRect(bird.xPos - 1, bird.yPos - 1, images["bird"].width + 2, images["bird"].height + 2)
    ctx.restore();
    collideLow = false
    collideUpper = false
  }

}

function collisionAABB(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    const collisionDetected =
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    h1 + y1 > y2;
  return collisionDetected;
}

const targetX =  bird.xPos - 10
// Adjust values
const G = 20
const impulse = -5

let collideLow = false;
let collideUpper = false

function update(dt: number) {

  // BIRD - not realistic
  bird.dy += G * dt
  if (bird.jump) {
    bird.jump = false
    bird.dy = impulse;
  }
  bird.yPos += bird.dy

  // LOWER PIPE
  // check collision between (targetX, gapStart + gapHeight) and (targetX + pipeW, H)
  const lowerCollision = collisionAABB(bird.xPos, bird.yPos, images["bird"].width, images["bird"].height,
  targetX, gapStart + gapH, images["pipe"].width, H - gapStart - gapH)

  if (lowerCollision) {
    collideLow = true
  }


  // UPPER PIPE
  // check collision between (targetX, 0) and (targetX + pipeW, gapStart)
  const upperCollision = collisionAABB(bird.xPos, bird.yPos, images["bird"].width, images["bird"].height,
  targetX, 0, images["pipe"].width, gapStart)

  if (upperCollision) {
    collideUpper = true
  }

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
        bird.jump = true;
    }

}
