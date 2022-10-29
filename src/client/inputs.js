import { Bus } from "../common/bus.js"
import { DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT, ACTION_FIRE } from "../common/keyController.js"
export const KeyboardInput = () => {
    const bus = new Bus()
    const watch = [
        ['key', 'ArrowUp', DIRECTION_UP],
        ['key', 'ArrowRight', DIRECTION_RIGHT],
        ['key', 'ArrowDown', DIRECTION_DOWN],
        ['key', 'ArrowLeft', DIRECTION_LEFT],
        ['code', 'KeyW', DIRECTION_UP],
        ['code', 'KeyD', DIRECTION_RIGHT],
        ['code', 'KeyS', DIRECTION_DOWN],
        ['code', 'KeyA', DIRECTION_LEFT],
        ['code', 'Space', ACTION_FIRE],
    ]
    let state = 0
    let lastState = state
    const maybeUpdate = () => {
        if (state !== lastState) {
            bus.say(state)
            lastState = state
        }
    }
    const keydown = (e) => {
        watch.forEach(([type, value, control]) => {
            if (e[type] === value) {
                state |= control
            }
        })
        maybeUpdate()
    }
    const keyup = (e) => {
        watch.forEach(([type, value, control]) => {
            if (e[type] === value) {
                state &= ~control
            }
        })
        maybeUpdate()
    }
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)
    return {
        bus
    }
}