import { AABB, AABB_AABBCollision, SweptAABB_AABBCollision, Vector2D } from "~common/geometry";
import { currentFrame } from "~common/loop";
import { checkAABB_AABB, checkSweptAABB_AABB } from "~projects/collision-detection/src/collision";
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
    dx: number,
    aabb: AABB
}


let paddle: Paddle

let serveState = true;

type BrickInfo = {
    x: number,
    y: number,
    life: number,
    index: number,
    aabb: AABB,
}

const bricks: BrickInfo[][] = []

type Ball = {
    w: number,
    h: number,
    x: number,
    y: number,
    index: number,
    dx: number,
    dy: number,
    aabb: AABB
}

let ball: Ball

const paddleSpeed = 10;


/* collision drawings */

let brickCollision = false

let paddleCollision = false

let paddleAABBCollision = false

let capturedBallInfo: {
    x: number,
    y: number,
    dx: number,
    dy: number
}

let paddlePreviousInfo: {
    x: number,
    y: number,
    dx: number,
}

const ballHistory: {
    x: number,
    y: number
}[] = []

const debugPlay = true;

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

/* END collision drawings */


const borderPadding = 10
let topBorderAABB:AABB
let bottomBorderAABB :AABB
let leftBorderAABB :AABB
let rightBorderAABB:AABB



