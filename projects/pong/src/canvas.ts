import { canvasConfig } from "./config";
import { debug, info } from "~/common/log";
import { Position } from "./types";

const { W, H, pixelRatio, canvasSelector } = canvasConfig;

const canvas: HTMLCanvasElement = document.createElement("canvas");

const ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d"
) as CanvasRenderingContext2D;

debug("ratio", pixelRatio);
if (pixelRatio != 1) {
    debug("set canvas for display")
    adjustCanvasForDisplay();
}

/**
 * hack to draw crisp shapes in canvas instead of blurry on retina displays
 */
function adjustCanvasForDisplay() {
  // set canvas internal dimensions to be <ratio> times larger
  canvas.width = W * pixelRatio;
  canvas.height = H * pixelRatio;

  // scale all drawing operations to be <ratio> times larger
  ctx.scale(pixelRatio, pixelRatio);

  // set display size (css pixels)
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
}

document.querySelector(canvasSelector)?.appendChild(canvas);

export const canvasDim: Position = {
  x: 0,
  y: 0,
  w: W,
  h: H,
};

export default ctx;