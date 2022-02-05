import { adjustCanvasForDisplay } from "~common/canvas-util";
import { Vector2D } from "~common/geometry";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";
import { CellPos, CellState, clickCell, getCellState, initGrid, minePositions, safeCellTotal } from "./grid";
import { beginFrame, buttonClicked, dragButton, resizeXEdgeButton, endFrame, generateId, isActive, isHot, uiState, GUIRect, Button, renderGUI } from "./ui";

const DEBUG = true
const VERBOSE = false

const GRID = false

enum GameState {
  PLAY,
  LOSE,
  WIN
}

let gameState: GameState = GameState.PLAY

let minesToFind: number

/* CANVAS */
const W = 432;
const H = 243;

const gridX0 = 40
const gridY0 = 30


const nRows = 5
const nCols = 5

const gridW = 300
const gridH = 100

let redraw = true


const cellDim = Math.min(Math.max(gridW / nCols, gridH / nRows), 30)

const gridFinalW = nCols * cellDim

const gridFinalH = nRows * cellDim

const keys: { [index: string]: boolean } = {};

const ctx = getRenderingContext();

document.querySelector("#root")?.appendChild(ctx.canvas);

let cursorPosition: Vector2D = new Vector2D(0, 0)

let countCursor = 0


const discoveredCells: Cell[] = []

const markedCells: Cell[] = []

let revealCells = false

ctx.canvas.addEventListener('mousemove', (e) => {

  /* many events are fired between a redraw */
  countCursor++
  console.debug('move', countCursor)

  cursorPosition.x = e.offsetX
  cursorPosition.y = e.offsetY

  uiState.cursorPosition.x = e.offsetX,
  uiState.cursorPosition.y = e.offsetY

  redraw = true
})

let clicked = false

let marked = false
ctx.canvas.addEventListener('click', (e) => {

  if (clicked || marked) {
    DEBUG && console.log('click event wait to resolve', {clicked, marked})
    return
  }

  // DEBUG && console.log('clicked event')

  cursorPosition.x = e.offsetX
  cursorPosition.y = e.offsetY

  clicked = true

  redraw = true

})

ctx.canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault()

  if (clicked || marked) {
    DEBUG && console.log('wait to resolve click and mark', clicked, marked)
    return
  }

  cursorPosition.x = e.offsetX
  cursorPosition.y = e.offsetY

  marked = true

  redraw = true
})


ctx.canvas.addEventListener('mousedown', (e) => {

  if (e.button == 0) { // left click
    uiState.mouseLeftDown = true
  }

  redraw = true
})


ctx.canvas.addEventListener('mouseup', (e) => {


  if (e.button == 0) {  // left click

    uiState.mouseLeftDown = false
  }

  redraw = true
})


