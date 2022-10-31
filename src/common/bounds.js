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
