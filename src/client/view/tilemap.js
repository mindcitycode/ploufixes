import * as PIXI from 'pixi.js'

const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
const tilemapFilename = 'map0.tmj'

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;
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

export const loadTilemap = async (tilemapName) => {

    // load tilemap data
    const tilemapPath = [packBasePath, tilemapName].join('/')
    const tilemapData = await fetch(tilemapPath).then(x => x.json())
    console.log('tilemapData', tilemapData)

    // build atlas data from tilemap
    const atlasseDatas = tilemapData.tilesets.map(atlasDataFromTileset)
    console.log('atlassesData', atlasseDatas)

    // build spritesheet for tilemap from atlas data
    const spritesheets = atlasseDatas.map(atlasData => {
        const imagePath = [packBasePath, atlasData.meta.image].join('/')
        const spritesheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(imagePath),
            atlasData
        )
        return spritesheet
    })
    await Promise.all(spritesheets.map(spritesheet => spritesheet.parse()))
    console.log('tilemapspritesheets', spritesheets)

    return {
        tilemapName,
        tilemapData,
        atlasseDatas,
        spritesheets
    }
}

export const instanciateTilemap = async (loaded) => {

    const tilemapContainer = new PIXI.Container()
    tilemapContainer.zIndex = 0

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

    return {
        tilemapContainer,
    }

}

const moveIt = (loaded, tilemapContainer, app) => {

    const tilemapData = loaded.tilemapData

    const pixelshown = { w: 640, h: 360 }
    const position = { x: 0, y: 0 }
    const speed = { x: 1, y: 1 }
    const min = {
        x: -1 * (tilemapData.width * tilemapData.tilewidth) + pixelshown.w,
        y: -1 * (tilemapData.height * tilemapData.tileheight) + pixelshown.h
    }
    const max = { x: 0, y: 0 }

    app.ticker.add(() => {

        position.x += speed.x
        position.y += speed.y

        if (position.x > max.x) { position.x = max.x; speed.x *= -1 }
        if (position.x < min.x) { position.x = min.x; speed.x *= -1 }
        if (position.y > max.y) { position.y = max.y; speed.y *= -1 }
        if (position.y < min.y) { position.y = min.y; speed.y *= -1 }

        tilemapContainer.x = position.x
        tilemapContainer.y = position.y
    })
}


export const testTilemap = async (app) => {
    const loaded = await loadTilemap(tilemapFilename, app)
    const instance = await instanciateTilemap(loaded, app)
    app.stage.addChild(instance.tilemapContainer)

    moveIt(loaded, instance.tilemapContainer, app)
    console.log('tilemapContainer', instance.tilemapContainer)
}