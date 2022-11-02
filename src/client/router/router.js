const getCurrentHash = () => (new URLSearchParams(window.location)).get("hash")

export class Router {
    #routes = new Map()
    #cleanup = undefined
    constructor(config) {
        // copy config
        for (let [hash, setup] of Object.entries(config))
            this.#routes.set(hash, setup)
        // listen url changes from outside
        window.addEventListener('popstate', () => this.install())
        // install hash present in url on page load
        if (getCurrentHash().length) this.install()
        // or goto first (default) hash route
        else this.goto(Object.keys(config)[0])
    }
    install(name = getCurrentHash()) {
        if (this.#routes.has(name)) {
            // cleanup previous route if it provides a cleanup function
            if (this.#cleanup !== undefined) this.#cleanup()
            // go to the new route, and save its cleanup function
            this.#cleanup = this.#routes.get(name)()
            return true
        }
    }
    goto(name) {
        if (this.install(name))
            history.pushState({}, '', name)
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