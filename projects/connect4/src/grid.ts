
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
}



export function drawGrid(ctx: CanvasRenderingContext2D) 
{

ctx.save()

ctx.fillStyle = 'black'

ctx.lineWidth = axisLineW

/* VERTICAL AXES */
ctx.save()
    ctx.textBaseline = 'bottom'
    ctx.translate(gridX0 - cellW, gridY0)
    for (let i = 0; i <= nCols; i ++) {

        ctx.translate(cellW, 0);
        ctx.beginPath()
    
        if (GRID && i % 5 == 0) {
        ctx.fillText(`${i}`, - ctx.measureText(`${i}`).width / 2, 0)
        }

        ctx.moveTo(0, 0);
        ctx.lineTo(0, gridFinalH)
        ctx.stroke()
    }
ctx.restore()


 /* HORIZONTAL AXES */
 ctx.save()
    ctx.translate(gridX0, gridY0 - cellH)
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= nRows; i++) {

    ctx.translate(0, cellH);
    ctx.beginPath()
    
    if (GRID && i % 5 == 0) {
        ctx.fillText(`${i}`, -(3 + ctx.measureText(`${i}`).width), 0)
    }
    ctx.moveTo(0, 0);
    ctx.lineTo(gridFinalW, 0)
    ctx.stroke()
    }
 ctx.restore()

 /* close border*/
 ctx.save()
    ctx.translate(gridX0, gridY0)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(gridFinalW, 0)
    ctx.lineTo(gridFinalW, gridFinalH)
    ctx.lineTo(0, gridFinalH)
    ctx.closePath()
    ctx.stroke()
 ctx.restore()

 ctx.restore()

}