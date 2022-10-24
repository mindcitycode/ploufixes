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