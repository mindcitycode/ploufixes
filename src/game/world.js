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

import { timeSystem, movementSystem, permanentIdAttributionSystem, controlSystem, weaponSystem, ttlSystem, discreteSystem } from './systems/systems.js'
import { getTilemapDataBounds } from '../common/tilemap.js'
import { instanciateTilemapRTree } from '../common/tree.js'

import { Position } from './components/position.js'
import { Velocity } from './components/velocity.js'
import { PermanentId } from './components/permanentId.js'
import { KeyControl } from './components/keyControl.js'
import { Action, ACTION_TYPE_WALK } from './components/action.js'
import { Character, CHARACTER_TYPE_ANTITANK } from './components/character.js'
import { Orientation } from './components/orientation.js'
import { Weapon, WEAPON_TYPE_GRENADE_LAUNCHER, WEAPON_TYPE_PLASMA_LAUNCHER, WEAPON_TYPE_ROCKET_LAUNCHER } from './components/weapon.js'
import { Ttl } from './components/ttl.js'
import { Discrete } from './components/discrete.js'
import { spawnSoldier } from './spawns.js'

const pipeline = pipe(
    controlSystem,
    weaponSystem,
    movementSystem,
    timeSystem,
    ttlSystem,
    permanentIdAttributionSystem,
    discreteSystem,
)

export const createRegisteredWorld = () => {
    const world = createWorld()
    registerComponent(world, Position)
    registerComponent(world, Velocity)
    registerComponent(world, PermanentId)
    registerComponent(world, KeyControl)
    registerComponent(world, Action)
    registerComponent(world, Character)
    registerComponent(world, Orientation)
    registerComponent(world, Weapon)
    registerComponent(world, Ttl)
    registerComponent(world, Discrete)
    return world
}

const timeMeasurement = []
let timeMeasurementIndex = 0
const timeMeasurements = 10

export const createGame = async ({ tilemapData }) => {

    // properties
    const frameRate = 20

    // create world and serializer 
    const world = createRegisteredWorld()
    const serialize = defineSerializer(world)

    // update bus
    const worldUpdatedBus = new Bus()

    // load world
    const terrainBounds = getTilemapDataBounds(tilemapData)
    console.log('terrain bounds', terrainBounds)

    // create default entities
    if (false) {
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
    }
    //    removeEntity(world,eid)
    //  removeEntity(world,eid2)
    // world attributes (not serialized)
    world.time = { delta: 0, elapsed: 0, then: performance.now() / 1000 }
    world.permanentId = { nextOne: 1 }
    world.removeList = [] // permanentids
    world.incomingControls = [] //  [permanentId,state]
    world.tilemapRTree = await instanciateTilemapRTree(tilemapData)
    // world step
    const step = () => {
        let tm = [BigInt(Date.now())]
        pipeline(world)
        worldUpdatedBus.say(WorldUpdateMessage(Date.now(), serialize(world)))
        tm.push(BigInt(Date.now()))
        let el = `${tm[1] - tm[0]}`
        tm.push(el)
        timeMeasurement[(timeMeasurementIndex++) % timeMeasurements] = tm
        // console.log(timeMeasurement)
    }
    // run
    let intervalHandler = undefined
    const start = () => { intervalHandler = setInterval(step, 1000 / frameRate) }
    const stop = () => { clearInterval(intervalHandler) }

    // inputs
    const addClient = () => {

        const clientPermanentId = world.permanentId.nextOne
        world.permanentId.nextOne += 1
        
        const cx = (16 * 5) + 20 * Math.random()
        const cy = (16 * 5) + 20 * Math.random()
        const eid = spawnSoldier(world, CHARACTER_TYPE_ANTITANK, WEAPON_TYPE_ROCKET_LAUNCHER, cx, cy)
        
        // add controls
        addComponent(world, KeyControl, eid)
        KeyControl.state[eid] = 0
        
        // set pid
        PermanentId.pid[eid] = clientPermanentId
        console.log('client add with permanent id', clientPermanentId)
        
        return clientPermanentId
    }
    const removeClient = (clientPermanentId) => {
        world.removeList.push(clientPermanentId)
    }
    const onClientMessage = (pid, message) => {
        switch (message.type) {
            case MSG_TYPE_CLIENT_KEY_CONTROLLER_INPUT: {
                const state = message.state // controller state
                world.incomingControls.push({ pid, state })
            }
        }
    }
    return {
        worldUpdatedBus,
        stop: () => clearInterval(intervalHandler),
        start,
        step,
        onClientMessage,
        addClient,
        removeClient
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
        const hasOrientation = hasComponent(world, Orientation, eid)
        const hasCharacter = hasComponent(world, Character, eid)
        const hasAction = hasComponent(world, Action, eid)
        const hasWeapon = hasComponent(world, Weapon, eid)
        const hasTtl = hasComponent(world, Ttl, eid)
        const hasDiscrete = hasComponent(world, Discrete, eid)
        const position_x = Position.x[eid]
        const position_y = Position.y[eid]
        const velocity_x = Velocity.x[eid]
        const velocity_y = Velocity.y[eid]
        const permanentId_pid = PermanentId.pid[eid]
        const orientation_a8 = Orientation.a8[eid]
        const character_type = Character.type[eid]
        const action_type = Action.type[eid]
        const weapon_type = Weapon.type[eid]
        const weapon_idle = Weapon.idle[eid]
        const weapon_reload = Weapon.reload[eid]
        const ttl_remaining = Ttl.remaining[eid]
        const discrete_seen = Discrete.seen[eid]
        const object = {
            eid,
            exists,
            Position: { hasPosition, position_x, position_y },
            Velocity: { hasVelocity, velocity_x, velocity_y },
            PermanentId: { hasPermanentId, permanentId_pid },
            Orientation: { hasOrientation, orientation_a8 },
            Character: { hasCharacter, character_type },
            Action: { hasAction, action_type },
            Weapon: { hasWeapon, weapon_type, weapon_idle, weapon_reload },
            Ttl: { hasTtl, ttl_remaining },
            Discrete: { hasDiscrete, discrete_seen }
        }
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
