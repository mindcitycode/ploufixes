import { networkInterfaces } from 'os'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'

const [localNetworkIpV4] = Object.values(networkInterfaces()).flat().filter(({ netmask }) => netmask === '255.255.255.0').map(({ address }) => address)
const port = process.env.PORT || 3000
const host = process.env.HOST || localNetworkIpV4

const go = async () => {

    const fastify = Fastify({
        logger: true
    })

    await fastify.register(cors, {})
    await fastify.register(fastifyWebsocket);

    fastify.get('/hello-ws', { websocket: true }, (connection, req) => {
        connection.socket.send("hello from server")
        connection.socket.on('message', message => {
            console.log(message.toString())
            connection.socket.send('Hello Fastify WebSockets');
        });
    });

    fastify.get('/zozo/:aparam', async (request, reply) => {
        console.log('------------',request?.params?.aparam)
        reply.type('application/json').code(200)
        return { hello: 'world' }
    })

    fastify.listen({ port, host }, (err, address) => {
        if (err) throw err
        // Server is now listening on ${address}
    })
}
go()