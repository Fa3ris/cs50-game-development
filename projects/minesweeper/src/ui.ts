import { Vector2D } from "~common/geometry"
import { pointIsInQuad } from "./main"


type UIState = {
    // item currently below cursor
    hotItem: number,
    // item on which the cursor was pressed
    activeItem: number,


    cursorPosition: Vector2D

    mouseLeftDown: boolean 

    drag: Drag

    wasDragging: boolean
}

type Drag = Vector2D


export const uiState: UIState = {
    hotItem: 0,
    activeItem: 0,
    mouseLeftDown: false,
    cursorPosition: new Vector2D(0, 0),
    drag: new Vector2D(0, 0),
    wasDragging: false
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
function doButton(btnId: number, btnX: number, btnY: number, btnW: number, btnH: number): boolean {

    let res: boolean = false
    const cursorInsideButton = pointIsInQuad(uiState.cursorPosition.x, uiState.cursorPosition.y, btnX, btnY, btnW, btnH)
    if (cursorInsideButton) {
        setHot(btnId)

        console.debug('do button hot', btnId, 'hot is', uiState.hotItem)
    }

    if (isHot(btnId) && uiState.mouseLeftDown && !hasActive()) {

        /* idea for later maybe
        
            if (uiState.mouseLeftDown && uiState.activeItem == 0) { // activate if no other already activated
            
             uiState.activeItem = btnId
            }
            return true
        */
       // TODO: clear mouseLeftDown to avoid process other buttons - does not work :(
       // TODO: keep ordering of element in order of depth
        setActive(btnId)

        console.debug('do button active', btnId, 'active is', uiState.hotItem)

    } else if (isActive(btnId) && !uiState.mouseLeftDown) {
        clearActive()
        if (isHot(btnId)) {
            res = true
        }
    } 
    
    
    return res
}


export {
    doButton as buttonClicked
}


export function dragButton(btnId: number, btnX: number, btnY: number, btnW: number, btnH: number): Drag | undefined {

    let drag: Drag | undefined;

    /* cursor pressed down on button */
    /* get inital position */
    if (doButtonDown(btnId, btnX, btnY, btnW, btnH)) {
        /* mouse relative to top-left */
        uiState.drag.x = btnX - uiState.cursorPosition.x
        uiState.drag.y = btnY - uiState.cursorPosition.y
    }

    /* need to maintain that same drag value, if cursor move then btn need to move too */
    if (isActive(btnId)) {

        if (uiState.mouseLeftDown) {
            const expectedBtnX = uiState.drag.x + uiState.cursorPosition.x
            const expectedBtnY = uiState.drag.y + uiState.cursorPosition.y
            
            if (expectedBtnX != btnX || expectedBtnY != btnY) {
                drag = new Vector2D(expectedBtnX, expectedBtnY)
                uiState.wasDragging = true
            }

        } else {

            if (uiState.wasDragging) {
                /* prevent button from being clicked if button was dragged */
                disableActive()
                uiState.wasDragging = false
            }
        }
    }
    return drag
}

/**
 * true if cursor is pressed (not clicked) on button
 */
function doButtonDown(btnId: number, btnX: number, btnY: number, btnW: number, btnH: number): boolean {

    let res: boolean = false
    const cursorInsideButton = pointIsInQuad(uiState.cursorPosition.x, uiState.cursorPosition.y, btnX, btnY, btnW, btnH)
    if (cursorInsideButton) {
        setHot(btnId)
        console.debug('button down hot', btnId, 'hot is', uiState.hotItem)
    }

    if (isHot(btnId) && uiState.mouseLeftDown && !hasActive()) {
        setActive(btnId)
        console.debug('button down active', btnId, 'active is', uiState.activeItem)
        res = true
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

function disableActive(): void {
    setActive(-1)
}

function hasActive(): boolean {
    return uiState.activeItem != 0
}

export function beginFrame(): void {

    clearHot()
}


export function endFrame(): void {

    if (!uiState.mouseLeftDown) {
        clearActive()
    } else {
        /* 
            mouse is down outside of a widget
            if mouse stays down while moving over the element, prevent this element from activating
            by setting a dummy id
        */
        if (!hasActive()) {
            disableActive()
        }
    }
}

function clearHot(): void {
    uiState.hotItem = 0
}


let idCounter = 0

export function generateId(): number {
    return ++idCounter
}