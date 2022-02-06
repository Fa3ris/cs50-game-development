import { adjustCanvasForDisplay } from "~common/canvas-util";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";
import { mouseMove } from "~projects/pong/src/game";
import { bgColor, drawGrid, gridColumns, hoverColumn, Rect, setGrid } from "./grid";
import { attach, mouseP } from "./input";


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

    start()

    ctx.fillStyle = bgColor

}


function update(dt: number)
{

    for (let i = 0; i < gridColumns.length; ++i) {


        if (inRect(mouseP.x, mouseP.y, gridColumns[i])) {

            hoverColumn(i, 'red')
            break
        }
    }
}

const DEBUG = false
function draw()
{

    ctx.fillRect(0, 0, W, H)

    drawGrid(ctx)

    if (DEBUG) {
        ctx.save()
            ctx.strokeStyle = 'pink'
            for (let column of gridColumns) {
                ctx.strokeRect(column.x0, column.y0, Math.abs(column.x1 - column.x0), Math.abs(column.y1 - column.y0) )
            }
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
