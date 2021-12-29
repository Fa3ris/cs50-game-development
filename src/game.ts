import { Ball } from "./ball";
import ctx, { canvasDim } from "./canvas";
import { collideBorders, collisionAABBV2 } from "./collision";
import { canvasConfig, debugConfig, padConfig } from "./config";
import { debug, info } from "./log";
import { Pad } from "./pad";
import { State } from "./state";
import {
    Ball as BallType,
    Pad as PadType,
    Player,
    Position,
    Side
} from "./types";

const { W, H } = canvasConfig;

const black = "#000";
const white = "#fff";
const courtThickness = 20;
const winScore = 2;

let ball: Ball;
let pad1: Pad;
let pad2: Pad;
let gameState: State = State.START;

let score1 = 0;
let score2 = 0;

resetEntities();

const hitSound = new Audio("pong_sounds_paddle_hit.wav");
const scoreSound = new Audio("pong_sounds_score.wav");
const wallSound = new Audio("pong_sounds_wall_hit.wav");

const keys: { [key: string]: string } = {};


export function mouseMove(event: MouseEvent) {
  if (gameState == State.PLAY) {
    pad1.pos.y = event.offsetY;
  }
}

export function keyUp(event: KeyboardEvent) {
    debug("key up", "[" + event.key + "]")
    delete keys[event.key]
}

export function keyPressed(event: KeyboardEvent) {
    debug("key pressed", "[" + event.key + "]")
    keys[event.key] = event.key;
}


function logState() {
    switch (gameState) {
      case State.END:
        debug("END");
        break;
      case State.PAUSED:
        debug("PAUSED");
        break;
      case State.PLAY:
        debug("PLAY");
        break;
      case State.SERVE:
        debug("SERVE");
        break;
      case State.START:
        debug("START");
        break;
    }
}

export function processInput() {

    logState();

    if (keys[" "] != undefined) {
      delete keys[" "]; // do not process it during next loop

      switch (gameState) {
        case State.START:
        case State.SERVE:
          gameState = State.PLAY;
          break;
        case State.PLAY:
          gameState = State.PAUSED;
          break;
        case State.PAUSED:
          gameState = State.PLAY;
          break;
        case State.END:
          score1 = 0;
          score2 = 0;
          gameState = State.START;
          break;
      }
    }
}

export function update(dt: number): void {
  if (gameState == State.PLAY) {
    updatePlay(dt);
  }
}

function updatePlay(dt: number): void {
  

  ball.update(dt);

  // player pad responds to mouse event
  restrictPad(pad1)

  // AI pad follows ball strictly
  pad2.pos.y = ball.pos.y;

  restrictPad(pad2)

  const borderCollision = collideBorders(ball.pos);

  if (borderCollision != null) {
    debug("collision border", borderCollision);
    updateAfterBorderCollision(borderCollision, dt);
  }

  const ballPad1Collision = collisionAABBV2(ball.pos, pad1.pos);

  const ballPad2Collision = collisionAABBV2(ball.pos, pad2.pos);

  const padCollision = ballPad1Collision || ballPad2Collision;

  if (padCollision) {
    hitSound.play();
    debug("%cpad collision", "color:red; font-size: 20px", ball);
  }

  if (ballPad1Collision) {
    updateAfterPad1Collision(dt);
  }

  if (ballPad2Collision) {
    updateAfterPad2Collision(dt);
  }

  ball.adjustVelocity();

  if (padCollision && debugConfig.stopOnCollision) {
    gameState = State.PAUSED
  }
}

function restrictPad(pad: Pad) {

    if (pad.pos.y < courtThickness) {
        pad.pos.y = courtThickness;
    }

    if (pad.pos.y + pad.pos.h > H - courtThickness) {
        pad.pos.y = H - courtThickness - pad.pos.h
    }

}

/**
 * UPDATE AFTER COLLISION
 */

