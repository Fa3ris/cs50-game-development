import { adjustCanvasForDisplay } from "~common/canvas-util";
import { Vector2D } from "~common/geometry";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";

/* CANVAS */
const W = 432;
const H = 243;

const gridX0 = 40
const gridY0 = 30


const nRows = 10
const nCols = 20

const gridW = 300
const gridH = 100

let redraw = true


const cellDim = Math.max(gridW / nCols, gridH / nRows)

const gridFinalW = nCols * cellDim

const gridFinalH = nRows * cellDim

const keys: { [index: string]: boolean } = {};

const ctx = getRenderingContext();

document.querySelector("#root")?.appendChild(ctx.canvas);

let cursorPosition: Vector2D = new Vector2D(0, 0)

let countCursor = 0

ctx.canvas.addEventListener('mousemove', (e) => {

  /* many events are fired between a redraw */
  countCursor++
  console.log('move', countCursor)

  cursorPosition.x = e.offsetX
  cursorPosition.y = e.offsetY

  redraw = true
})



document.addEventListener("keydown", function (e) {
  if (e.key === "Alt") {
    // seems that no keyup is fired for alt key
    console.log("ignore alt");
    return;
  }

  if (keys[e.key] == undefined) {
    keys[e.key] = false;
  }
});

document.addEventListener("keyup", function (e) {
  delete keys[e.key];
});

window.addEventListener("keydown", function (e) {
  if (e.key === " " && e.target == document.body) {
    console.log("prevent scrolling");
    e.preventDefault();
  }

  if (e.key === "ArrowDown" && e.target == document.body) {
    console.log("prevent scrolling");
    e.preventDefault();
  }
});

let insideGrid: boolean

let topLeft: Quad, topRight: Quad, bottomLeft: Quad, bottomRight: Quad
type Quad = {
  x: number,
  y: number,
  w: number,
  h: number,
  baseCol: number,
  baseRow: number
}

let grid: Quad

main();

async function main() {

  const halfCol = Math.floor(nCols / 2)
  const halfRow = Math.floor(nRows / 2)

  grid = {
    x: gridX0,
    y: gridY0,
    w: gridFinalW,
    h: gridFinalH,
    baseCol: 0,
    baseRow: 0
  }

  topLeft = {
    x: gridX0,
    y: gridY0,
    w: (halfCol) * cellDim,
    h: (halfRow) * cellDim,
    baseCol: 0,
    baseRow: 0
  }

  topRight = {
    x: gridX0 + halfCol * cellDim,
    y: gridY0,
    w: (nCols- halfCol) * cellDim,
    h: halfRow * cellDim,
    baseCol: halfCol,
    baseRow: 0
  }

  bottomLeft = {
    x: gridX0,
    y: gridY0 + halfRow *cellDim,
    w: (halfCol) * cellDim,
    h: (nRows - halfRow) * cellDim,
    baseCol: 0,
    baseRow: halfRow
  }

  bottomRight = {
    x: gridX0 + halfCol * cellDim,
    y: gridY0 + halfRow *cellDim,
    w: (nCols- halfCol) * cellDim,
    h: (nRows - halfRow) * cellDim,
    baseCol: halfCol,
    baseRow: halfRow
  }


  setDraw(draw);
  setUpdate(update);
  setProcessInput(processInput);

  
  start();
}



function isinQuad(point:Vector2D, quad: Quad): boolean {

  return pointIsInQuad(point.x, point.y, quad.x, quad.y, quad.w, quad.h)
}

