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
import { Bounds } from '../../common/bounds.js'
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

function getBoundingBox(x, y, w, h, ax, ay, bounds = Bounds()) {
    bounds.minX = x - ax * w
    bounds.maxX = bounds.minX + w
    bounds.minY = y - ay * h
    bounds.maxY = bounds.minY + h
    return bounds
}

const __bounds = Bounds()
const axisMovement = (posx, posy, size, anchor) => {

}

export const movementQuery = defineQuery([Position, Velocity])
export const movementSystem = world => {
    const { time: { delta } } = world
    const ents = movementQuery(world)

    const _bounds = Bounds()

    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]

        const currentx = Position.x[eid]
        const currenty = Position.y[eid]
        // compute new position
        //const posx = currentx + Math.sign(Velocity.x[eid] * delta)
        //const posy = currenty + Math.sign(Velocity.y[eid] * delta)
        const d = {
            x: Velocity.x[eid] * delta,
            y: Velocity.y[eid] * delta
        }
        const size = { x: 16, y: 16 }
        const anchor = { x: 0.5, y: 1 }

        const pos = {
            x: currentx,
            y: currenty
        }
        if (d.y !== 0) {
            const bounds = getBoundingBox(pos.x, pos.y + d.y, size.x, size.y, anchor.x, anchor.y, _bounds)
            const colliders = world.tilemapRTree.tree.search(bounds)
            if (colliders.length) {
                if (d.y < 0) {
                    const yLimit = Math.max(...colliders.map(c => c.maxY))
                    //Position.y[eid] = yLimit + 1 + size.y * anchor.y
                    pos.y = yLimit + 1 + size.y * anchor.y
                } else if (d.y > 0) {
                    const yLimit = Math.min(...colliders.map(c => c.minY))
                    //Position.y[eid] = yLimit - 1 - size.y * (1 - anchor.y)
                    pos.y = yLimit - 1 - size.y * (1 - anchor.y)
                }
            } else {
                pos.y += d.y
            }
        }
        // on x axis
        if (d.x !== 0) {
            const bounds = getBoundingBox(pos.x + d.x, pos.y, size.x, size.y, anchor.x, anchor.y, _bounds)
            const colliders = world.tilemapRTree.tree.search(bounds)
            if (colliders.length) {
                if (d.x < 0) {
                    const xLimit = Math.max(...colliders.map(c => c.maxX))
                    pos.x = xLimit + 1 + size.x * anchor.x
                } else if (d.x > 0) {
                    const xLimit = Math.min(...colliders.map(c => c.minX))
                    pos.x = xLimit - 1 - size.x * (1 - anchor.x)
                }
            } else {
                pos.x += d.x
            }
        }

        Position.x[eid] = pos.x
        Position.y[eid] = pos.y



        //   console.log('colliders', colliders)
        // }

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

        // clamp position
        if (Position.x[eid] > 1000) {
            Position.x[eid] = 0
        }
        if (Position.y[eid] > 800) {
            Position.y[eid] = 0
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