import { ctx, H, keys, W } from "../main";
import { drawPaddle, elementsTileW, elementsTileH, PaddleColor, PaddleSize } from "../tile-renderer";
import { State } from "./State";


let paddle: {
    size: PaddleSize,
    color: PaddleColor,
    w: number,
    h: number,
    x: number,
    y: number
    dx: number
}

const paddleSpeed = 10;

export const play: State = {
    enter: function (): void {
        console.log('enter play')
        paddle = {
          size: PaddleSize.MEDIUM,
          color: PaddleColor.BLUE,
          w: PaddleSize.MEDIUM * elementsTileW,
          h: elementsTileH,
          x: (W - PaddleSize.MEDIUM * elementsTileW) / 2,
          y: H - 5 - elementsTileH,
          dx: 0,
        };
    },


    update: function (dt: number): void {

        paddle.x += paddle.dx;

        paddle.dx = 0

        if (paddle.x < 0) {
            paddle.x = 0
           
        }

        if (paddle.x + paddle.w > W) {
            paddle.x = W - paddle.w
        }
    },


    draw: function (): void {
        drawPaddle(ctx, paddle.color, paddle.size, paddle.x, paddle.y)
    },


    processInput: function (): void {

        if (keys["ArrowRight"] != undefined) {
            paddle.dx += paddleSpeed
           
        }
        
        if (keys["ArrowLeft"] != undefined) {
            keys["ArrowLeft"] = true // do not process it again
            paddle.dx -= paddleSpeed;
        }
    },



    exit: function (): void {
        console.log('enter play')
    }
}