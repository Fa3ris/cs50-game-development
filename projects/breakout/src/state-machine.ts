import { State } from "./state/State";
import { gameTitle } from "./state/game-title";
import { getScore, Paddle, play, resetLife, resetScore, setBricks, setPaddle, setWinScore } from "./state/play";
import { lose } from "./state/lose";
import { win } from "./state/win";
import { levelComplete as levelCompleteState } from "./state/level-complete";
import { AABB } from "~common/geometry";
import { generateLevel } from "./brick-generator";
import { W, H } from "./main";
import { PaddleSize, PaddleColor, elementsTileW, elementsTileH } from "./tile-renderer";

export enum GameState {
    TITLE,
    PLAY,
    HIGHSCORE,
    LOSE,
    WIN,
    LEVEL_COMPLETE
}

let currentState: State


export function enterState(newState: GameState): State {

    if (currentState) { currentState.exit(); }

    switch(newState) {
        case GameState.TITLE:
            currentState = gameTitle
            break

        case GameState.PLAY:
            currentState = play
            break

        case GameState.LOSE:
            currentState = lose
            break

        case GameState.WIN:
            currentState = win;
            break

        case GameState.LEVEL_COMPLETE:
            currentState = levelCompleteState
            break

        default:
            throw 'unknown state'
    }

    currentState.enter()

    return currentState
}

export function update(dt: number) {
    currentState.update(dt)
}

export function draw() {
    currentState.draw()
}

export function processInput() {
    currentState.processInput()
}

let level: number = 0;

export function getLevel() {
    return level + 1
}

let totalScore: number = 0

export function getTotalScore() {
    return totalScore
}


export function startPlay() {
    setPaddle(generatePaddle(PaddleSize.MEDIUM, PaddleColor.BLUE))
    const {bricks, winScore} = generateLevel(level)
    setWinScore(winScore)
    setBricks(bricks)
    if (level == 0) {
        resetLife()
    }
    resetScore()
    enterState(GameState.PLAY)
}

const maxLevel = 1;
export function levelComplete() {
    level++
    totalScore += getScore()
    if (level >= maxLevel) {
        enterState(GameState.WIN)
        level = 0
        totalScore = 0
        return
    }
    startPlay()
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