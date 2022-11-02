import './user.css'
export const getCurrentUser = async () => fetch('current-user').then(x => x.json())
export const loginForm = ({ message = '' } = {}) => {
    document.body.innerHTML = `
    <div id="login">
    <form action="/login" method="post">
    <h3>Login</h3>
    <p id="bad-login-message">${message}</p>
        <label for="username">Username</label>
        <input placeholder="username" id="username" name="username" type="text" autocomplete="username" required autofocus>
        <label for="current-password">Password</label>
        <input placeholder="password" id="current-password" name="password" type="password" autocomplete="current-password" required>
    <button id="submit-login" type="submit">Sign in</button>
    <a id="link-sign-up" href=".">or sign up</a>
    </form>    
    </div>
    `
    const $badLoginMessageParagraph = document.getElementById('bad-login-message')
    const $submitButton = document.getElementById('submit-login')
    const $usernameInput = document.getElementById('username')
    const $usernamePassword = document.getElementById('current-password')
    const postLogin = async (username, password) => {
        const reply = await fetch("/login", {
            method: "post",
            body: new URLSearchParams({ username, password }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        console.log(reply)
        if (reply.status === 200) {
            window.router.goto('#play')
        } else {
            $badLoginMessageParagraph.textContent = 'wrong username or password'
        }
    }
    $submitButton.onclick = (e) => {
        e.preventDefault()
        console.log([$usernameInput.value, $usernamePassword.value])
        postLogin($usernameInput.value, $usernamePassword.value)
    }

    const $signUpLink = document.getElementById('link-sign-up')
    console.log({ $signUpLink })
    $signUpLink.onclick = async e => {
        e.preventDefault()
        window.router.goto('#signup')
    }

    return () => {
        document.body.innerHTML = 'cleanup'
    }

}

//    <input type="hidden" name="_csrf" value="<%= csrfToken %>">


export const SignUpForm = ({ message = '' } = {}) => {

    document.body.innerHTML = `
    <div id="login">
    <form action="/signup" method="post">
    <h3>Sign up</h3>
    <p id="bad-signup-message">${message}</p>
        <label for="username">Username</label>
        <input placeholder="username" id="username" name="username" type="text" autocomplete="username" required autofocus>
        <label for="current-password">Password</label>
        <input placeholder="password" id="current-password" name="password" type="password" autocomplete="current-password" required>
    <button id="submit-signup" type="submit">Sign up</button>
    <a id="link-login" href=".">or login</a>
    </form>    
    </div>
    `
    const $badSignupMessageParagraph = document.getElementById('bad-signup-message')
    const $submitButton = document.getElementById('submit-signup')
    const $usernameInput = document.getElementById('username')
    const $usernamePassword = document.getElementById('current-password')
    const postSignup = async (username, password) => {
        $badSignupMessageParagraph.classList.remove('shake')

        const reply = await fetch("/signup", {
            method: "post",
            body: new URLSearchParams({ username, password }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        console.log(reply)
        if (reply.status === 200) {
            const r = await reply.json()
            if (r.error) {
                $badSignupMessageParagraph.textContent = r.error
                $badSignupMessageParagraph.classList.add('shake')
            } else {
                router.goto('#login')
            }
        } else {
            $badSignupMessageParagraph.textContent = 'error!'
            $badSignupMessageParagraph.classList.add('shake')
        }
    }
    $submitButton.onclick = (e) => {
        console.log([$usernameInput.value, $usernamePassword.value])
        postSignup($usernameInput.value, $usernamePassword.value)
        e.preventDefault()
    }

    const $LoginLink = document.getElementById('link-login')
    console.log({ $LoginLink })
    $LoginLink.onclick = e => {
        e.preventDefault()
        window.router.goto('#login')
    }

    return () => {
        document.body.innerHTML = ''
    }
}
