export function createCtx2D(cssClassName?: string): CanvasRenderingContext2D {
    if (!cssClassName) {
      return document
        .createElement("canvas")
        .getContext("2d") as CanvasRenderingContext2D;
    }
  
    let canvas = document.querySelector(`.${cssClassName}`) as HTMLCanvasElement;
  
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.classList.add(cssClassName);
    }
  
    return canvas.getContext("2d") as CanvasRenderingContext2D;
  }
  