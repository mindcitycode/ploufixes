const RENDER_DELAY = 100;

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function processGameUpdate(update) {
    if (!firstServerTimestamp) {
        firstServerTimestamp = update.t;
        gameStart = Date.now();
    }
    gameUpdates.push(update);

    // Keep only one game update before the current server time
    const base = getBaseUpdate();
    if (base > 0) {
        gameUpdates.splice(0, base);
    }
}

function currentServerTime() {
    return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
    const serverTime = currentServerTime();
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        if (gameUpdates[i].t <= serverTime) {
            return i;
        }
    }
    return -1;
}
function interpolatePositions(basePosition, nextPosition, r) {
    return [
        basePosition[0] * (1 - r) + nextPosition[0] * r,
        basePosition[1] * (1 - r) + nextPosition[1] * r,
    ]
}
function interpolateFloat(basePosition, nextPosition, r) {
    return basePosition * (1 - r) + nextPosition * r
}
function interpolateObjects(baseOws, nextOws, r) {
    const basePids = Object.keys(baseOws.byPid)
    const ows = {
        byPid: {},
        removePid: [],
        noPid : baseOws.noPid
    }
    basePids.forEach(pid => {
        const baseObject = baseOws.byPid[pid]
        const nextObject = nextOws.byPid[pid]
        if (nextObject === undefined) {
            ows.removePid.push(pid)
        } else {
            const interpolatedObject = {
                baseObject, nextObject,
                PermanentId: {
                    hasPermanentId: true,
                    permanentId_pid: pid
                },
                Position: {
                    hasPosition: true,
                    position_x: interpolateFloat(baseObject.Position.position_x, nextObject.Position.position_x, r),
                    position_y: interpolateFloat(baseObject.Position.position_y, nextObject.Position.position_y, r),
                },
                Orientation: {
                    hasOrientation: baseObject.Orientation.hasOrientation,
                    orientation_a8: baseObject.Orientation.orientation_a8
                },
                Character: {
                    hasCharacter: baseObject.Character.hasCharacter,
                    character_type: baseObject.Character.character_type,
                },
                Action: {
                    hasAction: baseObject.Action.hasAction,
                    action_type: baseObject.Action.action_type
                },
                Health : {
                    hasHealth : baseObject.Health.hasHealth,
                    health_value :interpolateFloat(baseObject.Health.health_value, nextObject.Health.health_value, r),
                    health_max : interpolateFloat(baseObject.Health.health_max, nextObject.Health.health_max, r),
                }
                // Weapon
            }
            ows.byPid[pid] = interpolatedObject
        }
    })
    return ows
}
export function getCurrentState() {
    if (!firstServerTimestamp) {
        return {};
    }

    const base = getBaseUpdate();
    const serverTime = currentServerTime();

    // If base is the most recent update we have, use its state.
    // Else, interpolate between its state and the state of (base + 1).
    if (base < 0) {
        return gameUpdates[gameUpdates.length - 1];
    } else if (base === gameUpdates.length - 1) {
        return gameUpdates[base];
    } else {
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const r = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        return {
            t: interpolateFloat(baseUpdate.t, next.t, r),
            ows: interpolateObjects(baseUpdate.ows, next.ows, r)
            //me: interpolateObject(baseUpdate.me, next.me, r),
            //others: interpolateObjectArray(baseUpdate.others, next.others, r),
            //bullets: interpolateObjectArray(baseUpdate.bullets, next.bullets, r),
        };
    }
}