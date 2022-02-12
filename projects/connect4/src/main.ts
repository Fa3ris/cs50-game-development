import { adjustCanvasForDisplay } from "~common/canvas-util";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";
import { bgColor, currentPlayer, drawGrid, GameState, gameState, gridColumns, hoverColumn, Player, Rect, setGrid, updateGrid, winner } from "./grid";
import { attach, mouseP } from "./input";
import { getCommands } from "./input-handler";


/* CANVAS */
let W = 432;
let H = 243;


let ctx: CanvasRenderingContext2D

function main () 
{

    ctx = getRenderingContext();
    adjustCanvasForDisplay(ctx, W, H);
    document.querySelector("#root")?.appendChild(ctx.canvas);
    attach(ctx.canvas)


    setGrid(
        20, 10, 
        6, 7,
        700, 500,
        W, H,
        true)
    setDraw(draw)

    setUpdate(update)
    setProcessInput(processInput)

    ctx.fillStyle = bgColor

    start()
}




function processInput() 
{

    if (gameState == GameState.PLAY) {
        const commands = getCommands()

        for (let c of commands) {
            c.execute()
        }
    }

}

function update(dt: number)
{

    if (gameState == GameState.PLAY) {
        for (let i = 0; i < gridColumns.length; ++i) {


            if (inRect(mouseP.x, mouseP.y, gridColumns[i])) {
    
                hoverColumn(i, 'red')
                break
            }
        }
    }

    updateGrid(dt)
}

const DEBUG = false
function draw()
{

    drawGrid(ctx)

    if (DEBUG) {
        ctx.save()
            ctx.strokeStyle = 'pink'
            for (let column of gridColumns) {
                ctx.strokeRect(column.x0, column.y0, Math.abs(column.x1 - column.x0), Math.abs(column.y1 - column.y0) )
            }
        ctx.restore()
    }

    ctx.save()
        ctx.globalCompositeOperation = "destination-over"; // fill over what is not drawn
        ctx.fillRect(0, 0, W, H)
    ctx.restore()

    if (gameState == GameState.WIN) {

        ctx.save()
            ctx.fillStyle = 'black'
            const msg = `${Player[currentPlayer]} wins`
            ctx.fillText(msg, W - ctx.measureText(msg).width - 20, 10)
        ctx.restore()

    } else if (gameState == GameState.DRAW) {
        ctx.save()
        ctx.fillStyle = 'black'
        const msg = `it's a draw`
        ctx.fillText(msg, W - ctx.measureText(msg).width - 20, 10)
    ctx.restore()

    }
}

main()






function getRenderingContext(): CanvasRenderingContext2D {
    let canvas = document.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
    }
  
    const ctx: CanvasRenderingContext2D = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    return ctx;
  }


  function inRect(x: number, y: number, rect: Rect): boolean {
    return x > rect.x0 && x < rect.x1 && y > rect.y0 && y < rect.y1
}

/* 
    TODO

    input handling
        abstract

        what is pressed

        how to add temporality ?

            tree
            queue


    animation tile animation
        animation state machine linked to game login state machine

*/
