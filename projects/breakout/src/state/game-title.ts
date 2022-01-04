import { ctx, H, keys, W } from "../main";
import { enterState, GameState } from "../state-machine";
import { State } from "./State";


let titleSelectHighlightedIndex = 0

const title = "BREAKOUT"

const defaultColor = "white"
const selectedColor = "aqua"

export const gameTitle: State = {

    enter: function (): void {
        console.log('enter title')
    },


    update: function (dt: number): void {
    },


    draw: function (): void {
        
        ctx.font = "40px/1.5 breakout-font"
        ctx.fillStyle = defaultColor
        let height = H/2
        ctx.fillText(title, W/2 - (ctx.measureText(title).width / 2), height)
        ctx.font = "20px breakout-font"
        ctx.fillStyle = titleSelectHighlightedIndex == 0 ? selectedColor : defaultColor;
        height += 50
        const text1 = "Start"
        ctx.fillText(text1, W/2 - (ctx.measureText(text1).width / 2), height)
        ctx.fillStyle = titleSelectHighlightedIndex == 1 ? selectedColor : defaultColor;
        height += 20*1.5
        const text2 = "High Score"
        ctx.fillText(text2, W/2 - (ctx.measureText(text2).width / 2), height)
    
    },



    processInput: function (): void {

        if (keys["ArrowUp"] == false) {
            keys["ArrowUp"] = true // do not process it again
            titleSelectHighlightedIndex--
            if (titleSelectHighlightedIndex < 0) {
                titleSelectHighlightedIndex = 1;
            }
           
        }
        
        if (keys["ArrowDown"] == false) {
            keys["ArrowDown"] = true // do not process it again
            titleSelectHighlightedIndex++
            if (titleSelectHighlightedIndex > 1) {
                titleSelectHighlightedIndex = 0;
            }
        }

        if (keys["Enter"] == false) {
            keys["Enter"] = true

            if (titleSelectHighlightedIndex == 0) {
                enterState(GameState.PLAY)
            } else {
                console.log('title -> high score')

            }
        }
    },

    exit: function (): void {
        console.debug("exit title")
    }
}