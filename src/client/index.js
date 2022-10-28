import { createDisplay } from './view/display.js'

import { processGameUpdate, getCurrentState } from './state.js'
import { makeWsUrl } from './network.js'
import { ClientKeyControllerInputMessage, MSG_TYPE_GAME_CREATION_OPTIONS, MSG_TYPE_WORLD_UPDATE, parseBinaryServerMessage } from '../common/messages.js'
import { createRegisteredWorld, worldEntitiesToObject } from '../game/world.js'
import { defineDeserializer, DESERIALIZE_MODE, getAllEntities, hasComponent } from 'bitecs'
import { Position } from '../game/components/position.js'
import { KeyboardInput } from './inputs.js'


const go = async () => {


    const keyboardInput = KeyboardInput()


    const display = await createDisplay()
    let gameDisplay = undefined

    const animationFrame = () => {
        const state = getCurrentState()

        // if (Math.random() > 0.99) console.log('>>>>>>', state)

        if (gameDisplay !== undefined) {
            for (const [pid, object] of Object.entries(state.ows.byPid)) {
                const asprite = gameDisplay.getOrCreateASprite(pid)
                asprite.x = object.Position.position_x
                asprite.y = object.Position.position_y
            }
        }
        requestAnimationFrame(animationFrame)
    }
    animationFrame()


    function websocket() {

        const world = createRegisteredWorld()
        const deserialize = defineDeserializer(world)

        const socket = new WebSocket(makeWsUrl('/hello-ws', 80))
        console.log('websocket', socket)

        const sendKeyboardInputMessage = (state) => socket.send(ClientKeyControllerInputMessage(state))

        socket.addEventListener('open', function (event) {
            console.log('socket is opened')
        //    socket.send('Coucou le serveur !');
            keyboardInput.bus.addListener(sendKeyboardInputMessage)
        });

        const onCloseOrError = () => {
            keyboardInput.bus.removeListener(sendKeyboardInputMessage)
        }
        socket.addEventListener('close', function (event) {
            console.log('Byebye le serveur !');
            onCloseOrError()
        });

        socket.addEventListener('error', function (event) {
            console.log('Voici un message de erreur', event);
            onCloseOrError()
        });


        socket.addEventListener('message', async function (event) {

            if ((event.data instanceof Blob)) {
                const arrayBuffer = await event.data.arrayBuffer()
                const message = parseBinaryServerMessage(arrayBuffer)
                switch (message.type) {
                    case MSG_TYPE_WORLD_UPDATE: {
                        deserialize(world, message.serializedWorld, DESERIALIZE_MODE.MAP)
                        const object = worldEntitiesToObject(world)
                        const ows = {
                            byPid: Object.fromEntries(object.filter(o => o.PermanentId.hasPermanentId === true).map(o => {
                                return [o.PermanentId.permanentId_pid, o]
                            })),
                            noPid: object.filter(o => o.PermanentId.hasPermanentId === false)
                        }
                        const state = { t: message.t, ows }
                        processGameUpdate(state)
                        break;
                    }
                    default: {
                        throw new Error('wrong (binary) message type', message.type)
                    }
                }
            } else {
                const message = JSON.parse(event.data)
                switch (message.type) {
                    case MSG_TYPE_GAME_CREATION_OPTIONS: {
                        console.log('game creation options message', message)
                        gameDisplay = await display.loadGame(message.gameOptions)
                        break;
                    }
                    default: {
                        throw new Error('wrong (json) message type', message.type)
                    }
                }
            }
        });


    }
    websocket()

}

go()