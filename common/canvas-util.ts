/**
 * hack to draw crisp shapes in canvas instead of blurry on retina displays
 */
export function adjustCanvasForDisplay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
) {
  const pixelRatio = window.devicePixelRatio;
  console.log('pixel ratio', pixelRatio)
  const canvas = ctx.canvas;
  // set canvas internal dimensions to be <ratio> times larger
  canvas.width = W * pixelRatio;
  canvas.height = H * pixelRatio;

  // scale all drawing operations to be <ratio> times larger
  ctx.scale(pixelRatio, pixelRatio);

  // set display size (css pixels)
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
}
