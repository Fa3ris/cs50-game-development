let gridX0: number
let gridY0: number

let nRows: number
let nCols: number

let gridW: number
let gridH: number

let cellW: number

let cellH: number

let gridFinalW: number

let gridFinalH: number

const GRID = true

type Slot = {
    color: string
}

const coloredSlots: Slot[] = []

let columnHeights: number[]

enum Player {
    ONE,
    TWO
}

let currentPlayer: Player = Player.ONE

type HoveredSlot = {
    row: number
    col: number,
    color: string    
}

let hoveredSlot: HoveredSlot | undefined

export const gridColumns: GridColumn[] = []

type GridColumn = {
    x0: number,
    y0: number,
    x1: number,
    y1: number
}

export type Rect = GridColumn


export function setGrid(
    x0: number, y0: number,
    _nRows: number, _nCols: number,
    desiredW: number, desiredH: number,
    canvasW: number, canvasH: number,
    sameSizeCell: boolean = true)
{
    gridX0 = x0
    gridY0 = y0
    nRows = _nRows
    nCols = _nCols

    console.log({
        gridX0,
        gridY0,
        nRows,
        nCols,
        
    })

    console.log({
        desiredW,
        desiredH,
        canvasW,
        canvasH
    })

    const gridXEnd = x0 + desiredW

    if (gridXEnd > canvasW) {
        console.log('adjust width to')
        desiredW = canvasW - x0
        console.log('adjust width', {
            desiredW
        })
    }
    const gridYEnd = y0 + desiredH
    if (gridYEnd > canvasH) {
        console.log('before adjust height', {
            desiredH,
            gridYEnd})
        desiredH = canvasH - y0
        console.log('adjust height', {
            desiredH
        })
    }
    let _cellW = Math.floor(desiredW / nCols)

    let _cellH = Math.floor(desiredH / nRows)

    console.log({
        _cellW,
        _cellH  
      })


    if (sameSizeCell) {
        cellW = cellH = Math.min(_cellH, _cellW)
    } else {
        cellW = _cellW
        cellH =_cellH
    }

    gridFinalW = nCols * cellW

    gridFinalH = nRows * cellH

    console.log({
      gridFinalW,
      gridFinalH  
    })

  
   console.log(coloredSlots)

    /* for mouse detection */
    const colY1 = gridY0 + gridFinalH
    for (let i = 0; i < nCols ; ++i) {
        let gridColumn: GridColumn = {

            x0: gridX0 + i * cellW,
            y0: gridY0,
            x1: gridX0 + (i + 1) * cellW,
            y1: colY1
        }

        gridColumns.push(gridColumn)
    }

    columnHeights = new Array(nCols)

    columnHeights.fill(0)

    Object.seal(columnHeights);

    addSlot(0)
    addSlot(0)
    addSlot(0)

    addSlot(1)
    addSlot(2)
    addSlot(4)

}


const gridColor = 'blue'

const slotColor = 'aqua'

export {slotColor as bgColor} 


export function drawGrid(ctx: CanvasRenderingContext2D) 
{

    const slotCenterX = cellW * .5
    const slotCenterY = cellH * .5
    const slotRadius = .8 * slotCenterY

    ctx.save()

        /* GRID FRAME */
        ctx.fillStyle = gridColor
        ctx.fillRect(gridX0, gridY0, gridFinalW, gridFinalH)


        /* SLOTS */
        ctx.save()

        ctx.translate(gridX0 - cellW, gridY0)
        ctx.fillStyle = slotColor
        
        for (let j = 0; j < nRows; ++j) {

            ctx.save()
                for (let i = 0; i < nCols; ++i) {

                    ctx.translate(cellW, 0);
                    ctx.beginPath()
                
                    if (GRID && i > 0 && i % 5 == 0 && j == 0) {
                        ctx.save()
                            ctx.textBaseline = 'bottom'
                            ctx.fillText(`${i}`, - ctx.measureText(`${i}`).width / 2, 0)
                        ctx.restore()
                    }
            
                    const slot = coloredSlots[gridIndex(j, i)]
                    if (slot) {
                        ctx.fillStyle = slot.color
                    } else {
                        ctx.fillStyle = slotColor
                    }
                    ctx.arc(slotCenterX, slotCenterY, slotRadius,  0, 2 * Math.PI)
                    ctx.fill()
                }

            ctx.restore()

            if (GRID && j > 0 && j % 5 == 0) {
                ctx.save()
                    ctx.textBaseline = 'middle'
                    ctx.fillText(`${j}`, cellW - 2 * ctx.measureText(`${j}`).width, 0)
                ctx.restore()
            }

            ctx.translate(0, cellH)
        }
        ctx.restore()

        if (hoveredSlot) {

            if (coloredSlots[gridIndex(hoveredSlot.row, hoveredSlot.col)] == undefined) {

            
                ctx.save()
        
                    ctx.globalAlpha = .8
                    ctx.translate(gridX0 + hoveredSlot.col * cellW, gridY0 + hoveredSlot.row * cellH)
            
                    ctx.fillStyle = hoveredSlot.color;
                    ctx.beginPath()
                    ctx.arc(slotCenterX, slotCenterY, slotRadius,  0, 2 * Math.PI)
                    ctx.fill()
        
                ctx.restore()

            }

            hoveredSlot = undefined
        }

    ctx.restore()
}


function gridIndex(row: number, col: number): number 
{

    return nCols * row + col
}




export function hoverColumn(colNum: number, color: string) 
{

    if (fillableColumn(colNum))
        hoveredSlot = {
            row:  nRows - 1 - columnHeights[colNum],
            col: colNum,
            color: getColor()
        }
}


function getColor(): string 
{
    if (currentPlayer == Player.ONE) {
        return 'red'
    } else {
        return 'gold'
    }
}

function switchPlayer() 
{

    if (currentPlayer == Player.ONE) {
        currentPlayer = Player.TWO
    } else {
        currentPlayer = Player.ONE
    }
}

function addSlot(colNum: number) 
{
    if (fillableColumn(colNum)) {

        const row = nRows - 1 - columnHeights[colNum]
        ++columnHeights[colNum]
        coloredSlots[gridIndex(row, colNum)] = {
            color: getColor()
        }
        switchPlayer()
    } else {
        console.error('invalid col num', colNum, columnHeights)
    }
}

function fillableColumn(colNum: number): boolean 
{
    return colNum >= 0 && colNum <= nCols && columnHeights[colNum] < nRows
}



