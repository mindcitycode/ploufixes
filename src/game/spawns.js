import { addEntity, addComponent } from 'bitecs'
import { getCharacterShape } from '../common/animations.js'
import { getPositionFromCenter } from '../common/bounds.js'
import { Orientation, rotationForDirections } from './components/orientation.js'
import { Position } from './components/position.js'
import { Velocity } from './components/velocity.js'
import { PermanentId } from './components/permanentId.js'
import { Discrete } from './components/discrete.js'
import { Character } from './components/character.js'

export const spawnBullet = (world, character_type, cx, cy, orientation, speed = 100) => {
    const bulletEid = addEntity(world)
    addComponent(world, Position, bulletEid)
    addComponent(world, Orientation, bulletEid)
    addComponent(world, Velocity, bulletEid)
    addComponent(world, PermanentId, bulletEid)
    addComponent(world, Character, bulletEid)
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
    return bulletEid
}
export const spawnExplosion = (world, character_type, cx, cy) => {
    const exId = addEntity(world)
    addComponent(world, Position, exId)
    addComponent(world, Character, exId)
    addComponent(world, Discrete, exId)
    const explosionShape = getCharacterShape(character_type)
    const explosionPosition = getPositionFromCenter(cx, cy, explosionShape.w, explosionShape.h, explosionShape.ax, explosionShape.ay)
    Position.x[exId] = explosionPosition.x
    Position.y[exId] = explosionPosition.y
    Character.type[exId] = character_type
    Discrete.seen[exId] = 0
    return exId
}
