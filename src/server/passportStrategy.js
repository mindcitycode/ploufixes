import LocalStrategy from 'passport-local'
import * as Users from './users.js'

export const BasicLocalStrategy = () => new LocalStrategy(
    async function (username, password, done) {
        const user = await Users.findByUsername(username)
        if (user === undefined) {
            return done('no such user', false)
        }
        const passwordCheck = await Users.verifyPassword(user, password)
        if (passwordCheck === false) {
            return done(null, false)
        }
        return done(null, user)
    }
)
