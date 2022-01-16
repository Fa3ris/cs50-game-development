import { AABB, AABB_AABBCollision, SweptAABB_AABBCollision, Vector2D } from "~common/geometry";
import { currentFrame } from "~common/loop";
import { checkAABB_AABB, checkSweptAABB_AABB } from "~projects/collision-detection/src/collision";
import { TAU } from "~projects/collision-detection/src/drawing";
import { sweptAABB_AABB } from "~projects/collision-detection/src/swept-aabb-aabb";
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

let paddleCollision = false

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



const debugPlay = true;


/* END collision drawings */

const borderPadding = 10
let topBorderAABB:AABB
let bottomBorderAABB :AABB
let leftBorderAABB :AABB
let rightBorderAABB:AABB


const EPSILON = 1e-8

const brickCollisions: {collision: SweptAABB_AABBCollision, brick: BrickInfo}[] = [];

let paddleCollisionV2: {collision: SweptAABB_AABBCollision, paddle: {x: number, y: number, dx: number, aabb: AABB}} | undefined = undefined

let checkCollisionPaddleBrick = true

const ballDx0 = -70
const ballDy0 = -60

const maxBallSpeedX = 200;
const maxBallSpeedY = 200;

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
        bricks.push(generateBrickRow(5, 100 + elementsTileH + rowGap, 4))
        bricks.push(generateBrickRow(20, 100 + 2.25*elementsTileH + rowGap, 0))

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
    
            ball.dx = ballDx0
            ball.dy = ballDy0
        }
    },

    update: function (dt: number): void {

        if (debugPlay) {

            if (paddleCollision) {
            }
        }

        brickCollisions.length = 0;

        if (serveState) {
    
            paddle.x += paddle.dx
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
    
        paddle.aabb.setX(paddle.x)
        paddle.aabb.setY(paddle.y)
    
    
        const ballDx = ball.dx * dt
        const ballDy = ball.dy * dt
    
        if (checkCollisionPaddleBrick == false) {
            if (ball.y + ball.h + EPSILON < paddle.y || ball.y > paddle.y + paddle.h + EPSILON) {
                checkCollisionPaddleBrick = true
            }
        }
    
        if (paddleCollisionV2) {
            paddleCollisionV2 = undefined
        }
    
        paddleCollision = false
    
        const ballMove = new Vector2D(ballDx, ballDy)
    
        const topCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  topBorderAABB)
    
        if (topCollision) {
    
            ball.x += ballDx * topCollision.tMin
    
            ball.y = EPSILON
    
            ball.dy = Math.abs(ball.dy)
    
            constrainBallSpeed()
            console.debug('resolved top collision', 'ball', ball, 'collision', topCollision)
            return
        }
        const bottomCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  bottomBorderAABB)
    
        if (bottomCollision) {
    
            ball.x += ballDx * bottomCollision.tMin
    
            ball.y = H - ball.h - EPSILON
    
            ball.dy = -Math.abs(ball.dy)
    
            constrainBallSpeed()
            console.debug('resolved bottom collision', 'ball', ball, 'collision', bottomCollision)
            return
    
        }
        const leftCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  leftBorderAABB)
    
        if (leftCollision) {
    
            ball.y += ballDy * leftCollision.tMin
    
            ball.x = EPSILON
    
            ball.dx = Math.abs(ball.dx)
    
            constrainBallSpeed()
            console.debug('resolved left collision', 'ball', ball, 'collision', leftCollision)
            return
        }
        const rightCollision = checkSweptAABB_AABB(ball.aabb, ballMove,  rightBorderAABB)
    
        if (rightCollision) {
            ball.y += ballDy * rightCollision.tMin
    
            ball.x = W - ball.w - EPSILON
            ball.dx = -Math.abs(ball.dx)
    
            constrainBallSpeed()
            console.debug('resolved right collision', 'ball', ball, 'collision', rightCollision)
    
            return
        }
    
        
        for (const row of bricks) {
            for (const brick of row) {
                if (brick.life <= 0) { continue }
                const ballBrickCollision = checkSweptAABB_AABB(ball.aabb, ballMove, brick.aabb)
                if (ballBrickCollision) {
                    brickCollisions.push({collision: ballBrickCollision, brick})
                }
            }
        }
    

        for (const brickCollision of brickCollisions) {
            brickCollision.brick.life--
        }
    
        let closestBrickCollision: {collision: SweptAABB_AABBCollision, brick: BrickInfo} | undefined
    
        if (brickCollisions.length == 1) {
    
            closestBrickCollision = brickCollisions[0];
        } else if (brickCollisions.length > 1) {
            let minDist = distanceSquared(ball.aabb.x, ball.aabb.y, brickCollisions[0].brick.aabb.x, brickCollisions[0].brick.aabb.y)
            closestBrickCollision = brickCollisions[0];
    
            for (let i = 1; i < brickCollisions.length; i++) {
                const dist = distanceSquared(ball.aabb.x, ball.aabb.y, brickCollisions[i].brick.aabb.x, brickCollisions[i].brick.aabb.y)
    
                if (dist < minDist) {
                    minDist = dist
                    closestBrickCollision = brickCollisions[i]
                }
            }
        }
    
        if (closestBrickCollision) {
            // add epsilon to exit collision completely
            ball.x = closestBrickCollision.collision.resolvedColliderPosition.x + EPSILON * closestBrickCollision.collision.normal.x
            ball.y = closestBrickCollision.collision.resolvedColliderPosition.y  + EPSILON * closestBrickCollision.collision.normal.y
     
            if (closestBrickCollision.collision.normal.x != 0) {
    
                ball.dx = closestBrickCollision.collision.normal.x * Math.abs(ball.dx)
            }
    
            if (closestBrickCollision.collision.normal.y != 0) {
    
                ball.dy = closestBrickCollision.collision.normal.y * Math.abs(ball.dy)
            }
    
            constrainBallSpeed()
    
            return
        }
    
        
        if (checkCollisionPaddleBrick) {
    
            const ballMoveRelativeToPaddle = new Vector2D(ballDx - paddle.dx, ballDy)
            const ballPaddleCollision = checkSweptAABB_AABB(ball.aabb, ballMoveRelativeToPaddle,  paddle.aabb)
            
            if (ballPaddleCollision) { 
                paddleCollision = true
    
                checkCollisionPaddleBrick = false
                paddleCollisionV2 = {
                    collision: ballPaddleCollision,
                    paddle: {
                        dx: paddle.dx,
                        y: paddle.y,
                        x: paddle.x,
                        aabb: new AABB(paddle.x, paddle.y, paddle.w, paddle.h)
                    }}
    
                console.debug('brick paddle collision', paddleCollisionV2)
                
                // go to collision point
                if (ballPaddleCollision.tMin >= EPSILON && ballPaddleCollision.tMin <= 1) {
    
                    ball.x += ballDx * (ballPaddleCollision.tMin - EPSILON) 
                    ball.y += ballDy * (ballPaddleCollision.tMin - EPSILON) 
    
                    paddleCollisionV2.collision.resolvedColliderPosition.x = ball.x
                    paddleCollisionV2.collision.resolvedColliderPosition.y = ball.y
    
                    paddle.x += paddle.dx * (ballPaddleCollision.tMin - EPSILON)
                }
    
    
                if (ballPaddleCollision.normal.x != 0) { // left or right side
                    const additionalSpeed = 1 * Math.abs(paddle.dx) / dt
                    console.log('add speed to ball', additionalSpeed)
                    ball.dx = ballPaddleCollision.normal.x * (Math.abs(ball.dx) + additionalSpeed)
                    ball.x += ball.dx * EPSILON
                    
                    ball.aabb.setY(ball.y)
    
                    if (ball.aabb.center.y < paddle.aabb.center.y + 4) { // add 4 to be less strict 
                        ball.dy = -Math.abs(ball.dy)
                    } else {
                        ball.dy = Math.abs(ball.dy)
                    }
                } else if (ballPaddleCollision.normal.y < 0) { // top
                    ball.dy = -Math.abs(ball.dy)
                }
    
                // do not constrain ball speed to let ball escape from the paddle
                return
            }
        }
        
    
        ball.x += ballDx
        ball.y += ballDy
    
        paddle.x += paddle.dx
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
        

        for (const brickRow of bricks) {
            for (const brick of brickRow) {
                if (brick.life <= 0) { continue }
                drawBrick(ctx, brick.index, brick.x, brick.y)
            }
        }

        drawBall(ctx, ball.index, ball.x, ball.y)

        if (debugPlay) {

            ctx.save()
            ctx.textBaseline = "top"
            ctx.fillStyle = "white"
            ctx.font = "20px breakout-font"
            ctx.fillText(`${brickCollisions.length}`, 10, 10)
            ctx.restore()

            for (const brickCollision of brickCollisions) {
                ctx.strokeStyle = "red"
                ctx.strokeRect(brickCollision.brick.x, brickCollision.brick.y, elementsTileW, elementsTileH)

                brickCollision.collision.normal.x
                brickCollision.collision.normal.y

                ctx.save()
                ctx.translate(brickCollision.collision.resolvedColliderPosition.x, brickCollision.collision.resolvedColliderPosition.y);
                ctx.beginPath()
                ctx.moveTo(0, 0)
                const dirX = brickCollision.collision.normal.x * 10
                const dirY = brickCollision.collision.normal.y * 10
                ctx.lineTo(dirX, dirY)
                ctx.strokeStyle = "white"
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(dirX, dirY, 2, 0, TAU)
                ctx.fillStyle = "yellow"
                ctx.fill()
                ctx.restore()
            }

            if (paddleCollisionV2) {

                ctx.save()
                ctx.textBaseline = "top"
                ctx.fillStyle = "white"
                ctx.font = "20px breakout-font"
                ctx.fillText(`true`, W - 50, 10)
                ctx.restore()

                ctx.save()
                ctx.translate(paddleCollisionV2.collision.resolvedColliderPosition.x, paddleCollisionV2.collision.resolvedColliderPosition.y);
                ctx.beginPath()
                ctx.moveTo(0, 0)
                const dirX = paddleCollisionV2.collision.normal.x * 10
                const dirY = paddleCollisionV2.collision.normal.y * 10
                ctx.lineTo(dirX, dirY)
                ctx.strokeStyle = "white"
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(dirX, dirY, 2, 0, TAU)
                ctx.fillStyle = "yellow"
                ctx.fill()

                ctx.strokeStyle = "green"
                ctx.strokeRect(0, 0, ball.w, ball.h)

                ctx.restore()
            }


            ctx.textBaseline = "top"
            ctx.fillStyle = "white"
            ctx.font = "20px breakout-font"
            ctx.fillText(`${checkCollisionPaddleBrick}`, W - 50, 50)


            ctx.strokeStyle = "red"
            ctx.beginPath();
            const magnitude = 20
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo((ball.x + ball.dx * loopStep * magnitude)  , (ball.y + ball.dy * loopStep * magnitude));
            ctx.stroke();

    
            if (paddleCollision) {
                ctx.strokeStyle = "red"
                ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h)
            }

        }
    },

    /**
     * called only if has key
     */
    processInput: function (): void {

        if (keys["ArrowRight"] != undefined) { // can keep it pressed
            keys["ArrowRight"] = true
            paddle.dx = paddleSpeed
           
        }
        
        if (keys["ArrowLeft"] != undefined) { // can keep it pressed
            keys["ArrowLeft"] = true // do not process it again
            paddle.dx = -paddleSpeed;
        }

        if (keys[" "] == false && serveState) { // serve
            keys[" "] = true // do not process again
            serveState = false
            ball.dy = ballDy0
            // const xHalfRange = 25
            // ball.dx = -xHalfRange + Math.random() * (xHalfRange * 2)
            ball.dx = ballDx0
            ball.y -= EPSILON // remove collision
        }

        if (keys["p"] == false) {
            keys["p"] = true // do not process again
            paddleCollision = false
        }
    },

    exit: function (): void {
        console.log('exit play')
    }
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

function constrainBallSpeed() {
    if (Math.abs(ball.dx) > maxBallSpeedX) {
        console.debug('throttle ball X')
        ball.dx = Math.sign(ball.dx) * maxBallSpeedX
    }
    if (Math.abs(ball.dy) > maxBallSpeedY) {
        console.debug('throttle ball Y')
        ball.dy = Math.sign(ball.dy) * maxBallSpeedY
    }
}