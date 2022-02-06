import { adjustCanvasForDisplay } from "~common/canvas-util";
import { setDraw, setProcessInput, setUpdate, start } from "~common/loop";
import { attach } from "./input";

console.log('hello world !!!')


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

    setDraw(draw)

    setUpdate(update)

    start()

    ctx.fillStyle = 'aqua'

}


function update(dt: number)
{

}


function draw()
{

    ctx.fillRect(0, 0, W, H)

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