export const play: State = {
    enter: function (): void {
        console.log('enter play')
        const paddleW =  PaddleSize.MEDIUM * elementsTileW
        const paddleX =  (W - paddleW) / 2
        const paddleY =  H - 5 - elementsTileH
        paddle = {
          size: PaddleSize.MEDIUM,
          color: PaddleColor.BLUE,
          w: paddleW,
          h: elementsTileH,
          x: paddleX,
          y: paddleY,
          dx: 0,
          aabb: new AABB(paddleX, paddleY, paddleW, elementsTileH)
        };

        const ballX = (W - ballDim) / 2
        const ballY = paddle.y - ballDim
        ball = {
            x: ballX,
            y: paddle.y - ballDim,
            w: ballDim,
            h: ballDim,
            index: 0,
            dx: 0,
            dy: 0,
            aabb: new AABB(ballX, ballY, ballDim, ballDim)
        }

        const rowGap = 6
        bricks.push(generateBrickRow(3, 100, 8))
        bricks.push(generateBrickRow(5, 100 + elementsTileH + rowGap, 8))

        topBorderAABB = new AABB(0, -borderPadding, W, borderPadding)
        bottomBorderAABB = new AABB(0, H, W, borderPadding)
        leftBorderAABB = new AABB(-borderPadding, 0, borderPadding, H)
        rightBorderAABB = new AABB(W, 0, borderPadding, H)

        if (debugPlay) {
            // values to trigger aabb collision

            paddle.x = 204
            paddle.y = 212
            paddle.dx = 0
    
            ball.x = 197.16666666666632
            ball.y = 150
    
            ball.y -= 10
    
            ball.dx = 100
            ball.dy = 60

            serveState = false

             /* values to trigger aabb collision

            paddle.x = 214
            paddle.y = 212
            paddle.dx = 0

            ball.x = 207.66666666666623
            ball.y = 226

            // ball.y -= 10

            ball.dx = 70
            ball.dy = 60 
        */
        }
    },

    update: function (dt: number): void {

        if (debugPlay) {

            if (brickCollision) {
                // return
            } 
    
            if (paddleCollision) {
                // return
            }
            if (paddleAABBCollision) {
                // return
            }

            if (paddleCollisions && paddleCollisions.top) {
                // console.log('stop on paddle collision top', paddleCollisions.top)
                // return
            }
            // console.log('ball update', ball)
            // console.log('paddle update', paddle)
            
            if (paddleCollisions && Object.keys(paddleCollisions).length > 0) {
                return
            }
        }


        updatePaddle(paddle, dt)
        updateBall(dt)

        if (debugPlay) {
            // console.log('ball update after', ball)
            // console.log('paddle update after', paddle)
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

        if (debugPlay) {
            if (!(brickCollision || paddleCollision || paddleAABBCollision)) {
    
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


            if (paddleAABBCollision) {
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

                    ctx.strokeStyle = "white"
                    ctx.beginPath();
                    ctx.moveTo(line.x1, line.y1)
                    ctx.lineTo(line.x2, line.y2)
                    ctx.stroke();
            
                    ctx.fillStyle = "green"
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 1, 0, 2*Math.PI)
                    ctx.fill()
                }
                if (paddleCollisions.bottom) {
                    line = paddleCollisions.bottom.line
                    point = paddleCollisions.bottom.point

                    ctx.strokeStyle = "white"
                    ctx.beginPath();
                    ctx.moveTo(line.x1, line.y1)
                    ctx.lineTo(line.x2, line.y2)
                    ctx.stroke();
            
                    ctx.fillStyle = "green"
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 1, 0, 2*Math.PI)
                    ctx.fill()
                }
                if (paddleCollisions.left) {
                    line = paddleCollisions.left.line
                    point = paddleCollisions.left.point

                    ctx.strokeStyle = "white"
                    ctx.beginPath();
                    ctx.moveTo(line.x1, line.y1)
                    ctx.lineTo(line.x2, line.y2)
                    ctx.stroke();
            
                    ctx.fillStyle = "green"
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 1, 0, 2*Math.PI)
                    ctx.fill()
                }
                if (paddleCollisions.right) {
                    line = paddleCollisions.right.line
                    point = paddleCollisions.right.point

                    ctx.strokeStyle = "white"
                    ctx.beginPath();
                    ctx.moveTo(line.x1, line.y1)
                    ctx.lineTo(line.x2, line.y2)
                    ctx.stroke();
            
                    ctx.fillStyle = "green"
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 1, 0, 2*Math.PI)
                    ctx.fill()
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
    

                    ctx.strokeStyle = "rgba(0, 255, 0, .5)"
                    ctx.strokeRect(paddlePreviousInfo.x, paddlePreviousInfo.y, paddle.w, paddle.h)

                    ctx.strokeStyle = "rgba(245, 40, 145, 1)"
                    ctx.beginPath();
                    ctx.moveTo(paddlePreviousInfo.x, paddlePreviousInfo.y)
                    ctx.lineTo(paddlePreviousInfo.x + paddlePreviousInfo.dx, paddlePreviousInfo.y)
                    ctx.stroke();

                    for (const entry of ballHistory) {

                        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
                        ctx.strokeRect(entry.x, entry.y, ball.w, ball.h)
                        
                    }
                }
            }
        }
    },

    /**
     * called only if has key
     */
    processInput: function (): void {

        if (keys["ArrowRight"] != undefined) { // can keep it pressed
            keys["ArrowRight"] = true
            paddle.dx += paddleSpeed
           
        }
        
        if (keys["ArrowLeft"] != undefined) { // can keep it pressed
            keys["ArrowLeft"] = true // do not process it again
            paddle.dx -= paddleSpeed;
        }

        if (keys[" "] == false && serveState) { // serve
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
            paddleAABBCollision = false
            paddleCollisions = {}
            console.log("toggle stop", brickCollision)
        }
    },

    exit: function (): void {
        console.log('exit play')
    }
}

let paddleMoveX: number

function updatePaddle(paddle: Paddle, dt: number) {

    paddlePreviousInfo = {
        x: paddle.x,
        y: paddle.y,
        dx: paddle.dx
    }

    paddleMoveX = paddle.dx
    paddle.dx = 0

    paddle.x += paddleMoveX

    if (paddle.x < 0) {
        paddle.x = 0
    }

    if (paddle.x + paddle.w > W) {
        paddle.x = W - paddle.w
    }
}

