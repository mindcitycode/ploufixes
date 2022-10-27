import './style.css'
import * as PIXI from 'pixi.js'
import { testSpritesheet } from './sprites.js'
import { parseTilemap, instanciateTilemapContainer } from './tilemap.js'
import { resizeCanvas } from './screen.js';
import { instanciateTilemapRTree } from '../../common/tree.js'
import { getTilemapDataBounds } from '../../common/tilemap.js'

const initialize = async () => {

    // properties
    const viewSize = { w: 640, h: 360 }
    const scaleToInteger = true
    const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
    const tilemapFilename = 'map0.tmj'

    // create app
    const app = new PIXI.Application({ width: viewSize.w, height: viewSize.h });
    document.body.appendChild(app.view);
    app.view.classList.add('fullscreen')
    app.ticker.add(() => resizeCanvas(app.view, viewSize, scaleToInteger))
    console.log('view', app.view)

    // const scrollable container ( terrain + sprites on terrain )
    const scrollableContainer = new PIXI.Container()
    scrollableContainer.sortableChildren = true
    app.stage.addChild(scrollableContainer)

    // sprites container
    const spritesContainer = new PIXI.Container()
    spritesContainer.zIndex = 666
    scrollableContainer.addChild(spritesContainer)

    testSpritesheet(spritesContainer)

    // tilemap
    const parsedTilemap = await parseTilemap(tilemapFilename, packBasePath)
    const tilemapContainer = await instanciateTilemapContainer(parsedTilemap)
    const terrainBounds = getTilemapDataBounds(parsedTilemap.tilemapData)

    scrollableContainer.addChild(tilemapContainer)
    tilemapContainer.zIndex = 0

    moveIt(scrollableContainer, terrainBounds, viewSize, app)

    /*
        const tilemapRTree = await instanciateTilemapRTree(loaded.tilemapData)
    */

}

const moveIt = (movableContainer, terrainBounds, viewSize, app) => {

    const position = { x: 0, y: 0 }
    const speed = { x: 1, y: 1 }

    const bounds = getTerrtainPositionBounds(terrainBounds, viewSize)

    app.ticker.add(() => {

        position.x += speed.x
        position.y += speed.y

        if (position.x > bounds.maxX) { speed.x *= -1 }
        if (position.x < bounds.minX) { speed.x *= -1 }
        if (position.y > bounds.maxY) { speed.y *= -1 }
        if (position.y < bounds.minY) { speed.y *= -1 }

        clampToBounds(position, bounds)
        movableContainer.x = position.x
        movableContainer.y = position.y
    })
}

import { Bounds } from '../../common/bounds.js';
const getTerrtainPositionBounds = (terrainBounds, viewSize, bounds = Bounds()) => {
    bounds.minX = -1 * terrainBounds.maxX + viewSize.w
    bounds.minY = -1 * terrainBounds.maxY + viewSize.h
    bounds.maxX = 0
    bounds.maxY = 0
    return bounds;
}
const clampToBounds = (position, bounds) => {
    if (position.x > bounds.maxX) { position.x = bounds.maxX; }
    if (position.x < bounds.minX) { position.x = bounds.minX; }
    if (position.y > bounds.maxY) { position.y = bounds.maxY; }
    if (position.y < bounds.minY) { position.y = bounds.minY; }
}

initialize()
