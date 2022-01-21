import { ctx, H, W } from "../main";
import { getLevel,  levelComplete as levelCompletedCallback } from "../state-machine";
import { State } from "./State";

let elapsed = 0

let text: string
let textX: number
let textY: number
export const levelComplete: State = {
    enter: function (): void {
        console.log('enter level complete')
        elapsed = 0
        ctx.save()
        ctx.fillStyle = 'white'
        ctx.textBaseline = 'alphabetic'
        ctx.font = "25px/1.5 breakout-font"
        text = `Level ${getLevel()} complete`
        textX = W/2 - (ctx.measureText(text).width / 2)
        textY = H / 2
    },
    update: function (dt: number): void {
        elapsed += dt
        if (elapsed > 2) {
            levelCompletedCallback()
        }
    },
    draw: function (): void {
        ctx.fillText(text, textX, textY)
    },
    processInput: function (): void {
    },
    exit: function (): void {
        ctx.restore()
        console.log('exit level complete')
    }
}