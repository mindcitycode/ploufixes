import { Bus } from "../common/bus.js"
import { DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT } from "../common/keyController.js"
export const KeyboardInput = () => {
    const bus = new Bus()
    const watch = [
        ['key', 'ArrowUp', DIRECTION_UP],
        ['key', 'ArrowRight', DIRECTION_RIGHT],
        ['key', 'ArrowDown', DIRECTION_DOWN],
        ['key', 'ArrowLeft', DIRECTION_LEFT],
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
        if (e.repeat) return
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