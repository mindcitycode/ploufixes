import {
    defineQuery,
    addEntity,
    addComponent,
    removeEntity,
    hasComponent,
} from 'bitecs'

import { Position } from '../components/position.js'
import { Velocity } from '../components/velocity.js'
import { PermanentId } from '../components/permanentId.js'
import { KeyControl } from '../components/keyControl.js'
import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP } from '../../common/keyController.js'
import { Orientation } from '../components/orientation.js'
import { Action, ACTION_TYPE_IDLE, ACTION_TYPE_WALK } from '../components/action.js'
export const timeSystem = world => {

    const { time } = world
    const now = performance.now() / 1000
    const delta = now - time.then
    time.delta = delta
    time.elapsed += delta
    time.then = now
    return world
}
export const externalKeyControlQuery = defineQuery([PermanentId, KeyControl, Velocity])
export const controlSystem = world => {
    const ents = externalKeyControlQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        const pid = PermanentId.pid[eid]
        for (let j = 0; j < world.incomingControls.length; j++) {
            if (world.incomingControls[j].pid === pid) {

                const incomingState = world.incomingControls[j].state
                world.incomingControls.splice(j, 1)
                j--

                // set velocity
                Velocity.y[eid] = 100 * (((incomingState & DIRECTION_UP) ? -1 : 0) + ((incomingState & DIRECTION_DOWN) ? 1 : 0))
                Velocity.x[eid] = 100 * (((incomingState & DIRECTION_LEFT) ? -1 : 0) + ((incomingState & DIRECTION_RIGHT) ? 1 : 0))

                // set orientation
                if (hasComponent(world, Orientation, eid)) {
                    if (incomingState > 0) {
                        // if there is no orientation for an axis, keep last
                        Orientation.a8[eid] |= incomingState
                        if (incomingState & DIRECTION_UP) Orientation.a8[eid] &= ~DIRECTION_DOWN
                        if (incomingState & DIRECTION_RIGHT) Orientation.a8[eid] &= ~DIRECTION_LEFT
                        if (incomingState & DIRECTION_DOWN) Orientation.a8[eid] &= ~DIRECTION_UP
                        if (incomingState & DIRECTION_LEFT) Orientation.a8[eid] &= ~DIRECTION_RIGHT
                    }
                }
            }
        }
    }
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

        // set position
        if (Position.x[eid] > 1000) {
            Position.x[eid] = 0
        }
        if (Position.y[eid] > 800) {
            Position.y[eid] = 0
        }

        // set action
        if (hasComponent(world, Action, eid)) {
            const isMoving = ((Velocity.x[eid] !== 0) || (Velocity.x[eid] !== 0))
            const currentAction = Action.type[eid]
            if (isMoving === false) {
                if (currentAction === ACTION_TYPE_WALK) {
                    Action.type[eid] = ACTION_TYPE_IDLE
                }
            } else {
                if (currentAction === ACTION_TYPE_IDLE) {
                    Action.type[eid] = ACTION_TYPE_WALK
                }
            }
        }

    }
    return world

}
export const destroyerSystem = world => {
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
/*        removeEntity(world, eid)

        const eid2 = addEntity(world)
        addComponent(world, Position, eid2)
        addComponent(world, Velocity, eid2)
    */   }
    return world
}

export const permanentIdQuery = defineQuery([PermanentId])
export const permanentIdAttributionSystem = world => {
    const { permanentId } = world
    const ents = permanentIdQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        if (PermanentId.pid[eid] === 0) {
            PermanentId.pid[eid] = permanentId.nextOne
            permanentId.nextOne++
        }
        {
            const removeIndex = world.removeList.indexOf(PermanentId.pid[eid])
            if (removeIndex >= 0) {
                world.removeList.splice(removeIndex, 1)
                console.log('SYSTEM::permnentIdAttributionSystem', 'remove', PermanentId.pid[eid])
                removeEntity(world, eid)
                console.log('SYSTEM::permnentIdAttributionSystem', 'removed eid', eid)

            }
        }
    }
    return world
}