const getCurrentHash = () => (new URLSearchParams(window.location)).get("hash")

class Router {
    #routes = new Map()
    #cleanup = undefined
    constructor(config) {
        for (let [hash, setup] of Object.entries(config)) {
            this.#routes.set(hash, setup)
        }
        window.addEventListener('popstate', () => this.install())
        this.install()
    }
    install(name = getCurrentHash()) {
        if (this.#routes.has(name)) {
            if (this.#cleanup !== undefined) this.#cleanup()
            this.#cleanup = this.#routes.get(name)()
            return true
        }
    }
    goto(name) {
        if (this.install(name)) history.pushState({}, '', name)
    }
}
/* usage
const rr = new Router({
    '#signup': () => {
        console.log('show signup page')
        return () => {
            console.log('remove signup page')
        }
    },
    '#login': () => {
        console.log('show login page')
    },
    '#logout': () => {
        console.log('show logout page')
    }
})
window.Rr = rr
*/