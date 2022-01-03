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

let nbCols: number
let nbRows: number

let col = 0
let row = 10

const tileW = 32;
const tileH = 16;

const nBrickTiles = 21

type TileInfo = {
    x: number,
    y: number,
}
let bricksPositions: TileInfo[]
let tilesInfos: TileInfo[]

let bluePaddlePositions: TileInfo[]

enum PaddleColor {
    BLUE,
    GREEN,
    RED,
    PURPLE
}

enum PaddleSize {
    SMALL,
    MEDIUM,
    BIG,
    JUMBO
}

const paddleMap: Map<PaddleColor, Map<PaddleSize, {info: TileInfo, size: number}>> = new Map()

async function main() {
  images["background"] = await loadImage("img/background.png");

  sprites["elements"] = await loadImage("sprite/brick-paddle-ball.png")

  nbRows = sprites["elements"].height / tileH - 2; // there is unused space in the image
  nbCols = sprites["elements"].width / tileW;

  console.log(nbCols, nbRows)

  tilesInfos = tilePositions(nbRows, nbCols)
  bricksPositions =tilesInfos.slice(0, nBrickTiles)

  bluePaddlePositions = tilesInfos.slice(24, 24 + 12)

  const bluePaddleInfo = new Map<PaddleSize, {info: TileInfo, size: number}>()

  bluePaddleInfo.set(PaddleSize.SMALL, {
      info: {
          x: bluePaddlePositions[0].x,
          y: bluePaddlePositions[0].y
      },
      size: smallPaddleW
  })

  bluePaddleInfo.set(PaddleSize.MEDIUM, {
    info: {
        x: bluePaddlePositions[smallPaddleW].x,
        y: bluePaddlePositions[smallPaddleW].y
    },
    size: mediumPaddleW
})

bluePaddleInfo.set(PaddleSize.BIG, {
    info: {
        x: bluePaddlePositions[smallPaddleW + mediumPaddleW].x,
        y: bluePaddlePositions[smallPaddleW + mediumPaddleW].y
    },
    size: bigPaddleW
})


    bluePaddleInfo.set(PaddleSize.JUMBO, {
        info: {
            x: bluePaddlePositions[smallPaddleW + mediumPaddleW + bigPaddleW].x,
            y: bluePaddlePositions[smallPaddleW + mediumPaddleW + bigPaddleW].y
        },
        size: jumboPaddleW
    })

    paddleMap.set(PaddleColor.BLUE, bluePaddleInfo)



   // small
   ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[0].x, tileH * bluePaddlePositions[0].y, tileW * smallPaddleW, tileH, 10, 99, tileW * smallPaddleW, tileH)
   // middle
   ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[smallPaddleW].x, tileH * bluePaddlePositions[smallPaddleW].y, tileW * mediumPaddleW, tileH, 10, 120, tileW * mediumPaddleW, tileH)

   // big -- white line appears
   ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[smallPaddleW + mediumPaddleW].x, tileH * bluePaddlePositions[smallPaddleW + mediumPaddleW].y, tileW * bigPaddleW, tileH, 10, 150, tileW * bigPaddleW, tileH)
   
   // jumbo
   ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[smallPaddleW + mediumPaddleW + bigPaddleW].x, tileH * bluePaddlePositions[smallPaddleW + mediumPaddleW + bigPaddleW].y, tileW * jumboPaddleW, tileH, 10, 200, tileW * jumboPaddleW, tileH)


  console.log("paddle blue", bluePaddlePositions)

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


    const brickPosX = 10
    const brickPosY = 10

    ctx.strokeStyle = "red"
    ctx.strokeRect(brickPosX, brickPosY, tileW, tileH)
    ctx.drawImage(sprites["elements"], tileW * bricksPositions[brickIndex].x, tileH * bricksPositions[brickIndex].y, tileW, tileH, brickPosX, brickPosY, tileW, tileH)

    const elementPosX = 60
    const elementPosY = 10
    
    ctx.strokeRect(elementPosX, elementPosY, tileW, tileH)

    ctx.drawImage(sprites["elements"], tileW * tilesInfos[elementIndex].x, tileH * tilesInfos[elementIndex].y, tileW, tileH, elementPosX, elementPosY, tileW, tileH)


    // draw paddle

    // small
    ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[0].x, tileH * bluePaddlePositions[0].y, tileW * smallPaddleW, tileH, 10, 99, tileW * smallPaddleW, tileH)
    // middle
    ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[smallPaddleW].x, tileH * bluePaddlePositions[smallPaddleW].y, tileW * mediumPaddleW, tileH, 10, 120, tileW * mediumPaddleW, tileH)

    // big -- white line appears
    ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[smallPaddleW + mediumPaddleW].x, tileH * bluePaddlePositions[smallPaddleW + mediumPaddleW].y, tileW * bigPaddleW, tileH, 10, 150, tileW * bigPaddleW, tileH)
    
    // jumbo
    ctx.drawImage(sprites["elements"], tileW * bluePaddlePositions[smallPaddleW + mediumPaddleW + bigPaddleW].x, tileH * bluePaddlePositions[smallPaddleW + mediumPaddleW + bigPaddleW].y, tileW * jumboPaddleW, tileH, 10, 200, tileW * jumboPaddleW, tileH)


    let smallPaddleInfo = paddleMap.get(PaddleColor.BLUE)?.get(PaddleSize.SMALL)

    if (smallPaddleInfo == undefined) {
        throw "is undefined"
    }

    ctx.drawImage(sprites["elements"], tileW * smallPaddleInfo.info.x, tileH * smallPaddleInfo.info.y, tileW * smallPaddleInfo.size, tileH, 310, 10, tileW * smallPaddleInfo.size, tileH)

    let mediumPaddleInfo = paddleMap.get(PaddleColor.BLUE)?.get(PaddleSize.MEDIUM)

    if (mediumPaddleInfo == undefined) {
        throw "is undefined"
    }

    ctx.drawImage(sprites["elements"], tileW * mediumPaddleInfo.info.x, tileH * mediumPaddleInfo.info.y, tileW * mediumPaddleInfo.size, tileH, 310, 44, tileW * mediumPaddleInfo.size, tileH)

    let bigPaddleInfo = paddleMap.get(PaddleColor.BLUE)?.get(PaddleSize.BIG)

    if (bigPaddleInfo == undefined) {
        throw "is undefined"
    }

    ctx.drawImage(sprites["elements"], tileW * bigPaddleInfo.info.x, tileH * bigPaddleInfo.info.y, tileW * bigPaddleInfo.size, tileH, 310, 75, tileW * bigPaddleInfo.size, tileH)

    let jumboPaddleInfo = paddleMap.get(PaddleColor.BLUE)?.get(PaddleSize.JUMBO)

    if (jumboPaddleInfo == undefined) {
        throw "is undefined"
    }

    ctx.drawImage(sprites["elements"], tileW * jumboPaddleInfo.info.x, tileH * jumboPaddleInfo.info.y, tileW * jumboPaddleInfo.size, tileH, 278, 200, tileW * jumboPaddleInfo.size, tileH)
}

const smallPaddleW = 1;
const mediumPaddleW = 2;
const bigPaddleW = 3;
const jumboPaddleW = 4

let elapsed = 0
const waitingTime = .5

let brickIndex = 0

let elementIndex = 0

function update(dt: number) {
    elapsed += dt;
    if (elapsed > waitingTime) {
        elapsed -= waitingTime
        brickIndex++
        if (brickIndex >= bricksPositions.length) {
            console.log("reset brick index", brickIndex)
            brickIndex = 0;
        }


        elementIndex++
        if (elementIndex >= tilesInfos.length) {

            elementIndex = 0

        }
    }
}


function tilePositions(nbRows: number, nbCols: number): TileInfo[] {

    const res = []
    for (let row = 0; row < nbRows; row++) {

        for (let col = 0; col < nbCols; col++) {
            res.push({x: col, y: row})
        }
    }

    return res
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