import {
    defineQuery,
    addEntity,
    addComponent,
    removeEntity,
} from 'bitecs'

import { Position } from '../components/position.js'
import { Velocity } from '../components/velocity.js'
import { PermanentId } from '../components/permanentId.js'

export const timeSystem = world => {

    const { time } = world
    const now = performance.now() / 1000
    const delta = now - time.then
    time.delta = delta
    time.elapsed += delta
    time.then = now
    return world
}
export const movementQuery = defineQuery([Position, Velocity])
export const movementSystem = world => {
    const { time: { delta } } = world
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        Position.x[eid] += Velocity.x[eid] * delta
        Position.y[eid] += Velocity.y[eid] * delta
    }
    return world

}
export const destroyerSystem = world => {
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        removeEntity(world, eid)

        const eid2 = addEntity(world)
        addComponent(world, Position, eid2)
        addComponent(world, Velocity, eid2)
    }
    return world
}
export const permanentIdQuery = defineQuery([PermanentId])
export const permnentIdAttributionSystem = world => {
    const { permanentId } = world
    const ents = permanentIdQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        if (PermanentId.pid[eid] === 0) {
            PermanentId.pid[eid] = permanentId.nextOne
            permanentId.nextOne++
        }
    }
    return world
}