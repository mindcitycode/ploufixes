const NO_LOGIN = true

const HTML = (title = "oui", body = '<h1>OUI</h1>') => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
  </head>
  <body>${body}</body>
</html>`

const LOGOUT_FORM = (username) => {
    return HTML('logout', `
    <p>currently ${username ? ("connected as " + username) : "disconnected"}</p>
    <form action="/logout" method="post">
    <button type="submit">Logout</button>
    </form>
    
    `)
}
const LOGIN_FORM = (username) => HTML('login', `
<p>currently ${username ? ("connected as " + username) : "disconnected"}</p>
<form action="/login" method="post">
<section>
    <label for="username">Username</label>
    <input id="username" name="username" type="text" autocomplete="username" required autofocus>
</section>
<section>
    <label for="current-password">Password</label>
    <input id="current-password" name="password" type="password" autocomplete="current-password" required>
<section>
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
<button type="submit">Sign in</button>
</form>

`)
//////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////
import fs from 'fs'
import path from 'path'

import { __dirname } from './dirname.js'
import fastify from 'fastify'

const server = fastify({
    logger: true,
    http2: true,
    https: {
        // mkcert -install -cert-file ./fastify.cert -key-file ./fastify.key localhost
        allowHTTP1: true, // fallback support for HTTP1
        //    key: fs.readFileSync(path.join(__dirname, 'https', 'fastify.localhost.key')),
        //   cert: fs.readFileSync(path.join(__dirname, 'https', 'fastify.localhost.cert'))
        // mkcert -install -cert-file ./fastify.192.168.1.11.cert -key-file ./fastify.192.168.1.11.key 192.168.1.11

        key: fs.readFileSync(path.join(__dirname, 'https', 'fastify.192.168.1.11.key')),
        cert: fs.readFileSync(path.join(__dirname, 'https', 'fastify.192.168.1.11.cert'))
    }
})


import { Authenticator } from '@fastify/passport'
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import { BasicLocalStrategy } from './passportStrategy.js'

const fastifyPassport = new Authenticator()

const basicLocalStrategy = BasicLocalStrategy()
fastifyPassport.use('test', basicLocalStrategy)



await server.register(fastifyCookie)
await server.register(fastifySession, {
    secret: 'secret with minimum length of 32 characters',
    cookie: {
        sameSite: true,
        // secure : false 
    },
})
// initialize @fastify/passport and connect it to the secure-session storage.
await server.register(fastifyPassport.initialize())
await server.register(fastifyPassport.secureSession())

import * as Users from './users.js'
fastifyPassport.registerUserSerializer(async (user, request) => user.id)
fastifyPassport.registerUserDeserializer(async (id, request) => await Users.findById(id))

server.get(
    '/html',
    (req, reply) => {
        reply.type('text/html').code(200)
        return HTML()
    }
)
server.get(
    '/login',
    (req, reply) => {
/*        if (req.isAuthenticated()) {
            return res.redirect('/logout')
        }
 */       reply.type('text/html').code(200)
        return LOGIN_FORM(req.user?.username)
    }
)
server.get(
    '/logout',
    (req, reply) => {
        reply.type('text/html').code(200)
        return LOGOUT_FORM(req.user?.username)
    }
)



import fastifyMultipart from '@fastify/multipart'
import fastifyFormBody from '@fastify/formbody'

await server.register(fastifyFormBody)
await server.register(fastifyMultipart)
server.post(
    '/login',
    { preValidation: fastifyPassport.authenticate('test', { successRedirect: '/', authInfo: false }) },
    () => { }
)
server.post(
    '/logout',
    async function (req, res) {
        console.log('LOG OUT', req.user?.username)
        await req.logout()
        res.redirect('/login');
    }
)

server.get(
    '/',
    //  { preValidation: fastifyPassport.authenticate('test', { authInfo: false }) },
    (req, reply) => {
        let uni = req.isUnauthenticated() ? '😭' : '🙋'
        /*   if (req.isUnauthenticated()) {
               console.log('😢')
           } else {
               //    console.log('sendfile',reply.sendFile)
               //  reply.sendFile('../../dist/index.html')
               console.log('😬')
           }*/
        reply.type('application/json').code(200)
        return { uni, its: !req.isUnauthenticated(), req }
    }
)

import fastifyWebsocket from '@fastify/websocket'
await server.register(fastifyWebsocket, {
    //   options: { maxPayload: 1048576 }
});

import { createGame } from '../game/world.js'
import { loadTilemapFromFs } from './serverAssets.js'
const gameOptions = {
    packBasePath: 'Robot Warfare Asset Pack 22-11-24',
    tilemapName: 'map0.tmj',
    spriteAtlasName : 'combined.json'

}
const tilemapData = await loadTilemapFromFs(gameOptions.tilemapName, gameOptions.packBasePath)
const game = createGame({ tilemapData })
game.start()

server.get('/hello-ws', { websocket: true }, (connection, req) => {

    /*console.log('websocket connection')
    connection.socket.send(JSON.stringify(['this', 'is', 'an', 'json array']))
    connection.socket.send(JSON.stringify({ 'this': 'is', 'an': 'json object' }))
    connection.socket.send(JSON.stringify('"this is a json tring"'))
*/
    connection.socket.send(JSON.stringify(GameCreationOptionsMessages(gameOptions)))
    game.worldUpdatedBus.addListener(worldUpdateMessage => {
        connection.socket.send(worldUpdateMessage)//.serializedWorld)
    })

    //connection.socket.send("hello from server")
    connection.socket.on('message', message => {
        console.log('received socket message', message.toString())
        //  connection.socket.send('Hello Fastify WebSockets');
    });
    //  clientSends.push(connection.socket.send.bind(connection.socket))
});



import fastifyStatic from '@fastify/static'
server.register(fastifyStatic, {
    // only assets because html must be redirected
    // if no connection
    root: path.join(__dirname, 'dist', 'assets'),
    prefix: '/assets/',
    cacheControl: false,
    allowedPath: (pathname, root, req, res) => {
        console.log('FASTIFY STATIC ASK IF OK', { pathname, root, username: req?.user?.username })
        return (NO_LOGIN || req.isAuthenticated()) ? true : false
        //res.redirect('/login');
    }
})


import * as fsp from "node:fs/promises"
import { GameCreationOptionsMessages } from '../common/messages.js'
server.get(
    '/*',
    async (req, reply) => {
        if ((!NO_LOGIN) && req.isUnauthenticated()) {
            return reply.redirect('/login')
        } else {
            const filename = path.join(__dirname, 'dist', req.params['*'])
            console.log('read needed filenme', filename)
            const text = await fsp.readFile(filename)
            reply.type('text/html').code(200) // even images can be served with wrong type
            return text
        }
    }
)


//const host = 'localhost'
const host = '192.168.1.11'
const port = '80'
const options = { host, port }


server.listen(options)/*{ port, host }, (err, address) => {
*/