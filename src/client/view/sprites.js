import * as PIXI from 'pixi.js'
const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
const packSpriteSheetsFilename = 'spritesheets.json'
export const loadSprites = async (app) => {

    const categorisedSpritesheets = await fetch(`${packBasePath}/${packSpriteSheetsFilename}`).then(x => x.json())

    const parses = []
    const animations = {}
    let x = 0
    let y = 0
    Object.entries(categorisedSpritesheets).forEach(async ([category, spritesheets], i) => {
        Object.entries(spritesheets).forEach(async ([spritesheetName, atlasData], j) => {
            if (Object.values(atlasData.animations).length) {
                atlasData.meta.image = `${packBasePath}/${atlasData.meta.image}`
                const spritesheet = new PIXI.Spritesheet(
                    PIXI.BaseTexture.from(atlasData.meta.image),
                    atlasData
                );

                await spritesheet.parse()
                Object.keys(atlasData.animations).forEach(animationName => {
                    const firstAnimName = [0];
                    const asprite = new PIXI.AnimatedSprite(spritesheet.animations[animationName]);
                    asprite.animationSpeed = 0.1
                    asprite.x = x
                    asprite.y = y
                    x += 32
                    if (x > 200) {
                        x = 0
                        y += 32
                    }
                    console.log(category, spritesheetName, animationName)
                    app.stage.addChild(asprite)
                    asprite.gotoAndPlay(0)
                })
                x = 0
                y += 32
                /*    
                parses.push( spritesheet.parse().then( parsed => {
                    animations[`${category}.${spritesheetName}`] = parsed
                    return parsed
                }))
                */
                //       // spritesheet is ready to use!
                //     const anim = new PIXI.AnimatedSprite(spritesheet.animations.enemy);
                // });
            }
        })
    })
    /*
    const allParsed = await Promise.all(parses)
    console.log(allParsed)
    console.log("x",animations["Effects.big-explosion"]['big-explosion'])
*/
}