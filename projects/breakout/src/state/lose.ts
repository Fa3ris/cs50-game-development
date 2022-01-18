import { ctx, H, keys, W } from "../main";
import { enterState, GameState } from "../state-machine";
import { getScore } from "./play";
import { State } from "./State";

let score: number

export const lose: State = {
    enter: function (): void {
        score = getScore();
        console.log('enter lose');
    },
    update: function (dt: number): void {
    },
    draw: function (): void {
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('You lose', (W -ctx.measureText('You lose').width) / 2, H/2);
        ctx.fillText(`Score : ${score}`, (W -ctx.measureText(`Score : ${score}`).width) / 2, H/2 + 20);
        ctx.fillText(`Press Enter`, (W -ctx.measureText(`Press Enter`).width) / 2, H/2 + 2 * 20);
    },
    processInput: function (): void {

        if (keys["Enter"] == false) { // serve
            keys["Enter"] = true // do not process again
            enterState(GameState.TITLE)
            return
        }
    },
    exit: function (): void {
        console.log('exit lose')
    }
}