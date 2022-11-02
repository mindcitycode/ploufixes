import './user.css'
export const getCurrentUser = async () => fetch('current-user').then(x => x.json())
export const loginForm = ({ message }) => {
    return new Promise((accept, reject) => {
        document.body.innerHTML = `
    <div id="login">
    <form action="/login" method="post">
    <h3>Login</h3>
    <p>${message}</p>
        <label for="username">Username</label>
        <input placeholder="username" id="username" name="username" type="text" autocomplete="username" required autofocus>
        <label for="current-password">Password</label>
        <input placeholder="password" id="current-password" name="password" type="password" autocomplete="current-password" required>
    <button id="submit-login" type="submit">Sign in</button>
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
    })

}

//    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
