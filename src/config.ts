const canvasConfig = {
    /**
     * canvas width
     */
     W: 600,
     /**
      * canvas height
      */
     H: 300,
     /**
      * value > 1 for retina display : use more than 1 device pixel (physical) to draw 1 CSS pixel (logical)
      */
     pixelRatio: window.devicePixelRatio,
     canvasSelector: "#root",
}

const debugConfig = {
    stopOnCollision: false,
}

const ballV0 = 70;
const multiplier = 3;
const acceleration = 1.75;

const ballConfig = {
    v0 : ballV0,
    acc : acceleration,
    maxVx: multiplier * ballV0,
    maxVy : multiplier * ballV0,
}

const padH = 50;

const padConfig = {
    borderOffset: 20,
    padW: 10,
    padH,
    padStartY: canvasConfig.H / 2 -  padH / 2
}

export { canvasConfig, ballConfig, debugConfig, padConfig };
export default canvasConfig