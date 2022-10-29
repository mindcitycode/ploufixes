import { defineComponent } from "bitecs";
import { Types } from 'bitecs'
export const Action = defineComponent({ type: Types.ui8 })

export const ACTION_TYPE_NEUTRAL = 1
export const ACTION_TYPE_FIRING = 2
export const ACTION_TYPE_IDLE = 3
export const ACTION_TYPE_WALK = 4
export const ACTION_TYPE_MELEE = 5
export const ACTION_TYPE_DESTROYED = 6
export const ACTION_TYPE_CRAWL = 7
export const ACTION_TYPE_HIT = 8
export const ACTION_TYPE_DEATH = 9