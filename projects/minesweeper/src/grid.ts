type Cell = {

    hidden: boolean
}

let grid: Cell[];

let gridWidth: number

let _rows: number;
let _cols: number

export function initGrid(rows: number, cols: number): void {

    _rows = rows
    _cols = cols
    gridWidth = cols;
    const totalCells = rows * cols
    grid = []

    for (let i = 0; i < totalCells; i++) {
        grid.push({
            hidden: true
        })
    }
}


export function clickCell(row: number, col: number ): boolean {
  let index = gridIndex(row, col);

  console.log('clicked on cell at index', index)
  let cell = grid[index]

  if (cell.hidden) {
    cell.hidden = false
    return true
  }

  return false
}



function gridIndex(row: number, col: number): number {
    return gridWidth * row + col
}