function updateBall(dt: number) {

    paddleCollisions = {}

    ballHistory.length = 0

    brickCollision = false
    paddleCollision = false
    paddleAABBCollision = false

    capturedBallInfo = {
        x: ball.x,
        y: ball.y,
        dx: ball.dx,
        dy: ball.dy
    }

    if (serveState) {
        ball.x = paddle.x + (paddle.w - ball.w) / 2,
        ball.y = paddle.y - ball.h
        return
    }

    checkCollideBorders()

    if (checkCollideBricks(dt) == true) { return }
    

    // paddle collision if ball going down
    // ball.y + ball.h > paddle.y - 1
    if (ball.dy > 0) {

        if (ballPaddleSegmentIntersection(dt) == true) { return }

        if (ballPaddleAABBCollisionBackStep(dt) == true) { 
            
            let ballSpeed = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2))

            if (ballSpeed > 200) {
                console.log('throttle ball speed after backstep collision')

                ball.dx = (ball.dx / ballSpeed) * 200 
                ball.dy = (ball.dy / ballSpeed) * 200 
            }
            return 
        
        }
    }

    ball.x += ball.dx * dt
    ball.y += ball.dy * dt


    let ballSpeed = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2))

    if (ballSpeed > 200) {
        console.log('throttle ball speed')

        ball.dx = (ball.dx / ballSpeed) * 200 
        ball.dy = (ball.dy / ballSpeed) * 200 
    }
}


function ballPaddleAABBCollisionBackStep(dt: number): boolean {

    if (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, ball.x, ball.y, ball.w, ball.h)) {

        console.log('aabb paddle backstep', currentFrame)
        console.log('paddle', JSON.stringify(paddle), "ball", JSON.stringify(ball))

        if (paddleMoveX == 0) {
            console.log('cannot rewind - paddle did not move', paddleMoveX)
            return false
        }
        
        let paddlePositionXWithNoCollision = paddle.x
        let backStep = 0
        let moveToRewind = paddleMoveX / 4
        do {
            paddlePositionXWithNoCollision -= moveToRewind
            backStep++
        } while (collisionAABB(paddlePositionXWithNoCollision, paddle.y, paddle.w, paddle.h,
             ball.x, ball.y, ball.w, ball.h))

        console.log('backstepped', backStep)
        

        if (ball.x + ball.w <= paddlePositionXWithNoCollision) { // on the left

            paddle.x = paddlePositionXWithNoCollision
            console.log('ball intercepted left side')
            ball.x =  paddlePositionXWithNoCollision - ball.w - 1
            ball.dx = -Math.abs(ball.dx) * 1.5 // go left

            if (ball.y <= paddle.y + paddle.h /2) { // if saveable
                ball.dy = -Math.abs(ball.dy) // go up
            } else {
                ball.y = paddle.y + paddle.h + 1
                console.log("right side but not saveable", "ball",  JSON.stringify(ball))
            }

            ball.dy *= 1.2
            paddle.x -= paddleMoveX

            return true
        }

        if (ball.x >= paddlePositionXWithNoCollision + paddle.w) { // on the right

            paddle.x = paddlePositionXWithNoCollision

            console.log('ball intercepted right side')

            ball.x =  paddlePositionXWithNoCollision + paddle.w + 1
            ball.dx = Math.abs(ball.dx) * 1.5 // go right

            if (ball.y <= paddle.y + paddle.h /2) { // if saveable
                ball.dy = -Math.abs(ball.dy) // go up
            } else {
                ball.y = paddle.y + paddle.h + 1
                console.log("right side but not saveable", "ball",  JSON.stringify(ball))
            }

            ball.dy *= 1.2
            paddle.x -= paddleMoveX

            return true
        }

        console.error("canno resolve with backtracking paddle")
    }

    return false
}

