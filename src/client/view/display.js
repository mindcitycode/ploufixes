import './style.css'
import * as PIXI from 'pixi.js'
import { loadSpritesheet, testSpritesheet } from './sprites.js'
import { parseTilemap, instanciateTilemapContainer } from './tilemap.js'
import { resizeCanvas } from './screen.js';
import { instanciateTilemapRTree } from '../../common/tree.js'
import { getTilemapDataBounds } from '../../common/tilemap.js'
import { installFonts } from './text.js'
import { Bounds, getHeight, getWidth } from '../../common/bounds.js';
import { createTitleMenu } from './text.js';
import { ANIM_BIG_EXPLOSION, ANIM_GRENADIER_CLASS_CRAWL, ANIM_SCARAB_WALK, getAnimationName } from '../../common/generated-game-animations-definitions.js';

export const createDisplay = async () => {

    // properties
    const viewSize = { w: 640, h: 360 }
    const scaleToInteger = true

    // install fonts
    await installFonts()

    // create app
    const app = new PIXI.Application({ width: viewSize.w, height: viewSize.h });
    document.body.appendChild(app.view);
    app.view.classList.add('fullscreen')
    app.ticker.add(() => resizeCanvas(app.view, viewSize, scaleToInteger))
    console.log('view', app.view)

    const loadGame = async (gameOptions) => {

        const { packBasePath, tilemapFilename, spriteAtlasFilename } = gameOptions

        const gameContainer = new PIXI.Container()
        app.stage.addChild(gameContainer)

        // const scrollable container ( terrain + sprites on terrain )
        const scrollableContainer = new PIXI.Container()
        scrollableContainer.sortableChildren = true
        gameContainer.addChild(scrollableContainer)

        // sprites container
        const spritesContainer = new PIXI.Container()
        spritesContainer.zIndex = 666
        scrollableContainer.addChild(spritesContainer)
        const { atlasData, spritesheet } = await loadSpritesheet(spriteAtlasFilename, packBasePath)

        // title/menu container
        const menuContainer = await createTitleMenu()
        menuContainer.zIndex = 888
        //  scrollableContainer.addChild(menuContainer)

        // sprites, anchored middle-bottom
        const aSprites = new Map()
        const createASprite = (pid, animationNum) => {

            //            const animationNum = ANIM_GRENADIER_CLASS_CRAWL
            const animationName = getAnimationName(animationNum)

            const aSprite = new PIXI.AnimatedSprite(spritesheet.animations[animationName])
            //const aSprite = new PIXI.AnimatedSprite(spritesheet.animations["big-explosion"]);
            console.log(aSprite)
            aSprite.animationSpeed = 0.1
            // TODO : dehack.
            if (false) {
                aSprite.pivot.x = 0
                aSprite.pivot.y = -aSprite._textures[0].frame.height / 2
                aSprite.anchor.x = 0.5
                aSprite.anchor.y = 1
            }
            aSprite.pivot.x = aSprite._textures[0].frame.width /2
            aSprite.pivot.y = aSprite._textures[0].frame.height / 2
            aSprite.gotoAndPlay(0)
            //  custom prop
            aSprite.animationNum = animationNum

            aSprites.set(pid, aSprite)
            spritesContainer.addChild(aSprite)
            return aSprite
        }
        const getOrCreateASprite = (pid, animationNum) => {
            const current = aSprites.get(pid)
            if (current === undefined) {
                return createASprite(pid, animationNum)
            } else if (current.animationNum !== animationNum) {
                removeASprite(pid)
                return createASprite(pid, animationNum)
            } else {
                return current
            }
        }
        const removeASprite = pid => {
            // when pid disappears
            const aSprite = aSprites.get(pid)
            if (aSprite) {
                aSprite.destroy()
                aSprites.delete(pid)
            }
        }

        // tilemap
        const parsedTilemap = await parseTilemap(tilemapFilename, packBasePath)
        const tilemapContainer = await instanciateTilemapContainer(parsedTilemap)

        const terrainBounds = getTilemapDataBounds(parsedTilemap.tilemapData)
        console.log('terrainBounds', terrainBounds)

        scrollableContainer.addChild(tilemapContainer)
        tilemapContainer.zIndex = 0

        // view positioning 
        const scrollablePositioner = ScrollablePositioner(scrollableContainer, terrainBounds, viewSize)

        return {
            destroy: () => {
                gameContainer.destroy(true, true)
            },
            getOrCreateASprite,
            removeASprite,
            scrollablePositioner,
        }
    }
    // const stopShowAroundTerrain = showAroundTerrain(terrainBounds, scrollablePositioner, app)
    return {
        destroy: () => {
            app.destroy(true, true)
        },
        loadGame
    }
}

const showAroundTerrain = (terrainBounds, scrollablePositioner, app) => {
    const centerTarget = { x: terrainBounds.maxX, y: terrainBounds.maxY }
    const rps = 0.1
    const circle = {
        radius: Math.max(getWidth(terrainBounds), getHeight(terrainBounds)) / 2,
        center: {
            x: (terrainBounds.minX + terrainBounds.maxX) / 2,
            y: (terrainBounds.minY + terrainBounds.maxY) / 2,
        }
    }
    const tick = () => {
        const ts = Date.now() / 1000
        const a = ts * 2 * Math.PI * rps
        centerTarget.x = circle.center.x + circle.radius * Math.cos(a)
        centerTarget.y = circle.center.y + circle.radius * Math.sin(a)
        scrollablePositioner.centerOnTarget(centerTarget)

    }
    app.ticker.add(tick)
    return () => app.ticker.remove(tick)
}

const ScrollablePositioner = (scrollableContainer, terrainBounds, viewSize) => {
    const topLeftPositionBounds = getTerrainTopLeftPositionBounds(terrainBounds, viewSize)
    const centerOnTarget = (target) => {
        scrollableContainer.x = viewSize.w / 2 - target.x
        scrollableContainer.y = viewSize.h / 2 - target.y
        clampPositionToBounds(scrollableContainer, topLeftPositionBounds)
    }
    return {
        centerOnTarget
    }
}

const getTerrainTopLeftPositionBounds = (terrainBounds, viewSize, bounds = Bounds()) => {
    bounds.minX = -1 * terrainBounds.maxX + viewSize.w
    bounds.minY = -1 * terrainBounds.maxY + viewSize.h
    bounds.maxX = 0
    bounds.maxY = 0
    return bounds;
}

const clampPositionToBounds = (position, bounds) => {
    if (position.x > bounds.maxX) { position.x = bounds.maxX; }
    if (position.x < bounds.minX) { position.x = bounds.minX; }
    if (position.y > bounds.maxY) { position.y = bounds.maxY; }
    if (position.y < bounds.minY) { position.y = bounds.minY; }
}

//createDisplay()
