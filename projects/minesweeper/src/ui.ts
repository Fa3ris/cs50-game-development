import { Vector2D } from "~common/geometry"
import { pointIsInQuad } from "./main"


type UIState = {
    // item currently below cursor
    hotItem: number,
    // item on which the cursor was pressed
    activeItem: number,


    cursorPosition: Vector2D

    mouseLeftDown: boolean 
}



export const uiState: UIState = {
    hotItem: 0,
    activeItem: 0,
    mouseLeftDown: false,
    cursorPosition: new Vector2D(0, 0)
}


/**
 * true if button was clicked
 * @param btnId 
 * @param btnX 
 * @param btnY 
 * @param btnW 
 * @param btnH 
 * @returns 
 */
export function doButton(btnId: number, btnX: number, btnY: number, btnW: number, btnH: number): boolean {

    let res: boolean = false
    const cursorInsideButton = pointIsInQuad(uiState.cursorPosition.x, uiState.cursorPosition.y, btnX, btnY, btnW, btnH)
    if (cursorInsideButton) {
        setHot(btnId)
    }

    if (isHot(btnId) && uiState.mouseLeftDown) {

        /* idea for later maybe
        
            if (uiState.mouseLeftDown && uiState.activeItem == 0) { // activate if no other already activated
            
             uiState.activeItem = btnId
            }
            return true
        */
       // TODO: clear mouseLeftDown to avoid process other buttons
       // TODO: keep ordering of element in order of depth
        setActive(btnId)

    } else if (isActive(btnId) && !uiState.mouseLeftDown) {
        clearActive()
        if (isHot(btnId)) {
            res = true
        }
    } 
    
    
    return res
}


export function isHot(id: number): boolean {
    return uiState.hotItem == id
}

function setHot(id: number): void {
    uiState.hotItem = id
}


export function isActive(id: number): boolean {
    return uiState.activeItem == id
}

function setActive(id: number): void {
    uiState.activeItem = id
}


function clearActive(): void {
    uiState.activeItem = 0
}

export function beginFrame(): void {

    clearHot()
}

function clearHot(): void {
    uiState.hotItem = 0
}

type ButtonState = {
    x: number,
    y: number,
    w: number,
    h: number,
    isHot: boolean,
    isActive: boolean
}