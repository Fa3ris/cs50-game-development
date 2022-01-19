import { Vector2D } from "~common/geometry";


export type VectorTween = {
    current: Vector2D,
    update: (dt: number) => void,
    onEnd: () => void,
}
/**
 * 
 * @param totalTime in seconds 
 */
export function easeOutVector(start: Vector2D, end: Vector2D, totalTime: number): VectorTween {
    return _easeVector(start, end, totalTime, easeOutQuad);
}

/**
 * 
 * @param totalTime in seconds 
 */
 export function linearVector(start: Vector2D, end: Vector2D, totalTime: number): VectorTween {
    return _easeVector(start, end, totalTime, linear);
}

/**
 * 
 * @param totalTime in seconds 
 */
 export function easeInVector(start: Vector2D, end: Vector2D, totalTime: number): VectorTween {
    return _easeVector(start, end, totalTime, easeInQuad);
}

function _easeVector(start: Vector2D, end: Vector2D, totalTime: number, easingFn: (t: number) => number) {
    const changeX = end.x - start.x;
    const changeY = end.y - start.y;
    let elapsed = 0
  
    const res = {
        current: start,
        onEnd: onEndFn,
        update: function(dt: number): void {
            elapsed += dt;
            const ratio = elapsed / totalTime
            if (ratio > 1) {
                this.onEnd()
                return
            }
            const t = clamp(ratio, 0, 1)
            const newX = updateEasing(easingFn, start.x, changeX, t)
            const newY = updateEasing(easingFn, start.y, changeY, t)
            this.current = new Vector2D(newX, newY)
        }
    }

    return res
}

const onEndFn = () => { console.log('finished animation - no op') }

const updateEasing = (easingFn: (t: number) => number, start: number, change: number, t: number): number => {
    return start + easingFn(t) * change
}

/* credit https://gist.github.com/gre/1650294*/

const linear = (t: number) => t;

const easeInQuad = (t: number) => t*t

const easeOutQuad = (t: number) => t * (2-t)

function clamp(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
    /* OR Math.min(Math.max(value, min), max) both implementations are ok */
}