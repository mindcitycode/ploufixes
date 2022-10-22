import * as PIXI from 'pixi.js'
const app = new PIXI.Application({ width: 640, height: 360 });
document.body.appendChild(app.view);
const sprite = PIXI.Sprite.from('assets/hands.png');
app.stage.addChild(sprite);

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
     //   const state = JSON.parse(event.data)

        sprite.x = state.position[0]
        sprite.y = state.position[1]
        console.log('state',state)
    });

    socket.addEventListener('error', function (event) {
        console.log('Voici un message de erreur', event);
    });

}
websocket()

