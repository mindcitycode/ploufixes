import { MSG_TYPE_GAME_CREATED_OK, MSG_TYPE_GAME_CREATED_KO } from '../common/messages.js'

export const makeWsUrl = (point) => {
    const url = new URL(window.location)
    url.protocol = 'ws'
    url.port = '3000'
    url.pathname = point
    return url.toString()
}

const makeRestUrl = (pathname) => {
    const url = new URL(window.location)
    url.port = '3000'
    url.pathname = pathname
    return url.toString()
}
const postJson = async (point, data) => {
    const url = makeRestUrl(point)
    console.log('POST to url', url)
    const a = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {})
    })
    const r = await a.json()
    return r
}
const getJson = async (point) => {
    const url = makeRestUrl(point)
    const a = await fetch(url)
    const r = await a.json()
    return r
}
const restPostCreateGame = async (gameParameters) => {
    const r = await postJson('/game', gameParameters)
    if (r.type === MSG_TYPE_GAME_CREATED_OK) {
        console.log('game created ', r)
    } else if (r.type === MSG_TYPE_GAME_CREATED_KO) {
        console.log('game NOT created ')
    } else {
        throw new Error('not convincing')
    }
}
async function restGet() {
    const r = await getJson('/zozo/apppp')
    console.log('FETCHED', r)
}
//restGet()
//restPostCreateGame({ maxClients: 1 })


const postLoginForm = async () => {
    var details = {
        'username': 'UnUser',
        'password': 'UnUserp',
        'submit': 'login'
    };

    var formBody = [];
    for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    const url = makeRestUrl("/login")
    console.log('POST LOGIN TO',url)
    const data = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
    })
    console.log('POST FORM RETRUNS DATA', data)
}
// postLoginForm()