function draw() {

  if (!redraw) { return }
  
  console.log('redraw')

  ctx.clearRect(0, 0, W, H);

  

  ctx.save()
  
  ctx.fillStyle = 'grey'
  ctx.fillRect(0, 0, W, H)

  /* DRAW CANVAS GRADUATION POINTS */

  ctx.fillStyle = 'black'

  ctx.textBaseline = 'top'
  let graduation = `(${gridX0}, 0)`

  ctx.font = '7px courrier'
  ctx.fillText(graduation, gridX0 - ctx.measureText(graduation).width / 2, 2)



  let end = gridX0 + gridFinalW
  graduation = `(${end}, 0)`
  ctx.fillText(graduation, end - ctx.measureText(graduation).width / 2, 2)


  ctx.textBaseline = 'middle'
  graduation = `(0, ${gridY0})`
  ctx.fillText(graduation, 0, gridY0)

  end = gridY0 + gridFinalH
  graduation = `(0, ${end})`

  ctx.fillText(graduation, 0, end)

  
  ctx.fillText(`cell dim : ${cellDim}`, W - ctx.measureText(`cell dim : ${cellDim}`).width - 10, H - 10)

  ctx.restore()

  /* draw VERTICAL */

  ctx.save()
  ctx.textBaseline = 'bottom'
  ctx.translate(gridX0 - cellDim, gridY0)

  ctx.fillRect(0, 0, 1, 1)
  for (let i = 0; i <= nCols; i ++) {

    ctx.translate(cellDim, 0);
    ctx.beginPath()
  
    if (i % 5 == 0) {
      ctx.fillText(`${i}`, - ctx.measureText(`${i}`).width / 2, 0)
    }
    ctx.moveTo(0, 0);
    ctx.lineTo(0, cellDim * nRows)
    ctx.stroke()
  }

  ctx.restore()


  /* draw HORIZONTAL */
  ctx.save()

  ctx.translate(gridX0, gridY0 - cellDim)

  ctx.fillRect(0, 0, 1, 1)

  ctx.textBaseline = 'middle'
  for (let i = 0; i <= nRows; i++) {

    ctx.translate(0, cellDim);
    ctx.beginPath()
  
    if (i % 5 == 0) {
      ctx.fillText(`${i}`, -(3 + ctx.measureText(`${i}`).width), 0)
    }
    ctx.moveTo(0, 0);
    ctx.lineTo(cellDim * nCols, 0)
    ctx.stroke()
  }
  ctx.restore()


  ctx.beginPath()
  ctx.arc(cursorPosition.x, cursorPosition.y, 2, 0, Math.PI * 2)
  ctx.fill()

  if (insideGrid) {
    ctx.save()

    ctx.globalAlpha = 0.1
    ctx.fillStyle = 'red'

    ctx.fillRect(gridX0, gridY0, gridFinalW, gridFinalH)


    ctx.globalAlpha = 0.5

    if (insideTopLeft) {

      ctx.fillStyle= 'green'
      ctx.fillRect(topLeft.x, topLeft.y, topLeft.w, topLeft.h)
    }
    
    if (insideTopRight) {
      ctx.fillStyle= 'blue'
      ctx.fillRect(topRight.x, topRight.y, topRight.w, topRight.h)

    }

    if (insideBottomLeft) {
      ctx.fillStyle= 'yellow'
      ctx.fillRect(bottomLeft.x, bottomLeft.y, bottomLeft.w, bottomLeft.h)

    }

    if (insideBottomRight) {
      ctx.fillStyle= 'orange'
      ctx.fillRect(bottomRight.x, bottomRight.y, bottomRight.w, bottomRight.h)

    }

    if (pointedCell) {
      ctx.fillStyle= 'white'
      ctx.fillRect(pointedCell.x, pointedCell.y, cellDim, cellDim)
    }
  

    ctx.restore()
  }

  redraw = false
  console.log('reset count cursor')
  countCursor = 0
}


let insideTopLeft: boolean
let insideTopRight: boolean
let insideBottomLeft: boolean
let insideBottomRight: boolean

let pointedCell: Cell | undefined

function update() {

  pointedCell = undefined

  insideGrid = insideTopLeft = insideTopRight = insideBottomLeft = insideBottomRight = false

  insideGrid = pointIsInQuad(cursorPosition.x, cursorPosition.y, gridX0, gridY0, gridFinalW, gridFinalH)

  if (!insideGrid) { return }

  insideTopLeft = isinQuad(cursorPosition, topLeft)
  insideTopRight = isinQuad(cursorPosition, topRight)
  insideBottomLeft = isinQuad(cursorPosition, bottomLeft)
  insideBottomRight = isinQuad(cursorPosition, bottomRight)


  if (insideTopLeft) {
    console.log('%cinside top left', "color:green", insideTopLeft)
    pointedCell = cellInQuad(cursorPosition, topLeft)
  }

  if (insideTopRight) {
    console.log('%cinside top right', "color:blue", insideTopRight)
    pointedCell = cellInQuad(cursorPosition, topRight)
  }
  
  
  if (insideBottomLeft) {
    console.log('%cinside bottom left', "color:yellow", insideBottomLeft)
    pointedCell = cellInQuad(cursorPosition, bottomLeft)
  }
  

  if (insideBottomRight) {
    console.log('%cinside bottom right', "color:orange", insideBottomRight)
    pointedCell = cellInQuad(cursorPosition, bottomRight)
  }

  if (pointedCell) {

    console.log('pointed cell', pointedCell)
  }

}

function processInput() {}

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



function pointIsInQuad(x1: number, y1: number, x2: number, y2: number, w2: number, h2: number): boolean {

  const left = x2;
  const right = x2 + w2;

  const top = y2;
  const bottom = y2 + h2;

  return (x1 > left && x1 < right && y1 > top && y1 < bottom) // check if really inside and not on edge
}

function gridIndex(row: number, col: number, gridWidth: number): number {
  return gridWidth * row + col
}


function cellInQuad(point: Vector2D, quad: Quad): Cell | undefined {
  const maxX =  quad.x + quad.w
  const maxY =  quad.y + quad.h
  let row = quad.baseRow, col = quad.baseCol
  for (let x = quad.x; x < maxX; x += cellDim, col++) {

    for (let y = quad.y; y < maxY; y += cellDim, row++) {
      const insideCell = pointIsInQuad(point.x, point.y, x, y, cellDim, cellDim)

      if (insideCell) {
        return {x, y, row, col}
      }
    }
    row = quad.baseRow
  }
}


type Cell = {
  x: number,
  y: number,
  row: number,
  col: number,
}