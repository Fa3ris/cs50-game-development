
import { adjustCanvasForDisplay } from "~common/canvas-util";
import { currentFrame, setDraw, setUpdate, start} from "~common/loop";

const ctx = createCtx2D("point-collision")

const W = 640
const H = 160

adjustCanvasForDisplay(ctx, W, H)


document.querySelector("#root")?.appendChild(ctx.canvas);


function createCtx2D(cssClassName?: string): CanvasRenderingContext2D {
    if (!cssClassName) {
        return document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
    }

    let canvas = document.querySelector(`.${cssClassName}`) as HTMLCanvasElement;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.classList.add(cssClassName)
    }

    return canvas.getContext("2d") as CanvasRenderingContext2D;

}

type Point2D = Vector2D

class Vector2D {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class AABB {
  x: number
  y: number
  w: number
  h: number

  top: number
  bottom: number

  left: number
  right: number

  min: Point2D
  max: Point2D
  center: Point2D

  halfW: number
  halfH: number

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h

    this.top = y
    this.bottom = y + h

    this.left = x
    this.right = x + w

    this.min = new Vector2D(x, y)
    this.max = new Vector2D(x + w, y + h)

    this.center = new Vector2D(x + w/2, y + h/2)

    this.halfW = w / 2
    this.halfH = h / 2
  }
}


const startPoint: Point2D = new Vector2D(50, 50)
const point: Point2D = new Vector2D(startPoint.x, startPoint.y)

const aabb: AABB = new AABB(55, 45, 30, 12)

const PI = Math.PI

const cos = Math.cos
const sin = Math.sin

const updatePointSin = createSinUpdate(startPoint, point)

let collisionInfo: AABBPointCollision | undefined


const horizontalMotion = linearUpdate(new Vector2D(45, 50), new Vector2D(95, 50))
const verticalMotion = linearUpdate(new Vector2D(75, 35), new Vector2D(75, 65))


function update(dt: number) {

  if (currentFrame < 10) console.log("update frame", currentFrame)

  if (false && collisionInfo && point.y < 45 + 7) {
    return
  }

  horizontalMotion.update(dt)
  verticalMotion.update(dt)

  updatePointSin(dt)

  // FIXME  if exactly on center cannot give which shift to make to exit
  // point.x = aabb.center.x
  // point.y = aabb.center.y

  const collide = checkAABBPoint(aabb, point)

  collisionInfo = collide

}


function linearUpdate(startPoint: Point2D, endPoint: Point2D): {
  point: Point2D,
  update: (dt: number) => void

} {

  let direction: 1 | -1 = 1
  let t = 0

  const step = .01
  const point = new Vector2D(startPoint.x, startPoint.y)

  const update = (dt: number) => {
    if (direction > 0) {
      t += step
  
      if (t >= 1) {
        direction = -1
        // skipping = true
      }
    } else {
  
      t -= step
  
      if (t <= 0) {
        direction = 1
        // skipping = true
      }
  
    }
  
    point.x = startPoint.x + t * (endPoint.x - startPoint.x) 
    point.y = startPoint.y + t * (endPoint.y - startPoint.y) 

  }


  return {point, update}
}

function createSinUpdate(startPoint: Point2D, point: Point2D): (dt: number) => void {

  const xStep = 10
  let xOffset = 0;
  const MAX_OFFSET_X = 40
  let xDirection: 1 | -1 = 1;
  
  const freq = 3
  const waveAmplitude = 10
  
  let skipping = false;
  const timeToWaitBeforeChangingDirection = .1;
  let timeWaited = 0

  const update = (dt: number) => {

    if (skipping) {
      timeWaited += dt
      if (timeWaited >= timeToWaitBeforeChangingDirection) {
        skipping = false
        timeWaited = 0
      }
      return
    }
  
    const step = dt * xStep;
    
    if (xDirection > 0) {
      xOffset += step
  
      if (xOffset >= MAX_OFFSET_X) {
        xDirection = -1
        skipping = true
      }
    } else {
  
      xOffset -= step
  
      if (xOffset <= 0) {
        xDirection = 1
        skipping = true
      }
  
    }
  
    point.x = startPoint.x + xOffset;
    point.y = startPoint.y + sin(xOffset * freq / (PI * 2)) * waveAmplitude

  }
  return update
}

ctx.font = "12px courier"
ctx.textBaseline = "top"


function draw() {

  if (currentFrame < 10) console.log("draw frame", currentFrame)

  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)

  if (collisionInfo) {
    drawPoint(collisionInfo.collisionPoint, "green")
    drawPoint(point, "yellow")
    drawAABB(aabb, "red")
  } else {
    drawPoint(point, "white")
    drawAABB(aabb, "white")
  }


    drawPoint(horizontalMotion.point, "blue")
    drawPoint(verticalMotion.point, "pink")

  ctx.fillStyle = "white"
  ctx.fillText(`point: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`, .5, .5)
}

type AABBPointCollision = {
  collisionPoint: Point2D,
  normal: Point2D
}

function checkAABBPoint(aabb: AABB, point: Point2D): AABBPointCollision | undefined {

  if (point.x < aabb.left || point.x > aabb.right) {
    return undefined
  }

  if (point.y < aabb.top || point.y > aabb.bottom) {
    return undefined
  }

  const pointToCenterX = aabb.center.x - point.x
  let dxToExit = aabb.halfW - Math.abs(pointToCenterX)
  if (pointToCenterX > 0) { // if closest x exit is on the left
    dxToExit++ //  account for the point width = 1 because we draw point from top-left corner
  }
  const pointToCenterY = aabb.center.y - point.y
  let dyToExit = aabb.halfH - Math.abs(pointToCenterY) 
  if (pointToCenterY > 0) { // if closest y exit is on the top
    dyToExit++ //  account for the point height = 1 because we draw point from top-left corner
  }

  const collisionPoint = new Vector2D(point.x, point.y)
  const normal = new Vector2D(0, 0)

  if (dxToExit < dyToExit) { // exit by x
    collisionPoint.x -= Math.sign(pointToCenterX) * dxToExit
    normal.x = -Math.sign(pointToCenterX)
  } else { // exit by y
    collisionPoint.y -= Math.sign(pointToCenterY) * dyToExit
    normal.y = -Math.sign(pointToCenterY)
  }

  // console.log( {collisionPoint, normal})
  return {collisionPoint, normal}
}

setUpdate(update)
setDraw(draw)

start()


function drawPoint(point: Point2D, fillColor: string = "white") {
  ctx.fillStyle = fillColor
  ctx.fillRect(point.x, point.y, 1, 1)
}


function drawAABB(aabb: AABB, strokeColor: string = "white") {
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = .1
  ctx.strokeRect(aabb.x, aabb.y, aabb.w, aabb.h)
}