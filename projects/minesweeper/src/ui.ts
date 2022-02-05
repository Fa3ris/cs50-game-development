import { Vector2D } from "~common/geometry"
import { pointIsInQuad } from "./main"


type UIState = {
    // item currently below cursor
    hotItem: number | undefined,
    // item on which the cursor was pressed
    activeItem: number | undefined,


    cursorPosition: Vector2D

    mouseLeftDown: boolean 

    drag: Drag

    // wasDragging: boolean

    // resizing: boolean

    hasActive: boolean

    prevCursorPosition: Vector2D

    hasHot: boolean

    interactions: number,

    activable: boolean,

    pressPosition: Vector2D,

    wentActiveThisFrame: boolean
    resizeSide: ResizeSide | undefined
}

type Drag = Vector2D

type Rect = {
    x0: number,
    y0: number,
    x1: number,
    y1: number
}


export {
    Rect as GUIRect
}


export const uiState: UIState = {
    hotItem: 0,
    activeItem: 0,
    mouseLeftDown: false,
    cursorPosition: new Vector2D(0, 0),
    drag: new Vector2D(0, 0),
    // wasDragging: false,
    // resizing: false,
    hasActive: false,
    prevCursorPosition: new Vector2D(0, 0),
    hasHot: false,
    interactions: 0,

    activable: false,
    pressPosition: new Vector2D(0, 0),
    wentActiveThisFrame: false,

    resizeSide: undefined
}


const pressFlag     = 1
const dragFlag      = 1 << 1
const resizeFlag    = 1 << 2


enum ResizeSide {
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
}


function setFlag(bitField: number, flag: number): number {

    return bitField | flag
}

function checkFlag(bitField: number, flag: number): boolean {

    return (bitField & flag) > 0

}

function unsetFlag(bitField: number, flag: number): number {

    /* 
        bitwise NOT
        for desired bit => bit is unset
            if bit = 1 then 1 & 0 = 0
            if bit = 0 then 0 & 0 = 0

        for other bits => no change
            if bit = 1 then 1 & 1 = 1
            if bit = 0 then 0 & 1 = 0

    */
    return bitField & (~flag)
}

function flipFlag(bitField: number, flag: number): number {

    /* 
        bitwise XOR

        for desired bit => bit is effectively flipped
            if bit = 1 then 1 ^ 1 = 0
            if bit = 0 then 0 ^ 1 = 1

        for other bits => no change
            if bit = 1 then 1 ^ 0 = 1
            if bit = 0 then 0 ^ 0 = 0
 
    */
    return bitField ^ flag
}

/**
 * 
 * @deprecated
 * true if button was clicked
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


/**
 * @deprecated
 */
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
                // uiState.wasDragging = true
            }

        } else {

            // if (uiState.wasDragging) {
                /* prevent button from being clicked if button was dragged */
                disableActive()
                // uiState.wasDragging = false
            // }
        }
    }
    return drag
}

type Shift = number

/**
 * @deprecated
 */
