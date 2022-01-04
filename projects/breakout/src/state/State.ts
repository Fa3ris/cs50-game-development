export type State = {
    enter(): void,
    update(dt: number): void,
    draw(): void,
    processInput(): void
    exit(): void,
}


export type StateConfig = {
    ctx?: CanvasRenderingContext2D,
    keys?: {[index: string]: boolean },
    images?: { [index: string]: HTMLImageElement },
}