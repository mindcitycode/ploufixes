import { defineComponent } from "bitecs";
import { Types } from 'bitecs'
export const Orientation = defineComponent({ a8: Types.ui8 })

import { DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT } from "../../common/keyController.js";
export const rotationForDirections = directions => {
    switch (directions) {
        case (DIRECTION_RIGHT): return 0
        case (DIRECTION_RIGHT | DIRECTION_DOWN): return Math.PI / 4
        case (DIRECTION_DOWN): return 2 * Math.PI / 4
        case (DIRECTION_LEFT | DIRECTION_DOWN): return 3 * Math.PI / 4
        case (DIRECTION_LEFT): return 4 * Math.PI / 4
        case (DIRECTION_LEFT | DIRECTION_UP): return 5 * Math.PI / 4
        case (DIRECTION_UP): return 6 * Math.PI / 4
        case (DIRECTION_RIGHT | DIRECTION_UP): return 7 * Math.PI / 4
        default: return undefined//throw new Error('NoSuchDirection', direction.toString(2))
    }
}