function ballPaddleAABBCollision(dt: number): boolean {

    // last resort - ball is inside paddle but no collision detected before
    if (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h, ball.x, ball.y, ball.w, ball.h)) {

        console.log('aabb paddle')
        console.log('paddle', JSON.stringify(paddle))
        console.log('ball', JSON.stringify(ball))
        // paddleAABB = true
        

        console.log('capture', capturedBallInfo)

        console.log('resolve aabb', currentFrame, JSON.stringify(ball), JSON.stringify(paddle))

        /* find previous position where no collision */
        
         let rewindNb = 0;

         let noCollisionBallPoint : {x: number, y: number} = {
             x: ball.x,
             y: ball.y
         }

         do {
             rewindNb++
             noCollisionBallPoint.x -= ball.dx * dt
             noCollisionBallPoint.y -= ball.dy * dt
             ballHistory.push({
                 x: noCollisionBallPoint.x,
                 y: noCollisionBallPoint.y
             })
         } while (collisionAABB(paddle.x, paddle.y, paddle.w, paddle.h,
             noCollisionBallPoint.x, noCollisionBallPoint.y, ball.w, ball.h))


        console.log('rewinded', rewindNb)
        console.log('point of no collision', noCollisionBallPoint)

        /* check if segment intersects with TOP */

        line2X3 = paddle.x - ball.w
        line2Y3 = paddle.y
        line2X4 = paddle.x + paddle.w
        line2Y4 = paddle.y
        const topIntersect = segmentsIntersect(ball.x, ball.y, noCollisionBallPoint.x, noCollisionBallPoint.y,
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
            const resultDisplacement = Math.min(maxDisplacement, Math.abs(topIntersect.x - ball.x) / 2)
            console.log('displace by', resultDisplacement)

            // rewind
            ball.x += -Math.sign(ball.dx) * resultDisplacement

            // ball.x = (topIntersect.x + ball.x) / 2 // place at middle because if ball entered too much from the side, replace far away -- looks weird
            ball.y = topIntersect.y - ball.h
            ball.dy = -Math.abs(ball.dy) // go up
            return true
        }

        /* check if segment intersects with LEFT */

        line2X3 = paddle.x
        line2Y3 = paddle.y - ball.h
        line2X4 = paddle.x
        line2Y4 = paddle.y + paddle.h

        const leftIntersect = segmentsIntersect(ball.x, ball.y, noCollisionBallPoint.x, noCollisionBallPoint.y,
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
            } else {
                console.log("left side but not saveable", "ball",  JSON.stringify(ball))
            }
            return true
        }


        /* check if segment intersects with RIGHT */

        line2X3 = paddle.x + paddle.w
        line2Y3 = paddle.y - ball.h
        line2X4 = paddle.x + paddle.w
        line2Y4 = paddle.y + paddle.h
        const rightIntersect = segmentsIntersect(ball.x, ball.y, noCollisionBallPoint.x, noCollisionBallPoint.y,
            line2X3, line2Y3,  line2X4, line2Y4)

        if (rightIntersect) {

            paddleCollisions = {
                right: {
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
            } else {
                console.log("right side but not saveable", "ball",  JSON.stringify(ball))
            }
            return true
        }

        paddleCollisions = {
            right: {
                line: {
                    x1: line2X3,
                    y1: line2Y3,
                    x2: line2X4,
                    y2: line2Y4

                },
                point: {
                    x: 0,
                    y: 0
                }
            },

            top: {
                line: {
                    x1: paddle.x - ball.w,
                    y1: paddle.y,
                    x2: paddle.x + paddle.w,
                    y2: paddle.y

                },
                point: {
                    x: 0,
                    y: 0
                }
            },


            left: {
                line: {
                    x1: paddle.x,
                    y1: paddle.y - ball.h,
                    x2: paddle.x,
                    y2: paddle.y + paddle.h

                },
                point: {
                    x: 0,
                    y: 0
                }
            }
        }

        console.error("could not resolve collision", "ball", JSON.stringify(ball), "paddle", JSON.stringify(paddle))
        
    }

    return false
}

