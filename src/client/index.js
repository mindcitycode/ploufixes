import { createDisplay } from './view/display.js'

import { processGameUpdate, getCurrentState } from './state.js'
import { makeWsUrl } from './network.js'
import { ClientKeyControllerInputMessage, MSG_TYPE_CLIENT_BEEN_IDLE_TOO_LONG, MSG_TYPE_GAME_CREATION_OPTIONS, MSG_TYPE_HERE_IS_YOUR_PID, MSG_TYPE_WORLD_UPDATE, parseBinaryServerMessage } from '../common/messages.js'
import { createRegisteredWorld, worldEntitiesToObject } from '../game/world.js'
import { defineDeserializer, DESERIALIZE_MODE, getAllEntities, hasComponent } from 'bitecs'
import { Position } from '../game/components/position.js'
import { KeyboardInput } from './inputs.js'
import { selectAnimation, selectFlipRotation } from '../common/animations.js'
import { FLIPPED_HORIZONTALLY_FLAG } from '../common/tilemap.js'
import { ANIM_BIG_EXPLOSION } from '../common/generated-game-animations-definitions.js'


const go = async () => {


    const keyboardInput = KeyboardInput()


    const display = await createDisplay()
    let gameDisplay = undefined
    let affectedPid = undefined

    const animationFrame = () => {
        const state = getCurrentState()

        // if (Math.random() > 0.99) console.log('>>>>>>', state)


        if (gameDisplay !== undefined) {
            if (state?.ows?.byPid) {
                for (const [pid, object] of Object.entries(state.ows.byPid)) {
                    let asprite = undefined

                    if (object.Character.hasCharacter && object.Action.hasAction && object.Orientation.hasOrientation) {
                        const character_type = object.Character.character_type
                        const action_type = object.Action.action_type
                        const orientation_a8 = object.Orientation.orientation_a8
                        const animationNum = selectAnimation(character_type, action_type, orientation_a8)
                        asprite = gameDisplay.getOrCreateASprite(pid, animationNum)
                    } else {
                        asprite = gameDisplay.getOrCreateASprite(pid, ANIM_BIG_EXPLOSION)
                        asprite.tint = 0xff0000
                    }
                    if ((parseInt(pid) === parseInt(affectedPid))) {
                        gameDisplay.scrollablePositioner.centerOnTarget({
                            x: Math.round(object.Position.position_x),
                            y: Math.round(object.Position.position_y)
                        })
                    }
                    if (asprite && object.Position.hasPosition) {
                        asprite.x = Math.round(object.Position.position_x)
                        asprite.y = Math.round(object.Position.position_y)
                    }
                    if (asprite && object.Character.hasCharacter && object.Action.hasAction && object.Orientation.hasOrientation) {
                        const character_type = object.Character.character_type
                        const action_type = object.Action.action_type
                        const orientation_a8 = object.Orientation.orientation_a8
                        const flipRotation = selectFlipRotation(character_type, action_type, orientation_a8)
                        asprite.scale.x = (flipRotation & FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1
                    }
                }
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
                        // console.log('world update')
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
                    case MSG_TYPE_CLIENT_BEEN_IDLE_TOO_LONG: {
                        console.error('BEEN IDLE TOO LONG')
                        socket.close()
                        break;
                    }
                    case MSG_TYPE_HERE_IS_YOUR_PID: {
                        const pid = message.pid
                        affectedPid = pid
                        console.log('I been affected the permanent id', pid)
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