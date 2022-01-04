import { adjustCanvasForDisplay } from "~common/canvas-util";
import { loadImage } from "~common/image-utils";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";
import { init as initSprites, drawBrick, drawPaddle, drawElement, PaddleColor, PaddleSize, nBrickTiles, nTiles, drawBall, nBalls} from "./tile-renderer"
import { update as stateUpdate, processInput as stateProcessInput, draw as stateDraw, enterState, GameState } from './state-machine'

/* CANVAS */
const W = 432;
const H = 243;


const mainMusic = new Audio("sound/music.wav");
mainMusic.loop = true;
mainMusic.volume = 0

const eventsStartingMainMusic = ["click", "keydown",]

for (const iterator of eventsStartingMainMusic) {
    document.addEventListener(iterator, function(e) {
        if (mainMusic.paused) {
            console.log("begin play for event", e)
            mainMusic.play()
        }
    }, {once: true})
}

const ctx = getRenderingContext()

document.querySelector("#root")?.appendChild(ctx.canvas);

const images: { [index: string]: HTMLImageElement } = {};
const keys: {[index: string]: boolean } = {}

main();

document.addEventListener("keydown", function(e) {

    if (e.key === "Alt") { // seems that no keyup is fired for alt key
        console.log("ignore alt")
        return
    }

    if (keys[e.key] == undefined) {
        keys[e.key] = false
    }
})

document.addEventListener("keyup", function(e) {
    delete keys[e.key]
})


async function main() {
  images["background"] = await loadImage("img/background.png");

  await initSprites();

  setDraw(draw);
  setUpdate(update);
  setProcessInput(processInput);

  enterState(GameState.TITLE)

  start();
}



function draw() {

    ctx.clearRect(0, 0, W, H)

    ctx.drawImage(images["background"], 0, 0, W + 10, H + 10); // add extra dimensions, else image is not filling entire canvas

    stateDraw()

    const tileW = 32;
    const tileH = 16;

    const brickPosX = 10
    const brickPosY = 10

    ctx.strokeStyle = "red"
    ctx.strokeRect(brickPosX, brickPosY, tileW, tileH)

    drawBrick(ctx, brickIndex, brickPosX, brickPosY)

    const elementPosX = 60
    const elementPosY = 10
    
    ctx.strokeRect(elementPosX, elementPosY, tileW, tileH)


    drawElement(ctx, elementIndex, elementPosX, elementPosY)

    drawPaddle(ctx, PaddleColor.BLUE, PaddleSize.SMALL, 310, 10)
    drawPaddle(ctx, PaddleColor.BLUE, PaddleSize.MEDIUM, 310, 44)
    drawPaddle(ctx, PaddleColor.BLUE, PaddleSize.BIG, 310, 75)
    drawPaddle(ctx, PaddleColor.BLUE, PaddleSize.JUMBO, 150, 150)

    // ballIndex = 6
    drawBall(ctx, ballIndex, 150, 132)

    ctx.fillText(`${ballIndex}`, 150 - 30, 132 + 10)
}

let elapsed = 0
const waitingTime = .5

let brickIndex = 0

let elementIndex = 0

let ballIndex = 0

function update(dt: number) {

    stateUpdate(dt)
    elapsed += dt;
    if (elapsed > waitingTime) {
        elapsed -= waitingTime
        brickIndex++
        if (brickIndex >= nBrickTiles) {
            console.log("reset brick index", brickIndex)
            brickIndex = 0;
        }


        elementIndex++
        if (elementIndex >= nTiles) {
            elementIndex = 0
        }

        ballIndex++
        if (ballIndex >= nBalls) {
            ballIndex = 0
        }
    }
}


function processInput() {

    if (Object.keys(keys).length > 0) {
        stateProcessInput()
    }
}


function getRenderingContext(): CanvasRenderingContext2D {
    let canvas = document.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
    }

    const ctx: CanvasRenderingContext2D = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    adjustCanvasForDisplay(ctx, W, H);

    return ctx;
}

export {
    W,
    H,
    ctx,
    images,
    keys
};