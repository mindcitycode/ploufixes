import './view/display.js'

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