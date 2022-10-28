import * as PIXI from 'pixi.js'
import { Assets } from '@pixi/assets';
import { assetPath } from '../assetPath.js';

export const fontPath = (...p) => assetPath('fonts', ...p)

export async function createFont(handle, fontPath, options) {
    Assets.add(handle, fontPath)
    const loaded = await Assets.load(handle)
    options.fontFamily = loaded.family
    PIXI.BitmapFont.from(handle, options)
}

export async function installFonts() {

    await createFont('title-font',
        fontPath('the_sunday_paper_fonts/Sunday_Masthead/fonts/woff', 'SundayMasthead-Regular.woff2'), {
        fontSize: 64,
        strokeThickness: 1,
        dropShadow: true,
        fill: 'white',
    })
    await createFont('body-font',
        fontPath('min_sans/fonts/woff2', 'MinSans-Black.woff2'), {
        fontSize: 24,
        strokeThickness: 1,
        dropShadow: true,
        fill: 'white',
    });
}

export async function createTitleMenu() {

    const titleContainer = new PIXI.Container()
    const viewSize = { w: 640, h: 360 }

    let bitmapText0 = new PIXI.BitmapText("PLOUFIXES", { fontName: "title-font" });
    bitmapText0.anchor.set(0.5, 0)
    bitmapText0.x = viewSize.w / 2
    bitmapText0.y = 50
    titleContainer.addChild(bitmapText0)


    const items = [
        { text: "text using a fancy font!" },
        { text: "text using a fancy font!" },
        { text: "text using a fancy font!" }
    ]
    const menuContainer = new PIXI.Container()
    items.forEach((item, itemIndex) => {
        let bitmapText1 = new PIXI.BitmapText(item.text.toLocaleUpperCase(), { fontName: "body-font" });
        bitmapText1.x = viewSize.w / 2
        bitmapText1.y = (itemIndex * 1.2) * 24
        bitmapText1.anchor.set(0.5, 0)
        bitmapText1.calculateBounds()
        menuContainer.addChild(bitmapText1)
    })
    menuContainer.x = 0
    menuContainer.y = 150

    const container = new PIXI.Container()
    container.addChild(titleContainer)
    container.addChild(menuContainer)

    return container
}
