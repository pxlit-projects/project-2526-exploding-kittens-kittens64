const form = document.getElementById('register-form')
const username_input = document.getElementById('username')
const email_input = document.getElementById('email')
const password_input = document.getElementById('password')
const confirm_password_input = document.getElementById('password-verification')
const date_input = document.getElementById('date')
// hier de error id krijgen

form.addEventListener('submit', (e) => {
    // e.preventDefault() 

    let errors = []

    errors = getRegistrationFormErrors(
        username_input.value
        ,email_input.value
        ,password_input.value
        ,confirm_password_input.value
        ,date_input.value
        )


        if (errors.length > 0 ) {
            // als er errors zijn, stopt de proces
            e.preventDefault() 
            // error id .innerText = errors.join(". ")
            
        }
})

function getRegistrationFormErrors(username, email, password, confirmPassword, date){

    let errors = []

    if (username === '' || username == null){
        errors.push('') // de boodschaap van deze error
        username_input.parentElement.classList.add('error')

    }
     if (email === '' || email == null){
        errors.push('') // de boodschaap van deze error
        email_input.parentElement.classList.add('error')

    }
     if (password === '' || password == null){
        errors.push('') // de boodschaap van deze error
        password_input.parentElement.classList.add('error')

    }
     if (confirmPassword === '' || confirmPassword == null){
        errors.push('') // de boodschaap van deze error
        confirm_password_input.parentElement.classList.add('error')

    }
     if (date === '' || date == null){
        errors.push('') // de boodschaap van deze error
        date_input.parentElement.classList.add('error') 

    }

    return errors;

}
