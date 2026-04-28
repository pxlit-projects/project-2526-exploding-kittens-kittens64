const form = document.getElementById('login-form')
const url = "https://localhost:5051/api/Authentication/token"

// extract email from url
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");

// paste email into input field
document.getElementById('email').value = email;

let errorDisplay = document.getElementById('error-message')

function showError(message) {
    errorDisplay.textContent = message
    errorDisplay.style.display = 'block'
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    console.log(email);
    console.log(password);

    if (!email || !password) {
        showError("Fill in all fields.")
        return
    }

    try {
        const response =
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem('token', data.token)
            window.location.href = `lobby.html`

        } else {
            showError("Wrong email or password")
        }
    } catch (err) {
        showError("Cannot connect to the server.")
    }
})