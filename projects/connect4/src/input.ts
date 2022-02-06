let attachedElt: HTMLElement


export const activeKeys: { [index: string]: boolean } = {};

export const activeMouseButtons: number[] = []

type MouseP = {
    x: number,
    y: number
}


export function attach(elt: HTMLElement) 
{

    attachedElt = elt

    window.addEventListener('keydown', onKeyDown)

    window.addEventListener('keyup', onKeyUp)

    attachedElt.addEventListener('mousedown', onMouseDown)

    attachedElt.addEventListener('mouseup', onMouseUp)

    attachedElt.addEventListener('mousemove', onMouseMove)

    attachedElt.addEventListener('mouseenter', onMouseEnter)
    attachedElt.addEventListener('mouseleave', onMouseLeave)

    attachedElt.addEventListener('contextmenu', onContextMenu)

}



export function detach()
{
    log('detach')

    window.removeEventListener('keydown', onKeyDown)

    window.removeEventListener('keyup', onKeyUp)

    attachedElt.removeEventListener('mousedown', onMouseDown)

    attachedElt.removeEventListener('mouseup', onMouseUp)

    attachedElt.removeEventListener('mousemove', onMouseMove)

    attachedElt.removeEventListener('contextmenu', onContextMenu)

    Object.keys(activeKeys).forEach(key => {
        activeKeys[key] = false;
    })

    activeMouseButtons.length = 0

    log(activeKeys, activeMouseButtons)

}



function onContextMenu(e: MouseEvent) {
    log('%cprevent context default', 'color:yellow')
    e.preventDefault()
}


function onMouseEnter(e: MouseEvent)
{

    log('mouse enter', e.offsetX, e.offsetY)
}


function onMouseLeave(e: MouseEvent)
{
    log('mouse leave', e.offsetX, e.offsetY)
}


function onMouseUp(e: MouseEvent)
{
    
    log('mouse up', e.offsetX, e.offsetY, 'button', e.button)
    
}


function onMouseDown(e: MouseEvent)
{
    
    log('mouse down', e.offsetX, e.offsetY, 'button', e.button)

}

function onMouseMove(e: MouseEvent) {

    log('mouse move', e.offsetX, e.offsetY)
}


function onKeyDown(e: KeyboardEvent)
{
    log(e.key, 'down')
}

function onKeyUp(e: KeyboardEvent)
{
    log(e.key, 'up')

    if (false && 'p' === e.key) {
        detach()
    }
}


function log(...params: any[])
{
    return
    console.log(...params)
}






