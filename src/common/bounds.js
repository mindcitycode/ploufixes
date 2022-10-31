export const Bounds = (minX = 0, minY = 0, maxX = 0, maxY = 0) => ({ minX, minY, maxX, maxY })
export const getWidth = bounds => bounds.maxX - bounds.minX
export const getHeight = bounds => bounds.maxY - bounds.minY
export const boundsReallyIntersect = (b1, b2) => {
    const minX = Math.max(b1.minX, b2.minX)
    const maxX = Math.min(b1.maxX, b2.maxX)
    const minY = Math.max(b1.minY, b2.minY)
    const maxY = Math.min(b1.maxY, b2.maxY)
    return ((minX < maxX) && (minY < maxY))
}

// TODO put elsewhere ?
export function getBoundingBox(x, y, w, h, ax, ay, bounds = Bounds()) {
    bounds.minX = x - ax * w
    bounds.maxX = bounds.minX + w
    bounds.minY = y - ay * h
    bounds.maxY = bounds.minY + h
    return bounds
}

// TODO usage pass _center
export function getCenter(x, y, w, h, ax, ay, center = { x: 0, y: 0 }) {
    center.x = x + (0.5 - ax) * w
    center.y = y + (0.5 - ay) * h
    return center
}
// TODO usage pass _position
export function getPositionFromCenter(cx, cy, w, h, ax, ay, position = { x: 0, y: 0 }) {
    position.x = cx + (ax - 0.5) * w
    position.y = cy + (ay - 0.5) * h
    return position
}
