export class Bus {
    listeners = []
    addListener( l ){
        this.listeners.push(l)
    }
    removeListener(l){
        this.listeners.splice(this.listeners.indexOf(l,1))
    }
    say(...msg){
        this.listeners.forEach( f => f(...msg))
    }
}