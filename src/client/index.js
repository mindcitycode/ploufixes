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
    console.log('websocket', socket)

    socket.addEventListener('open', function (event) {
        console.log('socket is opened')
        socket.send('Coucou le serveur !');
    });
    socket.addEventListener('close', function (event) {
        console.log('Byebye le serveur !');
    });

    socket.addEventListener('error', function (event) {
        console.log('Voici un message de erreur', event);
    });

    const world = createRegisteredWorld()
    const deserialize = defineDeserializer(world)

    socket.addEventListener('message', async function (event) {
        if ((event.data instanceof Blob)) {
            const arrayBuffer = await event.data.arrayBuffer()
            const message = parseBinaryMessage(arrayBuffer)
            switch (message.type) {
                case MSG_TYPE_WORLD_UPDATE: {
                    deserialize(world, message.serializedWorld, DESERIALIZE_MODE.MAP)
                    const positions = getAllEntities(world).filter(eid => (
                        hasComponent(world, Position, eid)
                    )).map(eid => {
                        return [
                            Position.x[eid],
                            Position.y[eid],
                        ]
                    })
                    const state = {
                        t: message.t,
                        position: positions[0],
                    }
                    processGameUpdate(state)
                }
                default: {
                    throw new Error('wrong message type', type)
                }
            }
        } else {
            const message = JSON.parse(event.data)
            console.log('DATA', event.data, typeof event.data, message)
        }
    });


}
websocket()

