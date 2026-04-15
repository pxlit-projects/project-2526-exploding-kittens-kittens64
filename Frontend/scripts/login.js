const form = document.getElementById('login-form')
const url = "https://localhost:5051/api/Authentication/token"
let errorDisplay = document.getElementById('error-message')

function showError(message) {
    while (errorDisplay.firstChild) {
        errorDisplay.removeChild(errorDisplay.firstChild)
    }

    let error = document.createTextNode(message)
    errorDisplay.appendChild(error)
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    console.log(email);
    console.log(password);

    if (!email || !password) {
        showError("Vul alle velden in.")
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
            window.location.href = `lobby.html`
        } else {
            showError("Foutief email of wachtwoord")
        }
    } catch (err) {
        showError("Kan geen verbinding maken met de server.")
    }
})