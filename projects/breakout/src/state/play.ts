import { currentFrame } from "~common/loop";
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

let paddleCollision = false

let paddleAABB = false

// collision drawings

let line1X1: number
let line1Y1: number
let line1X2: number
let line1Y2: number

let line2X3: number
let line2Y3: number

let line2X4: number
let line2Y4: number

// collision point
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


        // values to trigger aabb collision

        paddle.x = 204
        paddle.y = 212
        paddle.dx = 0

        ball.x = 197.16666666666632
        ball.y = 224

        ball.y -= 10

        ball.dx = 70
        ball.dy = 60

        // values to trigger aabb collision

        //  paddle.x = 214
        // paddle.y = 212
        // paddle.dx = 0

        // ball.x = 207.66666666666623
        // ball.y = 226

        // // ball.y -= 10

        // ball.dx = 70
        // ball.dy = 60


        

        serveState = false


        const rowGap = 6
        bricks.push(generateBrickRow(3, 100, 8))
        bricks.push(generateBrickRow(5, 100 + elementsTileH + rowGap, 8))

    },

    update: function (dt: number): void {

        if (brickCollision) {
        //     return
        } 

        if (paddleCollision) {
            // return
        }
        if (paddleAABB) {
            // return
        }

        // console.log('ball update', ball)
        // console.log('paddle update', paddle)

        // debugger

        updatePaddle(paddle, dt)
        updateBall(dt)

        // console.log('ball update after', ball)
        // console.log('paddle update after', paddle)

    },


    draw: function (): void {
        drawPaddle(ctx, paddle.color, paddle.size, paddle.x, paddle.y)
        

        for (const brickRow of bricks) {
            for (const brick of brickRow) {
                drawBrick(ctx, brick.index, brick.x, brick.y)
            }
        }

        drawBall(ctx, ball.index, ball.x, ball.y)

        if (!(brickCollision || paddleCollision || paddleAABB)) {

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
            ctx.strokeStyle = "red"
            ctx.strokeRect(collidedBrickX, collidedBrickY, elementsTileW, elementsTileH)
        }

        if (paddleCollision) {
            ctx.strokeStyle = "red"
            ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h)
        }

        if (paddleAABB) {
            ctx.strokeStyle = "red"
            ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h)


            const magnitude = 1

            line1X1 = capture.x
            line1Y1 = capture.y
            line1X2 = capture.x + capture.dx * loopStep * magnitude
            line1Y2 = capture.y + capture.dy * loopStep * magnitude

            drawBall(ctx, ball.index, capture.x, capture.y)

            ctx.strokeStyle = "pink"
            ctx.beginPath();
            ctx.moveTo(line1X1, line1Y1)
            ctx.lineTo(line1X2, line1Y2)
            ctx.stroke();

            ctx.fillStyle = "aqua"
            ctx.beginPath()
            ctx.arc(line1X2, line1Y2, .5, 0, 2*Math.PI)
            ctx.fill()

            const sideBorderH = paddle.h - ballDim 
            // check left
         line2X3 = paddle.x - ballDim
         line2Y3 = paddle.y - ballDim

         line2X4 = paddle.x - ballDim
         line2Y4 =  paddle.y + sideBorderH

         ctx.strokeStyle = "white"
            
         ctx.beginPath();
         ctx.moveTo(line2X3, line2Y3)
         ctx.lineTo(line2X4, line2Y4)
         ctx.stroke();

        }

        if (brickCollision || paddleCollision) {

            const magnitude = 20

            line1X1 = ball.x
            line1Y1 = ball.y
            line1X2 = ball.x + ball.dx * loopStep * magnitude
            line1Y2 = ball.y + ball.dy * loopStep * magnitude


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

        if (keys["ArrowRight"] != undefined) { // can keep it pressed
            keys["ArrowRight"] = true
            paddle.dx += paddleSpeed
           
        }
        
        if (keys["ArrowLeft"] != undefined) { // can keep it pressed
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
            keys["p"] = true // do not process again
            brickCollision = false
            paddleCollision = false
            paddleAABB = false
            console.log("toggle stop", brickCollision)
        }
    },



    exit: function (): void {
        console.log('exit play')
    }
}

function updatePaddle(paddle: Paddle, dt: number) {
    paddle.x += paddle.dx

    paddle.dx = 0

    if (paddle.x < 0) {
        paddle.x = 0
    }

    if (paddle.x + paddle.w > W) {
        paddle.x = W - paddle.w
    }
}