export function resizeXEdgeButton(btnId: number, handleX: number, handleY: number, handleW: number, handleH: number): Shift | undefined {

    const halfW = handleW * .5

     if (doButtonDown(btnId, handleX - halfW, handleY, handleW, handleH)) {

        console.log('active X edge')
    }

    // if (isActive(btnId)) {

    //     if (uiState.mouseLeftDown) {
    //         const shift = uiState.cursorPosition.x - handleX

            
    //         if (shift != 0) {
    //             console.log('shift is', shift)

    //             uiState.wasDragging = true
    //             return shift
    //         }
            
    //     } else {

    //         if (uiState.wasDragging) {
    //             /* prevent button from being clicked if button was dragged */
    //             disableActive()
    //             uiState.wasDragging = false
    //         }
    //     }
    // }

    return undefined

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

function canActivate(id: number): boolean {
    return !hasActive || isActive(id)
}

export function isHot(id: number): boolean {
    return uiState.hotItem == id
}

function setHot(id: number): void {
    uiState.hotItem = id
}


export function isActive(id: number): boolean {
    // TODO see if is Interacting

    if (!uiState.hasActive) {
        return false
    }
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

    uiState.hasHot = false
    uiState.hotItem = undefined
    drawCommands.length = 0
}


export function endFrame(): void {

    uiState.prevCursorPosition.x = uiState.cursorPosition.x
    uiState.prevCursorPosition.y = uiState.cursorPosition.y


    if (uiState.wentActiveThisFrame) {
        uiState.wentActiveThisFrame = false
    }

    if (!uiState.mouseLeftDown) {
        clearActive()

        uiState.hasActive = false
        uiState.activeItem = undefined
    } else {
        /* 
            mouse is down outside of a widget
            if mouse stays down while moving over the element, prevent this element from activating
            by setting a dummy id
        */

        if (!uiState.hasActive) {
            uiState.hasActive = true
        }

        if (!hasActive()) {
            disableActive() // set interacting to NONE
        }
    }
}

/**
 * add a button to draw
 * return true if the button is clicked
 * 
 * handle resizing and moving of the button
 * @param id 
 * @param label text to draw 
 * @param rect 
 * @returns 
 */
export function Button(id: number, label: string, rect: Rect): boolean {
    

    if (inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, rect)) {

        uiState.hasHot = true
        uiState.hotItem = id
    }

    let res = false
    if (uiState.hasHot && uiState.hotItem == id) {

        if (uiState.mouseLeftDown) { // pressed on button

            if (!uiState.hasActive) { // nobody else is active

                log('set active')
                uiState.hasActive = true
                uiState.activeItem = id
                uiState.activable = true // return true when release

                uiState.pressPosition.x = uiState.cursorPosition.x // why ?
                uiState.pressPosition.y = uiState.cursorPosition.y
            }
        }
    }

    if (uiState.hasActive && uiState.activeItem == id) {

        if (!uiState.mouseLeftDown) {

            if (uiState.hasHot && uiState.hotItem == id) {

                console.log('is released inside')
                if (uiState.activable) {
                    res = true
                } else {
                    console.log(`%c ${id} not activable`, "color:red")
                }

            }

            uiState.activable = false
            uiState.hasActive = false
            uiState.activeItem = undefined

            console.log('reset interactions', uiState.interactions)
            console.log('reset rect')
            const x00 = Math.min(rect.x0, rect.x1)
            const y00 = Math.min(rect.y0, rect.y1)
            const x11 = Math.max(rect.x0, rect.x1)
            const y11 = Math.max(rect.y0, rect.y1)

            rect.x0 = x00
            rect.y0 = y00
            rect.x1 = x11
            rect.y1 = y11

            console.log('new rect', rect)
            uiState.interactions = 0
        }
    }


    if (uiState.hasActive && uiState.activeItem == id && !uiState.wentActiveThisFrame) { // we are active

        const mouseMove = new Vector2D(
            uiState.cursorPosition.x - uiState.prevCursorPosition.x,
            uiState.cursorPosition.y - uiState.prevCursorPosition.y)


        if (mouseMove.x != 0 || mouseMove.y != 0) { // cursor moved
            uiState.activable = false


            if (uiState.interactions > 0) {
                log('interacting', uiState.interactions)

                if (checkFlag(uiState.interactions, resizeFlag)) {
                    
                    if (uiState.resizeSide == ResizeSide.TOP_LEFT) {
                        log('continue resizing top left', uiState.interactions)
                        rect.x0 = uiState.cursorPosition.x
                        rect.y0 = uiState.cursorPosition.y

                    } 
                    else if (uiState.resizeSide == ResizeSide.TOP_RIGHT)
                    
                    {
                        log('continue resizing top right', uiState.interactions)
                        rect.x1 = uiState.cursorPosition.x
                        rect.y0 = uiState.cursorPosition.y
                    }

                    else if (uiState.resizeSide == ResizeSide.BOTTOM_LEFT)
                    
                    {
                        log('continue resizing bottom left', uiState.interactions)
                        rect.x0 = uiState.cursorPosition.x
                        rect.y1 = uiState.cursorPosition.y
                    }

                    else if (uiState.resizeSide == ResizeSide.BOTTOM_RIGHT)
                    
                    {

                        log('continue resizing bottom right', uiState.interactions)
                        rect.x1 = uiState.cursorPosition.x
                        rect.y1 = uiState.cursorPosition.y

                    }
                    
                    else if (uiState.resizeSide == ResizeSide.LEFT) {
                        log('continue resizing left', uiState.interactions)
                        rect.x0 = uiState.cursorPosition.x
                    } else if (uiState.resizeSide == ResizeSide.RIGHT) {
                        log('continue resizing right', uiState.interactions)
                        rect.x1 = uiState.cursorPosition.x

                    } else if (uiState.resizeSide == ResizeSide.BOTTOM) {
                        log('continue resizing bottom', uiState.interactions)
                        rect.y1 = uiState.cursorPosition.y
                    } else if (uiState.resizeSide == ResizeSide.TOP) {
                        log('continue resizing top', uiState.interactions)
                        rect.y0 = uiState.cursorPosition.y
                    }
        

                } else if (checkFlag(uiState.interactions, dragFlag)) {

                    log('continue moving', uiState.interactions)
        
                    rect.x0 += mouseMove.x,
                    rect.y0 += mouseMove.y
        
                    rect.x1 += mouseMove.x,
                    rect.y1 += mouseMove.y

                }
            } else {

                const leftHandle: Rect = {
                    x0: rect.x0,
                    y0: rect.y0,
                    x1: rect.x0 + 3,
                    y1: rect.y1
                }


                const rightHandle: Rect = {
                    x0: rect.x1 - 3,
                    y0: rect.y0,
                    x1: rect.x1,
                    y1: rect.y1
                }

                const topHandle: Rect = {
                    x0: rect.x0,
                    y0: rect.y0,
                    x1: rect.x1,
                    y1: rect.y0 + 3
                }

                const bottomHandle: Rect = {
                    x0: rect.x0,
                    y0: rect.y1 - 3,
                    x1: rect.x1,
                    y1: rect.y1
                }

                const topLeftCorner: Rect = {
                    x0: rect.x0,
                    y0: rect.y0,
                    x1: rect.x0 + 4,
                    y1: rect.y0 + 4
                }

                const topRightCorner: Rect = {
                    x0: rect.x1 - 4,
                    y0: rect.y0,
                    x1: rect.x1,
                    y1: rect.y0 + 4
                }

                const bottomLeftCorner: Rect = {
                    x0: rect.x0,
                    y0: rect.y1 - 4,
                    x1: rect.x0 + 4,
                    y1: rect.y1
                }

                const bottomRightCorner: Rect = {
                    x0: rect.x1 - 4,
                    y0: rect.y1 - 4,
                    x1: rect.x1,
                    y1: rect.y1
                }
        
                /* WARN: consider the point where mouse was pressed else 
                   the current mouse position can already be outside of the handle after moving
                 */
                const insideLeftHandle = inRect(uiState.pressPosition.x, uiState.pressPosition.y, leftHandle)
                const insideRightHandle = inRect(uiState.pressPosition.x, uiState.pressPosition.y, rightHandle)
                const insideTopHandle = inRect(uiState.pressPosition.x, uiState.pressPosition.y, topHandle)
                const insideBottomHandle = inRect(uiState.pressPosition.x, uiState.pressPosition.y, bottomHandle)
                
                const insideTopLeft = inRect(uiState.pressPosition.x, uiState.pressPosition.y, topLeftCorner)
                const insideTopRight = inRect(uiState.pressPosition.x, uiState.pressPosition.y, topRightCorner)
                const insideBottomLeft = inRect(uiState.pressPosition.x, uiState.pressPosition.y, bottomLeftCorner)
                const insideBottomRight = inRect(uiState.pressPosition.x, uiState.pressPosition.y, bottomRightCorner)

                if (insideTopLeft)
                {

                    log('resize top left', uiState.interactions)
                    rect.x0 = uiState.cursorPosition.x
                    rect.y0 = uiState.cursorPosition.y

                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.TOP_LEFT

                } 
                else if (insideTopRight)
                {
                    log('resize top right', uiState.interactions)
                    rect.x1 = uiState.cursorPosition.x
                    rect.y0 = uiState.cursorPosition.y

                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.TOP_RIGHT
                } 
                else if (insideBottomLeft)
                {
                    log('resize bottom left', uiState.interactions)
                    rect.x0 = uiState.cursorPosition.x
                    rect.y1 = uiState.cursorPosition.y

                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.BOTTOM_LEFT
                } 
                else if (insideBottomRight)
                {

                    log('resize bottom right', uiState.interactions)
                    rect.x1 = uiState.cursorPosition.x
                    rect.y1 = uiState.cursorPosition.y

                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.BOTTOM_RIGHT

                } 
                else if (insideLeftHandle) { // resize left side
        
        
                    log('resize left', uiState.interactions)
                    rect.x0 = uiState.cursorPosition.x

                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.LEFT
                } else if (insideRightHandle) {
                    log('resize right', uiState.interactions)
                    rect.x1 = uiState.cursorPosition.x


                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.RIGHT

                } else if (insideBottomHandle) {

                    log('resize bottom', uiState.interactions)
                    rect.y1 = uiState.cursorPosition.y


                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.BOTTOM

                } else if (insideTopHandle) {

                    
                    log('resize top', uiState.interactions)
                    rect.y0 = uiState.cursorPosition.y

                    uiState.interactions = setFlag(uiState.interactions, resizeFlag)

                    uiState.resizeSide = ResizeSide.TOP

                } else {  // move
                   
                    log('move')
        
                    rect.x0 += mouseMove.x,
                    rect.y0 += mouseMove.y
        
                    rect.x1 += mouseMove.x,
                    rect.y1 += mouseMove.y

                    uiState.interactions = setFlag(uiState.interactions, dragFlag)
                }

            }

        }

    }

    let color: string;

    if (uiState.hasActive && uiState.activeItem == id) {

        if (uiState.activable) {

            color = 'yellow'
        } else {
            color = 'green'
        }
    } else if (uiState.hasHot && uiState.hotItem == id) {
        color = 'aqua'
    } else {
        color = 'white'
    }

    let buttonCommand: DrawRectCommand = {
        rect,
        color,
        label
    }

    drawCommands.push(buttonCommand)


    if (uiState.hasHot && uiState.hotItem == id && !uiState.hasActive) {

        const leftHandle: Rect = {
            x0: rect.x0,
            y0: rect.y0,
            x1: rect.x0 + 3,
            y1: rect.y1
        }


        const rightHandle: Rect = {
            x0: rect.x1 - 3,
            y0: rect.y0,
            x1: rect.x1,
            y1: rect.y1
        }

        const topHandle: Rect = {
            x0: rect.x0,
            y0: rect.y0,
            x1: rect.x1,
            y1: rect.y0 + 3
        }

        const bottomHandle: Rect = {
            x0: rect.x0,
            y0: rect.y1 - 3,
            x1: rect.x1,
            y1: rect.y1
        }

        const topLeftCorner: Rect = {
            x0: rect.x0,
            y0: rect.y0,
            x1: rect.x0 + 4,
            y1: rect.y0 + 4
        }

        const topRightCorner: Rect = {
            x0: rect.x1 - 4,
            y0: rect.y0,
            x1: rect.x1,
            y1: rect.y0 + 4
        }

        const bottomLeftCorner: Rect = {
            x0: rect.x0,
            y0: rect.y1 - 4,
            x1: rect.x0 + 4,
            y1: rect.y1
        }

        const bottomRightCorner: Rect = {
            x0: rect.x1 - 4,
            y0: rect.y1 - 4,
            x1: rect.x1,
            y1: rect.y1
        }

        const insideTopLeft = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, topLeftCorner)
        const insideTopRight = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, topRightCorner)
        const insideBottomLeft = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, bottomLeftCorner)
        const insideBottomRight = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, bottomRightCorner)

        const insideLeftHandle = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, leftHandle)
        const insideRightHandle = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, rightHandle)
        const insideTopHandle = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, topHandle)
        const insideBottomHandle = inRect(uiState.cursorPosition.x, uiState.cursorPosition.y, bottomHandle)

        if (insideTopLeft)
        {

            console.log('draw top left')
            let handleCommand: DrawRectCommand = {
                rect: topLeftCorner,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)

        } 
        else if (insideTopRight)
        {
            let handleCommand: DrawRectCommand = {
                rect: topRightCorner,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)
        } 
        else if (insideBottomLeft)
        {
            let handleCommand: DrawRectCommand = {
                rect: bottomLeftCorner,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)
        } 
        else if (insideBottomRight)
        {

            let handleCommand: DrawRectCommand = {
                rect: bottomRightCorner,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)

        } 
        else if (insideLeftHandle) {

            let handleCommand: DrawRectCommand = {
                rect: leftHandle,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)

        } else if (insideRightHandle) {

            let handleCommand: DrawRectCommand = {
                rect: rightHandle,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)

        } else if (insideTopHandle) {

            let handleCommand: DrawRectCommand = {
                rect: topHandle,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)

        } else if (insideBottomHandle) {

            let handleCommand: DrawRectCommand = {
                rect: bottomHandle,
                color: 'red',
                label: ''
            }

            drawCommands.push(handleCommand)

        }


    }
    return res

}


export function renderGUI(ctx: CanvasRenderingContext2D): void {

    ctx.save()
    for (let command of drawCommands) {


        ctx.fillStyle = command.color
        ctx.fillRect(command.rect.x0, command.rect.y0, command.rect.x1 - command.rect.x0, command.rect.y1 - command.rect.y0)

        ctx.fillStyle = 'black'
        ctx.fillText(command.label, command.rect.x0, command.rect.y0)
    }

    ctx.restore()
}

type DrawRectCommand = {
    rect: Rect,
    color: string,
    label: string,
}

const drawCommands: DrawRectCommand[] = []

function inRect(x: number, y: number, rect: Rect): boolean {
    return x > rect.x0 && x < rect.x1 && y > rect.y0 && y < rect.y1
}


function clearHot(): void {
    uiState.hotItem = 0
}


let idCounter = 0

export function generateId(): number {
    return ++idCounter
}


function log(...data: any[]): void {
    console.log(...data)

}