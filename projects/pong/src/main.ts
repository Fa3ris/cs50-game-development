
import { draw as gameDraw, keyPressed, keyUp, mouseMove, processInput, update as gameUpdate } from "./game";
import { setDraw, setUpdate, start, setProcessInput } from "~/common/loop";
import ctx from "./canvas";


ctx.canvas.addEventListener("mousemove", mouseMove);
document.addEventListener("keydown", keyPressed);
document.addEventListener("keyup", keyUp);
setDraw(gameDraw)
setUpdate(gameUpdate);
setProcessInput(processInput)


start();