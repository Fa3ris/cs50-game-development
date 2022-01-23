import { AABB } from "~common/geometry";
import { W } from "./main";
import { BrickInfo } from "./state/play";
import { elementsTileH, elementsTileW } from "./tile-renderer";

export function generateBrickRow(n: number, y: number, columnGap: number): BrickInfo[] {
    const res: BrickInfo[] = [];
    const totalW =  (n * elementsTileW) + ((n - 1) * columnGap);

    let x = (W - totalW) / 2

    for (let index = 0; index < n; index++) {

        res.push({
            x,
            y,
            index: 0,
            life: 1,
            aabb: new AABB(x, y, elementsTileW, elementsTileH)
        })

        x += elementsTileW

        if (index < (n - 1)) {
            x += columnGap
        }
        
    }
    return res
}


export function generateLevel(n: number): {
     bricks: BrickInfo[][],
     winScore: number } {

    console.log('generate level', n)

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

    for (let index = 1; index < secondRow.length; index = index + 2) {
        secondRow[index].index = 2;
        secondRow[index].life = 3;
    }
    
    for (const brick of secondRow) {
        winScore += brick.life
    }
    bricks.push(secondRow)

    const thirdRow = generateBrickRow(1, 100 + 2.25*elementsTileH + rowGap, 0)
    for (let index = 0; index < thirdRow.length - 1; index = index + 2) {
        thirdRow[index].index = 1;
        thirdRow[index].life = 2;
    }

    for (const brick of thirdRow) {
        winScore += brick.life
    }
    bricks.push(thirdRow)

    return {
        bricks,
        winScore
    }

}