import { Vector2D } from "~common/geometry";
import { ctx, H, keys, W } from "../main";
import { enterState, GameState, getTotalScore } from "../state-machine";
import { easeInVector, easeOutVector, linearVector, VectorTween } from "../tween";
import { State } from "./State";

let score: number

let textTween: VectorTween | undefined
let scoreTween: VectorTween | undefined
let instructionTween: VectorTween | undefined

let textPosition: Vector2D
let scorePosition: Vector2D
let instructionPosition: Vector2D

let promptPseudo = false

let blinkingColor: 'white' | 'aqua' = 'white'

let blinkCounter = 0

let pseudoChars = new Int16Array(3);

let cursorPosition = 0

let cursorColorAlpha: 0 | 1 = 1

let cursorCounter = 0

const cleanTextTween = () => {
    setTimeout(() => {
        textTween = undefined;
        console.log('text tween unregistered');
        promptPseudo = true
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
        score = getTotalScore();
        console.log('enter win');
        const start = new Vector2D(0, -60);
        instructionPosition = scorePosition = textPosition = start
        
        const duration = .5
        const end = new Vector2D(0, H / 2 - 50);
        textTween = easeOutVector(start, end, duration)
        textTween.onEnd = cleanTextTween

        scoreTween = linearVector(start, end, duration);
        scoreTween.onEnd = cleanScoreTween

        instructionTween = easeInVector(start, end, duration);
        instructionTween.onEnd = cleanInstructionTween

        pseudoChars.fill(65) // A to Z == 65 to 90
        
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

        if (promptPseudo) {
            blinkCounter += dt
            if (blinkCounter > .5) {
                blinkCounter = 0
                blinkingColor = blinkingColor === 'aqua' ? 'white' : 'aqua'
            }

            cursorCounter += dt
            if (cursorCounter > .5) {
                cursorCounter = 0
                cursorColorAlpha = cursorColorAlpha == 0 ? 1 : 0
            }
          
        }
    },
    draw: function (): void {
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('You win', (W - ctx.measureText('You lose').width) / 2, textPosition.y);
        ctx.fillText(`Score : ${score}`, (W - ctx.measureText(`Score : ${score}`).width) / 2, scorePosition.y + 20);
        ctx.fillText(`Press Enter`, (W - ctx.measureText(`Press Enter`).width) / 2, instructionPosition.y + 2 * 20);

        if (promptPseudo) {
            const savedFillStyle = ctx.fillStyle
            ctx.fillStyle = blinkingColor
            ctx.fillText(`Enter Name`, (W - ctx.measureText(`Enter Name`).width) / 2, instructionPosition.y + 3 * 20);
            ctx.fillStyle = savedFillStyle

            for (let index = 0; index < pseudoChars.length; index++) {
                const element = pseudoChars[index];
                let char;
                if (element == 0) {
                    char = '_'
                } else {
                    char = String.fromCharCode(element)
                }

                const savedAlpha = ctx.globalAlpha
                if (index == cursorPosition) {
                    ctx.globalAlpha = cursorColorAlpha
                }
                const placeholder = "_ _ _";
                ctx.fillText(char, (W - ctx.measureText(placeholder).width)/2 + index * ctx.measureText("_ ").width, instructionPosition.y + 4 * 20 + 10);
                
                ctx.globalAlpha = savedAlpha
            }

        }
    },
    processInput: function (): void {

        if (!promptPseudo) { // process keys only when prompting for pseudo
            return
        }

        if (keys["Enter"] == false) { // serve
            keys["Enter"] = true // do not process again
            
            let pseudo;
            for (const n of pseudoChars) {
                const letter = String.fromCharCode(n)
                if (!pseudo) {
                    pseudo = letter 
                } else {
                    pseudo += letter
                }
            }
            console.log('final pseudo', pseudo)
            enterState(GameState.TITLE)
            return
        }

        if (keys["ArrowRight"] == false) {
            keys["ArrowRight"] = true
            cursorPosition++
            if (cursorPosition > pseudoChars.length - 1) {
                cursorPosition = 0
            }
        }

        if (keys["ArrowLeft"] == false) {
            keys["ArrowLeft"] = true
            cursorPosition--
            if (cursorPosition < 0) {
                cursorPosition = pseudoChars.length - 1
            }
        }

        if (keys['ArrowDown'] == false) {
            keys["ArrowDown"] = true
            const newChar = ++pseudoChars[cursorPosition]
            if (newChar > 90) {
                pseudoChars[cursorPosition] = 65
            }
        }

        if (keys['ArrowUp'] == false) {
            keys["ArrowUp"] = true
            const newChar = --pseudoChars[cursorPosition]
            if (newChar < 65) {
                pseudoChars[cursorPosition] = 90
            }
        }
    },
    exit: function (): void {
        console.log('exit win')
    }
}