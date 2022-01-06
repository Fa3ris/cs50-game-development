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


type CollisionLine = {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

type CollisionPoint = {
    x: number,
    y: number
}

type CollisionInfo = {
    line: CollisionLine,
    point: CollisionPoint
}

let paddleCollisions: {
    top?: CollisionInfo,
    bottom?: CollisionInfo,
    left?: CollisionInfo,
    right?: CollisionInfo
}

let stopPaddleCollision: {
    top?: boolean,
    bottom?: boolean,
    left?: boolean,
    right?: boolean
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

let capturedBallInfo: {
    x: number,
    y: number,
    dx: number,
    dy: number
}

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

        /* DEBUG setup */

        // values to trigger aabb collision

        paddle.x = 204
        paddle.y = 212
        paddle.dx = 0

        ball.x = 197.16666666666632
        ball.y = 150

        ball.y -= 10

        ball.dx = 100
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


        /* DEBUG setup END */


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

        if (paddleCollisions && paddleCollisions.top) {
            
            // console.log('stop on paddle collision top', paddleCollisions.top)
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

            line1X1 = capturedBallInfo.x
            line1Y1 = capturedBallInfo.y
            line1X2 = capturedBallInfo.x + capturedBallInfo.dx * loopStep * magnitude
            line1Y2 = capturedBallInfo.y + capturedBallInfo.dy * loopStep * magnitude

            drawBall(ctx, ball.index, capturedBallInfo.x, capturedBallInfo.y)

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


        if (paddleCollisions) {

         
            let line: CollisionLine | undefined;
            let point: CollisionPoint | undefined;
            
            if (paddleCollisions.top) {
                

                line = paddleCollisions.top.line

                point = paddleCollisions.top.point
            
            }

            if (paddleCollisions.bottom) {

                line = paddleCollisions.bottom.line

                point = paddleCollisions.bottom.point
            
            }
            if (paddleCollisions.left) {

                line = paddleCollisions.left.line

                point = paddleCollisions.left.point
            
            }

            if (paddleCollisions.right) {

                line = paddleCollisions.right.line

                point = paddleCollisions.right.point
            
            }

            if (line && point) {

                ctx.strokeStyle = "red"
                ctx.strokeRect(capturedBallInfo.x, capturedBallInfo.y, ball.w, ball.h)

                const magnitude = 10

                line1X1 = capturedBallInfo.x
                line1Y1 = capturedBallInfo.y
                line1X2 = capturedBallInfo.x + capturedBallInfo.dx * loopStep * magnitude
                line1Y2 = capturedBallInfo.y + capturedBallInfo.dy * loopStep * magnitude
    
                ctx.strokeStyle = "pink"
                ctx.beginPath();
                ctx.moveTo(line1X1, line1Y1)
                ctx.lineTo(line1X2, line1Y2)
                ctx.stroke();

                ctx.strokeStyle = "white"
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1)
                ctx.lineTo(line.x2, line.y2)
                ctx.stroke();
        
        
                ctx.fillStyle = "green"
                ctx.beginPath()
                ctx.arc(point.x, point.y, 2, 0, 2*Math.PI)
                ctx.fill()
            }


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
            paddleCollisions = {}
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

    paddleCollisions = {}

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

            // paddleCollisions = {
            //     top: {
            //         line: {
            //             x1: paddle.x - ballDim,
            //             y1: paddle.y - ballDim,
            //             x2: paddle.x + paddle.w,
            //             y2: paddle.y - ballDim

    
            //         },
            //         point: {
            //             x: topIntersect.x,
            //             y: topIntersect.y
            //         }
            //     }
            // }

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


            // paddleCollisions = {
            //     top: {
            //         line: {
            //             x1: paddle.x - ballDim,
            //             y1: paddle.y - ballDim,
            //             x2: paddle.x + paddle.w,
            //             y2: paddle.y - ballDim

    
            //         },
            //         point: {
            //             x: topIntersectBefore.x,
            //             y: topIntersectBefore.y
            //         }
            //     }
            // }

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


            // paddleCollisions = {
            //     left: {
            //         line: {
            //             x1: paddle.x - ballDim,
            //             y1: paddle.y - ballDim,
            //             x2: paddle.x - ballDim,
            //             y2:  paddle.y + sideBorderH

    
            //         },
            //         point: {
            //             x: leftIntersect.x,
            //             y: leftIntersect.y
            //         }
            //     }
            // }

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


            // paddleCollisions = {
            //     left: {
            //         line: {
            //             x1: paddle.x - ballDim,
            //             y1: paddle.y - ballDim,
            //             x2: paddle.x - ballDim,
            //             y2:  paddle.y + sideBorderH

    
            //         },
            //         point: {
            //             x: leftIntersectBefore.x,
            //             y: leftIntersectBefore.y
            //         }
            //     }
            // }


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


            // paddleCollisions = {
            //     right: {
            //         line: {
            //             x1: paddle.x + paddle.w,
            //             y1: paddle.y - ballDim,
            //             x2: paddle.x + paddle.w,
            //             y2:  paddle.y + sideBorderH

    
            //         },
            //         point: {
            //             x: rightIntersect.x,
            //             y: rightIntersect.y
            //         }
            //     }
            // }

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

            // paddleCollisions = {
            //     right: {
            //         line: {
            //             x1: paddle.x + paddle.w,
            //             y1: paddle.y - ballDim,
            //             x2: paddle.x + paddle.w,
            //             y2:  paddle.y + sideBorderH

    
            //         },
            //         point: {
            //             x: rightIntersectBefore.x,
            //             y: rightIntersectBefore.y
            //         }
            //     }
            // }


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
            console.log('paddle', JSON.stringify(paddle))
            console.log('ball', JSON.stringify(ball))
            // paddleAABB = true
            capturedBallInfo = {
                x: ball.x,
                y: ball.y,
                dx: ball.dx,
                dy: ball.dy
            }

            console.log('capture', capturedBallInfo)

            console.log('resolve aabb', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))


             // number of rewind
             let rewind = 0;

             // find previous position where no collision

             let noCollision : {x: number, y: number} = {
                 x: ball.x,
                 y: ball.y
             }
 
             do {
                 rewind++
                 // ball.x -= ball.dx * dt
                 // ball.y -= ball.dy * dt
                 noCollision.x -= ball.dx * dt
                 noCollision.y -= ball.dy * dt
             } while (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, noCollision.x, noCollision.y, ball.w, ball.h))


             console.log('rewinded', rewind)
             console.log('point of no collision', noCollision)

             line2X3 = paddle.x - ball.w
             line2Y3 =  paddle.y
             line2X4 = paddle.x + paddle.w
             line2Y4 = paddle.y
             const topIntersect = segmentsIntersect(ball.x, ball.y, noCollision.x, noCollision.y,
                line2X3, line2Y3,  line2X4, line2Y4)

            if (topIntersect) {

                paddleCollisions = {
                    top: {
                        line: {
                            x1: line2X3,
                            y1: line2Y3,
                            x2: line2X4,
                            y2: line2Y4
    
        
                        },
                        point: {
                            x: topIntersect.x,
                            y: topIntersect.y
                        }
                    }
                }

                
                console.log('ball intercepted top side')
                const maxDisplacement = 5
                const displacement = Math.abs(topIntersect.x - ball.x)
                const resultDisplacement = Math.min(maxDisplacement, Math.abs(topIntersect.x - ball.x) / 2)
                console.log('displace by', resultDisplacement)

                // rewind
                ball.x += -Math.sign(ball.dx) * resultDisplacement

                // ball.x = (topIntersect.x + ball.x) / 2 // place at middle because if ball entered too much from the side, replace far away -- looks weird
                ball.y = topIntersect.y - ball.h
                ball.dy = -Math.abs(ball.dy) // go up
                return
            }


            line2X3 = paddle.x
            line2Y3 =  paddle.y - ball.h
            line2X4 = paddle.x
            line2Y4 = paddle.y + paddle.h

            const leftIntersect = segmentsIntersect(ball.x, ball.y, noCollision.x, noCollision.y,
                line2X3, line2Y3,  line2X4, line2Y4)

            if (leftIntersect) {

                paddleCollisions = {
                    left: {
                        line: {
                            x1: line2X3,
                            y1: line2Y3,
                            x2: line2X4,
                            y2: line2Y4
        
                        },
                        point: {
                            x: leftIntersect.x,
                            y: leftIntersect.y
                        }
                    }
                }

                console.log('ball intercepted left side')
                ball.x = leftIntersect.x - ball.w
                ball.y = leftIntersect.y

                ball.dx = -Math.abs(ball.dx) // go left

                if (ball.y <= paddle.y + paddle.h /2) { // if saveable
                    ball.dy = -Math.abs(ball.dy) // go up
                }
                return
            }


            line2X3 = paddle.x + paddle.w
            line2Y3 =  paddle.y - ball.h
            line2X4 = paddle.x + paddle.w
            line2Y4 = paddle.y + paddle.h


            const rightIntersect = segmentsIntersect(ball.x, ball.y, noCollision.x, noCollision.y,
                line2X3, line2Y3,  line2X4, line2Y4)

            if (rightIntersect) {

                paddleCollisions = {
                    left: {
                        line: {
                            x1: line2X3,
                            y1: line2Y3,
                            x2: line2X4,
                            y2: line2Y4
        
                        },
                        point: {
                            x: rightIntersect.x,
                            y: rightIntersect.y
                        }
                    }
                }

                console.log('ball intercepted right side')
                ball.x = rightIntersect.x
                ball.y = rightIntersect.y

                ball.dx = Math.abs(ball.dx) // go right

                if (ball.y <= paddle.y + paddle.h /2) { // if saveable
                    ball.dy = -Math.abs(ball.dy) // go up
                }
                return
            }

            console.error()

            // ---------------------------------------

             
            // if (noCollisionY + ball.h <= paddle.h) { // above
            
            //     const topIntersect = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
            // paddle.x, paddle.y,  paddle.x + paddle.w, paddle.y)
            
            // }

            // if (ball.dx >= 0 && noCollisionX + ball.w <= paddle.x) {

            //     const leftIntersect = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
            //         paddle.x, paddle.y,  paddle.x, paddle.y + paddle.y + paddle.h)

            // }

            // if (ball.dx <= 0 && noCollisionX >= paddle.x + paddle.w) {


            //     const rightInterset = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
            //         paddle.x + paddle.w, paddle.y,  paddle.x + paddle.w, paddle.y + paddle.y + paddle.h)

            // }

            //  if (ball.x > paddle.x && ball.x - ball.w <= paddle.x + paddle.w) {
            //     console.log('ball within paddle sides')

            //     if (ball.y + ball.h <= paddle.y) {
            //         console.log('ball has collided on top')
            //     }
            //  }
             // state of no collision



             
            /*

                if ball exceeds lowest point of paddle

                if ball below mid-paddle and between sides - let pass


                if ball below mid-paddle and on left - change dx to show collision but lose anyway
                if ball below mid-paddle and on right - change dx to show collision but lose anyway


                
            */
           /*
            find cases where no resolution needed and let ball fall

                ball within sides but past mid-height
            */
            // if (ball.x > paddle.x && ball.x - ball.w <= paddle.x + paddle.w) {
            //     console.log('ball within paddle sides')

            //     if (ball.y > paddle.y + paddle.h / 2) {
            //         console.log('ball exceeds mid-height - no response')
            //         return
            //     }

                // console.log('begin resolve top collision')

                // // number of rewind
                // let  rewind = 0;

                // // find previous position where no collision
                // let noCollisionX = ball.x;
                // let noCollisionY = ball.y;

                // do {
                //     rewind++
                //     noCollisionX -= ball.dx * dt
                //     noCollisionY -= ball.dy * dt
                // } while (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, noCollisionX, noCollisionY, ball.w, ball.h))

                // console.log('rewinded to resolve top collision', rewind)


                // const topIntersect = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
                //             paddle.x - ball.w, paddle.y,  paddle.x + paddle.w, paddle.y)

                // if (topIntersect) {

                //     ball.x = topIntersect.x
                //     ball.y = paddle.y - ballDim
                //     ball.dy = - Math.abs(ball.dy)

                //     console.log('end resolve top collision', JSON.stringify(ball))
                //     return

                // } else {
                //     console.error('cannot resolve')
                //     return
                // }
            // }




            // if (ball.dx >= 0) {

            // }
            //  // if ball above and between paddle
            //  if (ball.y + ball.h <= paddle.y && (ball.x + ball.w >= paddle.x || ball.x <= paddle.x + paddle.w)) {

            //     console.log('response up', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
            //     ball.y = paddle.y - ballDim
            //     ball.dy = -ball.dy

            //     return
            // }

            // console.log('rewinded', rewind)
            // // rewind to not be colliding


            // if (noCollisionY + ball.h <= paddle.h) { // above
            
            //     const topIntersect = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
            // paddle.x, paddle.y,  paddle.x + paddle.w, paddle.y)
            
            // }

            // if (ball.dx >= 0 && noCollisionX + ball.w <= paddle.x) {

            //     const leftIntersect = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
            //         paddle.x, paddle.y,  paddle.x, paddle.y + paddle.y + paddle.h)

            // }

            // if (ball.dx <= 0 && noCollisionX >= paddle.x + paddle.w) {


            //     const rightInterset = segmentsIntersect(ball.x, ball.y, noCollisionX, noCollisionY,
            //         paddle.x + paddle.w, paddle.y,  paddle.x + paddle.w, paddle.y + paddle.y + paddle.h)

            // }

            // // if ball above and between paddle
            // if (ball.y + ball.h <= paddle.y && (ball.x + ball.w >= paddle.x || ball.x <= paddle.x + paddle.w)) {

            //     console.log('response up', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
            //     ball.y = paddle.y - ballDim
            //     ball.dy = -ball.dy

            //     return
            // }


            // // if ball on the left
            // if (ball.x + ball.w < paddle.x) {

            //     // go left
            //     ball.dx = -Math.abs(ball.dx)
            //     // check if above mid-level -> go up 
            //     // invert dx
            //     if (ball.y <= paddle.y + sideBorderH) {
            //         ball.dy = -ball.dy
            //     }
            //     console.log('response left', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
            //     return

            // }

            // // if ball on the right
            // if (ball.x > paddle.x + paddle.w) {
            //     // go right
            //     ball.dx = Math.abs(ball.dx)

            //     // check if above mid-level -> go up 
            //     // invert dx

            //     if (ball.y <= paddle.y + sideBorderH) {
            //         ball.dy = -ball.dy
            //     }
            //     console.log('response right', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))
            //     return
            // }

            // // dead code if ball is saveable 
            // if (ball.y <= paddle.y + sideBorderH) {
            //     ball.y = paddle.y - ballDim
            //     ball.dy = -ball.dy
            //     return

            // } else {
            //     console.log("ignore collision")
            //     // debugger
            // }

        }

    }

    ball.x += ball.dx * dt
    ball.y += ball.dy * dt
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