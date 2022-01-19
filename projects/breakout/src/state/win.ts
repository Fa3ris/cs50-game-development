import { Vector2D } from "~common/geometry";
import { ctx, H, keys, W } from "../main";
import { enterState, GameState } from "../state-machine";
import { easeInVector, easeOutVector, linearVector, VectorTween } from "../tween";
import { getScore } from "./play";
import { State } from "./State";

let score: number

let textTween: VectorTween | undefined
let scoreTween: VectorTween | undefined
let instructionTween: VectorTween | undefined

let textPosition: Vector2D
let scorePosition: Vector2D
let instructionPosition: Vector2D

const cleanTextTween = () => {
    setTimeout(() => {
        textTween = undefined;
        console.log('text tween unregistered');
    })
} // wait for call stack to get empty

const cleanScoreTween = () => {
    setTimeout(() => {
        scoreTween = undefined;
        console.log('score tween unregistered');
    })
} // wait for call stack to get empty

const cleanInstructionTween = () => {
    setTimeout(() => {
        instructionTween = undefined;
        console.log('instruction tween unregistered');
    })
} // wait for call stack to get empty


export const win: State = {
    enter: function (): void {
        score = getScore();
        console.log('enter win');
        const start = new Vector2D(0, -60);
        instructionPosition = scorePosition = textPosition = start
        
        const duration = 2
        const end = new Vector2D(0, H / 2);
        textTween = easeOutVector(start, end, duration)
        textTween.onEnd = cleanTextTween

        scoreTween = linearVector(start, end, duration);
        scoreTween.onEnd = cleanScoreTween

        instructionTween = easeInVector(start, end, duration);
        instructionTween.onEnd = cleanInstructionTween
        
    },
    update: function (dt: number): void {

        if (textTween) {
            textTween.update(dt)
            textPosition = textTween.current;
        }

        if (scoreTween) {
            scoreTween.update(dt)
            scorePosition = scoreTween.current
        }

        if (instructionTween) {
            instructionTween.update(dt)
            instructionPosition = instructionTween.current
        }
    },
    draw: function (): void {
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('You win', (W - ctx.measureText('You lose').width) / 2, textPosition.y);
        ctx.fillText(`Score : ${score}`, (W - ctx.measureText(`Score : ${score}`).width) / 2, scorePosition.y + 20);
        ctx.fillText(`Press Enter`, (W - ctx.measureText(`Press Enter`).width) / 2, instructionPosition.y + 2 * 20);
    },
    processInput: function (): void {

        if (keys["Enter"] == false) { // serve
            keys["Enter"] = true // do not process again
            enterState(GameState.TITLE)
            return
        }
    },
    exit: function (): void {
        console.log('exit win')
    }
}