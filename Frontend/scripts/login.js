const form = document.getElementById('login-form')
const url = "https://localhost:5051/api/Authentication/token"

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    console.log(email);
    console.log(password);

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
            // console.log("er is een fout");
        }
    } catch (err) {
        // error_display.innerText = "!"
    }
})