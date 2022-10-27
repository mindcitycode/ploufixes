import { createDisplay } from './view/display.js'

import { processGameUpdate, getCurrentState } from './state.js'
import { makeWsUrl } from './network.js'
import { MSG_TYPE_WORLD_UPDATE, parseBinaryMessage } from '../common/messages.js'
import { createRegisteredWorld, worldEntitiesToObject } from '../game/world.js'
import { defineDeserializer, DESERIALIZE_MODE, getAllEntities, hasComponent } from 'bitecs'
import { Position } from '../game/components/position.js'

const go = async () => {
    const asprite = await createDisplay()

    const animationFrame = () => {
        const state = getCurrentState()
        //console.log('>',state)
        if (state?.position) {
            asprite.x = state.position[0]
            asprite.y = state.position[1]
        }
        requestAnimationFrame(animationFrame)
    }
    animationFrame()
}
go()


function websocket() {


    const socket = new WebSocket(makeWsUrl('/hello-ws', 80))
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
       
        const arrayBuffer = await event.data.arrayBuffer()
        const parsed = parseBinaryMessage(arrayBuffer)
        deserialize(world, parsed.serializedWorld, DESERIALIZE_MODE.MAP)
    //    console.log(worldEntitiesToObject(world))

        const positions = getAllEntities(world).filter(eid => (
            hasComponent(world, Position, eid)
        )).map(eid => {
            return [
                Position.x[eid],
                Position.y[eid],
            ]
        })
        const state = {
            t: parsed.t,
            position: positions[0],
        }
        processGameUpdate(state)

       
    });

    socket.addEventListener('error', function (event) {
        console.log('Voici un message de erreur', event);
    });

}
websocket()

