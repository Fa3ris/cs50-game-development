
/**
 * 
 * 
 * see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
 * @param x1 
 * @param y1 
 * 
 * @param x2 
 * @param y2 
 * 
 * @param x3 
 * @param y3 
 * 
 * @param x4 
 * @param y4 
 * @returns point of intersection between two line segments or undefined
 */
export function segmentsIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): 
    {x: number, y: number } | undefined 
{

    const denominator = (x1 -x2)*(y3 - y4) - (y1 - y2)*(x3 - x4)

    if (denominator == 0) {
        return undefined
    }

    const ratio1 = ((x1 - x3)*(y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator

    if (ratio1 < 0 || ratio1 > 1) {
        return undefined
    }


    const ratio2 = ((x2 - x1)*(y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    if (ratio2 < 0 || ratio2 > 1) {
        return undefined
    }

    const point1X = x1 + ratio1 * (x2 - x1)
    const point1Y = y1 + ratio1 * (y2 - y1)

    return { x: point1X, y: point1Y }
}