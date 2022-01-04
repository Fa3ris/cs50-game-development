import { ctx, H, keys, W } from "../main";
import { drawPaddle, elementsTileW, elementsTileH, PaddleColor, PaddleSize, ballDim, drawBall } from "../tile-renderer";
import { State } from "./State";


type Paddle = {
    size: PaddleSize,
    color: PaddleColor,
    w: number,
    h: number,
    x: number,
    y: number
    dx: number


}

let paddle: Paddle

let serveState = true;

type Ball = {
    w: number,
    h: number,
    x: number,
    y: number,
    index: number,
    dx: number,
    dy: number
}
let ball: Ball

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

        ball = {
            x: (W - ballDim) / 2,
            y: paddle.y - ballDim,
            w: ballDim,
            h: ballDim,
            index: 0,
            dx: 0,
            dy: 0
        }
    },

    update: function (dt: number): void {

        updatePaddle(paddle, dt)
        updateBall(ball, dt)


        if (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, ball.x, ball.y, ball.w, ball.h)) {
            ball.y = paddle.y - ballDim
            ball.dy = -ball.dy
        }

    },


    draw: function (): void {
        drawPaddle(ctx, paddle.color, paddle.size, paddle.x, paddle.y)
        drawBall(ctx, ball.index, ball.x, ball.y)

    },


    processInput: function (): void {

        if (keys["ArrowRight"] != undefined) {
            paddle.dx += paddleSpeed
           
        }
        
        if (keys["ArrowLeft"] != undefined) {
            keys["ArrowLeft"] = true // do not process it again
            paddle.dx -= paddleSpeed;
        }

        if (keys[" "] == false && serveState) {
            keys[" "] = true // do not process again
            serveState = false
            const yImpulse = -60
            ball.dy = yImpulse
            const xHalfRange = 25
            ball.dx = -xHalfRange + Math.random() * (xHalfRange * 2)
        }
    },



    exit: function (): void {
        console.log('enter play')
    }
}

function updatePaddle(paddle: Paddle, dt: number) {
    paddle.x += paddle.dx;

    paddle.dx = 0

    if (paddle.x < 0) {
        paddle.x = 0
    }

    if (paddle.x + paddle.w > W) {
        paddle.x = W - paddle.w
    }
}

function updateBall(ball: Ball, dt: number) {

    if (serveState) {
        ball.x = paddle.x + (paddle.w - ballDim) / 2,
        ball.y = paddle.y - ballDim
        return
    }
    ball.x += ball.dx * dt
    ball.y += ball.dy * dt

    // allow ball to bounce off walls
    if (ball.x <= 0) {
        ball.x = 0
        ball.dx = -ball.dx
        // gSounds['wall-hit']:play()
    }

    if (ball.x >= W - ballDim) {

        ball.x = W - ballDim
        ball.dx = -ball.dx
        // gSounds['wall-hit']:play()
    }

    if (ball.y <= 0) {
        ball.y = 0
        ball.dy = -ball.dy
        // gSounds['wall-hit']:play()
    }

}


function collisionAABB(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    const collisionDetected =
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    h1 + y1 > y2;
  return collisionDetected;
}