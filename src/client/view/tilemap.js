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
export const loadTilemap = async (tilemapName, app) => {
    const tilemapPath = [packBasePath, tilemapName].join('/')
    const tilemapData = await fetch(tilemapPath).then(x => x.json())
    console.log('tilemapData', tilemapData)

    const atlasseDatas = tilemapData.tilesets.map(atlasDataFromTileset)
    console.log(atlasseDatas)

    const spritesheets = atlasseDatas.map(atlasData => {
        const imagePath = [packBasePath, atlasData.meta.image].join('/')
        const spritesheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(imagePath),
            atlasData
        )
        return spritesheet
    })
    await Promise.all(spritesheets.map(spritesheet => spritesheet.parse()))

    console.log('tilemap spritesheets', spritesheets)

    for (let layerIndex = 0; layerIndex < tilemapData.layers.length; layerIndex++) {
        const layer = tilemapData.layers[layerIndex]
        for (let i = 0; i < layer.width; i++) {
            for (let j = 0; j < layer.height; j++) {
                const offset = i + j * layer.width
                const v = layer.data[offset]
                const gid = v & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
                const x = i * tilemapData.tilewidth
                const y = j * tilemapData.tileheight
                        //    const asprite = new PIXI.AnimatedSprite(spritesheets[0].animations[gid])
                //const asprite = new PIXI.TilingSprite(spritesheets[0].textures[gid])
                const asprite = new PIXI.Sprite(spritesheets[0].textures[gid])
                asprite.zOrder = -1
                asprite.x = x
                asprite.y = y
                app.stage.addChild(asprite)
            }
        }
    }

    /*
    
    const imagePath = [packBasePath, tilemapData.meta.image].join('/')
    const spritesheet = new PIXI.Spritesheet(
        PIXI.BaseTexture.from(imagePath),
        tilemapData
    );
    await spritesheet.parse()
    return { atlasData: tilemapData, spritesheet }
*/
}
export const testTilemap = (app) => {
    loadTilemap(tilemapFilename, app)
}