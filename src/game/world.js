import { Bus } from '../common/bus.js'
import { MSG_TYPE_CLIENT_KEY_CONTROLLER_INPUT, WorldUpdateMessage } from '../common/messages.js'
import {
    createWorld,
    Types,
    defineComponent,
    defineQuery,
    addEntity,
    addComponent,
    pipe,
    defineDeserializer,
    defineSerializer,
    registerComponent,
    getAllEntities,
    DESERIALIZE_MODE,
    removeEntity,
    hasComponent,
    deleteWorld,
    entityExists,
} from 'bitecs'

import { Position } from './components/position.js'
import { Velocity } from './components/velocity.js'
import { PermanentId } from './components/permanentId.js'
import { timeSystem, movementSystem, destroyerSystem, permnentIdAttributionSystem } from './systems/systems.js'
import { getTilemapDataBounds } from '../common/tilemap.js'

const pipeline = pipe(movementSystem, timeSystem, destroyerSystem, permnentIdAttributionSystem)

export const createRegisteredWorld = () => {
    const world = createWorld()
    registerComponent(world, Position)
    registerComponent(world, Velocity)
    registerComponent(world, PermanentId)
    return world
}

export const createGame = ({ tilemapData }) => {

    // properties
    const frameRate = 10

    // create world and serializer 
    const world = createRegisteredWorld()
    const serialize = defineSerializer(world)

    // update bus
    const worldUpdatedBus = new Bus()

    // load world
    const terrainBounds = getTilemapDataBounds(tilemapData)

    // create default entities
    const eid0 = addEntity(world)
    {
        const eid = eid0
        addComponent(world, Position, eid)
        addComponent(world, Velocity, eid)
        addComponent(world, PermanentId, eid)
        Position.x[eid] = 0
        Position.y[eid] = 0
        Velocity.x[eid] = 10
        Velocity.y[eid] = 10
        PermanentId.pid[eid] = 0
    }
    const eid1 = addEntity(world)
    {
        const eid = eid1
        addComponent(world, Position, eid)
        addComponent(world, Velocity, eid)
        addComponent(world, PermanentId, eid)
        Position.x[eid] = 20
        Position.y[eid] = 20
        Velocity.x[eid] = 10
        Velocity.y[eid] = 10
        PermanentId.pid[eid] = 0
    }
    //    removeEntity(world,eid)
    //  removeEntity(world,eid2)
    // world attributes (not serialized)
    world.time = { delta: 0, elapsed: 0, then: performance.now() / 1000 }
    world.permanentId = { nextOne: 1 }


    // world step
    const step = () => {
        pipeline(world)
        worldUpdatedBus.say(WorldUpdateMessage(Date.now(), serialize(world)))
    }
    // run
    let intervalHandler = undefined
    const start = () => { intervalHandler = setInterval(step, 1000 / frameRate) }
    const stop = () => { clearInterval(intervalHandler) }

    // inputs
    const addClient = () => {

        const clientPermanentId = world.permanentId.nextOne
        world.permanentId.nextOne += 1

        const eid = addEntity(world)
        {
            const eid = eid1
            addComponent(world, Position, eid)
            addComponent(world, Velocity, eid)
            addComponent(world, PermanentId, eid)
            Position.x[eid] = 20
            Position.y[eid] = 20
            Velocity.x[eid] = 10
            Velocity.y[eid] = 10
            PermanentId.pid[eid] = clientPermanentId
        }
        return clientPermanentId
    }
    const removeClient = (clientPermanentId) => {

    }
    const onClientMessage = (message) => {
        switch (message.type) {
            case MSG_TYPE_CLIENT_KEY_CONTROLLER_INPUT: {
                console.log('message !!!!!', message)
            }
        }
    }
    return {
        worldUpdatedBus,
        stop: () => clearInterval(intervalHandler),
        start,
        step,
        onClientMessage,
        addClient
    }
}



export const worldEntitiesToObject = world => {
    const entities = getAllEntities(world)
    const objects = []
    entities.forEach(eid => {
        const exists = entityExists(world, eid)
        const hasPosition = hasComponent(world, Position, eid)
        const hasVelocity = hasComponent(world, Velocity, eid)
        const hasPermanentId = hasComponent(world, PermanentId, eid)

        const position_x = Position.x[eid]
        const position_y = Position.y[eid]
        const velocity_x = Velocity.x[eid]
        const velocity_y = Velocity.y[eid]
        const permanentId_pid = PermanentId.pid[eid]
        const object = {
            eid,
            exists,
            Position: { hasPosition, position_x, position_y },
            Velocity: { hasVelocity, velocity_x, velocity_y },
            PermanentId: { hasPermanentId, permanentId_pid }
        }
        //console.log(JSON.stringify(object))
        // console.log(object)
        objects.push(object)
    })
    return objects
}

const test = () => {
    const game = createGame()
    const reWorld = createRegisteredWorld()
    const deserialize = defineDeserializer(reWorld)
    game.bus.addListener(worldUpdateMessage => {

        //  console.log('got message', worldUpdateMessage)
        const { t, serializedWorld } = worldUpdateMessage
        deserialize(reWorld, serializedWorld, DESERIALIZE_MODE.MAP)
        console.log(worldEntitiesToObject(reWorld))
    })
    game.start()
}
