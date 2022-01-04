import { State } from "./state/State";
import { gameTitle } from "./state/game-title";
import { play } from "./state/play";

export enum GameState {
    TITLE,
    PLAY,
    HIGHSCORE
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