import './style.css'
import * as PIXI from 'pixi.js'
import { testSpritesheet } from './sprites.js'
import { loadTilemap, instanciateTilemapContainer  } from './tilemap.js'
import { resizeCanvas } from './screen.js';

// create app
const app = new PIXI.Application({ width: 640, height: 640 });
document.body.appendChild(app.view);
app.view.classList.add('fullscreen')
console.log('view', app.view)

// const scrollable container ( terrain + sprites on terrain )
const scrollableContainer = new PIXI.Container()
scrollableContainer.sortableChildren = true
app.stage.addChild(scrollableContainer)

const spritesContainer = new PIXI.Container()
spritesContainer.zIndex = 666
scrollableContainer.addChild(spritesContainer)

testSpritesheet(spritesContainer)


// properties
const pixelshown = { w: 640, h: 360 }
const scaleToInteger = true

// resize
app.ticker.add(() => {
    resizeCanvas(app.view,pixelshown,scaleToInteger)
})

const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
const tilemapFilename = 'map0.tmj'

import { instanciateTilemapRTree } from '../../common/tree.js'

export const testTilemap = async () => {
    const loaded = await loadTilemap(tilemapFilename,packBasePath)
    const tilemapContainer = await instanciateTilemapContainer(loaded)
    return tilemapContainer
}
/*
    container.addChild(tilemapContainer.tilemapContainer)

    const tilemapRTree = await instanciateTilemapRTree(loaded.tilemapData)
    console.log('tilemapRTree', tilemapRTree)
 //   moveIt(loaded, tilemapContainer.tilemapContainer, container)
    console.log('tilemapContainer', tilemapContainer.tilemapContainer)
}
*/

const tilemapcontainer = testTilemap(scrollableContainer).then( tilemapContainer => {
    tilemapContainer.tilemapContainer.zIndex = 0
    scrollableContainer.addChild(tilemapContainer.tilemapContainer)

})

/*
const sprite = PIXI.Sprite.from('assets/hands.png');
sprite.tint = 0xff0000
const sprite2 = PIXI.Sprite.from('assets/hands.png');
app.stage.sortableChildren = true
*/

