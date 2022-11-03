import { defineComponent, Types } from 'bitecs'

export const Collider = defineComponent({ group: Types.i8, mask: Types.i8 })

export const COLLIDE_GROUP_SOLDIER = 1
export const COLLIDE_GROUP_BULLET = 2
export const COLLIDE_GROUP_EXPLOSION = 4