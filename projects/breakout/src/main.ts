import { adjustCanvasForDisplay } from "~common/canvas-util";
import { loadImage } from "~common/image-utils";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";

/* CANVAS */
const W = 432;
const H = 243;

let canvas = document.querySelector("canvas");
if (!canvas) {
  canvas = document.createElement("canvas");
}

const ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d"
) as CanvasRenderingContext2D;

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

adjustCanvasForDisplay(ctx, W, H);

document.querySelector("#root")?.appendChild(canvas);

const images: { [index: string]: HTMLImageElement } = {};
const sprites: { [index: string]: HTMLImageElement } = {};

main();


const keys: {[index: string]: boolean } = {}


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


enum State {
    TITLE,
}

let elementsPerRow: number
let elementsPerCol: number

let col = 0
let row = 10

const tileW = 32;
const tileH = 16;

async function main() {
  images["background"] = await loadImage("img/background.png");

  sprites["elements"] = await loadImage("sprite/brick-paddle-ball.png")

  elementsPerCol = sprites["elements"].height / tileH - 2; // there is unused space in the image
  elementsPerRow = sprites["elements"].width / tileW;

  console.log(elementsPerRow, elementsPerCol)
  setDraw(draw);
  setUpdate(update);
  setProcessInput(processInput);

  start();
}

let titleSelectHighlightedIndex = 0

function draw() {

    ctx.clearRect(0, 0, W, H)

    // scale image
    ctx.drawImage(images["background"], 
    0, 0, images["background"].width, images["background"].height,
    0, 0, W, H)

    const title = "BREAKOUT"
    ctx.font = "40px/1.5 breakout-font"
    ctx.fillStyle = "white"
    let height = H/2
    ctx.fillText(title, W/2 - (ctx.measureText(title).width / 2), height)
    ctx.font = "20px breakout-font"
    ctx.fillStyle = titleSelectHighlightedIndex == 0 ? "aqua" : "white";
    height += 50
    const text1 = "Start"
    ctx.fillText(text1, W/2 - (ctx.measureText(text1).width / 2), height)
    ctx.fillStyle = titleSelectHighlightedIndex == 1 ? "aqua" : "white";
    height += 20*1.5
    const text2 = "High Score"
    ctx.fillText(text2, W/2 - (ctx.measureText(text2).width / 2), height)


    ctx.drawImage(sprites["elements"], tileW * col, tileH * row, tileW, tileH, 10, 10, tileW, tileH)
}

let elapsed = 0
const waitingTime = .5

function update(dt: number) {
    elapsed += dt;
    if (elapsed > waitingTime) {
        elapsed -= waitingTime
        col++
        if (col >= elementsPerRow) {
            col = 0;
            row ++
        }
        if (row >= elementsPerCol) {
            row = 0;
            col = 0;
        }
    }
}

function processInput() {

    if (Object.keys(keys).length > 0) {

        if (keys["ArrowUp"] == false) {
            keys["ArrowUp"] = true // do not process it again
            titleSelectHighlightedIndex--
            if (titleSelectHighlightedIndex < 0) {
                titleSelectHighlightedIndex = 1;
            }
           
        }
        
        if (keys["ArrowDown"] == false) {
            keys["ArrowDown"] = true // do not process it again
            titleSelectHighlightedIndex++
            if (titleSelectHighlightedIndex > 1) {
                titleSelectHighlightedIndex = 0;
            }
        }
    }
}