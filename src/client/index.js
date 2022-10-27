import './view/style.css'
import * as PIXI from 'pixi.js'

/*for ( let i = 0 ; i < 5000 ; i++ ){
    const j = i / 16 * 9
    if ( j === Math.floor(j)){
        console.log(i,j)
    }
}*/

const app = new PIXI.Application({ width: 640, height: 640 });
document.body.appendChild(app.view);
app.view.classList.add('fullscreen')
console.log('view', app.view)
const sprite = PIXI.Sprite.from('assets/hands.png');
//app.stage.addChild(sprite);
sprite.tint = 0xff0000
const sprite2 = PIXI.Sprite.from('assets/hands.png');
//app.stage.addChild(sprite2);
app.stage.sortableChildren = true
app.ticker.add(() => {

    const pixelshown = { w: 640, h: 360 }
    const screen = { w: window.innerWidth, h: window.innerHeight }
    const mult = Math.min(screen.w / pixelshown.w, screen.h / pixelshown.h)

    const scaleToInteger = true
    let rmult
    if ((mult >= 1) && scaleToInteger) {
        rmult = Math.floor(mult)
    } else {
        rmult = mult
    }


    app.view.width = pixelshown.w
    app.view.height = pixelshown.h

    app.view.style.width = `${pixelshown.w * rmult}px`
    app.view.style.height = `${pixelshown.h * rmult}px`

})
import { testSpritesheet } from './view/sprites.js'
testSpritesheet(app)

import { testTilemap } from './view/tilemap.js'
testTilemap(app)




import { processGameUpdate, getCurrentState } from './state.js'
import { makeWsUrl } from './network.js'
if (false) {
    const animationFrame = () => {
        const state = getCurrentState()
        if (state?.position) {
            sprite2.x = state.position[0]
            sprite2.y = state.position[1]
        }
        requestAnimationFrame(animationFrame)
    }
    animationFrame()


    function websocket() {


        const socket = new WebSocket(makeWsUrl('/hello-ws'))
        console.log(socket)

        socket.addEventListener('open', function (event) {
            console.log('socket is opened')
            socket.send('Coucou le serveur !');
        });
        socket.addEventListener('close', function (event) {
            console.log('Byebye le serveur !');
        });
        socket.addEventListener('message', function (event) {
            //    console.log('Voici un message du serveur', event.data);
            const state = JSON.parse(event.data)
            sprite.x = state.position[0]
            sprite.y = state.position[1]
            processGameUpdate(state)
            //        console.log('state', state)
        });

        socket.addEventListener('error', function (event) {
            console.log('Voici un message de erreur', event);
        });

    }
    websocket()

}