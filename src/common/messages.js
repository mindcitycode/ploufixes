const MSG_TYPE_GAME_TERMINATE = 1
const MSG_TYPE_HERE_IS_YOUR_ID = 2
const MSG_TYPE_CANNOT_CONNECT_SERVER_FULL = 3
const MSG_TYPE_GAME_CLIENT_LEFT = 4
const MSG_TYPE_GAME_CLIENT_JOINED = 5

export const GameTerminateMessage = id => ({ type: MSG_TYPE_GAME_TERMINATE, gameId: id })
export const HereIsYourIdMessage = id => ({ type: MSG_TYPE_HERE_IS_YOUR_ID, clientId: id })
export const CannotConnectServerFullMessage = () => ({ type: MSG_TYPE_CANNOT_CONNECT_SERVER_FULL })
export const GameClientLeftMessage = id => ({ type: MSG_TYPE_GAME_CLIENT_LEFT, clientId: id })
export const GameClientJoinedMessage = id => ({ type: MSG_TYPE_GAME_CLIENT_JOINED, clientId: id })


export const MSG_TYPE_GAME_CREATED_OK = 6
export const MSG_TYPE_GAME_CREATED_KO = 7

export const GameCreatedOkMessage = id => ({ type: MSG_TYPE_GAME_CREATED_OK, gameId: id })
export const GameCreatedKoMessage = () => ({ type: MSG_TYPE_GAME_CREATED_KO })

export const MSG_TYPE_GAME_CREATION_OPTIONS = 100
export const GameCreationOptionsMessages = gameOptions => ({ type: MSG_TYPE_GAME_CREATION_OPTIONS, gameOptions })

export const MSG_TYPE_WORLD_UPDATE = 200
export const WorldUpdateMessage = (t, serializedWorld) => {
    const array = new ArrayBuffer(10)
    new DataView(array).setUint16(0, MSG_TYPE_WORLD_UPDATE)
    new DataView(array).setBigInt64(2, BigInt(t))
    return Buffer.concat([new Uint8Array(array), new Uint8Array(serializedWorld)])
}

export const parseBinaryMessage = arrayBuffer => {
    const view = new DataView(arrayBuffer)
    const type = view.getUint16(0)
    switch (type) {
        case MSG_TYPE_WORLD_UPDATE: {
            const t = Number(view.getBigInt64(2))
            return {
                type,
                t,
                serializedWorld: arrayBuffer.slice(10)
            }
        }
        default: {
            throw new Error('Unknown binary message type ' + type)
        }
    }
}
