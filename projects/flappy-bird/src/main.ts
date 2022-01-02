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
    if (keys[e.key] == undefined) {
        keys[e.key] = false
    }
})

document.addEventListener("keyup", function(e) {
    delete keys[e.key]
})


enum State {
    TITLE,
    PLAY,
}

let gameState: State = State.TITLE;

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


type PipePair = {
    x: number,
    gapStart: number,
    gapH: number
}

const pairs: PipePair[] = []

let spawnTimer = 0;


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


    if (gameState == State.PLAY) {
        /* PIPES */
        for (const pair of pairs) {
          // UPPER PIPE
          ctx.save();
          ctx.scale(1, -1); // flip horizontally by scaling y
          ctx.drawImage(images["pipe"], pair.x, -pair.gapStart); // y axis now points upward
          ctx.restore();
    
          // LOWER PIPE
          ctx.drawImage(images["pipe"], pair.x, pair.gapStart + pair.gapH);
        }
    }
   
  // draw ground image as-is
  ctx.drawImage(
    images["ground"],
    -groundScroll, H - images["ground"].height, images["ground"].width, images["ground"].height
  );

  if (gameState == State.PLAY) {

      // draw bird
      ctx.drawImage(
          images["bird"], bird.xPos, bird.yPos
      )

      // draw hitbox
      if (collideLow || collideUpper || collideBottomScreen || collideTopScreen) {


        ctx.save()

        if (collideLow) {
            ctx.strokeStyle = "red";
            collideLow = false
        }

        if (collideUpper) {
            ctx.strokeStyle = "blue";
            collideUpper = false
        }

        if (collideBottomScreen) {
            ctx.strokeStyle = "purple";
            collideBottomScreen = false
        }

        if (collideTopScreen) {
            ctx.strokeStyle = "pink";
            collideTopScreen = false
        }
    
        ctx.strokeRect(bird.xPos - 1, bird.yPos - 1, images["bird"].width + 2, images["bird"].height + 2)
        ctx.restore();
      }
  }

    // draw title
    if (gameState == State.TITLE) {
        ctx.save()
        ctx.font = "40px/1.5 flappy-font"
        ctx.fillStyle = "white"
        ctx.fillText("Hello, Flappy", W/2 - (ctx.measureText("Hello, Flappy").width / 2), H/2)
        // ctx.strokeStyle = "red";
        // ctx.strokeRect(W/2 - (ctx.measureText("Hello, Flappy").width / 2),  H/2 - 40, ctx.measureText("Hello, Flappy").width, 40*1.5)
        ctx.font = "20px flappy-font"
        ctx.fillText("Press Enter", W/2 - (ctx.measureText("Press Enter").width / 2), H/2 - 20 + (40*1.5))
        ctx.restore()
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

// Adjust values
const G = 20
const impulse = -5

let collideLow = false;
let collideUpper = false

let cleanPipeTimer = 0;

let collideTopScreen = false
let collideBottomScreen = false

function update(dt: number) {

  if (gameState == State.PLAY) {
      
        // BIRD - not realistic
        bird.dy += G * dt
        if (bird.jump) {
          bird.jump = false
          bird.dy = impulse;
        }
        bird.yPos += bird.dy


        if (bird.yPos < 0) {
            collideTopScreen = true
        }

        if (bird.yPos + images["bird"].height > H - images["ground"].height) {
            collideBottomScreen = true
        }

        // PIPES
        for (const pair of pairs) {
            
          // LOWER PIPE
          // check collision between (targetX, gapStart + gapHeight) and (targetX + pipeW, H)
          const lowerCollision = collisionAABB(bird.xPos, bird.yPos, images["bird"].width, images["bird"].height,
          pair.x, pair.gapStart + pair.gapH, images["pipe"].width, H - pair.gapStart - pair.gapH)
      
          if (lowerCollision) {
              collideLow = true
              break
          }
      
      
          // UPPER PIPE
          // check collision between (targetX, 0) and (targetX + pipeW, gapStart)
          const upperCollision = collisionAABB(bird.xPos, bird.yPos, images["bird"].width, images["bird"].height,
          pair.x, 0, images["pipe"].width, pair.gapStart)
      
          if (upperCollision) {
              collideUpper = true
              break
          }
      
         
        }
      
        for (const pair of pairs) {
          pair.x -= 2
        }
  }


  // loop background and ground images when reach the looping point
  bgScroll = (bgScroll + bgScrollSpeed * dt) % bgLoopingPoint;

  groundScroll = (groundScroll + groundScrollSpeed * dt) % groundLoopingPoint;
  console.debug(bgLoopingPoint);
  console.debug(groundLoopingPoint);
  console.debug("bgscroll", -bgScroll, "groundscroll", groundScroll);

  if (gameState == State.PLAY) {

      // REMOVE PIPES
      cleanPipeTimer += dt
    
      if (cleanPipeTimer >= 10) {
          cleanPipeTimer -= 10
    
          let nPipeToRemove = 0;
          for (let i = 0; i < pairs.length; i++) {
              if (pairs[i].x < -images["pipe"].width) { // out of screen
                  nPipeToRemove++
              }
          }
    
          if (nPipeToRemove > 0) {
              const removed = pairs.splice(0, nPipeToRemove)
              console.log('removed', removed)
          }
      }
    
      // SPAWN PIPE
      spawnTimer += dt
    
      if (spawnTimer >= 2) {
          spawnTimer -= 2;
          pairs.push({
              gapStart: random(50, 70),
              x: W + images["pipe"].width + 10,
              gapH: random(100, 150)
          })
      }

  }
}

function random(min:number, max: number) {
    return min + Math.random() * (max - min)
}

function processInput() {

    if (gameState == State.PLAY)  {

        if (keys[" "] != undefined && keys[" "] == false) {
            keys[" "] = true
            console.debug("jump")
            bird.jump = true;
        }
    }


    if (gameState == State.TITLE) {
        if (keys["Enter"] != undefined) {
            console.debug("play")
            gameState = State.PLAY
        }
    }

}
