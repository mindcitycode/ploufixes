import './user.css'
export const getCurrentUser = async () => fetch('current-user').then(x => x.json())
export const loginForm = ({ message }) => {
    return new Promise((accept, reject) => {
        document.body.innerHTML = `
    <div id="login">
    <form action="/login" method="post">
    <h3>Login</h3>
    <p class="bad-login-message">${message}</p>
        <label for="username">Username</label>
        <input placeholder="username" id="username" name="username" type="text" autocomplete="username" required autofocus>
        <label for="current-password">Password</label>
        <input placeholder="password" id="current-password" name="password" type="password" autocomplete="current-password" required>
    <button id="submit-login" type="submit">Sign in</button>
    <a id="link-sign-up" href=".">or sign up</a>
    </form>    
    </div>
    `
        const $submitButton = document.getElementById('submit-login')
        const $usernameInput = document.getElementById('username')
        const $usernamePassword = document.getElementById('current-password')
        const postLogin = async (username, password) => {
            const reply = await fetch("/login", {
                method: "post",
                body: new URLSearchParams({ username, password }),
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            })
            document.body.innerHTML = ''
            console.log(reply)
            if (reply.status === 200) {
                accept({ reply })
            } else {
                reject({ reply, message: 'wrong username or password' })
            }
        }
        $submitButton.onclick = (e) => {
            console.log([$usernameInput.value, $usernamePassword.value])
            postLogin($usernameInput.value, $usernamePassword.value)
            e.preventDefault()
        }

        const $signUpLink = document.getElementById('link-sign-up')
        console.log({$signUpLink})
        $signUpLink.onclick = async e => {
            e.preventDefault()
            console.log('sign up')
            document.body.innerHTML = ''
            await SignUpForm({})
        }

    })

}

//    <input type="hidden" name="_csrf" value="<%= csrfToken %>">


export const SignUpForm = ({ message }) => {
    return new Promise((accept, reject) => {
        document.body.innerHTML = `
    <div id="login">
    <form action="/signup" method="post">
    <h3>Sign up</h3>
    <p class="bad-login-message">${message}</p>
        <label for="username">Username</label>
        <input placeholder="username" id="username" name="username" type="text" autocomplete="username" required autofocus>
        <label for="current-password">Password</label>
        <input placeholder="password" id="current-password" name="password" type="password" autocomplete="current-password" required>
    <button id="submit-signup" type="submit">Sign up</button>
    <a id="link-login" href=".">or login</a>
    </form>    
    </div>
    `
        const $submitButton = document.getElementById('submit-signup')
        const $usernameInput = document.getElementById('username')
        const $usernamePassword = document.getElementById('current-password')
        const postLogin = async (username, password) => {
            const reply = await fetch("/signup", {
                method: "post",
                body: new URLSearchParams({ username, password }),
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            })
            document.body.innerHTML = ''
            console.log(reply)
            if (reply.status === 200) {
                accept({ reply })
            } else {
                reject({ reply, message: 'wrong username or password' })
            }
        }
        $submitButton.onclick = (e) => {
            console.log([$usernameInput.value, $usernamePassword.value])
            postLogin($usernameInput.value, $usernamePassword.value)
            e.preventDefault()
        }

        const $LoginLink = document.getElementById('link-login')
        console.log({$LoginLink})
        $LoginLink.onclick = e => {
            console.log('login')
            e.preventDefault()
        }

    })

}
