export type State = {
    enter(): void,
    update(dt: number): void,
    draw(): void,
    processInput(): void
    exit(): void,
}