import { readFile } from 'node:fs/promises'
import path from 'path'
import { __dirname } from './dirname.js'
const assetsPath = path.join(__dirname, 'assets')

export const loadTilemapFromFs = async (tilemapFilename, packBasePath) => {
    const tilemapPath = path.join(assetsPath, packBasePath, tilemapFilename)
    const tilemapData = await readFile(tilemapPath, 'utf8').then(x => JSON.parse(x))
    return tilemapData
}
