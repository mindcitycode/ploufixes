import * as PIXI from 'pixi.js'
import { Assets } from '@pixi/assets';

export async function createTextFields() {

    

    const fontPath = 'assets/SundayACHand-Thin.woff'
    const tutu = await fetch(fontPath)
    console.log('tutu', await tutu.arrayBuffer())
    Assets.add('my-font', fontPath)
    const loaded = await Assets.load('my-font')
    console.log('loaded',loaded)
    
    const fromme = PIXI.BitmapFont.from('my-font', {
        fontFamily: 'Sundayachand Thin',
        fontSize: 12,
        strokeThickness: 2,
        fill: 'purple',
    });
    console.log('fromme',fromme)
    let bitmapText = new PIXI.BitmapText("text using a fancy font!", { fontName: "my-font", align: "right" });

    return bitmapText
}
