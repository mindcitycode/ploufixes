// mkcert -install -cert-file ./fastify.cert -key-file ./fastify.key localhost
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
</section>
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
<button type="submit">Sign in</button>
</form>

`)
//////////////////////////////////////////////////////////////////////////////////////////////////
import fastifyMultipart from '@fastify/multipart'
import fastifyFormBody from '@fastify/formbody'


/////////////////////////////////////////////////
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
const __dirname = dirname(path.join(fileURLToPath(import.meta.url), '..', '..'));

import fastify from 'fastify'

const server = fastify({
    logger: true,
    http2: true,
    https: {
        allowHTTP1: true, // fallback support for HTTP1
        key: fs.readFileSync(path.join(__dirname, 'https', 'fastify.key')),
        cert: fs.readFileSync(path.join(__dirname, 'https', 'fastify.cert'))
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
    '/',
    //  { preValidation: fastifyPassport.authenticate('test', { authInfo: false }) },
    (req, reply) => {
        if (req.isUnauthenticated()) {
            console.log('😢')
        } else {
            console.log('😬')
        }
        reply.type('application/json').code(200)
        return { its: 'ok', req }
    }
)
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

const host = 'localhost'//'192.168.1.11'
const port = '80'
const options = { host, port }


server.listen(options)/*{ port, host }, (err, address) => {
*/