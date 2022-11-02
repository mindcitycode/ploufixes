import { createDisplay } from './view/display.js'

import { processGameUpdate, getCurrentState } from './state.js'
import { makeWsUrl } from './network.js'
import { ClientKeyControllerInputMessage, MSG_TYPE_CLIENT_BEEN_IDLE_TOO_LONG, MSG_TYPE_GAME_CREATION_OPTIONS, MSG_TYPE_HERE_IS_YOUR_PID, MSG_TYPE_WORLD_UPDATE, parseBinaryServerMessage } from '../common/messages.js'
import { createRegisteredWorld, worldEntitiesToObject } from '../game/world.js'
import { defineDeserializer, DESERIALIZE_MODE, entityExists, getAllEntities, hasComponent, removeEntity } from 'bitecs'
import { Position } from '../game/components/position.js'
import { KeyboardInput } from './inputs.js'
import { getCharacterShape, selectAnimation, selectFlipRotation, selectRotationRotation } from '../common/animations.js'
import { FLIPPED_HORIZONTALLY_FLAG } from '../common/tilemap.js'
import { ANIM_BIG_EXPLOSION } from '../common/generated-game-animations-definitions.js'
import { Shape } from '../common/shape.js'

import { getCurrentUser, loginForm } from './user/user.js'

const go = async () => {
    const user = await getCurrentUser()
    if (user.username) {
        startGame()
    } else {
        let logged = false
        let message = ''
        while (!logged) {
            try {
                await loginForm({message})
                logged = true
            } catch (e) {
                console.log('wrong login',e)
                message = e.message
            }
        }
        go()
    }
}
go()
const startGame = async () => {


    const keyboardInput = KeyboardInput()


    const display = await createDisplay()
    let gameDisplay = undefined
    let affectedPid = undefined

    const animationFrame = () => {
        const state = getCurrentState()

        // if (Math.random() > 0.99) console.log('>>>>>>', state)


        if (gameDisplay !== undefined) {
            if (state?.ows?.removePid) {
                state.ows.removePid.forEach(pid => {
                    gameDisplay.removeASprite(pid)
                })
            }
            if (state?.ows?.byPid) {
                const _shape = Shape

                for (const object of state.ows.noPid) {
                    console.log('no pid', object, object.Character)
                    if (object.Character.hasCharacter && object.Position.hasPosition) {
                        console.log('no pidx', object)
                        const character_type = object.Character.character_type
                        const action_type = object.Action?.action_type
                        const orientation_a8 = object.Orientation?.orientation_a8
                        const animationNum = selectAnimation(character_type, action_type, orientation_a8)
                        const asprite = gameDisplay.createOneshotASprite(animationNum)

                        const shape = getCharacterShape(character_type, _shape)
                        // define anchor here rather thant in sprite to circuvent strange pixi behaviour
                        // rotation center ("pivot") is set in sprite to (0.5,0.5) of texture, in absolute dimension
                        // (0.5*w,0.5*h)
                        const aax = 0.5 * shape.w - shape.ax * shape.w
                        const aay = 0.5 * shape.h - shape.ay * shape.h
                        asprite.x = Math.round(object.Position.position_x + aax)
                        asprite.y = Math.round(object.Position.position_y + aay)
                        console.log(asprite)
                    }
                }
                // delete in original base update
                state.ows.noPid.length = 0

                for (const [pid, object] of Object.entries(state.ows.byPid)) {
                    //const pid = (object.PermanentId?.hasPermanentId)?object.PermanentId.permanentId_pid:undefined

                    let asprite = undefined

                    if (object.PermanentId.hasPermanentId && object.Character.hasCharacter) {//&& object.Action.hasAction && object.Orientation.hasOrientation) {
                        const character_type = object.Character.character_type
                        const action_type = object.Action?.action_type
                        const orientation_a8 = object.Orientation?.orientation_a8
                        const animationNum = selectAnimation(character_type, action_type, orientation_a8)
                        asprite = gameDisplay.getOrCreateASprite(pid, animationNum)
                    } else {
                        asprite = gameDisplay.getOrCreateASprite(pid, ANIM_BIG_EXPLOSION)
                        asprite.tint = 0xff0000
                    }
                    if (object.PermanentId.hasPermanentId && object.Position.hasPosition) {
                        if ((parseInt(pid) === parseInt(affectedPid))) {
                            gameDisplay.scrollablePositioner.centerOnTarget({
                                x: Math.round(object.Position.position_x),
                                y: Math.round(object.Position.position_y)
                            })
                        }
                    }
                    if (asprite && object.Position.hasPosition && object.Character.hasCharacter) {
                        const character_type = object.Character.character_type
                        const shape = getCharacterShape(character_type, _shape)
                        // define anchor here rather thant in sprite to circuvent strange pixi behaviour
                        // rotation center ("pivot") is set in sprite to (0.5,0.5) of texture, in absolute dimension
                        // (0.5*w,0.5*h)
                        const aax = 0.5 * shape.w - shape.ax * shape.w
                        const aay = 0.5 * shape.h - shape.ay * shape.h
                        asprite.x = Math.round(object.Position.position_x + aax)
                        asprite.y = Math.round(object.Position.position_y + aay)
                    }
                    if (asprite && object.Character.hasCharacter) {//&& object.Action.hasAction && object.Orientation.hasOrientation) {
                        const character_type = object.Character.character_type
                        const action_type = object.Action?.action_type
                        const orientation_a8 = object.Orientation?.orientation_a8
                        const flipRotation = selectFlipRotation(character_type, action_type, orientation_a8)
                        asprite.scale.x = (flipRotation & FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1
                        const rotationRotation = selectRotationRotation(character_type, action_type, orientation_a8)
                        if (rotationRotation !== undefined) {
                            asprite.rotation = rotationRotation
                        }
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
                        // TODO : deserialize MAP does not remove removed entities
                        getAllEntities(world).forEach(eid => {
                            if (entityExists(world, eid)) {
                                removeEntity(world, eid)
                            }
                        })
                        deserialize(world, message.serializedWorld, DESERIALIZE_MODE.MAP)
                        const object = worldEntitiesToObject(world)
                        const ows = {
                            byPid: Object.fromEntries(
                                object
                                    .filter(o => o.exists)
                                    .filter(o => o.PermanentId.hasPermanentId === true)
                                    .map(o => ([o.PermanentId.permanentId_pid, o]))
                            ),
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

