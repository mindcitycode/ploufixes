import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
const __dirname = dirname(path.join(fileURLToPath(import.meta.url), '..', '..'));

import { Authenticator } from '@fastify/passport'
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import fastify from 'fastify'


import LocalStrategy from 'passport-local'
import fastifyMultipart from '@fastify/multipart'
import fastifyFormBody from '@fastify/formbody'

const User = {
    findById: async (id) => {
        console.log('################ find by id', id)
        return {
            id,
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

                const ok = true
                //const ok = (password === (username + 'p'))
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

const server = fastify({
    logger: true,
    http2: true,
    https: {
        allowHTTP1: true, // fallback support for HTTP1
        key: fs.readFileSync(path.join(__dirname, '192.168.1.11-key.pem')),
        cert: fs.readFileSync(path.join(__dirname,  '192.168.1.11.pem'))
    }
})
// setup an Authenticator instance which uses @fastify/session
const fastifyPassport = new Authenticator()

await server.register(fastifyFormBody)
await server.register(fastifyMultipart)

await server.register(fastifyCookie)
await server.register(fastifySession, { secret: 'secret with minimum length of 32 characters' })

// initialize @fastify/passport and connect it to the secure-session storage. Note: both of these plugins are mandatory.
await server.register(fastifyPassport.initialize())
await server.register(fastifyPassport.secureSession())


// Add an authentication for a route which will use the strategy named "test" to protect the route
server.get(
    '/',
    { preValidation: fastifyPassport.authenticate('test', { authInfo: false }) },
    async () => 'hello world!'
)
const loginForm = `
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
`
server.get(
    '/login',
    (req, reply) => {
        reply.type('text/html').code(200)
        return loginForm
    }
)
// Add an authentication for a route which will use the strategy named "test" to protect the route, and redirect on success to a particular other route.
server.post(
    '/login',
    { preValidation: fastifyPassport.authenticate('test', { successRedirect: '/', authInfo: false }) },
    () => { }
)


// register an example strategy for fastifyPassport to authenticate users using
fastifyPassport.use('test', passportStrategy)
const host = '192.168.1.11'
const port = '80'
const options = { host, port }


server.listen(options)/*{ port, host }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
})*/
