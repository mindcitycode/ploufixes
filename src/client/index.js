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
    url.port = '3000'
    url.pathname = pathname
    return url.toString()
}
import { MSG_TYPE_GAME_CREATED_OK, MSG_TYPE_GAME_CREATED_KO } from '../common/messages.js'

const postJson = async (point, data) => {
    const url = makeRestUrl(point)
    console.log('POST to url', url)
    const a = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {x:','})
    })
    const r = await a.json()
    console.log('POST to url',url,'received response',r)
    return r

}

const restPostCreateGame = async (gameParameters) => {
    const r = await postJson('/game',gameParameters)
    if (r.type === MSG_TYPE_GAME_CREATED_OK) {
        console.log('game created ',r)
    } else if (r.type === MSG_TYPE_GAME_CREATED_KO) {
        console.log('game NOT created ')
    } else {
        throw new Error('not convincing')
    }
}
async function restGet() {
    const url = makeRestUrl('/zozo/apppp')
    console.log('make request at', url)
    const a = await fetch(url)
    console.log('REST GET fetched', await a.json())
}
restGet()
restPostCreateGame()

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