function updateAfterPad1Collision(dt: number) {
  debug("pad1 collision before", JSON.stringify(ball), JSON.stringify(pad1))
  ball.pos.x = pad1.pos.x + pad1.pos.w;
  ball.applyForce(ballImpulsion(ball, pad1, dt))
  debug("pad1 collision after", JSON.stringify(ball), JSON.stringify(pad1))
}

/**
   F dt = m*dp => F = m*dp / dt
   ou impulsion ? I = delta(p)
   avant impulsion vy
   apres impulsion -vy
   dp = vy - (-vy) = 2*vy
 * @param ball 
 * @param pad 
 * @param dt 
 * @returns 
 */
function ballImpulsion(ball: Ball, pad: Pad, dt: number) {
    return {
        x: Math.sign(ball.vel.x) * -2 * Math.abs(ball.vel.x) / dt,
        y: 0
    }
}

function ballRebound(ball: Ball, dt: number) {
    return {
        y: Math.sign(ball.vel.y) * -2 * Math.abs(ball.vel.y) / dt,
        x: 0
    }
}

function updateAfterPad2Collision(dt: number) {
  debug("pad2 collision before", JSON.stringify(ball), JSON.stringify(pad2))
  ball.pos.x = pad2.pos.x - ball.pos.w;
  ball.applyForce(ballImpulsion(ball, pad2, dt))
  debug("pad2 collision after", JSON.stringify(ball), JSON.stringify(pad2))
}

function updateAfterBorderCollision(ballCollision: Side, dt: number) {
  switch (ballCollision) {
    case Side.TOP:
      ball.pos.y = courtThickness;
      ball.applyForce(ballRebound(ball, dt))
      wallSound.play();
      break;
    case Side.BOTTOM:
      ball.pos.y = H - courtThickness - ball.pos.h;
      ball.applyForce(ballRebound(ball, dt))
      wallSound.play();
      break;
    case Side.RIGHT:
      scoreSound.play();
      score(Player.ONE);
      break;
    case Side.LEFT:
      scoreSound.play();
      score(Player.TWO);
      break;
  }
}

function score(player: Player) {
  switch (player) {
    case Player.ONE:
      score1++;
      debug("1 scores", score1);
      if (score1 >= winScore) {
        win();
        return;
      }
      twoServing();
      break;
    case Player.TWO:
      score2++;
      debug("2 scores", score1);
      if (score2 >= winScore) {
        win();
        return;
      }
      oneServing();
      break;
  }

  gameState = State.SERVE;
}

function win() {
  gameState = State.END;
  resetEntities();
}

function oneServing() {
  resetEntities();

  // stick ball to pad but cause to detect collision
  ball.pos.x = pad1.pos.x + pad1.pos.w - 1;

  const angleOffset = -Math.PI / 3;
  const angle = angleOffset + (Math.random() * Math.PI) / 3;
  const vx0 = Ball.v0 * Math.cos(angle);
  const vy0 = Ball.v0 * Math.sin(angle);

  ball.vel.x = vx0;
  ball.vel.y = vy0;
}

function twoServing() {
  resetEntities();

  // stick ball to pad but cause to detect collision
  ball.pos.x = pad2.pos.x - ball.pos.w + 1;

  const angleOffset = Math.PI - Math.PI / 3;
  const angle = angleOffset + (Math.random() * Math.PI) / 3;
  const vx0 = Ball.v0 * Math.cos(angle);
  const vy0 = Ball.v0 * Math.sin(angle);

  ball.vel.x = vx0;
  ball.vel.y = vy0;
}

export function draw(): void {
  resetCanvas(ctx);

  if (gameState == State.END) {
    drawScore(ctx);
    debug("score 1", score1);
    debug("score 2", score2);
    if (score1 >= winScore) {
      debug("1 wins");
      drawWin(1);
    } else {
      debug("2 wins");
      drawWin(2);
    }
    return;
  }
  if (gameState == State.START) {
    drawStartScreen();
    return;
  }

  drawBall(ctx, ball);
  drawPad(ctx, pad1);
  drawPad(ctx, pad2);
  drawScore(ctx);
  drawCourt(ctx)
}