function ballPaddleSegmentIntersection(dt: number): boolean {

    const lookAhead = 1

    const lookAheadDistX = ball.dx * dt * lookAhead
    const lookAheadDistY = ball.dy * dt * lookAhead

    // check top
    line2X3 = paddle.x - ballDim
    line2Y3 = paddle.y - ballDim

    line2X4 = paddle.x + paddle.w
    line2Y4 =  paddle.y - ballDim

    const topIntersect = segmentsIntersect(ball.x, ball.y, ball.x + lookAheadDistX, ball.y + lookAheadDistY,
        line2X3, line2Y3, line2X4, line2Y4)
        
    if (topIntersect) {

        paddleCollisions = {
            top: {
                line: {
                    x1: paddle.x - ballDim,
                    y1: paddle.y - ballDim,
                    x2: paddle.x + paddle.w,
                    y2: paddle.y - ballDim


                },
                point: {
                    x: topIntersect.x,
                    y: topIntersect.y
                }
            }
        }

        pointX = topIntersect.x
        pointY = topIntersect.y

        console.log('top paddle', topIntersect)
        paddleCollision = true


        // bounce up
        ball.x = pointX
        ball.y = pointY - 1 // remove collision
        ball.dy = -ball.dy

        return true
    }

    const topIntersectBefore = segmentsIntersect(ball.x, ball.y, ball.x - lookAheadDistX, ball.y - lookAheadDistY,
        line2X3, line2Y3, line2X4, line2Y4)
        
    if (topIntersectBefore) {

        pointX = topIntersectBefore.x
        pointY = topIntersectBefore.y


        paddleCollisions = {
            top: {
                line: {
                    x1: paddle.x - ballDim,
                    y1: paddle.y - ballDim,
                    x2: paddle.x + paddle.w,
                    y2: paddle.y - ballDim


                },
                point: {
                    x: topIntersectBefore.x,
                    y: topIntersectBefore.y
                }
            }
        }

        console.log('top paddle before', topIntersectBefore)
        paddleCollision = true


        // bounce up
        ball.x = pointX
        ball.y = pointY - 1 // remove collision
        ball.dy = -ball.dy

        return true
    }

    const sideBorderH = paddle.h - ball.h

    // if ball going right
    if (ball.dx > 0) {
        // check left
        line2X3 = paddle.x - ballDim
        line2Y3 = paddle.y - ballDim

        line2X4 = paddle.x - ballDim
        line2Y4 =  paddle.y + sideBorderH

        const leftIntersect = segmentsIntersect(ball.x, ball.y, ball.x + lookAheadDistX, ball.y + lookAheadDistY,
            line2X3, line2Y3,  line2X4, line2Y4)

        if (leftIntersect) {

            paddleCollisions = {
                left: {
                    line: {
                        x1: paddle.x - ballDim,
                        y1: paddle.y - ballDim,
                        x2: paddle.x - ballDim,
                        y2:  paddle.y + sideBorderH

    
                    },
                    point: {
                        x: leftIntersect.x,
                        y: leftIntersect.y
                    }
                }
            }

            pointX = leftIntersect.x
            pointY = leftIntersect.y

            console.log('left paddle', leftIntersect)
            paddleCollision = true

            // bounce up left
            ball.x = pointX - 1 // remove collision
            ball.y = pointY
            ball.dx = -Math.abs(ball.dx)
            ball.dy = -ball.dy

            return true
        }

        const leftIntersectBefore = segmentsIntersect(ball.x, ball.y, ball.x - lookAheadDistX, ball.y - lookAheadDistY,
            line2X3, line2Y3,  line2X4, line2Y4)

        if (leftIntersectBefore) {

            paddleCollisions = {
                left: {
                    line: {
                        x1: paddle.x - ballDim,
                        y1: paddle.y - ballDim,
                        x2: paddle.x - ballDim,
                        y2:  paddle.y + sideBorderH

    
                    },
                    point: {
                        x: leftIntersectBefore.x,
                        y: leftIntersectBefore.y
                    }
                }
            }


            pointX = leftIntersectBefore.x
            pointY = leftIntersectBefore.y

            console.log('left paddle before', leftIntersectBefore)
            paddleCollision = true

            // bounce up left
            ball.x = pointX - 1 // remove collision
            ball.y = pointY
            ball.dx = -Math.abs(ball.dx)
            ball.dy = -ball.dy

            return true
        }
    }

    // if going left
    if (ball.dx < 0) {


        // check right
        line2X3 = paddle.x + paddle.w
        line2Y3 = paddle.y - ballDim

        line2X4 = paddle.x + paddle.w
        line2Y4 =  paddle.y + sideBorderH


        const rightIntersect = segmentsIntersect(ball.x, ball.y, ball.x + lookAheadDistX, ball.y + lookAheadDistY,
            line2X3, line2Y3,  line2X4, line2Y4)

        if (rightIntersect) {


            paddleCollisions = {
                right: {
                    line: {
                        x1: paddle.x + paddle.w,
                        y1: paddle.y - ballDim,
                        x2: paddle.x + paddle.w,
                        y2:  paddle.y + sideBorderH

    
                    },
                    point: {
                        x: rightIntersect.x,
                        y: rightIntersect.y
                    }
                }
            }

            pointX = rightIntersect.x
            pointY = rightIntersect.y

            console.log('right paddle', rightIntersect)
            paddleCollision = true


            // bounce up right
            ball.x = pointX + 1 // remove collision
            ball.y = pointY 
            ball.dx = Math.abs(ball.dx)
            ball.dy = -ball.dy

            return true
        }

        const rightIntersectBefore = segmentsIntersect(ball.x, ball.y, ball.x - lookAheadDistX, ball.y - lookAheadDistY,
            line2X3, line2Y3,  line2X4, line2Y4)

        if (rightIntersectBefore) {

            paddleCollisions = {
                right: {
                    line: {
                        x1: paddle.x + paddle.w,
                        y1: paddle.y - ballDim,
                        x2: paddle.x + paddle.w,
                        y2:  paddle.y + sideBorderH

    
                    },
                    point: {
                        x: rightIntersectBefore.x,
                        y: rightIntersectBefore.y
                    }
                }
            }


            pointX = rightIntersectBefore.x
            pointY = rightIntersectBefore.y

            console.log('right paddle before', rightIntersectBefore)
            paddleCollision = true


            // bounce up right
            ball.x = pointX + 1 // remove collision
            ball.y = pointY 
            ball.dx = Math.abs(ball.dx)
            ball.dy = -ball.dy

            return true
        }
    }

    return false

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

function checkCollideBricks(dt: number): boolean {

    // check for the top left point of the ball
     for (const row of bricks) {
        for (const brick of row) {

            /* check BOTTOM */
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

                return true
            }

            /* check TOP */
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

                return true
            }
            
            /*  check LEFT */
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

                return true
            }

            /* check RIGHT */
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

                return true
            }
        }
    }

    return false
}


