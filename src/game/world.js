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

export const BestFriend = defineComponent({ who: Types.eid })


const timeSystem = world => {
    const { time } = world
    const now = performance.now()
    const delta = now - time.then
    time.delta = delta
    time.elapsed += delta
    time.then = now
    return world
}

const movementQuery = defineQuery([Position, Velocity])
const movementSystem = world => {
    const { time: { delta } } = world
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        Position.x[eid] += Velocity.x[eid] * delta
        Position.y[eid] += Velocity.y[eid] * delta
    }
    return world

}
const destroyerSystem = world => {
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        removeEntity(world, eid)
/*
        const eid2 = addEntity(world)
        addComponent(world, Position, eid2)
        addComponent(world, Velocity, eid2)
        Position.x[eid2] = Math.random()
    */  }
    return world
}
const pipeline = pipe(movementSystem, timeSystem, destroyerSystem)

const packBasePath = 'assets/Robot Warfare Asset Pack 22-11-24'

const loadTilemap = async tilemapName => {
    const tilemapPath = [packBasePath, tilemapName].join('/')
    const tilemapData = await fetch(tilemapPath).then(x => x.json())
    console.log('tilemapData', tilemapData)


}

import { Bus } from '../common/bus.js'
import { WorldUpdateMessage } from '../common/messages.js'

const createRegisteredWorld = () => {
    const world = createWorld()
    registerComponent(world, Position)
    registerComponent(world, Velocity)
//    registerComponent(world, BestFriend)
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

    // create default entities
    const eid = addEntity(world)
    addComponent(world, Position, eid)
    addComponent(world, Velocity, eid)
    Velocity.x[eid] = 1.23
    Velocity.y[eid] = 1.23

    const eid2 = addEntity(world)
 //   addComponent(world, BestFriend, eid2)
   // BestFriend.who[eid2] = eid
    // world attributes (not serialized)
    world.time = { delta: 0, elapsed: 0, then: performance.now() }

    // world step
    let nStep = 0
    const step = () => {
   /*     
        if (nStep === 3) {
            console.log('remove',eid)
            removeEntity(world, eid)
        } else if ( nStep === 4){
            console.log('remove',eid2)
            removeEntity(world, eid)

        }
     */   pipeline(world)

        const entities = getAllEntities(world)
        console.log('-------------------')
        entities.forEach(e => {
            console.log('s!', e, 'exists', entityExists(world,e))
            console.log('s!', e, 'position', hasComponent(world, Position, e) ? (Position.x[e]) : 'non')
            console.log('s!', e, 'velocity', hasComponent(world, Velocity, e) ? (Velocity.x[e]) : 'non')
     //       console.log('s!', e, 'bestfriend', hasComponent(world, BestFriend, e) ? (BestFriend.who[e]) : 'non')
        })


        worldBus.say(
            WorldUpdateMessage(
                Date.now(),
                serialize(world)
            )
        )
        nStep++
    }

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
const desserialize = defineDeserializer(reWorld)

game.bus.addListener(worldUpdateMessage => {

    console.log('got message', worldUpdateMessage)
    const { t, serializedWorld } = worldUpdateMessage

    console.log('t', t)

    desserialize(reWorld, serializedWorld, DESERIALIZE_MODE.MAP)

    const entities = getAllEntities(reWorld)
    entities.forEach(eid => {
        console.log(eid, 'exists?', entityExists(reWorld, eid) ? 'OUI' : 'non')
        console.log(eid, 'position', hasComponent(reWorld, Position, eid) ? (Position.x[eid]) : 'non')
        console.log(eid, 'velocity', hasComponent(reWorld, Velocity, eid) ? (Velocity.x[eid]) : 'non')
     //   console.log(eid, 'bestfriend', hasComponent(reWorld, BestFriend, eid) ? (BestFriend.who[eid]) : 'non')
    })

    //    deleteWorld(reWorld)
    //  console.log('a position', e)
    // hasComponent(reWorld, Position, e)
    // console.log('a position', e)


    //console.log(entities)

    //    const eid = entities[0]
    //  console.log(Velocity.x[eid], Velocity.y[eid])
    // console.log(BestFriend.who[entities[1]])

    //    console.log(entities)
})
game.start()
/*game.step()
game.step()
game.step()
game.step()
game.step()
game.step()*/