import { ctx, H, keys, W, loopStep } from "../main";
import { segmentsIntersect } from "../segment-intersection";
import { drawPaddle, elementsTileW, elementsTileH, PaddleColor, PaddleSize, ballDim, drawBall, drawBrick } from "../tile-renderer";
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

const bricks: BrickInfo[][] = []

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


let brickCollision = false

// collision drawings

let line1X1: number
let line1Y1: number
let line1X2: number
let line1Y2: number

let line2X3: number
let line2Y3: number

let line2X4: number
let line2Y4: number

let pointX: number
let pointY: number

let collidedBrickX: number
let collidedBrickY: number

// END collision drawings

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


        const rowGap = 6
        bricks.push(generateBrickRow(3, 100, 8))
        bricks.push(generateBrickRow(5, 100 + elementsTileH + rowGap, 8))
    },

    update: function (dt: number): void {

        // if (brickCollision) {
        //     return
        // } 
        updatePaddle(paddle, dt)
        updateBall(dt)


        if (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, ball.x, ball.y, ball.w, ball.h)) {
            ball.y = paddle.y - ballDim
            ball.dy = -ball.dy
        }

    },


    draw: function (): void {
        drawPaddle(ctx, paddle.color, paddle.size, paddle.x, paddle.y)
        

        for (const brickRow of bricks) {
            for (const brick of brickRow) {
                drawBrick(ctx, brick.index, brick.x, brick.y)
            }
        }

        drawBall(ctx, ball.index, ball.x, ball.y)

        if (!brickCollision) {

            ctx.strokeStyle = "red"
            ctx.beginPath();
            const ballCenterX = ball.x + ballDim / 2
            const ballCenterY = ball.y + ballDim /2
            const magnitude = 20
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo((ball.x + ball.dx * loopStep * magnitude)  , (ball.y + ball.dy * loopStep * magnitude));
            ctx.stroke();
        }


        if (brickCollision) {

            const magnitude = 20

            line1X1 = ball.x
            line1Y1 = ball.y
            line1X2 = ball.x + ball.dx * loopStep * magnitude
            line1Y2 = ball.y + ball.dy * loopStep * magnitude

            ctx.strokeStyle = "red"
            ctx.strokeRect(collidedBrickX, collidedBrickY, elementsTileW, elementsTileH)

            ctx.strokeStyle = "yellow"
            ctx.beginPath();
            ctx.moveTo(line1X1, line1Y1)
            ctx.lineTo(line1X2, line1Y2)
            ctx.stroke();

            ctx.strokeStyle = "white"
            
            ctx.beginPath();
            ctx.moveTo(line2X3, line2Y3)
            ctx.lineTo(line2X4, line2Y4)
            ctx.stroke();


            ctx.fillStyle = "green"
            ctx.beginPath()
            ctx.arc(pointX, pointY, 2, 0, 2*Math.PI)
            ctx.fill()

            
        }
    },


    processInput: function (): void {

        if (keys["ArrowRight"] != undefined) {
            keys["ArrowRight"] = true
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
            ball.dx = -70
        }

        if (keys["p"] == false) {
            keys["p"] = true
            brickCollision = !brickCollision
            console.log("toggle stop", brickCollision)
        }
    },



    exit: function (): void {
        console.log('exit play')
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

function updateBall(dt: number) {

    if (serveState) {
        ball.x = paddle.x + (paddle.w - ballDim) / 2,
        ball.y = paddle.y - ballDim
        return
    }
    ball.x += ball.dx * dt
    ball.y += ball.dy * dt

    checkCollideBorders()

    // check brick collision
    for (const row of bricks) {
        for (const brick of row) {

            // check for the top left point of the ball

            // check bottom

            line2X3 = brick.x - ballDim
            line2Y3 = brick.y + elementsTileH

            line2X4 = brick.x + elementsTileW
            line2Y4 =  brick.y + elementsTileH

            const bottomIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt, ball.y + ball.dy * dt,
                line2X3, line2Y3, line2X4, line2Y4)

            if (bottomIntersect) {


                pointX = bottomIntersect.x
                pointY = bottomIntersect.y
                console.log("bottom", bottomIntersect)
                brickCollision = true

                collidedBrickX = brick.x
                collidedBrickY = brick.y

                // bounce down
                ball.x = pointX
                ball.y = pointY + 1 // remove collision
                ball.dy = -ball.dy


                return
            }

            // check top
            line2X3 = brick.x - ballDim
            line2Y3 = brick.y - ballDim

            line2X4 = brick.x + elementsTileW
            line2Y4 =  brick.y - ballDim

            const topIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt, ball.y + ball.dy * dt,
                line2X3, line2Y3, line2X4, line2Y4)
                
            if (topIntersect) {

                pointX = topIntersect.x
                pointY = topIntersect.y

                console.log('top', topIntersect)
                brickCollision = true

                collidedBrickX = brick.x
                collidedBrickY = brick.y

                // bounce up
                ball.x = pointX
                ball.y = pointY - 1 // remove collision
                ball.dy = -ball.dy

                return
            }

            
            
            // check left
            line2X3 = brick.x - ballDim
            line2Y3 = brick.y - ballDim

            line2X4 = brick.x - ballDim
            line2Y4 =  brick.y + elementsTileH

            const leftIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt, ball.y + ball.dy * dt,
                line2X3, line2Y3,  line2X4, line2Y4)

            if (leftIntersect) {



                pointX = leftIntersect.x
                pointY = leftIntersect.y

                console.log('left', leftIntersect)
                brickCollision = true

                collidedBrickX = brick.x
                collidedBrickY = brick.y

                // bounce left
                ball.x = pointX - 1 // remove collision
                ball.y = pointY
                ball.dx = -ball.dx

                return
            }

            // check right
                line2X3 = brick.x + elementsTileW
                line2Y3 = brick.y - ballDim

                line2X4 = brick.x + elementsTileW
                line2Y4 =  brick.y + elementsTileH


             const rightIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt, ball.y + ball.dy * dt,
                line2X3, line2Y3,  line2X4, line2Y4)

            if (rightIntersect) {


                pointX = rightIntersect.x
                pointY = rightIntersect.y

                console.log('right', rightIntersect)
                brickCollision = true

                collidedBrickX = brick.x
                collidedBrickY = brick.y

                // bounce right
                ball.x = pointX + 1 // remove collision
                ball.y = pointY 
                ball.dx = -ball.dx

                return
            }
        }
    }
    // no collision detected
    brickCollision = false
}


function checkCollideBorders() {
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


type BrickInfo = {
    x: number,
    y: number,
    life: number,
    index: number
}


function generateBrickRow(n: number, y: number, columnGap: number): BrickInfo[] {
    const res: BrickInfo[] = [];
    const totalW =  (n * elementsTileW) + ((n - 1) * columnGap);

    let x = (W - totalW) / 2

    for (let index = 0; index < n; index++) {

        res.push({
            x,
            y,
            index: 0,
            life: 1
        })

        x += elementsTileW

        if (index < (n - 1)) {
            x += columnGap
        }
        
    }


    return res

}


function ballIntersectsSegment(ballX1: number, ballY1: number, ballX2: number, ballY2: number, x1: number, y1: number, x2: number, y2: number) : {
    diffX: number,
    diffY: number

} | undefined
{
    const intersection = segmentsIntersect(ballX1, ballY1, ballX2, ballY2, x1, y1, x2, y2)

    if (!intersection)  return undefined

    //
}