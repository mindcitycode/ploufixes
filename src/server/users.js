import { v4 as uuidv4 } from 'uuid'

const Users = new Map()

export const addOne = async (username, password) => {
    console.log('addOne', username, password)
    const existing = await findByUsername(username)
    if (existing === undefined) {
        const id = uuidv4()
        const user = { id, username, password }
        Users.set(id, user)
        return user
    }
}
export const findById = async id => {
    return Users.get(id)
}
export const findByUsername = async username => {
    for (const user of Users.values()) {
        if (user.username === username) {
            return user
        }
    }
}
export const verifyPassword = async (user, password) => {
    return user.password === password
}


const joe = await addOne('joe', 'joe')
console.log(Users)