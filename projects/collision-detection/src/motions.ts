import { Point2D, Vector2D } from "~common/geometry";
import { TAU } from "./drawing";

export function sinusoidalMotion(startPoint: Point2D): {
    point: Point2D;
    update: (dt: number) => void;
  } {
    const xStep = 10;
    let xOffset = 0;
    const MAX_OFFSET_X = 40;
    let xDirection: 1 | -1 = 1;
  
    const freq = 3;
    const waveAmplitude = 10;
  
    let skipping = false;
    const timeToWaitBeforeChangingDirection = 0.1;
    let timeWaited = 0;
  
    const point = new Vector2D(startPoint.x, startPoint.y);
  
    const update = (dt: number) => {
      if (skipping) {
        timeWaited += dt;
        if (timeWaited >= timeToWaitBeforeChangingDirection) {
          skipping = false;
          timeWaited = 0;
        }
        return;
      }
  
      const step = dt * xStep;
  
      if (xDirection > 0) {
        xOffset += step;
  
        if (xOffset >= MAX_OFFSET_X) {
          xDirection = -1;
          skipping = true;
        }
      } else {
        xOffset -= step;
  
        if (xOffset <= 0) {
          xDirection = 1;
          skipping = true;
        }
      }
  
      point.x = startPoint.x + xOffset;
      point.y = startPoint.y + Math.sin((xOffset * freq) / TAU) * waveAmplitude;
    };
  
    return { point, update };
  }


  export function linearMotion(
    startPoint: Point2D,
    endPoint: Point2D
  ): {
    point: Point2D;
    update: (dt: number) => void;
  } {
    let direction: 1 | -1 = 1;
    let t = 0;
  
    const step = 0.01;
    const point = new Vector2D(startPoint.x, startPoint.y);
  
    const update = (dt: number) => {
      if (direction > 0) {
        t += step;
  
        if (t >= 1) {
          direction = -1;
          // skipping = true
        }
      } else {
        t -= step;
  
        if (t <= 0) {
          direction = 1;
          // skipping = true
        }
      }
  
      point.x = startPoint.x + t * (endPoint.x - startPoint.x);
      point.y = startPoint.y + t * (endPoint.y - startPoint.y);
    };
  
    return { point, update };
  }