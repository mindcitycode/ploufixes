import { networkInterfaces } from 'os'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import { GameParameters, Games } from './gamesManager.js'
import { GameCreatedKoMessage, GameCreatedOkMessage } from '../common/messages.js'

import fastifyPassport from '@fastify/passport'
import fastifySecureSession from '@fastify/secure-session'
import fastifySession from '@fastify/session'

import LocalStrategy from 'passport-local'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
const __dirname = dirname(path.join(fileURLToPath(import.meta.url), '..', '..'));

import fastifyMultipart from '@fastify/multipart'
import fastifyFormBody from '@fastify/formbody'
import fastifyCookie from '@fastify/cookie'
const clientSends = []

const state = { t: 0, position: [0, 0] }
setInterval(() => {
    const date = Date.now()
    const radius = 100
    const angularSpeed = 1 / 5 // turns by second
    const angle = date * angularSpeed / 1000 * Math.PI * 2
    const x = 100 + radius * Math.cos(angle)
    const y = 100 + radius * Math.sin(angle)
    state.position[0] = x
    state.position[1] = y
    state.t = date
    clientSends.forEach(send => send(JSON.stringify(state)))
}, 1000 / 10)

const [localNetworkIpV4] = Object.values(networkInterfaces()).flat().filter(({ netmask }) => netmask === '255.255.255.0').map(({ address }) => address)
const port = process.env.PORT || 3000
const host = 'localhost' || process.env.HOST || localNetworkIpV4

const games = new Games()

const go = async () => {

    const fastify = Fastify({
        logger: true
    })
    await fastify.register(fastifyCookie)
    await fastify.register(fastifySession, { secret: 'secret with minimum length of 32 characters' })


    // initialize @fastify/passport and connect it to the secure-session storage. Note: both of these plugins are mandatory.
    await fastify.register(fastifyPassport.initialize())
    await fastify.register(fastifyPassport.secureSession())

    await fastify.register(cors, {})
    await fastify.register(fastifyWebsocket, {
        //   options: { maxPayload: 1048576 }
    });
    await fastify.register(fastifyFormBody)
    await fastify.register(fastifyMultipart)

    fastifyPassport.registerUserSerializer(async (user, request) => user.id);

    // ... and then a deserializer that will fetch that user from the database when a request with an id in the session arrives
    fastifyPassport.registerUserDeserializer(async (id, request) => {
        return await User.findById(id);
    });
    // set up secure sessions for @fastify/passport to store data in
    /*
        await fastify.register(fastifyCookie)
    
       // await fastify.register(fastifySecureSession, { key: fs.readFileSync(path.join(__dirname, 'secret-key')) })
       await fastify.register(fastifySession,  {secret : fs.readFileSync(path.join(__dirname, 'secret-key'))})
    
    
    */

    const User = {
        findById: async (id) => {
            console.log('################ find by id', id)
            return {
                'username': 'monusername',
            }
        },
        findOne: ({ username }, callback) => {
            console.log('?????', 'check', username)
            const err = undefined
            const user = {
                username,
                unchamp: 'ooo',
                id: '23',
                verifyPassword: (password) => {
                    console.log('?????', 'check son password', password)
                    const ok = (password === (username + 'p'))
                    console.log('?????', 'check son password', ok)

                    return ok

                }
            }
            callback(err, user)
        }
    }
    const passportStrategy = new LocalStrategy(
        function (username, password, done) {
            console.log('!!!!!!!!!!!!======================================')
            console.log('!!!!!!!!!!!!PASSPORT', 'try to find user', username)
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                if (!user.verifyPassword(password)) {
                    return done(null, false);
                }
                console.log('!!!!!!!!!!!!!!!!PASSPORT', 'le nom il est bon')
                return done(null, { username: username, id: 'id' });
            });
        }
    )

    // register an example strategy for fastifyPassport to authenticate users using
    fastifyPassport.use('test', passportStrategy) // you'd probably use some passport strategy from npm here

    // C:\Users\vivie\Downloads\curl-7.85.0_9-win64-mingw\curl-7.85.0_9-win64-mingw
    //   del cookies.txt
    //   bin\curl.exe --dump-header headers1.txt -c cookies.txt -X POST http://localhost:3000/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=monnom&password=monnomp" 
    //   bin\curl.exe --dump-header headers2.txt -b cookies.txt -X GET http://localhost:3000/   -H "Accept: application/json" 

    // Add an authentication for a route which will use the strategy named "test" to protect the route
    fastify.get(
        '/',
        { preValidation: fastifyPassport.authenticate('test', { authInfo: false }) },
        async () => {
            console.log('|||||||||||||||||||| sur la route /')
            return { m: 'hello world!' }
        }
    )

    // Add an authentication for a route which will use the strategy named "test" to protect the route, and redirect on success to a particular other route.
    fastify.post(
        '/login',
        { preValidation: fastifyPassport.authenticate('test', { successRedirect: '/', authInfo: false }) },
        () => {
            console.log('/.?/.?/.?/.?/.?/.?/.?/.?/.?')
        }
    )

    /*
    fastify.addHook('preValidation', async (request, reply) => {
      // check if the request is authenticated
      if (!request.isAuthenticated()) {
        await reply.code(401).send("not authenticated");
      }
    })
    */
    fastify.get('/hello-ws', { websocket: true }, (connection, req) => {
        //connection.socket.send("hello from server")
        connection.socket.on('message', message => {
            //  console.log(message.toString())
            //            connection.socket.send('Hello Fastify WebSockets');
        });
        clientSends.push(connection.socket.send.bind(connection.socket))
    });

    fastify.get('/zozo/:aparam', async (request, reply) => {
        console.log('------------', request?.params?.aparam)
        reply.type('application/json').code(200)
        return { hello: 'world' }
    })

    fastify.post('/game', async (request, reply) => {

        const gameParameters = new GameParameters()
        gameParameters.copy(request.body)

        const game = games.createGame(gameParameters)

        if (game) {
            return reply.send(GameCreatedOkMessage(game.getId()))
        } else {
            return reply.send(GameCreatedKoMessage())
        }

    })

    fastify.listen({ port, host }, (err, address) => {
        if (err) throw err
        console.log(`Server is now listening on ${address}`)
    })
}
go()