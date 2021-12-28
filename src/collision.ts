import { canvasDim } from "./canvas";
import { Position, Side } from "./types";

/**
 * Si la box2 est
 *  complètement à gauche,
 *  ou complètement en haut,
 *  ou complètement à droite,
 *  ou complètement en bas,
 *  alors elle ne touche pas. Sinon, elle touche.
 *
 *
 * Remarque intéressante
 * dessiner un rectangle à la position (x, y) de dimension (w, h)
 *
 * c'est dessiner un rectangle qui s'étend
 * de x à (x + w - 1),
 * puisque le premier pixel à la position x compte dans la largeur total w à dessiner
 *
 * de même le rectangle s'étend
 * de y à (y + h - 1)
 * pour dessiner une hauteur h en prenant en compte le premier pixel situé en y
 *
 */
function collisionAABB(box1: Position, box2: Position) {
  if (
    box2.x >= box1.x + box1.w || // trop à droite
    box2.x + box2.w <= box1.x || // trop à gauche
    box2.y >= box1.y + box1.h || // trop en bas
    box2.y + box2.h <= box1.y // trop en haut
  )
    return false;
  else return true; // collision
}

/**
 * AABB = Axis Aligned Bounding Box
 * ceci est la négation de la fonction du dessus
 * l'ordre des boîtes n'a pas d'importance,
 * si l'une touche l'autre, alors l'autre touche l'une
 * @param box1
 * @param box2
 * @returns
 */
export function collisionAABBV2(box1: Position, box2: Position) {
  const collisionDetected =
    box1.x < box2.x + box2.w &&
    box1.x + box1.w > box2.x &&
    box1.y < box2.y + box2.h &&
    box1.h + box1.y > box2.y;
  return collisionDetected;
}

export function collideBorders(pos: Position): Side | null {
  if (pos.x < canvasDim.x) {
    return Side.LEFT;
  }
  if (pos.x + pos.w > canvasDim.x + canvasDim.w) {
    return Side.RIGHT;
  }

  if (pos.y < canvasDim.y) {
    return Side.TOP;
  }

  if (pos.y + pos.h > canvasDim.y + canvasDim.h) {
    return Side.BOTTOM;
  }

  return null;
}