function drawCourt(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = white;
    drawRect(ctx, {
        x: 0,
        y: 0,
        w: W,
        h: courtThickness
    });
    drawRect(ctx, {
        x: 0,
        y: H - courtThickness,
        w: W,
        h: courtThickness
    });

    ctx.translate(W/2, 0);

    ctx.lineWidth = courtThickness;
    ctx.strokeStyle = white;
    ctx.beginPath();
    ctx.setLineDash([courtThickness, 15]);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, H);
    ctx.stroke();

    ctx.restore();
}

/**
 * DRAW FUNCTIONS
 *
 */

function resetCanvas(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = black;
  drawRect(ctx, canvasDim);
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  debug("ball", ball);
  ctx.save();
  ctx.fillStyle = white;
  drawRect(ctx, ball.pos);
  ctx.restore();
}

function drawPad(ctx: CanvasRenderingContext2D, pad: Pad) {
  debug("pad", pad);
  ctx.save();
  ctx.fillStyle = white;
  drawRect(ctx, pad.pos);
  ctx.restore();
}

function drawScore(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = `40px VT323`;
  ctx.fillStyle = white;
  ctx.textAlign = "center";
  ctx.fillText("" + score1, W / 2 - 80, H / 2);
  ctx.fillText("" + score2, W / 2 + 80, H / 2);
  ctx.restore();
}

function drawWin(n: number) {
  ctx.save();
  const textSize = 40;
  ctx.font = `${textSize}px VT323`;
  ctx.fillStyle = white;
  const hello = `player ${n} wins`;
  ctx.textAlign = "center";
  ctx.fillText(hello, W / 2, H / 2 + 50);
  ctx.restore();
}

function drawStartScreen() {
  ctx.save();
  const textSize = 40;
  ctx.font = `${textSize}px VT323`;
  ctx.fillStyle = white;
  const hello = "Press SPACE to begin";
  ctx.textAlign = "center";
  ctx.fillText(hello, W / 2, H / 2);
  ctx.restore();
}



function drawRect(ctx: CanvasRenderingContext2D, pos: Position) {
  ctx.fillRect(pos.x, pos.y, pos.w, pos.h);
}

/**
 * FACTORIES
 *
 */

function createBall(): Ball {
  const angleOffset = Math.random() > 0.5 ? 0 : Math.PI;
  const angle = angleOffset + (Math.random() * Math.PI) / 3;
  let vx0 = Ball.v0 * Math.cos(angle);
  let vy0 = Ball.v0 * Math.sin(angle);


//   const magnitude = Math.sqrt(Math.pow(vx0, 2) + Math.pow(vy0, 2));

//   vx0 *= (v0 / magnitude) 
//   vy0 *= (v0 / magnitude) 


  const ballSide = 10;
  const x0 = W / 2 - ballSide / 2;
  const y0 = H / 2 - ballSide / 2;

  const ballInit: BallType = {
    pos: {
      x: x0,
      y: y0,
      w: ballSide,
      h: ballSide,
    },
    vel: {
      x: vx0,
      y: vy0,
    },
  };

  debug("ball init", ballInit)
  return new Ball(ballInit);
}

function createPad1() {
  const pad1Init: PadType = {
    pos: {
      x: padConfig.borderOffset,
      y: padConfig.padStartY,
      w: padConfig.padW,
      h: padConfig.padH,
    },
  };
  return new Pad(pad1Init);
}

function createPad2() {
  const pad2Init: PadType = {
    pos: {
      x: W - padConfig.padW - padConfig.borderOffset,
      y: padConfig.padStartY,
      w: padConfig.padW,
      h: padConfig.padH,
    },
  };
  return new Pad(pad2Init);
}

function resetEntities() {
  ball = createBall();
  pad1 = createPad1();
  pad2 = createPad2();
}
