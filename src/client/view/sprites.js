import * as PIXI from 'pixi.js'
const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
const packSpriteSheetsFilename = 'spritesheets.json'
const combinedJsonSpriteSheetFilename = 'combined.json'

import { assetPath } from '../clientAssets.js'
export const loadSpritesheet = async (spriteAtlasFilename, packBasePath) => {
    const altasPath = assetPath(packBasePath, spriteAtlasFilename)
    const atlasData = await fetch(altasPath).then(x => x.json())
    const imagePath = assetPath(packBasePath, atlasData.meta.image)
    const spritesheet = new PIXI.Spritesheet(
        PIXI.BaseTexture.from(imagePath),
        atlasData
    );
    await spritesheet.parse()
    return { atlasData, spritesheet }
}

export const testSpritesheet = async (container) => {

    const { atlasData, spritesheet } = await loadSpritesheet('combined.json', packBasePath)
    let x = 0
    let y = 0
    console.log('animations', atlasData.animations)

    console.log('frames names', Object.keys(atlasData.frames))
    console.log('animation names', Object.keys(atlasData.animations))
    Object.keys(atlasData.animations).forEach(animationName => {
        //  console.log(animationName)
        const asprite = new PIXI.AnimatedSprite(spritesheet.animations[animationName]);

        asprite.animationSpeed = 0.1
        asprite.x = x
        asprite.y = y
        x += 32
        if (x > (7 * 32)) {
            x = 0
            y += 32
        }
        container.addChild(asprite)
        asprite.gotoAndPlay(0)
    })
}