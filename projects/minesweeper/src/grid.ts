const DEBUG = false
const VERBOSE = true

type Cell = {
    hidden: boolean
    state: CellState,
}

let grid: Cell[];

let gridWidth: number

let _maxRows: number;
let _maxCols: number

export function initGrid(rows: number, cols: number): void {

    _maxRows = rows - 1
    _maxCols = cols - 1
    gridWidth = cols;
    const totalCells = rows * cols
    grid = []

    for (let i = 0; i < totalCells; i++) {

        // TODO GENERATE cell
        const cell = {
            hidden: true,
            state: CellState.EMPTY,
        }

        CellState[2]
        if (i == 0) {
            cell.state = CellState.ONE
        }

        if (i>0 && i % 5 == 0) {
            cell.state = CellState.MINE
        }

        if (i % rows ==0) {
            cell.state = CellState.THREE
        }

        if (((i + 1) % cols) == 0) {
            cell.state = CellState.SIX
        }

        grid.push(cell)
    }
}




export function clickCell(row: number, col: number): {row: number, col: number}[] {


const discoveredRowCol:{row: number, col: number}[] = []
DEBUG && console.group('click cell', row, col)


const index = gridIndex(row, col);

DEBUG && console.log('clicked on cell at index', index)
const cell = grid[index]


if (!cell.hidden) {
DEBUG && console.log('cell not hidden')
DEBUG && console.groupEnd()
return discoveredRowCol /* already discovered */
}


if (cell.state === CellState.MINE) {
cell.hidden = false
DEBUG && console.error('you lose')
DEBUG && console.groupEnd()
throw 'you lose'
}


const queue: {row: number, col: number}[] = []
queue.push({row, col}) // clicked cell as root

while (queue.length > 0) {
    const firstElement = queue.shift()

    DEBUG && console.log('process cell', firstElement)

    if (!firstElement) { continue }

    const index = gridIndex(firstElement.row, firstElement.col);
    const cell = grid[index]

    DEBUG && console.log('cell at', firstElement, 'is', cell)

    if (!cell.hidden) {
        (DEBUG || VERBOSE) && console.log('already processed cell', cell)
        continue;
    }

    if (cell.state == CellState.MINE) {
        (DEBUG || VERBOSE) && console.log('%clet mine hidden', "color:yellow")
        continue
    }

    /* empty or number cell at this point */

    cell.hidden = false
    discoveredRowCol.push({row: firstElement.row, col: firstElement.col})
    
    if (cell.state != CellState.EMPTY) {
        DEBUG && console.log('cell not empty, do not reveal neighbors -> exit');
        (DEBUG || VERBOSE) && console.log('%creveal numbered cell', "color:yellow")
        continue
    }


    const {row, col} = firstElement

    /* neighbor cells */
    const children = []

    for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
            if (i == 0 && j == 0) { /* skip current cell */
                continue
            }
            children.push({
                row: row + j,
                col: col + i
            })

        }
    }


    (DEBUG || VERBOSE) && console.log('children', row, col, children)

    for (let child of children) {

        const invalidRowCol = child.row < 0 || child.row > _maxRows || child.col < 0 || child.col > _maxCols
        if (invalidRowCol) {
            
            DEBUG && console.log('%crefuse child', "color:red",  child)
        } else {
            DEBUG && console.log('%cpush child', "color:green", child)
            queue.push(child)
            
        }
    }

}

DEBUG && console.groupEnd()
return discoveredRowCol
 
}



export enum CellState {
    HIDDEN = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    EMPTY = 9,
    MINE = 10
}



export function getCellState(row: number, col: number, debug = false): CellState {
    const cell = grid[gridIndex(row, col)]
    if (debug) { return cell.state }
    return cell.hidden ? CellState.HIDDEN : cell.state
}


function gridIndex(row: number, col: number): number {

    return gridWidth * row + col
}