import { networkInterfaces } from 'os'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'

const [localNetworkIpV4] = Object.values(networkInterfaces()).flat().filter(({ netmask }) => netmask === '255.255.255.0').map(({ address }) => address)
const port = process.env.PORT || 3000
const host = process.env.HOST || localNetworkIpV4

const state = { position: [0, 0] }

const clientSends = []
setInterval(() => {
    const date = Date.now()
    const radius = 100
    const angularSpeed = 1 / 5 // turns by second
    const angle = date * angularSpeed / 1000 * Math.PI * 2
    const x = 100 + radius * Math.cos(angle)
    const y = 100 + radius * Math.sin(angle)
    state.position[0] = x
    state.position[1] = y
    clientSends.forEach(send => send(JSON.stringify(state)))
}, 1000 / 10)

const go = async () => {

    const fastify = Fastify({
        logger: true
    })

    await fastify.register(cors, {})
    await fastify.register(fastifyWebsocket, {
        //   options: { maxPayload: 1048576 }
    });
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

    fastify.listen({ port, host }, (err, address) => {
        if (err) throw err
        // Server is now listening on ${address}
    })
}
go()