document.addEventListener("keydown", function (e) {
  if (e.key === "Alt") {
    // seems that no keyup is fired for alt key
    DEBUG && console.debug("ignore alt");
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
    DEBUG && console.debug("prevent scrolling");
    e.preventDefault();
  }

  if (e.key === "ArrowDown" && e.target == document.body) {
    DEBUG && console.debug("prevent scrolling");
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

let numMines = 3


main();

async function main() {


  const halfCol = Math.floor(nCols / 2)
  const halfRow = Math.floor(nRows / 2)

  initGrid(nRows, nCols, numMines)

  minesToFind = minePositions.length

  console.log('need to find', minesToFind, 'mines')

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



function resetGame() {

  gameState = GameState.PLAY
  clicked = false
  marked = false

  revealCells = false
  discoveredCells.length = 0
  markedCells.length = 0

  const halfCol = Math.floor(nCols / 2)
  const halfRow = Math.floor(nRows / 2)

  initGrid(nRows, nCols, numMines)

  minesToFind = minePositions.length

  console.log('need to find', minesToFind, 'mines')

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


}


function isinQuad(point:Vector2D, quad: Quad): boolean {

  return pointIsInQuad(point.x, point.y, quad.x, quad.y, quad.w, quad.h)
}

function draw() {

  
  if (!redraw) { return }
  
  console.debug('redraw')
  ctx.clearRect(0, 0, W, H);

  ctx.save()
  
  ctx.fillStyle = 'grey'
  ctx.fillRect(0, 0, W, H)

  /* DRAW CANVAS GRADUATION POINTS */

  ctx.fillStyle = 'black'

  ctx.textBaseline = 'top'
  ctx.font = '7px courrier'

  if (DEBUG) {

    ctx.textBaseline = 'top'

    let graduation = `(${gridX0}, 0)`

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

  }

  ctx.textBaseline = 'middle'

  ctx.fillText(`discovered: ${discoveredCells.length}`, 5, H - 20)
  ctx.fillText(`safe cell total: ${safeCellTotal}`, 5, H - 5)


  if (gameState == GameState.LOSE) {
   ctx.fillText(`you LOSE :(`,  (W - ctx.measureText(`you LOSE :(`).width) / 2, H - 50)
  
  }

  if (gameState == GameState.WIN) {
  
    ctx.fillText(`you WIN :)`,  (W - ctx.measureText(`you WIN :)`).width) / 2, H - 50)
  }

  let text = `marked cells : ${markedCells.length}`
  ctx.fillText(text, W - ctx.measureText(text).width - 5, 10)
  
  text = `total mines: ${minePositions.length - markedCells.length}`
  ctx.fillText(text, W - ctx.measureText(text).width - 5, 20)

  ctx.restore()

  /* draw VERTICAL */

  ctx.save()
  ctx.textBaseline = 'bottom'
  ctx.translate(gridX0 - cellDim, gridY0)

  for (let i = 0; i <= nCols; i ++) {

    ctx.translate(cellDim, 0);
    ctx.beginPath()
  
    if (GRID && i % 5 == 0) {
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


  ctx.textBaseline = 'middle'
  for (let i = 0; i <= nRows; i++) {

    ctx.translate(0, cellDim);
    ctx.beginPath()
  
    if (GRID && i % 5 == 0) {
      ctx.fillText(`${i}`, -(3 + ctx.measureText(`${i}`).width), 0)
    }
    ctx.moveTo(0, 0);
    ctx.lineTo(cellDim * nCols, 0)
    ctx.stroke()
  }
  ctx.restore()

  // draw cursor
  if (DEBUG) {

    ctx.beginPath()
    ctx.arc(cursorPosition.x, cursorPosition.y, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  if (DEBUG && GRID && insideGrid) {
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

 

  drawCells()

  DEBUG && drawCellsDebug()

  ctx.save()
  ctx.fillStyle = 'white'
  ctx.globalAlpha = .8
  for (let markedCell of markedCells) {
    ctx.fillRect(markedCell.x + 1, markedCell.y + 1, cellDim - 2, cellDim - 2)
  }
  ctx.restore()
 

  redraw = false
  console.debug('reset count cursor')
  countCursor = 0

  if (false) {

    ctx.save()
  
      ctx.fillStyle = 'white'
      if (isHot(resetButton.id)) {
        ctx.fillStyle = 'lightgrey'
      }
  
      if (isActive(resetButton.id)) {
        ctx.fillStyle = 'yellow'
      }
      
      ctx.fillRect(resetButton.x, resetButton.y, resetButton.w, resetButton.h)
  
      ctx.fillStyle = "black"
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText("reset", resetButton.x + resetButton.w * .5 , resetButton.y + resetButton.h * .5)
  
      
    ctx.restore()
  }

  renderGUI(ctx)

  if (DEBUG) { // cursor

    ctx.save()
  
      ctx.globalAlpha = .5
      ctx.fillStyle = uiState.mouseLeftDown ? "red": "blue"
  
      ctx.fillRect(uiState.cursorPosition.x - 5, uiState.cursorPosition.y - 5, 10, 10)
    ctx.restore()
  }


}



function drawCells() {
  ctx.save()
  ctx.fillStyle = "black"

  const fontSize = cellDim / 2;
  ctx.font = `bold ${fontSize}px sans-serif`
  const yShift = fontSize * .5 + 1

  const halfCell = cellDim * .5
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'

  for (const discoveredCell of discoveredCells) {

    const state = getCellState(discoveredCell.row, discoveredCell.col, revealCells)

    if (state == CellState.HIDDEN) { continue }

    const content: string = cellContent(state)

    if (content) {
      if (content === 'X') {

        if (gameState == GameState.WIN) {
          ctx.fillStyle = 'green'
        } else {
          ctx.fillStyle = 'red'
        }
        ctx.fillRect(discoveredCell.x + 1, discoveredCell.y + 1, cellDim - 2, cellDim - 2)
      } else {
        ctx.fillStyle = bgCellColor
        ctx.fillRect(discoveredCell.x + 1, discoveredCell.y + 1, cellDim - 2, cellDim - 2)
      }
      ctx.fillStyle = 'black';
      ctx.fillText(content, discoveredCell.x + halfCell, discoveredCell.y + yShift)
    } else {
      ctx.fillStyle = bgCellColor
      ctx.fillRect(discoveredCell.x + 1, discoveredCell.y + 1, cellDim - 2, cellDim - 2)
    }
    
  }
  ctx.restore()
}

const bgCellColor = 'lightslategrey'

function drawCellsDebug() {

  ctx.save()
  ctx.globalAlpha = .5
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'

  const fontSize = cellDim / 2;
  ctx.font = `${fontSize}px sans-serif`
  const yShift = fontSize * .5 + 1
  const maxX =  grid.x + grid.w
  const maxY =  grid.y + grid.h

  const halfCell = cellDim * .5

  let row = grid.baseRow, col = grid.baseCol
  for (let x = grid.x; x < maxX; x += cellDim, col++) {

    for (let y = grid.y; y < maxY; y += cellDim, row++) {
      const state = getCellState(row, col, DEBUG)

    if (state == CellState.HIDDEN) { continue }

    let content: string = cellContent(state)

    if (content) {
      ctx.globalAlpha = .7
      ctx.fillStyle = 'black';
      ctx.fillText(content, x + halfCell, y + yShift)
    } else {
      ctx.globalAlpha = .2
      ctx.fillStyle = bgCellColor
      ctx.fillRect(x + 1, y + 1, cellDim - 2, cellDim - 2)
    }
    
    }
    row = grid.baseRow
  }

  ctx.restore()

}


function cellContent(state: CellState): string {
  let content: string;

    switch (state) {
      case CellState.ONE:
        content = "1";
        break;
      case CellState.TWO:
        content = "2";
        break;
      case CellState.THREE:
        content = "3";
        break;
      case CellState.FOUR:
        content = "4";
        break;
      case CellState.FIVE:
        content = "5";
        break;
      case CellState.SIX:
        content = "6";
        break;
      case CellState.SEVEN:
        content = "7";
        break;
      case CellState.EIGHT:
        content = "8";
        break;
      case CellState.MINE:
        content = "X";
        break;
      case CellState.EMPTY:
        content = "";
        break
      default:
      throw 'invalid state'
    }

    return content
}

let insideTopLeft: boolean
let insideTopRight: boolean
let insideBottomLeft: boolean
let insideBottomRight: boolean

let pointedCell: Cell | undefined


type Button = {
  id: number,
  x: number,
  y: number,
  w: number,
  h: number
}

const resetButton: Button = {
  id: generateId(),
  x: W - 75,
  y: H / 2,
  w: 50,
  h: 20
}

const randomButton: GUIRect = {
  x0: 10,
  y0: 10,
  x1: 50,
  y1: 30
}

function update() {



  (clicked || marked) && console.debug('begin update', {clicked, marked})

  beginFrame()

  let randomClicked = Button(1, "random", randomButton)

  if (randomClicked) {
    console.log("%cThis is a green text", "color:green");
  }

  if (false) {

    const drag = dragButton(resetButton.id, resetButton.x, resetButton.y, resetButton.w, resetButton.h) || new Vector2D(0, 0)
  
    if (drag) {
      console.log('drag', drag)
      resetButton.x = drag.x
      resetButton.y = drag.y
  
      console.debug('drag',  {clicked, marked})
    }
  
    let leftEdgeShift = resizeXEdgeButton(resetButton.id, resetButton.x, resetButton.y, 5, resetButton.h) || 2
  
    if (leftEdgeShift) {
  
        console.log('left edge shift', leftEdgeShift)
    
        let rightEdge = resetButton.x + resetButton.w;
    
        resetButton.x += leftEdgeShift
  
        resetButton.x = Math.min(rightEdge - 10, resetButton.x)
    
        resetButton.w = rightEdge - resetButton.x
    }
  
    if (buttonClicked(resetButton.id, resetButton.x, resetButton.y, resetButton.w, resetButton.h)) {
      resetGame()
      console.debug('reset -> exit')
      return
    }


  }

  endFrame()

  pointedCell = undefined

  insideGrid = insideTopLeft = insideTopRight = insideBottomLeft = insideBottomRight = false

  insideGrid = isinQuad(cursorPosition, grid)

  if (!insideGrid) { 
    clicked = false
    marked = false  
    return
  
  }

  insideTopLeft = isinQuad(cursorPosition, topLeft)
  insideTopRight = isinQuad(cursorPosition, topRight)
  insideBottomLeft = isinQuad(cursorPosition, bottomLeft)
  insideBottomRight = isinQuad(cursorPosition, bottomRight)


  if (insideTopLeft) {
    DEBUG && console.debug('%cinside top left', "color:green", insideTopLeft)
    pointedCell = cellInQuad(cursorPosition, topLeft)
  }

  if (insideTopRight) {
    DEBUG && console.debug('%cinside top right', "color:blue", insideTopRight)
    pointedCell = cellInQuad(cursorPosition, topRight)
  }
  
  
  if (insideBottomLeft) {
    DEBUG && console.debug('%cinside bottom left', "color:yellow", insideBottomLeft)
    pointedCell = cellInQuad(cursorPosition, bottomLeft)
  }
  

  if (insideBottomRight) {
    DEBUG && console.debug('%cinside bottom right', "color:orange", insideBottomRight)
    pointedCell = cellInQuad(cursorPosition, bottomRight)
  }

  if (pointedCell) {

    DEBUG && console.debug('pointed cell', pointedCell)
  }

  if (clicked) {

    clicked = false

    if (gameState !== GameState.PLAY) {
      console.log('not in play', GameState[gameState])
      return
    }

    DEBUG && console.debug('resolve click')

    if (pointedCell) {
      DEBUG && console.log('pointed cell', pointedCell)


      for (let i = 0; i < markedCells.length; i++) {
        let alreadyMarked = markedCells[i];
        if (pointedCell.col == alreadyMarked.col && alreadyMarked.row == pointedCell.row) {
          console.log('cell is marked do nothing', alreadyMarked)
          return
        }
      }

      let cellsRevealed: CellPos[]
      try {

        cellsRevealed = clickCell(pointedCell.row, pointedCell.col)
        
      } catch (error) {
        console.log('you lose', minePositions)
        for (let pos of minePositions ) {
          const discoveredCell = {
            row: pos.row,
            col: pos.col,
            x: gridX0 + pos.col * cellDim,
            y: gridY0 + pos.row * cellDim,
          }
          DEBUG && VERBOSE && console.log(discoveredCell)
          discoveredCells.push(discoveredCell)
        }
        gameState = GameState.LOSE
        revealCells = true
        return
      }
      DEBUG && console.group('discovered cells')
      for (let cellRevealed of cellsRevealed) {

        const discoveredCell = {
          row: cellRevealed.row,
          col: cellRevealed.col,
          x: gridX0 + cellRevealed.col * cellDim,
          y: gridY0 + cellRevealed.row * cellDim,
        }
        DEBUG && VERBOSE && console.log(discoveredCell)
        discoveredCells.push(discoveredCell)

        for (let i = 0; i < markedCells.length; i++) {
          let alreadyMarked = markedCells[i];
          if (discoveredCell.col == alreadyMarked.col && alreadyMarked.row == discoveredCell.row) {
            markedCells.splice(i, 1)
            console.log('discover a marked cell - unmark', alreadyMarked, markedCells)
          }
        }
      }
      DEBUG && console.groupEnd()
    }

    if (discoveredCells.length == safeCellTotal) {
      console.log('win')
      for (let pos of minePositions ) {
        const discoveredCell = {
          row: pos.row,
          col: pos.col,
          x: gridX0 + pos.col * cellDim,
          y: gridY0 + pos.row * cellDim,
        }
        DEBUG && VERBOSE && console.log(discoveredCell)
        discoveredCells.push(discoveredCell)
      }
      revealCells = true
      gameState = GameState.WIN
      return
    }
    DEBUG && console.log('discovered cells', discoveredCells.length)

    
  }


  if (marked) {
    console.log('resolving marked')
    marked = false

    if (pointedCell) {

      DEBUG && console.debug('pointed cell for mark', pointedCell)

      console.log('marked cells', markedCells)
      let mark = true
      for (let i = 0; i < markedCells.length; i++) {
        let alreadyMarked = markedCells[i];
        if (pointedCell.col == alreadyMarked.col && alreadyMarked.row == pointedCell.row) {
          console.log('unmark', alreadyMarked)
          markedCells.splice(i, 1)
          mark = false
          console.log('marked cells after demarking', markedCells)
          break
        }
      }
      
      if (mark) {
        console.log('mark', pointedCell)
        markedCells.push({row: pointedCell.row, col: pointedCell.col, x: pointedCell.x, y: pointedCell.y})

      }

    }
  

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



export function pointIsInQuad(x1: number, y1: number, x2: number, y2: number, w2: number, h2: number): boolean {

  const left = x2;
  const right = x2 + w2;

  const top = y2;
  const bottom = y2 + h2;

  return (x1 > left && x1 < right && y1 > top && y1 < bottom) // check if really inside and not on edge
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