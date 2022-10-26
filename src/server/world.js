import {
    createWorld,
    Types,
    defineComponent,
    defineQuery,
    addEntity,
    addComponent,
    pipe,
    defineDeserializer,
    defineSerializer
} from 'bitecs'


const save = (world) => {
    const serialize = defineSerializer(world)
    return serialize(world)
}

const load = (world, packet) => {
    const deserialize = defineDeserializer(world)
    deserialize(world, packet)
}

const Vector3 = { x: Types.f32, y: Types.f32, z: Types.f32 }
const Position = defineComponent(Vector3)
const Velocity = defineComponent(Vector3)

const movementQuery = defineQuery([Position, Velocity])

const movementSystem = (world) => {
    const { time: { delta } } = world
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        Position.x[eid] += Velocity.x[eid] * delta
        Position.y[eid] += Velocity.y[eid] * delta
        Position.z[eid] += Velocity.z[eid] * delta
    }
    return world
}

const timeSystem = world => {
    const { time } = world
    const now = performance.now()
    const delta = now - time.then
    time.delta = delta
    time.elapsed += delta
    time.then = now
    return world
}

const pipeline = pipe(movementSystem, timeSystem)

const world = createWorld()
world.time = { delta: 0, elapsed: 0, then: performance.now() }

const eid = addEntity(world)
addComponent(world, Position, eid)
addComponent(world, Velocity, eid)
Velocity.x[eid] = 1.23
Velocity.y[eid] = 1.23
pipeline(world)
pipeline(world)
pipeline(world)

/*
setInterval(() => {
    pipeline(world)
}, 16)
*/

console.log(save(world))
pipeline(world)
console.log(save(world))
pipeline(world)
console.log(save(world))
pipeline(world)
{
const eid = addEntity(world)
addComponent(world, Position, eid)
addComponent(world, Velocity, eid)
Velocity.x[eid] = 1.23
Velocity.y[eid] = 1.23
}
console.log(save(world))
pipeline(world)
console.log(save(world))
console.log(save(world))
