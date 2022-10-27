import './view/display.js'

import { processGameUpdate, getCurrentState } from './state.js'
import { makeWsUrl } from './network.js'
import { MSG_TYPE_WORLD_UPDATE, parseBinaryMessage } from '../common/messages.js'
import { createRegisteredWorld, worldEntitiesToObject } from '../game/world.js'
import { defineDeserializer, DESERIALIZE_MODE } from 'bitecs'
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

}

function websocket() {


    const socket = new WebSocket(makeWsUrl('/hello-ws',80))
    console.log(socket)

    socket.addEventListener('open', function (event) {
        console.log('socket is opened')
        socket.send('Coucou le serveur !');
    });
    socket.addEventListener('close', function (event) {
        console.log('Byebye le serveur !');
    });


    const world = createRegisteredWorld()
    const deserialize = defineDeserializer(world)

    socket.addEventListener('message', async function (event) {
        console.log('Voici un message du serveur', event.data);

        const arrayBuffer = await event.data.arrayBuffer()
        const parsed = parseBinaryMessage( arrayBuffer )
        console.log(parsed.serializedWorld)
        deserialize(world, parsed.serializedWorld, DESERIALIZE_MODE.MAP)
        console.log(worldEntitiesToObject(world))

        
       /* const state = JSON.parse(event.data)
        sprite.x = state.position[0]
        sprite.y = state.position[1]
        processGameUpdate(state)
        */
        //        console.log('state', state)
    });

    socket.addEventListener('error', function (event) {
        console.log('Voici un message de erreur', event);
    });

}
websocket()

