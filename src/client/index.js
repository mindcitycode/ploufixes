import * as PIXI from 'pixi.js'
const app = new PIXI.Application({ width: 640, height: 360 });
document.body.appendChild(app.view);
const sprite = PIXI.Sprite.from('assets/hands.png');
app.stage.addChild(sprite);
sprite.tint = 0xff0000
const sprite2 = PIXI.Sprite.from('assets/hands.png');
app.stage.addChild(sprite2);

const makeRestUrl = (pathname) => {
    const url = new URL(window.location)
    //url.protocol = 'ws'
    url.port = '3000'
    url.pathname = pathname
    return url.toString()
}

async function rest() {
    const url = makeRestUrl('/zozo/apppp')
    const a = await fetch(url)
    console.log('fetched', await a.json())
}
rest()

const makeWsUrl = () => {
    const url = new URL(window.location)
    url.protocol = 'ws'
    url.port = '3000'
    url.pathname = '/hello-ws'
    return url.toString()
}
import { processGameUpdate, getCurrentState } from './state.js'

const animationFrame = () => {
    const state = getCurrentState()
    //console.log(state)
    if (state?.position) {
        sprite2.x = state.position[0]
        sprite2.y = state.position[1]
    }
    requestAnimationFrame(animationFrame)
}
animationFrame()


function websocket() {
    console.log(makeWsUrl())

    const socket = new WebSocket(makeWsUrl())
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

