import { tweenValue, ValueTween } from "./tween"

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
    // color: string,
    player: Player
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

    // addSlot(0)
    // addSlot(0)
    // addSlot(0)

    // addSlot(1)
    // addSlot(2)
    // addSlot(4)

}


const gridColor = 'blue'

const slotColor = 'lightblue'

export {slotColor as bgColor} 


export function updateGrid(dt: number) {

    if (dropTween) {
        dropTween.update(dt)
    }
}

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
        
        for (let j = 0; j < nRows; ++j) {

            ctx.save()
                for (let i = 0; i < nCols; ++i) {

                    ctx.translate(cellW, 0);
                    ctx.beginPath()
                
                    if (GRID && i > 0 && i % 5 == 0 && j == 0) {
                        ctx.save()
                            ctx.fillStyle = "black"
                            ctx.textBaseline = 'bottom'
                            ctx.fillText(`${i}`, - ctx.measureText(`${i}`).width / 2, 0)
                        ctx.restore()
                    }
            
                    const slot = coloredSlots[gridIndex(j, i)]
                    if (slot) {
                        ctx.fillStyle = colorForPlayer(slot.player)
                        ctx.arc(slotCenterX, slotCenterY, slotRadius,  0, 2 * Math.PI)
                        ctx.fill()
                    } else {
                        ctx.save()
                            ctx.globalCompositeOperation = 'destination-out' // carve out empty slot from grid frame

                            ctx.arc(slotCenterX, slotCenterY, slotRadius,  0, 2 * Math.PI)
                            ctx.fill()
                        ctx.restore()
                    }
                   
                }

            ctx.restore()

            if (GRID && j > 0 && j % 5 == 0) {
                ctx.save()
                    ctx.fillStyle = "black"
                    ctx.textBaseline = 'middle'
                    ctx.fillText(`${j}`, cellW - 2 * ctx.measureText(`${j}`).width, 0)
                ctx.restore()
            }

            ctx.translate(0, cellH)
        }
        ctx.restore()

        if (hoveredSlot && !dropTween) {

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

        if (dropTween) {
            ctx.save()
        
                ctx.translate(gridX0 + columnOffset, gridY0 + 0 * cellH + dropTween.current)
        
                ctx.globalCompositeOperation = "destination-over"; // do not draw over what is already present
                ctx.fillStyle = getColor();
                ctx.beginPath()
                ctx.arc(slotCenterX, slotCenterY, slotRadius,  0, 2 * Math.PI)
                ctx.fill()

            ctx.restore()

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

function colorForPlayer(player: Player): string {
    if (player == Player.ONE) {
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

let droppingSlot: boolean = false

let dropTween: ValueTween | undefined
let columnOffset: number

export function addSlot(colNum: number) 
{
    if (fillableColumn(colNum)) {
        console.log(droppingSlot)
        if (droppingSlot === true) {
            console.warn('waiting for dropping to finish')
            return
        }

        droppingSlot = true

        const row = nRows - 1 - columnHeights[colNum]

        columnOffset = colNum * cellW

        let target = row * cellH

        let duration = .2 * row

        if (true) {
            duration = 0
        }

        dropTween = tweenValue({
            from: 0,
            to: target,
            duration: duration,
            complete: () => {
                console.log('drop slop completed')
                
                ++columnHeights[colNum]
                coloredSlots[gridIndex(row, colNum)] = {
                    player: currentPlayer
                }
                checkWin(coloredSlots, currentPlayer)
                switchPlayer()
                droppingSlot = false
                dropTween = undefined
            }

        })
        
    } else {
        console.error('invalid col num', colNum, columnHeights)
    }
}


function checkWin(slots: Slot[], player: Player, winLength = 4): boolean {
    
    let count = 0
    let current = 0
    // check horizontal row
    const lastPossibleCol = nCols - winLength
    console.debug('last possible horizontal col', lastPossibleCol)
    let res = false
    for (let row = 0; row < nRows; ++row) {

        false && console.group('check row', row)
        while (current < nCols) {
            const slot = slots[gridIndex(row , current)]
            if (slot && slot.player === player) {
                ++count
                console.debug('inc count to', count)
            } else {
                console.debug('close count to', count)

                if (count >= winLength) {
                    const winSlots: {row: number, col: number}[] = []
                    let i = current - count
                    const max = i + winLength
                    for (; i < max; ++i ) {
                        winSlots.push({row, col: i})
                    }
                    console.log('horizontal winning positions', winSlots)
                    res = true
                    break
                } else {
                    count = 0
                }
            }
            ++current

            console.debug('col is now', current)
            if (current > lastPossibleCol && count == 0) {
                console.debug('break out of loop')
                break
            }
        }

        if (res == false && count >= winLength) {
            console.debug('win after exit loop')
            const winSlots: {row: number, col: number}[] = []
            let i = current - count
            const max = i + winLength
            for (; i < max; ++i ) {
                winSlots.push({row, col: i})
            }
            console.log('horizontal winning positions', winSlots)
            res = true
        }

        false && console.groupEnd()
        if (res == true) {
            break
        }
        count = 0
        current = 0
    }


    if (res == true) {
        console.warn(`%cplayer ${Player[player]} wins`, 'color:green; font-weight: bold; font-size: 18px')
        return res
    }


    /* check columns */
    count = 0
    current = 0

    const lastPossibleRow = nRows - winLength

    for (let col = 0; col < nCols; ++col) {
        while (current < nRows) { // TODO use for-loop

            const slot = slots[gridIndex(current, col)]

            if (slot && slot.player === player) {
                ++count
                console.debug('inc count to', count)
            } else {
                console.debug('close count to', count)

                if (count >= winLength) {
                    const winSlots: {row: number, col: number}[] = []
                    let i = current - count
                    const max = i + winLength
                    for (; i < max; ++i ) {
                        winSlots.push({row: i, col})
                    }
                    console.log('vertical winning positions', winSlots)
                    res = true
                    break
                } else {
                    count = 0
                }
            }

            ++current

            console.debug('row is now', current)
            if (current > lastPossibleRow && count == 0) {
                console.debug('break out of loop')
                break
            }

        }

        if (res == false && count >= winLength) {
            console.debug('win after exit loop')
            const winSlots: {row: number, col: number}[] = []
            let i = current - count
            const max = i + winLength
            for (; i < max; ++i ) {
                winSlots.push({row: i, col})
            }
            console.log('horizontal winning positions', winSlots)
            res = true
        }

        false && console.groupEnd()
        if (res == true) {
            break
        }
        count = 0
        current = 0
    }


    if (res == true) {
        console.warn(`%cplayer ${Player[player]} wins`, 'color:red; font-weight: bold; font-size: 18px')
        return res
    }


    /* 
        top-left to bottom-right diagonals 
        
        for a starting row, there must be at least (winlength -1) rows below to form a diagonal of length winLength

        row = 0 .. nRows - winLength ?

        for a starting col, there must be at least (winlength -1) cols to the right to form a diagonal of length winLength

        col = 0 .. nCols - winLength ?
    
    */

        const lastPossibleRowDiagDown =  nRows - winLength;
        const lastPossibleColDiagDown = nCols - winLength;
        for (let row = 0; row <= lastPossibleRowDiagDown; ++row) {

            for (let col = 0; col <= lastPossibleColDiagDown; ++col) {

                const slot1 = slots[gridIndex(row, col)]
                const slot2 = slots[gridIndex(row + 1, col + 1)]
                const slot3 = slots[gridIndex(row + 2, col + 2)]
                const slot4 = slots[gridIndex(row + 3, col + 3)]

                if (slot1 && slot2 && slot3 && slot4  && slot1.player === player
                    && slot2.player === player
                    && slot3.player === player
                    && slot4.player === player) {

                        console.log('diagonal top-left to bottom-right winning position starting at ', {row, col}, [slot1, slot2, slot3, slot4])
                        res = true
                        break
                    }
            }

            if (res == true) { break }
        }


        if (res == true) {
            console.warn(`%cplayer ${Player[player]} wins`, 'color:red; font-weight: bold; font-size: 18px')
            return res
        }
    /* 
        bottom-left to top-right diagonals

        for a starting row, there must be at least (winlength -1) above below to form a diagonal of length winLength

        row = nRows - 1 .. winLength ?

        for a starting col, there must be at least (winlength -1) cols to the right to form a diagonal of length winLength

        col = 0 .. nCols - winLength ?

        
    
    
    */

        const lastPossibleRowDiagUp =  winLength - 1;
        const lastPossibleColDiagUp =  nCols - winLength;

        for (let row = nRows - 1; row >= lastPossibleRowDiagUp; --row) {

            for (let col = 0; col <= lastPossibleColDiagUp; ++col) {

                const slot1 = slots[gridIndex(row, col)]
                const slot2 = slots[gridIndex(row - 1, col + 1)]
                const slot3 = slots[gridIndex(row - 2, col + 2)]
                const slot4 = slots[gridIndex(row - 3, col + 3)]

                if (slot1 && slot2 && slot3 && slot4  && slot1.player === player
                    && slot2.player === player
                    && slot3.player === player
                    && slot4.player === player) {

                        res = true
                        console.log('diagonal bottom-left to top-right winning position starting at ', {row, col}, [slot1, slot2, slot3, slot4])
                        break
                    }
            }

            if (res == true) { break }
        }

        if (res == true) {
            console.warn(`%cplayer ${Player[player]} wins`, 'color:red; font-weight: bold; font-size: 18px')
            return res
        }

    return res
}

function fillableColumn(colNum: number): boolean 
{
    return colNum >= 0 && colNum <= nCols && columnHeights[colNum] < nRows
}



