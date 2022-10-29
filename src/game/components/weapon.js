import { defineComponent } from "bitecs";
import { Types } from 'bitecs'
export const Weapon = defineComponent({ type: Types.ui8, idle: Types.f32, reload: Types.f32, firing : Types.i8})

export const WEAPON_TYPE_PLASMA_LAUNCHER = 1
export const WEAPON_TYPE_GRENADE_LAUNCHER = 2
export const WEAPON_TYPE_ROCKET_LAUNCHER = 3