function collisionAABB(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    const collisionDetected =
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    h1 + y1 > y2;
  return collisionDetected;
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
            life: 1,
            aabb: new AABB(x, y, elementsTileW, elementsTileH)
        })

        x += elementsTileW

        if (index < (n - 1)) {
            x += columnGap
        }
        
    }
    return res
}


function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
}


// FIXME: does not work :(
function updateV2(dt: number) {

    if (serveState) {

        paddle.x += paddle.dx
        if (paddle.dx != 0) {
            // console.log("move paddle", paddle.dx)
        }
        paddleMoveX = paddle.dx
        paddle.dx = 0
    
        if (paddle.x < 0) {
            paddle.x = 0
        }
    
        if (paddle.x + paddle.w > W) {
            paddle.x = W - paddle.w
        }

        ball.x = paddle.x + (paddle.w - ball.w) / 2,
        ball.y = paddle.y - ball.h
        return
    }


    ball.aabb.setX(ball.x)
    ball.aabb.setY(ball.y)

    // console.log('ball init state', JSON.stringify(ball))

    let ballDx = ball.dx * dt
    let ballDy = ball.dy * dt

    const ballMove = new Vector2D(ballDx, ballDy)

    const topCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  topBorderAABB)

    if (topCollision) {
        
        ballDx *= topCollision.tMin
        ballDy *= topCollision.tMin

        ball.x += ballDx
        // ball.y += ballDy

        ball.y = 1e-8

        // if (topCollision.normal.x != 0) {
            
        //     ball.dx = Math.sign(topCollision.normal.x) * Math.abs(ball.dx)
        // }

        ball.dy = Math.abs(ball.dy)
        // if (topCollision.normal.y != 0) {
        // }

        console.log('resolved top collision', 'ball', ball, 'collision', topCollision)
        return
    }
    const bottomCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  bottomBorderAABB)

    if (bottomCollision) {
        ballDx *= bottomCollision.tMin
        ballDy *= bottomCollision.tMin

        ball.x += ballDx
        ball.y += ballDy

        ball.y = H - ball.h - 1e-8

        ball.dy = -Math.abs(ball.dy)
        // if (bottomCollision.normal.x != 0) {
        //     ball.dx = Math.sign(bottomCollision.normal.x) * Math.abs(ball.dx)
        // }

        // if (bottomCollision.normal.y != 0) {
            
        // }

        console.log('resolved bottom collision', 'ball', ball, 'collision', bottomCollision)
        return

    }
    const leftCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  leftBorderAABB)

    if (leftCollision) {
        ballDx *= leftCollision.tMin
        ballDy *= leftCollision.tMin

        ball.x += ballDx
        ball.y += ballDy

        ball.x = 1e-8

        ball.dx = Math.abs(ball.dx)
        // if (leftCollision.normal.x != 0) {
        //     ball.dx = Math.sign(leftCollision.normal.x) * Math.abs(ball.dx)
        // }

        // if (leftCollision.normal.y != 0) {
        //     ball.dy = Math.sign(leftCollision.normal.y) * Math.abs(ball.dy)
        // }

        console.log('resolved left collision', 'ball', ball, 'collision', leftCollision)
        return
    }
    const rightCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  rightBorderAABB)
    if (rightCollision) {
        ballDx *= rightCollision.tMin
        ballDy *= rightCollision.tMin

        ball.x += ballDx
        ball.y += ballDy

        ball.x = W - ball.w - 1e-8

        ball.dx = -Math.abs(ball.dx)

        // if (rightCollision.normal.x != 0) {
        //     ball.dx = Math.sign(rightCollision.normal.x) * Math.abs(ball.dx)
        // }

        // if (rightCollision.normal.y != 0) {
        //     ball.dy = Math.sign(rightCollision.normal.y) * Math.abs(ball.dy)
        // }

        console.log('resolved right collision', 'ball', ball, 'collision', rightCollision)
        return
    }


    ball.x += ballDx
    ball.y += ballDy

    paddle.x += paddle.dx
    if (paddle.dx != 0) {
    }
    paddleMoveX = paddle.dx
    paddle.dx = 0

    if (paddle.x < 0) {
        paddle.x = 0
    }

    if (paddle.x + paddle.w > W) {
        paddle.x = W - paddle.w
    }

    return

     /*
        check if colliding ball - each brick
                            ball - paddle
                            ball - borders
        
        gather all collisions - resolve them all

        check if moving ball will collide - brick
                                            - moving (or not) paddle

        what can really be colliding is the ball
            recursive check ball colliding with entities
                check if ball colliding with one entity
                    resolve collision and update ball direction
                    call check ball colliding with entities


        finally check ball borders - and reset

        */

    /* STATIC COLLISIONS */

    // const aabbCollisions: AABB_AABBCollision[] = []


    

    // const staticBallPaddleCollision = checkAABB_AABB(ball.aabb, paddle.aabb)

    // if (staticBallPaddleCollision) {
    //     aabbCollisions.push(staticBallPaddleCollision)
    // }

    // for (const row of bricks) {
    //     for (const brick of row) {
    //         const ballBrickCollision = checkAABB_AABB(ball.aabb, brick.aabb)
    //         if (ballBrickCollision) {
    //             aabbCollisions.push(ballBrickCollision)
    //         }
    //     }
    // }

    // if (ball.x <= 0) {
    //     ball.x = 0
    //     ball.dx = Math.abs(ball.dx)
    //     const leftBorderCollision: AABB_AABBCollision = {
    //         normal: new Vector2D(10, 0),
    //         resolvedColliderPosition: new Vector2D(0, ball.y)
    //     }
    //     aabbCollisions.push(leftBorderCollision)
    // }

    // if (ball.x >= W - ballDim) {
    //     ball.x = W - ballDim
    //     ball.dx = -Math.abs(ball.dx)
    //     const rightBorderCollision: AABB_AABBCollision = {
    //         normal: new Vector2D(-10, 0),
    //         resolvedColliderPosition: new Vector2D(W - ballDim, ball.y)
    //     }
    //     aabbCollisions.push(rightBorderCollision)
    // }

    // if (ball.y <= 0) {
    //     ball.y = 0
    //     ball.dy = -Math.abs(ball.dy)
    //     const topBorderCollision: AABB_AABBCollision = {
    //         normal: new Vector2D(0, -10),
    //         resolvedColliderPosition: new Vector2D(ball.x, 0)
    //     }
    //     aabbCollisions.push(topBorderCollision)
    // }

    // if (aabbCollisions.length > 0) {
    //     console.log(`resolving ${aabbCollisions.length} static collisions`, aabbCollisions)

    //     const resultantNormal = new Vector2D(0, 0)
    //     const resultantPosition = new Vector2D(0, 0)

    //     for (const staticCollision of aabbCollisions) {
    //         resultantNormal.x += staticCollision.normal.x
    //         resultantNormal.y += staticCollision.normal.y

    //         resultantPosition.x += staticCollision.resolvedColliderPosition.x
    //         resultantPosition.y += staticCollision.resolvedColliderPosition.y
    //     }

    //     resultantPosition.x /= aabbCollisions.length
    //     resultantPosition.y /= aabbCollisions.length

    //     ball.x = ball.aabb.x = resultantPosition.x
    //     ball.y = ball.aabb.y = resultantPosition.y
    //     if (Math.sign(resultantNormal.x) != 0) {

    //         ball.dx = Math.sign(resultantNormal.x) * ball.dx
    //     }
    //     if (Math.sign(resultantNormal.y) != 0) {
    //         ball.dy = Math.sign(resultantNormal.y) * ball.dy
    //     }

    //     console.log('ball after static resolution', ball)

    // }


    // /* DYNAMIC COLLISIONS */

    // const sweptCollisions: SweptAABB_AABBCollision[] = []
    
    

    // const ballMoveRelativeToPaddle = new Vector2D(ballDx - paddleMoveX, ballDy)

    // const ballPaddleCollision = checkSweptAABB_AABB(ball.aabb, ballMoveRelativeToPaddle,  paddle.aabb)
    
    // if (ballPaddleCollision && ball.dy > 0) { 
    //     console.log('collide with paddle', "ball", ball)
    //     sweptCollisions.push(ballPaddleCollision) }

    

    // for (const row of bricks) {
    //     for (const brick of row) {
    //         const ballBrickCollision = checkSweptAABB_AABB(ball.aabb, ballMove, brick.aabb)
    //         if (ballBrickCollision) {
    //             console.log('collide with brick', brick.index)
    //             sweptCollisions.push(ballBrickCollision)
    //         }
    //     }
    // }


    // if (sweptCollisions.length > 0) {
    //     console.log(`resolving ${sweptCollisions.length} sweeping collisions`, sweptCollisions)

    //     const lowestTMin = sweptCollisions.map(collision => collision.tMin)
    //     .reduce((resultTMin, current) => { return Math.min(resultTMin, current)})
        

    //     ballDx *= lowestTMin
    //     ballDy *= lowestTMin

    //     const resultantNormal = new Vector2D(0, 0)

    //     for (const staticCollision of sweptCollisions) {
    //         resultantNormal.x += staticCollision.normal.x
    //         resultantNormal.y += staticCollision.normal.y
    //     }

    //     ball.dx = Math.sign(resultantNormal.x) * ball.dx
    //     ball.dy = Math.sign(resultantNormal.y) * ball.dx

    // }

    // ball.x += ballDx
    // ball.y += ballDy

    // ball.aabb.setX(ball.x)
    // ball.aabb.setY(ball.y)
    
    
    // paddle.x += paddle.dx
    // if (paddle.dx != 0) {
    //     console.log("move paddle", paddle.dx)
    // }
    // paddleMoveX = paddle.dx
    // paddle.dx = 0

    // if (paddle.x < 0) {
    //     paddle.x = 0
    // }

    // if (paddle.x + paddle.w > W) {
    //     paddle.x = W - paddle.w
    // }

}