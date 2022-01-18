import { AABB } from "~common/geometry";
import { ctx, H, keys, W } from "../main";
import { enterState, GameState } from "../state-machine";
import { elementsTileH, elementsTileW, PaddleColor, PaddleSize } from "../tile-renderer";
import { generateBrickRow, Paddle, resetScore, setBricks, resetLife, setPaddle, setWinScore } from "./play";
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
        ctx.textBaseline = 'alphabetic'
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
                setPaddle(generatePaddle(PaddleSize.MEDIUM, PaddleColor.BLUE))
                const bricks = []
                const rowGap = 6

                const firstRow = generateBrickRow(0, 100, 8)
                for (let index = 0; index < firstRow.length; index = index + 2) {
                    firstRow[index].index = 1;
                    firstRow[index].life = 2;
                    
                }
                
                let winScore = 0;
                for (const brick of firstRow) {
                    winScore += brick.life
                }
                bricks.push(firstRow)
                const secondRow = generateBrickRow(0, 100 + elementsTileH + rowGap, 4)
                
                for (const brick of secondRow) {
                    winScore += brick.life
                }
                bricks.push(secondRow)
                const thirdRow = generateBrickRow(3, 100 + 2.25*elementsTileH + rowGap, 0)
                for (let index = 0; index < 0; index = index + 2) {
                    thirdRow[index].index = 1;
                    thirdRow[index].life = 2;
                }

                for (const brick of thirdRow) {
                    winScore += brick.life
                }
                bricks.push(thirdRow)

                setWinScore(winScore)
                setBricks(bricks)
                resetLife()
                resetScore()
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


function generatePaddle(size: PaddleSize, color: PaddleColor): Paddle {
    const paddleW =  size * elementsTileW
    const paddleX =  (W - paddleW) / 2
    const paddleY =  H - 5 - elementsTileH
    return {
        size: size,
        color: color,
        w: paddleW,
        h: elementsTileH,
        x: paddleX,
        y: paddleY,
        dx: 0,
        aabb: new AABB(paddleX, paddleY, paddleW, elementsTileH)
    };
}