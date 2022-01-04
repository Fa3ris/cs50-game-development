import { loadImage } from "~common/image-utils";

export enum PaddleColor {
  BLUE,
  GREEN,
  RED,
  PURPLE,
}

export enum PaddleSize {
  SMALL = 1,
  MEDIUM = 2,
  BIG = 3,
  JUMBO = 4,
}

export type TileInfo = {
  x: number;
  y: number;
};


const paddleMap: Map<
  PaddleColor,
  Map<PaddleSize, { info: TileInfo; size: number }>
> = new Map();

const smallPaddleW = 1;
const mediumPaddleW = 2;
const bigPaddleW = 3;
const jumboPaddleW = 4;

const sprites: { [index: string]: HTMLImageElement } = {};

export const elementsTileW = 32;
export const elementsTileH = 16;

let tilesInfos: TileInfo[]
export const nTiles = 84

let bricksPositions: TileInfo[]
export const nBrickTiles = 21


export async function init() {
  sprites["elements"] = await loadImage("sprite/brick-paddle-ball.png");

  const nbRows = sprites["elements"].height / elementsTileH - 2; // there is unused space in the image
  const nbCols = sprites["elements"].width / elementsTileW;

  tilesInfos = _tilePositions(nbRows, nbCols);

  bricksPositions = tilesInfos.slice(0, nBrickTiles)

  let multiplier = 1;

  const bluePaddlePositions = tilesInfos.slice(24, 24 + 12 * multiplier);
  console.log("blue", multiplier);
  console.log("blue length", bluePaddlePositions.length);
  
  const greenPaddlePositions = tilesInfos.slice(
    24 + 12 * multiplier,
    24 + 12 * ++multiplier
  );
  console.log("green", multiplier);
  console.log("green length", greenPaddlePositions.length);

  const redPaddlePositions = tilesInfos.slice(
    24 + 12 * multiplier,
    24 + 12 * ++multiplier
  );
  console.log("red", multiplier);
  console.log("red length", redPaddlePositions.length);

  const purplePaddlePositions = tilesInfos.slice(
    24 + 12 * multiplier,
    24 + 12 * ++multiplier
  );
  console.log("purple", multiplier);
  console.log("purple length", purplePaddlePositions.length);

  paddleMap.set(PaddleColor.BLUE, _generatePaddleMap(bluePaddlePositions));
  paddleMap.set(PaddleColor.GREEN, _generatePaddleMap(greenPaddlePositions));
  paddleMap.set(PaddleColor.RED, _generatePaddleMap(redPaddlePositions));
  paddleMap.set(PaddleColor.PURPLE, _generatePaddleMap(purplePaddlePositions));
}

export function drawPaddle(ctx: CanvasRenderingContext2D, color: PaddleColor, size: PaddleSize, x: number, y: number) {
    const paddleInfo = paddleMap.get(color)?.get(size)

    if (paddleInfo == undefined) { throw "is undefined" }
    ctx.drawImage(sprites["elements"], 
    elementsTileW * paddleInfo.info.x, elementsTileH * paddleInfo.info.y, elementsTileW * paddleInfo.size, elementsTileH,
     x, y, elementsTileW * paddleInfo.size, elementsTileH)
}

export function drawBrick(ctx: CanvasRenderingContext2D, index: number, x: number, y: number) {
    if (index >= nBrickTiles) { throw `invalid index ${index}` }
    ctx.drawImage(sprites["elements"],
     elementsTileW * bricksPositions[index].x, elementsTileH * bricksPositions[index].y, elementsTileW, elementsTileH,
      x, y, elementsTileW, elementsTileH)
}

export function drawElement(ctx: CanvasRenderingContext2D, index: number, x: number, y: number) {
    if (index > tilesInfos.length - 1) { throw `invalid index ${index}` }
    ctx.drawImage(sprites["elements"],
     elementsTileW * tilesInfos[index].x, elementsTileH * tilesInfos[index].y, elementsTileW, elementsTileH,
      x, y, elementsTileW, elementsTileH)

}

export const ballDim = 8

export const nBalls = 7

export function drawBall(ctx: CanvasRenderingContext2D, index: number, x: number, y: number) {
  if (index >= nBalls) { throw `invalid index ${index}`}

  const xIndex = index % 4
  const yIndex = Math.floor(index / 4)
  const xBallOffset = xIndex * ballDim
  const yBallOffset = yIndex * ballDim 
  const xSheetOffset = tilesInfos[21].x * elementsTileW + xBallOffset
  const ySheetOffset = tilesInfos[21].y * elementsTileH + yBallOffset
  
  console.log('x ball offset', xBallOffset)
  console.log('xoffset', xSheetOffset)
  console.log('y ball offset', yBallOffset)
  console.log('yoffset', ySheetOffset)


  ctx.drawImage(sprites["elements"],
  xSheetOffset, ySheetOffset, ballDim, ballDim,
   x, y, ballDim, ballDim)
}

function _tilePositions(nbRows: number, nbCols: number): TileInfo[] {
  const res = [];
  for (let row = 0; row < nbRows; row++) {
    for (let col = 0; col < nbCols; col++) {
      res.push({ x: col, y: row });
    }
  }

  return res;
}


function _generatePaddleMap(tileInfo: TileInfo[]) {
  const res = new Map<PaddleSize, { info: TileInfo; size: number }>();

  res.set(PaddleSize.SMALL, {
    info: {
      x: tileInfo[0].x,
      y: tileInfo[0].y,
    },
    size: smallPaddleW,
  });

  res.set(PaddleSize.MEDIUM, {
    info: {
      x: tileInfo[smallPaddleW].x,
      y: tileInfo[smallPaddleW].y,
    },
    size: mediumPaddleW,
  });

  res.set(PaddleSize.BIG, {
    info: {
      x: tileInfo[smallPaddleW + mediumPaddleW].x,
      y: tileInfo[smallPaddleW + mediumPaddleW].y,
    },
    size: bigPaddleW,
  });

  res.set(PaddleSize.JUMBO, {
    info: {
      x: tileInfo[smallPaddleW + mediumPaddleW + bigPaddleW].x,
      y: tileInfo[smallPaddleW + mediumPaddleW + bigPaddleW].y,
    },
    size: jumboPaddleW,
  });

  return res;
}