import { State, StateConfig } from "./state/State";
import { gameTitle } from "./state/game-title";

export enum GameState {
    TITLE,
}

let currentState: State


let stateConfig: StateConfig = {};


function setConfig(config: StateConfig = {}) {
    stateConfig = config;

    stateConfig["ctx"] = undefined
}

function enterState(newState: GameState): State {

    if (currentState) { currentState.exit(); }

    switch(newState) {
        case GameState.TITLE: {
            currentState = gameTitle
            break
        }

        default:
            throw 'unknown state'
    }

    currentState.enter()

    return currentState
}

function update(dt: number) {
    currentState.update(dt)
}

function draw() {
    currentState.draw()
}

function processInput() {
    currentState.processInput()
}