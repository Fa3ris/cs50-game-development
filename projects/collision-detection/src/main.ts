
import { adjustCanvasForDisplay } from "~common/canvas-util";
import { setDraw, setProcessInput, setUpdate, start, step as loopStep} from "~common/loop";

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
  }
}


const startPoint: Point2D = new Vector2D(50, 50)
const point: Point2D = new Vector2D(startPoint.x, startPoint.y)

const aabb: AABB = new AABB(75, 50, 10, 20)

const PI = Math.PI

const cos = Math.cos
const sin = Math.sin

const updatePoint = createSinUpdate(startPoint, point)

function update(dt: number) {

  updatePoint(dt)

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

ctx.lineWidth = .5
ctx.strokeStyle = "white"

function draw() {

  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = "#fff"
  ctx.fillRect(point.x, point.y, 1, 1)

  ctx.strokeRect(aabb.x, aabb.y, aabb.w, aabb.h)
  ctx.fillText(`point: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`, .5, .5)
}

setUpdate(update)
setDraw(draw)

start()