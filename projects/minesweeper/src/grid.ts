const DEBUG = true

type Cell = {
    hidden: boolean
    state: CellState
}

let grid: Cell[];

let gridWidth: number

// TODO remove if really useless
let _rows: number;
let _cols: number

export function initGrid(rows: number, cols: number): void {

    _rows = rows
    _cols = cols
    gridWidth = cols;
    const totalCells = rows * cols
    grid = []

    for (let i = 0; i < totalCells; i++) {

        // TODO GENERATE cell
        const cell = {
            hidden: true,
            state: CellState.EMPTY
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


export function clickCell(row: number, col: number ): boolean {
  const index = gridIndex(row, col);

  console.log('clicked on cell at index', index)
  const cell = grid[index]

  if (cell.hidden) {
    cell.hidden = false
    return true
  }

  /* already discovered */
  return false
}



export enum CellState {
    HIDDEN,
    EMPTY,
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    MINE
}



export function getCellState(row: number, col: number): CellState {
    const cell = grid[gridIndex(row, col)]
    if (DEBUG) { return cell.state }
    return cell.hidden ? CellState.HIDDEN : cell.state
}



function gridIndex(row: number, col: number): number {
    return gridWidth * row + col
}