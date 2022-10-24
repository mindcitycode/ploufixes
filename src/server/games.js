import { v4 as uuidv4 } from 'uuid';
import {
    GameTerminateMessage, HereIsYourIdMessage, CannotConnectServerFullMessage,
    GameClientLeftMessage, GameClientJoinedMessage
} from '../common/messages.js'

const serialize = d => JSON.stringify(d, null, 2)

class GameClient {
    id = uuidv4()
    sendf = undefined
    constructor(sendf) {
        this.sendf = sendf
        this.send(HereIsYourIdMessage(this.id))
    }
    send(message) {
        this.sendf(serialize(message))
    }
    getId() {
        return this.id
    }
    getJSON() {
        return {
            _: 'GameClient',
            id: this.id
        }
    }
}
class GameParameters {
    maxClients = 3
    constructor(maxClients) {
        if (maxClients !== undefined) this.maxClients = maxClients
    }
    copy(source) {
        this.maxClients = source.maxClients
    }
    getJSON() {
        return {
            _: 'GameParameters',
            maxClients: this.maxClients
        }
    }
}
class Game {
    id = uuidv4()
    creationDate = Date.now()

    lastBroadcastDate = undefined

    gameParameters = new GameParameters()
    gameClients = new Map()

    constructor(gameParameters) {
        this.gameParameters.copy(gameParameters)
    }
    getId() {
        return this.id
    }
    broadcast(message) {
        this.lastBroadcast = Date.now()
        for (let gameClient of this.gameClients.values()) {
            gameClient.send(message)
        }
    }
    createClient(send) {
        if (this.gameClients.size < this.gameParameters.maxClients) {
            const gameClient = new GameClient(send)
            const clientId = gameClient.getId()
            this.broadcast(GameClientJoinedMessage(clientId))
            this.gameClients.set(clientId, gameClient)
            return gameClient
        } else {
            send(CannotConnectServerFullMessage())
        }
    }
    removeClientById(clientId) {
        const gameClient = this.gameClients.get(clientId)
        if (gameClient !== undefined) {
            this.broadcast(GameClientLeftMessage(clientId))
            this.gameClients.delete(clientId)
        }
    }
    terminate() {
        this.broadcast(GameTerminateMessage(this.id))
    }
    getJSON() {
        const clients = []
        return {
            _: 'Game',
            id: this.id,
            clients: Array.from(this.gameClients.values()).map(c => c.getJSON()),
            parameters: this.gameParameters.getJSON()
        }
    }
}
class Games {
    static defaultMaxGames = 2
    list = new Map()
    maxGames = Games.defaultMaxGames

    constructor({ maxGames } = {}) {
        if (maxGames !== undefined) this.maxGames = maxGames
        console.log(this.maxGames)
    }
    getAll() {
        return this.list.values()
    }
    getById(id) {
        return this.list.get(id)
    }
    createGame(gameParameters) {
        if (this.list.size < this.maxGames) {
            const game = new Game(gameParameters)
            this.list.set(game.getId(), game)
            return game
        }
    }
    removeGameById(id) {
        const game = this.list.get(id)
        if (game !== undefined) {
            game.terminate()
            this.list.delete(id)
        }
    }
    getJSON() {
        return {
            _: 'Games',
            games: Array.from(this.list.values()).map(c => c.getJSON()),

        }
    }
}

const games = new Games()
const gameParameters = new GameParameters()

{
    const game1 = games.createGame(gameParameters)
    console.log(game1)
}
{

    const game1 = games.createGame(gameParameters)
    console.log(game1)
    games.removeGameById(game1.getId())
}
{
    gameParameters.maxClients = 2
    const game1 = games.createGame(gameParameters)
    console.log(game1)
    const c1 = game1.createClient(a => console.log('>to client 1', a))
    const c2 = game1.createClient(a => console.log('>to client 2', a))
    const c3 = game1.createClient(a => console.log('>to client 3', a))
    const c4 = game1.createClient(a => console.log('>to client 4', a))
    console.log(c1)
    console.log('reemove', c1.id)
    game1.removeClientById(c1.id)
    console.log('add client')
    const c5 = game1.createClient(a => console.log('>to client 4', a))
    //    games.removeGameById( game1.id )

}
{
    console.log('-------')
    console.log(games.getAll())

    console.log('-------')
    /*    const all = games.getAll()
        for (let game of all) {
            console.log(game.getJSON())
        }
        */
    console.log(serialize(games.getJSON()))
    //console.log(all.map( x => x))
}
