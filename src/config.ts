export default {
    /**
     * canvas width
     */
    W: 600,
    /**
     * canvas height
     */
    H: 300
}


export const debugConfig = {
    stopOnCollision: false,
}

const ballV0 = 70;
const multiplier = 3;
const acceleration = 1.75;

export const ballConfig = {
    v0 : ballV0,
    acc : acceleration,
    maxVx: multiplier * ballV0,
    maxVy : multiplier * ballV0,
}