import { Bus } from '../common/bus.js'
import { WorldUpdateMessage } from '../common/messages.js'
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

const pipeline = pipe(movementSystem, timeSystem, destroyerSystem, permnentIdAttributionSystem)

const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'
const loadTilemap = async tilemapName => {
    const tilemapPath = [packBasePath, tilemapName].join('/')
    const tilemapData = await fetch(tilemapPath).then(x => x.json())
    console.log('tilemapData', tilemapData)
}

const createRegisteredWorld = () => {
    const world = createWorld()
    registerComponent(world, Position)
    registerComponent(world, Velocity)
    registerComponent(world, PermanentId)
    return world
}

const createGame = () => {

    // properties
    const frameRate = 1 // 10

    // create world and serializer 
    const world = createRegisteredWorld()
    const serialize = defineSerializer(world)

    // update bus
    const worldBus = new Bus()

    // load world

    // create default entities
    const eid0 = addEntity(world)
    {
        const eid = eid0
        addComponent(world, Position, eid)
        addComponent(world, Velocity, eid)
        addComponent(world, PermanentId, eid)
        Position.x[eid] = 0
        Position.y[eid] = 0
        Velocity.x[eid] = 1
        Velocity.y[eid] = 2
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
        Velocity.x[eid] = 1
        Velocity.y[eid] = 1
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
        worldBus.say(WorldUpdateMessage(Date.now(), serialize(world)))
    }
    // run
    let intervalHandler = undefined
    const start = () => { intervalHandler = setInterval(step, 1000 / frameRate) }
    const stop = () => { clearInterval(intervalHandler) }

    return {
        bus: worldBus,
        stop: () => clearInterval(intervalHandler),
        start,
        step,
    }
}


const game = createGame()

const reWorld = createRegisteredWorld()
const deseralize = defineDeserializer(reWorld)

game.bus.addListener(worldUpdateMessage => {

    //  console.log('got message', worldUpdateMessage)
    const { t, serializedWorld } = worldUpdateMessage
    deseralize(reWorld, serializedWorld, DESERIALIZE_MODE.MAP)
    const entities = getAllEntities(reWorld)
    entities.forEach(eid => {
        const exists = entityExists(reWorld, eid)
        const hasPosition = hasComponent(reWorld, Position, eid)
        const hasVelocity = hasComponent(reWorld, Velocity, eid)
        const hasPermanentId = hasComponent(reWorld, PermanentId, eid)

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
        console.log(object)
    })
})
game.start()
