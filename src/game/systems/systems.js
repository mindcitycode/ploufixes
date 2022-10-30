import {
    defineQuery,
    addEntity,
    addComponent,
    removeEntity,
    hasComponent,
    entityExists,
} from 'bitecs'
import { Bounds } from '../../common/bounds.js'

import { Position } from '../components/position.js'
import { Velocity } from '../components/velocity.js'
import { PermanentId } from '../components/permanentId.js'
import { KeyControl } from '../components/keyControl.js'
import { ACTION_FIRE, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, _DIRECTION_ANY } from '../../common/keyController.js'
import { Orientation, rotationForDirections } from '../components/orientation.js'
import { Action, ACTION_TYPE_IDLE, ACTION_TYPE_WALK } from '../components/action.js'
import { Weapon, WEAPON_TYPE_PLASMA_LAUNCHER, WEAPON_TYPE_ROCKET_LAUNCHER, WEAPON_TYPE_GRENADE_LAUNCHER } from '../components/weapon.js'
import { Character, CHARACTER_TYPE_PLASMA, CHARACTER_TYPE_GRENADE, CHARACTER_TYPE_ROCKET, CHARACTER_TYPE_ANTITANK, CHARACTER_TYPE_SQUADLEADER, CHARACTER_TYPE_SNIPER, CHARACTER_TYPE_RADIOOPERATOR, CHARACTER_TYPE_MACHINEGUNNER, CHARACTER_TYPE_GRENADIER, CHARACTER_TYPE_ASSAULT, CHARACTER_TYPE_BIG_EXPLOSION } from '../components/character.js'
import { Shape } from '../../common/shape.js'
import { getCharacterShape } from '../../common/animations.js'
import { Ttl } from '../components/ttl.js'
import { Discrete } from '../components/discrete.js'
//import { Shape, SHAPE_TYPE_BOX } from '../components/shape.js'

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
                        Orientation.a8[eid] |= (incomingState & _DIRECTION_ANY)
                        //Orientation.a8[eid] |= (incomingState & _DIRECTION_ANY_LEFT_RIGHT)
                        if (incomingState & DIRECTION_UP) Orientation.a8[eid] &= ~DIRECTION_DOWN
                        if (incomingState & DIRECTION_RIGHT) Orientation.a8[eid] &= ~DIRECTION_LEFT
                        if (incomingState & DIRECTION_DOWN) Orientation.a8[eid] &= ~DIRECTION_UP
                        if (incomingState & DIRECTION_LEFT) Orientation.a8[eid] &= ~DIRECTION_RIGHT
                    }
                }
                if (hasComponent(world, Weapon, eid)) {
                    Weapon.firing[eid] += (incomingState & ACTION_FIRE) ? 1 : 0
                }
            }
        }
    }
    return world
}

