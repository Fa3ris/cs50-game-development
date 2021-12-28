
import { draw as gameDraw, keyPressed, mouseMove, update as gameUpdate } from "./game";
import { setDraw, setUpdate, start } from "./loop";
import ctx from "./canvas";


ctx.canvas.addEventListener("mousemove", mouseMove);
document.addEventListener("keydown", keyPressed);
setDraw(gameDraw)
setUpdate(gameUpdate);


start();