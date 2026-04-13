const form = document.getElementById('register-form')
const username_input = document.getElementById('username')
const email_input = document.getElementById('email')
const password_input = document.getElementById('password')
const confirm_password_input = document.getElementById('password-verification')
const date_input = document.getElementById('date')
const error_display = document.getElementById('error-message')
const params = new URLSearchParams(window.location.search)
const email = params.get('email')
if (email) {
    document.getElementById('email').value = email
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // 1 Reset errors van de vorige poging.
    error_display.innerText = ""
    const allInputs = [username_input, email_input, password_input, confirm_password_input, date_input]
    allInputs.forEach(input => input.parentElement.classList.remove('error'))

    // 2 Valideer het formulier
    let errors = getRegistrationFormErrors(
        username_input.value,
        email_input.value,
        password_input.value,
        confirm_password_input.value,
        date_input.value
    )

    //3 Stop als er fouten zijn
    if (errors.length > 0) {
        error_display.innerText = errors.join(". ")
        return
    }

    // 4 verstuur naar de backend
    try {
        const response = await fetch('https://localhost:5051/api/Authentication/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username_input.value,
                email: email_input.value,
                password: password_input.value,
                date: date_input.value
            })
        })

        if (response.ok) {
            window.location.href = `login.html?email=${encodeURIComponent(email_input.value)}`
        } else {
            const data = await response.json()
            error_display.innerText = data.message || "Registratie mislukt. Probeer opnieuw!"
        }
    } catch (err) {
        error_display.innerText = "Er is een fout opgetreden. Probeer opnieuw!"
    }
})

function getRegistrationFormErrors(username, email, password, confirmPassword, date) {
    let errors = []

    if (!username) {
        errors.push("Gebruikersnaam is verplicht")
        username_input.parentElement.classList.add('error')
    }

    if (!email) {
        errors.push("E-mail is verplicht")
        email_input.parentElement.classList.add('error')
    }

    if (password.length < 6) {
        errors.push("Wachtwoord moet minimaal 6 tekens bevatten")
        password_input.parentElement.classList.add('error')
    }

    if (password !== confirmPassword) {
        errors.push("Wachtwoorden komen niet overeen")
        confirm_password_input.parentElement.classList.add('error')
    }

    if (!date) {
    errors.push("Geboortedatum is verplicht")
    date_input.parentElement.classList.add('error')
    }
    else {
    const today = new Date()
    const birthDate = new Date(date)

    if (birthDate > today) {
        errors.push("Geboortedatum mag niet in de toekomst liggen")
        date_input.parentElement.classList.add('error')
    }
}

    return errors
}