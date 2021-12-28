import Config from "./config";
import { debug } from "./log";
import { Position } from "./types";

const {W, H} = Config;

let initCount = 0;

debug("init canvas", ++initCount);

const canvas: HTMLCanvasElement = document.createElement("canvas");

const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

/**
 * hack to draw crisp shapes in canvas instead of blurry on retina displays 
 */

// value > 1 for retina display : use more than 1 device pixel (physical) to draw 1 CSS pixel (logical)
const pixelRatio = window.devicePixelRatio;

debug("ratio", pixelRatio)

// set canvas internal dimensions to be <ratio> times larger
canvas.width = W * pixelRatio;
canvas.height = H * pixelRatio;

// scale all drawing operations to be <ratio> times larger
ctx.scale(pixelRatio, pixelRatio);

// set display size (css pixels)
canvas.style.width = W + "px";
canvas.style.height = H + "px";


const root = document.querySelector("#root");

root?.appendChild(canvas);

export const canvasDim: Position = {
    x: 0,
    y: 0,
    w: W,
    h: H,
}

export default ctx;