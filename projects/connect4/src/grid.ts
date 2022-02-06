
let gridX0 = 40
let gridY0 = 30

let nRows = 10
let nCols = 10

let gridW = 300
let gridH = 100

let cellW = Math.min(Math.max(gridW / nCols, gridH / nRows), 30)

let cellH = Math.min(Math.max(gridW / nCols, gridH / nRows), 30)

let gridFinalW = nCols * cellW

let gridFinalH = nRows * cellH

const GRID = true

let axisLineW = 3

type Slot = {
    color: string
}

const coloredSlots: Slot[] = []  

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

    coloredSlots[1] = {
        color: 'red'
    }


    coloredSlots[10] = {
        color: 'gold'
    }

    console.log(coloredSlots)
}


let gridColor = 'blue'

let slotColor = 'aqua'


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

    ctx.restore()

    return
}


function gridIndex(row: number, col: number): number {

    return nCols * row + col
}