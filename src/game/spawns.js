import { addEntity, addComponent } from 'bitecs'
import { getCharacterShape } from '../common/animations.js'
import { getPositionFromCenter } from '../common/bounds.js'
import { Orientation, rotationForDirections } from './components/orientation.js'
import { Position } from './components/position.js'
import { Velocity } from './components/velocity.js'
import { PermanentId } from './components/permanentId.js'
import { Discrete } from './components/discrete.js'
import { Character } from './components/character.js'
import { Action, ACTION_TYPE_WALK } from './components/action.js'
import { Weapon } from './components/weapon.js'
import { Health } from './components/health.js'
import { Owner } from './components/owner.js'
import { Collider, COLLIDE_GROUP_SOLDIER, COLLIDE_GROUP_BULLET, COLLIDE_GROUP_EXPLOSION } from './components/collider.js'

export const spawnSoldier = (world, character_type, weapon_type, cx, cy) => {
    const eid = addEntity(world)

    addComponent(world, Position, eid)
    addComponent(world, Velocity, eid)
    addComponent(world, PermanentId, eid)
    addComponent(world, Orientation, eid)
    addComponent(world, Character, eid)
    addComponent(world, Action, eid)
    addComponent(world, Weapon, eid)
    addComponent(world, Health, eid)
    addComponent(world, Collider, eid)
    Position.x[eid] = cx
    Position.y[eid] = cy
    Velocity.x[eid] = 0
    Velocity.y[eid] = 0
    Orientation.a8[eid] = 0
    Character.type[eid] = character_type
    Action.type[eid] = ACTION_TYPE_WALK
    Weapon.type[eid] = weapon_type
    Weapon.reload[eid] = 1
    Weapon.idle[eid] = 0
    PermanentId.pid[eid] = 0
    Health.value[eid] = 100
    Health.max[eid] = 100
    Collider.group[eid] = COLLIDE_GROUP_SOLDIER
    Collider.mask[eid] = COLLIDE_GROUP_BULLET

    return eid
}

export const spawnBullet = (world, character_type, cx, cy, orientation, speed = 100, ownerEid) => {
    const bulletEid = addEntity(world)
    addComponent(world, Position, bulletEid)
    addComponent(world, Orientation, bulletEid)
    addComponent(world, Velocity, bulletEid)
    addComponent(world, PermanentId, bulletEid)
    addComponent(world, Character, bulletEid)
    addComponent(world, Collider, bulletEid)

    if (ownerEid !== undefined)
        addComponent(world, Owner, bulletEid)

    Position.x[bulletEid] = cx
    Position.y[bulletEid] = cy
    Orientation.a8[bulletEid] = orientation//Orientation.a8[eid]
    const angle = rotationForDirections(orientation)

    Character.type[bulletEid] = character_type
    // console.log('fired at orientation', Orientation.a8[eid].toString(2))
    Velocity.x[bulletEid] = speed * Math.cos(angle)
    Velocity.y[bulletEid] = speed * Math.sin(angle)
    Character.type[bulletEid] = character_type
    PermanentId.pid[bulletEid] = 0

    if (ownerEid !== undefined)
        Owner.eid[bulletEid] = ownerEid

    Collider.group[bulletEid] = COLLIDE_GROUP_BULLET
    Collider.mask[bulletEid] = COLLIDE_GROUP_BULLET | COLLIDE_GROUP_SOLDIER

    return bulletEid
}
export const spawnExplosion = (world, character_type, cx, cy) => {
    const exId = addEntity(world)
    addComponent(world, Position, exId)
    addComponent(world, Character, exId)
    addComponent(world, Discrete, exId)
    addComponent(world, Collider, exId)
    const explosionShape = getCharacterShape(character_type)
    const explosionPosition = getPositionFromCenter(cx, cy, explosionShape.w, explosionShape.h, explosionShape.ax, explosionShape.ay)
    Position.x[exId] = explosionPosition.x
    Position.y[exId] = explosionPosition.y
    Character.type[exId] = character_type
    Discrete.seen[exId] = 0
    Collider.group[exId] = COLLIDE_GROUP_EXPLOSION
    Collider.mask[exId] = 0
    return exId
}