function updateBall(dt: number) {

    brickCollision = false
    paddleCollision = false
    paddleAABB = false

    if (serveState) {
        ball.x = paddle.x + (paddle.w - ballDim) / 2,
        ball.y = paddle.y - ballDim
        return
    }

    checkCollideBorders()

    // check brick collision -- check only if ball above last row of bricks + some value
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
                console.log("bottom brick", bottomIntersect)
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

                console.log('top brick', topIntersect)
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

                console.log('left brick', leftIntersect)
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

                console.log('right brick', rightIntersect)
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
    
    
    // paddle collision if ball going down -- maybe check y below certain point
    if (ball.dy > 0 && ball.y > paddle.y - ballDim - 1) {

        const lookAhead = 1

        // check top
        line2X3 = paddle.x - ballDim
        line2Y3 = paddle.y - ballDim

        line2X4 = paddle.x + paddle.w
        line2Y4 =  paddle.y - ballDim

        const topIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt * lookAhead, ball.y + ball.dy * dt * lookAhead,
            line2X3, line2Y3, line2X4, line2Y4)
            
        if (topIntersect) {

            pointX = topIntersect.x
            pointY = topIntersect.y

            console.log('top paddle', topIntersect)
            paddleCollision = true


            // bounce up
            ball.x = pointX
            ball.y = pointY - 1 // remove collision
            ball.dy = -ball.dy

            return
        }

        const topIntersectBefore = segmentsIntersect(ball.x, ball.y, ball.x - ball.dx * dt * lookAhead, ball.y - ball.dy * dt * lookAhead,
            line2X3, line2Y3, line2X4, line2Y4)
            
        if (topIntersectBefore) {

            pointX = topIntersectBefore.x
            pointY = topIntersectBefore.y

            console.log('top paddle before', topIntersectBefore)
            paddleCollision = true


            // bounce up
            ball.x = pointX
            ball.y = pointY - 1 // remove collision
            ball.dy = -ball.dy

            return
        }

        const sideBorderH = paddle.h - ballDim 

        // if ball going right
        if (ball.dx > 0) {
         // check left
         line2X3 = paddle.x - ballDim
         line2Y3 = paddle.y - ballDim

         line2X4 = paddle.x - ballDim
         line2Y4 =  paddle.y + sideBorderH

         const leftIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt * lookAhead, ball.y + ball.dy * dt * lookAhead,
             line2X3, line2Y3,  line2X4, line2Y4)

         if (leftIntersect) {


             pointX = leftIntersect.x
             pointY = leftIntersect.y

             console.log('left paddle', leftIntersect)
             paddleCollision = true

             // bounce up left
             ball.x = pointX - 1 // remove collision
             ball.y = pointY
             ball.dx = -Math.abs(ball.dx)
             ball.dy = -ball.dy

             return
         }

         const leftIntersectBefore = segmentsIntersect(ball.x, ball.y, ball.x - ball.dx * dt * lookAhead, ball.y - ball.dy * dt * lookAhead,
            line2X3, line2Y3,  line2X4, line2Y4)

        if (leftIntersectBefore) {


            pointX = leftIntersectBefore.x
            pointY = leftIntersectBefore.y

            console.log('left paddle before', leftIntersectBefore)
            paddleCollision = true

            // bounce up left
            ball.x = pointX - 1 // remove collision
            ball.y = pointY
            ball.dx = -Math.abs(ball.dx)
            ball.dy = -ball.dy

            return
        }
        }

        // if going left
        if (ball.dx < 0) {


         // check right
        line2X3 = paddle.x + paddle.w
        line2Y3 = paddle.y - ballDim

        line2X4 = paddle.x + paddle.w
        line2Y4 =  paddle.y + sideBorderH


        const rightIntersect = segmentsIntersect(ball.x, ball.y, ball.x + ball.dx * dt * lookAhead, ball.y + ball.dy * dt * lookAhead,
            line2X3, line2Y3,  line2X4, line2Y4)

         if (rightIntersect) {


             pointX = rightIntersect.x
             pointY = rightIntersect.y

             console.log('right paddle', rightIntersect)
             paddleCollision = true


             // bounce up right
             ball.x = pointX + 1 // remove collision
             ball.y = pointY 
             ball.dx = Math.abs(ball.dx)
             ball.dy = -ball.dy

             return
         }

         const rightIntersectBefore = segmentsIntersect(ball.x, ball.y, ball.x - ball.dx * dt * lookAhead, ball.y - ball.dy * dt * lookAhead,
            line2X3, line2Y3,  line2X4, line2Y4)

         if (rightIntersectBefore) {


             pointX = rightIntersectBefore.x
             pointY = rightIntersectBefore.y

             console.log('right paddle before', rightIntersectBefore)
             paddleCollision = true


             // bounce up right
             ball.x = pointX + 1 // remove collision
             ball.y = pointY 
             ball.dx = Math.abs(ball.dx)
             ball.dy = -ball.dy

             return
         }
        }

        // last resort - ball is inside paddle but no collision detected before
        if (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, ball.x, ball.y, ball.w, ball.h)) {

            console.log('aabb paddle')
            console.log('paddle', paddle)
            console.log('ball', ball)
            paddleAABB = true
            capture = {
                x: ball.x,
                y: ball.y,
                dx: ball.dx,
                dy: ball.dy
            }

            console.log('capture', capture)

            console.log('resolve aabb', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))

            let  rewind = 0;

            do {
                rewind++
                ball.x -= ball.dx * dt
                ball.y -= ball.dy * dt
            } while (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, ball.x, ball.y, ball.w, ball.h))

            console.log('rewinded', rewind)
            // rewind to not be colliding

            // if ball above and between paddle
            if (ball.y + ball.h <= paddle.y && (ball.x + ball.w >= paddle.x || ball.x <= paddle.x + paddle.w)) {

                console.log('response up', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
                ball.y = paddle.y - ballDim
                ball.dy = -ball.dy

                return
            }


            // if ball on the left
            if (ball.x + ball.w < paddle.x) {

                // go left
                ball.dx = -Math.abs(ball.dx)
                // check if above mid-level -> go up 
                // invert dx
                if (ball.y <= paddle.y + sideBorderH) {
                    ball.dy = -ball.dy
                }
                console.log('response left', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
                return

            }

            // if ball on the right
            if (ball.x > paddle.x + paddle.w) {
                // go right
                ball.dx = Math.abs(ball.dx)

                // check if above mid-level -> go up 
                // invert dx

                if (ball.y <= paddle.y + sideBorderH) {
                    ball.dy = -ball.dy
                }
                console.log('response right', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
                return
            }

            // dead code if ball is saveable 
            if (ball.y <= paddle.y + sideBorderH) {
                ball.y = paddle.y - ballDim
                ball.dy = -ball.dy
                return

            } else {
                console.log("ignore collision")
                // debugger
            }

        }

    }

    ball.x += ball.dx * dt
    ball.y += ball.dy * dt
}

let capture: {
    x: number,
    y: number,
    dx: number,
    dy: number
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