export const weaponQuery = defineQuery([Weapon])
export const weaponSystem = world => {
    const { time: { delta } } = world
    const ents = weaponQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        // increment idle time
        Weapon.idle[eid] += delta
        // if firing commanded
        if (Weapon.firing[eid]) {
            // one shot
            //Weapon.firing[eid] = 0
            // check fully reloaded
            if (Weapon.idle[eid] >= Weapon.reload[eid]) {
                Weapon.idle[eid] = 0
                Weapon.firing[eid] = 0
                const bulletEid = addEntity(world)
                addComponent(world, Position, bulletEid)
                addComponent(world, Orientation, bulletEid)
                addComponent(world, Velocity, bulletEid)
                addComponent(world, PermanentId, bulletEid)
                addComponent(world, Character, bulletEid)
                Position.x[bulletEid] = Position.x[eid]
                Position.y[bulletEid] = Position.y[eid]

                let orientation = 0

                // TODO check has orientation
                if (hasComponent(world, Velocity, eid)) {
                    const sdx = Math.sign(Velocity.x[eid])
                    const sdy = Math.sign(Velocity.y[eid])
                    if ((sdx !== 0) || (sdy !== 0)) {
                        // use velocity for direction
                        orientation |= (sdx > 0) ? (DIRECTION_RIGHT) : ((sdx < 0) ? DIRECTION_LEFT : 0)
                        orientation |= (sdy > 0) ? (DIRECTION_DOWN) : ((sdy < 0) ? DIRECTION_UP : 0)
                    } else {
                        // just left or right orientation
                        orientation = (Orientation.a8[eid] & (DIRECTION_RIGHT | DIRECTION_LEFT))
                    }
                } else {
                    orientation = (Orientation.a8[eid] & (DIRECTION_RIGHT | DIRECTION_LEFT))
                }
                Orientation.a8[bulletEid] = orientation//Orientation.a8[eid]
                const angle = rotationForDirections(orientation)

                // console.log('fired at orientation', Orientation.a8[eid].toString(2))
                Velocity.x[bulletEid] = 100 * Math.cos(angle)
                Velocity.y[bulletEid] = 100 * Math.sin(angle)

                PermanentId.pid[bulletEid] = 0
                switch (Weapon.type[eid]) {
                    case WEAPON_TYPE_PLASMA_LAUNCHER:
                        Character.type[bulletEid] = CHARACTER_TYPE_PLASMA;
                        break;
                    case WEAPON_TYPE_GRENADE_LAUNCHER:
                        Character.type[bulletEid] = CHARACTER_TYPE_GRENADE;
                        break;
                    case WEAPON_TYPE_ROCKET_LAUNCHER:
                        Character.type[bulletEid] = CHARACTER_TYPE_ROCKET;
                        break;
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

// TODO usage pass _center
function getCenter(x, y, w, h, ax, ay, center = { x: 0, y: 0 }) {
    center.x = x + (0.5 - ax) * w
    center.y = y + (0.5 - ay) * h
    return center
}
// TODO usage pass _position
function getPositionFromCenter(cx, cy, w, h, ax, ay, position = { x: 0, y: 0 }) {
    position.x = cx + (ax - 0.5) * w
    position.y = cy + (ay - 0.5) * h
    return position
}
export const movementQuery = defineQuery([Position, Velocity])
export const movementSystem = world => {
    const { time: { delta } } = world
    const ents = movementQuery(world)

    const _bounds = Bounds()
    const _shape = Shape()

    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]

        const currentx = Position.x[eid]
        const currenty = Position.y[eid]

        // compute new position
        const d = {
            x: Velocity.x[eid] * delta,
            y: Velocity.y[eid] * delta
        }
        const pos = {
            x: Math.floor(currentx),
            y: Math.floor(currenty)
        }
        if (hasComponent(world, Character, eid)) {
            const shape = getCharacterShape(Character.type[eid], _shape)
            const size = { x: shape.w, y: shape.h }
            const anchor = { x: shape.ax, y: shape.ay }
            const border = 1

            if (!hasComponent(world, KeyControl, eid)) {
                // do not try to collide anything
                pos.x += d.x
                pos.y += d.y
                const bounds = getBoundingBox(pos.x, Math.floor(pos.y + d.y), size.x, size.y, anchor.x, anchor.y, _bounds)
                const collides = world.tilemapRTree.tree.collides(bounds)
                if (collides) {
                    removeEntity(world, eid)
                    const exId = addEntity(world)
                    addComponent(world, Position, exId)
                    addComponent(world, Character, exId)
                    addComponent(world, Discrete, exId)
                    const character_type = CHARACTER_TYPE_BIG_EXPLOSION
                    const explosionShape = getCharacterShape(character_type)
                    const bulletCenter = getCenter(pos.x,pos.y,size.x,size.y,anchor.x,anchor.y)
                    const explosionPosition = getPositionFromCenter(bulletCenter.x,bulletCenter.y,explosionShape.w,explosionShape.h,explosionShape.ax,explosionShape.ay)
                    Position.x[exId] = explosionPosition.x
                    Position.y[exId] = explosionPosition.y
                    Character.type[exId] = character_type
                    Discrete.seen[eid] = 0
                    continue;
                }
            } else {
                // wall sliding
                // on y axis
                if (d.y !== 0) {
                    const bounds = getBoundingBox(pos.x, Math.floor(pos.y + d.y), size.x, size.y, anchor.x, anchor.y, _bounds)
                    const colliders = world.tilemapRTree.tree.search(bounds)
                    if (colliders.length) {
                        //console.log('y ===',currentx,currenty,'-',pos,bounds)
                        //console.log('y',colliders)
                        if (d.y < 0) {
                            const yLimit = Math.max(...colliders.map(c => c.maxY))
                            //Position.y[eid] = yLimit + 1 + size.y * anchor.y
                            pos.y = yLimit + border + size.y * anchor.y
                        } else if (d.y > 0) {
                            const yLimit = Math.min(...colliders.map(c => c.minY))
                            //Position.y[eid] = yLimit - 1 - size.y * (1 - anchor.y)
                            pos.y = yLimit - border - size.y * (1 - anchor.y)
                        }
                    } else {
                        pos.y += d.y

                    }
                }
                pos.y = Math.floor(pos.y)
                // on x axis
                if (d.x !== 0) {
                    const bounds = getBoundingBox(Math.floor(pos.x + d.x), pos.y, size.x, size.y, anchor.x, anchor.y, _bounds)
                    const colliders = world.tilemapRTree.tree.search(bounds)
                    if (colliders.length) {
                        // console.log('x ===',currentx,currenty,'-',pos,bounds)
                        // console.log('x',colliders)
                        if (d.x < 0) {
                            const xLimit = Math.max(...colliders.map(c => c.maxX))
                            pos.x = xLimit + border + size.x * anchor.x
                        } else if (d.x > 0) {
                            const xLimit = Math.min(...colliders.map(c => c.minX))
                            pos.x = xLimit - border - size.x * (1 - anchor.x)
                        }
                    } else {
                        pos.x += d.x
                    }
                }
            }

            if (entityExists(world, eid)) {
                Position.x[eid] = Math.floor(pos.x)
                Position.y[eid] = Math.floor(pos.y)


                // clamp position
                if (Position.x[eid] > 1000) {
                    Position.x[eid] = 0
                }
                if (Position.y[eid] > 800) {
                    Position.y[eid] = 0
                }
            }
        }

        // set action
        if (hasComponent(world, Action, eid)) {
            const isMoving = ((Velocity.x[eid] !== 0) || (Velocity.y[eid] !== 0))
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
const ttlQuery = defineQuery([Ttl])
export const ttlSystem = world => {
    const ents = ttlQuery(world)
    const delta = world.time.delta
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        if (Ttl.remaining[eid] <= 0) {
            removeEntity(world, eid)
        } else {
            Ttl.remaining[eid] -= delta
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

export const discreteQuery = defineQuery([Discrete])
export const discreteSystem = world => {
    const ents = discreteQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        if (Discrete.seen[eid] === 1) {
            removeEntity(world, eid)
        } else {
            Discrete.seen[eid] = 1
        }
    }
    return world
}