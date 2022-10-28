import * as PIXI from 'pixi.js'
import { FLIPPED_DIAGONALLY_FLAG, FLIPPED_HORIZONTALLY_FLAG, FLIPPED_VERTICALLY_FLAG, ROTATED_HEXAGONAL_120_FLAG } from '../../common/tilemap.js'


//gids.push({ {"meta":{"image":"combined.png","size":{"w":328,"h":328}},"frames":{"SquadLeader-throw-3":{"frame":{"x":128,"y":312,"w":16,"h":16}}}

export const atlasDataFromTileset = tilesetData => {

    const atlasData = {
        meta: {
            image: tilesetData.image,
            size: { w: tilesetData.imagewidth, h: tilesetData.imageheight }
        },
        frames: {},
        animations: {}
    }
    for (let tileIndex = 0; tileIndex < tilesetData.tilecount; tileIndex++) {
        // assumes spacing and margin to be 0
        const gid = tilesetData.firstgid + tileIndex
        const i = tileIndex % tilesetData.columns
        const j = Math.floor(tileIndex / tilesetData.columns)
        const x = i * tilesetData.tilewidth
        const y = j * tilesetData.tileheight
        atlasData.frames[gid] = {
            frame: { x, y, w: tilesetData.tilewidth, h: tilesetData.tileheight },
        }
        atlasData.animations[gid] = [gid]
    }
    return atlasData
}

import { assetPath } from '../assetPath.js'
export const parseTilemap = async (tilemapFilename, packBasePath) => {

    // load tilemap data
    const tilemapPath = assetPath(packBasePath, tilemapFilename)
    const tilemapData = await fetch(tilemapPath).then(x => x.json())
    console.log('tilemapData', tilemapData)

    // build atlas data from tilemap
    const atlasseDatas = tilemapData.tilesets.map(atlasDataFromTileset)
    console.log('atlassesData', atlasseDatas)

    // build spritesheet for tilemap from atlas data
    const spritesheets = atlasseDatas.map(atlasData => {
        const imagePath = assetPath(packBasePath, atlasData.meta.image)
        const spritesheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(imagePath),
            atlasData
        )
        return spritesheet
    })
    await Promise.all(spritesheets.map(spritesheet => spritesheet.parse()))
    console.log('tilemapspritesheets', spritesheets)

    return {
        tilemapFilename,
        tilemapData,
        atlasseDatas,
        spritesheets
    }
}
export const instanciateTilemapContainer = async (loaded) => {

    // instanciate display
    const tilemapContainer = new PIXI.Container()

    const tilemapData = loaded.tilemapData
    const spritesheets = loaded.spritesheets

    for (let layerIndex = 0; layerIndex < tilemapData.layers.length; layerIndex++) {
        const layer = tilemapData.layers[layerIndex]
        for (let i = 0; i < layer.width; i++) {
            for (let j = 0; j < layer.height; j++) {
                const offset = i + j * layer.width
                const v = layer.data[offset]
                const gid = v & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
                const x = i * tilemapData.tilewidth
                const y = j * tilemapData.tileheight
                const asprite = new PIXI.Sprite(spritesheets[0].textures[gid])
                asprite.x = x
                asprite.y = y
                tilemapContainer.addChild(asprite)
            }
        }
    }

    return tilemapContainer
}
