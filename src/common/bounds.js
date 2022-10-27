export const Bounds = (minX = 0, minY = 0, maxX = 0, maxY = 0) => ({ minX, minY, maxX, maxY })
export const getWidth = bounds => bounds.maxX - bounds.minX
export const getHeight = bounds => bounds.maxY - bounds.minY