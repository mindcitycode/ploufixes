import { networkInterfaces } from 'os'
import Fastify from 'fastify'

const [localNetworkIpV4] = Object.values(networkInterfaces()).flat().filter(({ netmask }) => netmask === '255.255.255.0').map(({ address }) => address)
const port = process.env.PORT || 3000
const host = process.env.HOST || localNetworkIpV4

const fastify = Fastify({
    logger: true
})

fastify.get('/', async (request, reply) => {
    reply.type('application/json').code(200)
    return { hello: 'world' }
})

fastify.listen({ port, host }, (err, address) => {
    if (err) throw err
    // Server is now listening on ${address}
})

