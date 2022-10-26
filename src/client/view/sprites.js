import * as PIXI from 'pixi.js'
const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
const packSpriteSheetsFilename = 'spritesheets.json'
const combinedJsonSpriteSheetFilename = 'combined.json'

export const loadSpritesheet = async (atlasName) => {
    const altasPath = [packBasePath, atlasName].join('/')
    const atlasData = await fetch(altasPath).then(x => x.json())
    const imagePath = [packBasePath, atlasData.meta.image].join('/')
    const spritesheet = new PIXI.Spritesheet(
        PIXI.BaseTexture.from(imagePath),
        atlasData
    );
    await spritesheet.parse()
    return { atlasData, spritesheet }
}

export const testSpritesheet = async (app) => {

    const { atlasData, spritesheet } = await loadSpritesheet('combined.json')
    let x = 0
    let y = 0
    console.log('animations',atlasData.animations)

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

        app.stage.addChild(asprite)
        asprite.gotoAndPlay(0)

    })

}

export const loadSprites2 = async (app) => {

    const categorisedSpritesheets = await fetch(`${packBasePath}/${packSpriteSheetsFilename}`).then(x => x.json())

    const parses = []
    const allAnimations = {}
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

                    const animationFullName = `${category}.${spritesheetName}.${animationName}`

                    console.log('AAA', spritesheet.animations[animationName])


                    const firstAnimName = [0];
                    const asprite = new PIXI.AnimatedSprite(spritesheet.animations[animationName]);
                    asprite.animationSpeed = 0.1
                    asprite.x = x
                    asprite.y = y
                    x += 32
                    if (x > (7 * 32)) {
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