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
export const MSG_TYPE_CLIENT_BEEN_IDLE_TOO_LONG = 201
export const ClientBeenIdleTooLongMessage = () => {
    const array = new ArrayBuffer(2)
    new DataView(array).setUint16(0, MSG_TYPE_CLIENT_BEEN_IDLE_TOO_LONG)
    return Buffer.concat([new Uint8Array(array)])
}
export const MSG_TYPE_HERE_IS_YOUR_PID = 202
export const HereIsYourPidMessage = pid => {
    const array = new ArrayBuffer(10)
    new DataView(array).setUint16(0, MSG_TYPE_HERE_IS_YOUR_PID)
    new DataView(array).setUint32(2, pid)
    return Buffer.concat([new Uint8Array(array)])

}
export const parseBinaryServerMessage = arrayBuffer => {

    const view = new DataView(arrayBuffer)
    const type = view.getUint16(0)

    switch (type) {
        case MSG_TYPE_WORLD_UPDATE: {
            const t = Number(view.getBigInt64(2))
            const serializedWorld = arrayBuffer.slice(10)
            return {
                type,
                t,
                serializedWorld 
            }
        }
        case MSG_TYPE_CLIENT_BEEN_IDLE_TOO_LONG: {
            return { type }
        }
        case MSG_TYPE_HERE_IS_YOUR_PID : {
            const pid = view.getUint32(2)
            return { 
                type,
                pid
            }
        }
        default: {
            throw new Error('Unknown binary server message type ' + type)
        }
    }
}

// client -> server

export const MSG_TYPE_CLIENT_KEY_CONTROLLER_INPUT = 300
export const ClientKeyControllerInputMessage = state => {
    const array = new ArrayBuffer(4)
    const dataView = new DataView(array)
    dataView.setUint16(0, MSG_TYPE_CLIENT_KEY_CONTROLLER_INPUT)
    dataView.setUint16(2, state)
    return array
}

function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
export const parseBinaryClientMessage = buffer => {
    const arrayBuffer = toArrayBuffer(buffer)
    const dataView = new DataView(arrayBuffer)
    const type = dataView.getUint16(0)
    switch (type) {
        case MSG_TYPE_CLIENT_KEY_CONTROLLER_INPUT: {
            return {
                type,
                state: dataView.getUint16(2)
            }
        }
        default: {
            throw new Error('Unknown binary client message type ' + type)
        }
    }
}