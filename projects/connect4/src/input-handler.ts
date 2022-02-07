import { addSlot, gridColumns, Rect } from "./grid"
import { activeMouseButtons, mouseP } from "./input"

type ButtonState = {
    isDown: boolean,
    hasTransitioned: boolean
}


let mouseLeftOldState: ButtonState = {
    isDown: false,
    hasTransitioned: false
}
let mouseLeftNewState: ButtonState = {
    isDown: false,
    hasTransitioned: false
}


type DropCommand = {
    column: number
}


type Command = {
    execute: () => void
}


function toCommand(drop: DropCommand): Command {
    return {
        execute: () => {
            console.log(`drop in column ${drop.column}`)

            addSlot(drop.column)
        }
    }
}

export function getCommands(): Command[]
{

    mouseLeftOldState.hasTransitioned = mouseLeftNewState.hasTransitioned
    mouseLeftOldState.isDown = mouseLeftNewState.isDown

    mouseLeftNewState.isDown = activeMouseButtons[0]

    mouseLeftNewState.hasTransitioned = mouseLeftOldState.isDown !== mouseLeftNewState.isDown


    const res: Command[] = []
    if (!mouseLeftNewState.isDown && mouseLeftNewState.hasTransitioned) {

        for (let i = 0; i < gridColumns.length; ++i) {

            if (inRect(mouseP.x, mouseP.y, gridColumns[i])) {

                res.push(toCommand({column: i}))
                break
            }
        }
    }
    

    return res
}


function inRect(x: number, y: number, rect: Rect): boolean {
    return x > rect.x0 && x < rect.x1 && y > rect.y0 && y < rect.y1
}