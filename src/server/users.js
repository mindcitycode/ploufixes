import { v4 as uuidv4 } from 'uuid'

const Users = new Map()

import bcrypt from 'bcrypt'
const salt = bcrypt.genSaltSync(10); // store in db

export const addOne = async (username, password) => {
    console.log('addOne', username, password)
    const existing = await findByUsername(username)
    if (existing === undefined) {
        const id = uuidv4()
        const passwordHash = await bcrypt.hash(password, salt)
        const user = { id, username, passwordHash, creationDate: Date.now() }
        Users.set(id, user)
        console.log('add users after creation', Users)
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
    const res = await bcrypt.compare(password, user.passwordHash)
    return res // true or false
}


const joe = await addOne('joe', 'joe')
console.log(Users)