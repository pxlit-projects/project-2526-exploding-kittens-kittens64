const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:5051/chathub")
    .build()
connection.start()
    .then(function () {
        console.log("Connected!")
        connection.invoke("JoinGame", TABLE_ID)
    })

    .catch(function (err) {
        console.error("Error:", err)
    });


let open_btn = document.getElementById("openChat")
let toggle_panel = document.getElementById("chatPanel")

open_btn.addEventListener("click", async () => {
    if (toggle_panel.hidden) {
        toggle_panel.hidden = false
    } else if (!toggle_panel.hidden) {
        toggle_panel.hidden = true
    }
});

// send en receive emoji

document.querySelectorAll(".emoji-opt").forEach(function (img) {
    img.addEventListener("click", function () {
        connection.invoke("SendEmoji", TABLE_ID, PLAYER_ID, this.src)
        toggle_panel.hidden = true
    })

})


connection.on("ReceiveEmoji", function (playerId, src) {
    let showEmoji = document.querySelector('[data-player-id="' + playerId + '"]')
    let img = document.createElement("img")
    img.src = src
    img.classList.add("emoji")
    showEmoji.appendChild(img)
    setTimeout(function () {
        img.remove()
    }, 5000)
})


// send en receive message
let message = document.getElementById("chatInput")
let sendMessage = document.getElementById("sendMessage")
sendMessage.addEventListener("click", function () {
    connection.invoke("SendMessage", TABLE_ID, PLAYER_ID, message.value)
    message.value = "";
})


connection.on("ReceiveMessage", function (playerId, message) {
    let showMessage = document.querySelector('[data-player-id="' + playerId + '"]')
    // showMessage.querySelector(".message-container") zoekt welke gebruiker heeft bericht gestuurd
    let container = showMessage.querySelector(".message-container")
    let span = document.createElement("span")
    span.textContent = message
    span.classList.add("messageText")
    container.appendChild(span)

    setTimeout(function () {
        span.remove()
    }, 10000)
})

