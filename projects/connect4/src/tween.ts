
export type ValueTweenConfig = {
    from: number,
    to: number,
    duration: number,
    
    complete?: () => void
}


export type ValueTween = {
    current: number,
    update: (dt: number) => void,
    completed: boolean,
}


export function tweenValue(config: ValueTweenConfig): ValueTween {

    const change = config.to - config.from;
    let elapsed = 0

    const res: ValueTween = {
        current: config.from,
        completed: false,
        update: function(dt: number): void {
            elapsed += dt;
            console.debug('elapsed', elapsed)
            const ratio = elapsed / config.duration
            if (ratio > 1) {
                this.completed = true
                if (config.complete) {
                    config.complete()
                }
                return
            }
            this.current = updateEasing(easeInQuad, config.from, change, clamp(ratio, 0, 1))
        }
    }

    return res
}


const updateEasing = (easingFn: (t: number) => number, start: number, change: number, t: number): number => {
    return start + easingFn(t) * change
}



const easeInQuad = (t: number) => t*t


function clamp(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
    /* OR Math.min(Math.max(value, min), max) both implementations are ok */
}