var token = localStorage.getItem('token')
if (!token) {
    window.location.href = 'index.html'
}

var tableList = []
var waitingAtTableId = null

var SearchButton = document.getElementById('search')
var tableCreatorButton = document.getElementById('create-table')
var tableContainer = document.getElementById('table-list')
var playerCountSlider = document.getElementById('total-players')
var playerCountText = document.getElementById('player-count-label')
var waitingText = document.getElementById('waiting-message')
var waitingTitle = document.getElementById('waiting_title')
var waitingSeats = document.getElementById('waiting-seats')
var waitingSubtitle = document.getElementById('waiting-subtitle')

playerCountSlider.addEventListener('input', function() {
    playerCountText.textContent = playerCountSlider.value
})

document.addEventListener('DOMContentLoaded', function() {
    waitingAtTableId = null
    waitingText.style.display = 'none'
    document.getElementById('table-list').style.display = 'block'

    loadTables()

    setInterval(function() {
        loadTables()
    }, 5000)
})

function getUserFromToken() {
    var t = localStorage.getItem('token')
    if (!t) return null

    try {
        var parts = t.split('.')
        var payload = parts[1]
        var decoded = JSON.parse(atob(payload))
        return decoded
    } catch(e) {
        return null
    }
}

async function loadTables() {
    var t = localStorage.getItem('token')
    var numPlayers = playerCountSlider.value

    var url = 'https://localhost:5051/api/Tables/with-available-seats?NumberOfPlayers=' + numPlayers + '&NumberOfArtificialPlayers=0'

    var response = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + t
        }
    })

    if (response.ok) {
        var data = await response.json()
        tableList = data
        renderTables(tableList)


        if (waitingText.style.display === 'block') {
            for (var i = 0; i < tableList.length; i++) {
                var tbl = tableList[i]
                var tblId = tbl.id || tbl.Id

                if (tblId === waitingAtTableId) {
                    var gId = tbl.gameId || tbl.GameId
                    if (gId && gId !== '00000000-0000-0000-0000-000000000000') {
                        window.location.href = 'game.html?tableId=' + tblId
                    }
                    break
                }
            }
        }
    }
}

function renderTables(tables) {
    var list = document.getElementById('table-list')
    list.innerHTML = ''

    if (!tables || tables.length === 0) {
        list.innerHTML = '<p>No tables found.</p>'
        return
    }

    for (var i = 0; i < tables.length; i++) {
        var table = tables[i]
        var id = table.id
        var seated = 0

        if (table.seatedPlayers) {
            seated = table.seatedPlayers.length
        }

        var maxSeats = 0
        if (table.preferences) {
            maxSeats = table.preferences.numberOfPlayers
        }

        var html = '<div class="table-box">'
        html += '<div class="table-top">'
        html += '<span class="table-name">Table: ' + id.substring(0, 8) + '</span>'
        html += '<span class="table-info">' + seated + ' / ' + maxSeats + ' Players</span>'
        html += '</div>'
        html += '<div class="table-bottom">'
        html += '<div class="table-info">Waiting for players</div>'
        html += '<div class="table-actions">'
        html += '<button class="buttonTable-join" onclick="joinTable(\'' + id + '\')">Join</button>'
        html += '</div></div></div>'

        list.innerHTML += html
    }
}

SearchButton.addEventListener('click', function() {
    var selected = parseInt(playerCountSlider.value)
    var matches = []

    for (var i = 0; i < tableList.length; i++) {
        var t = tableList[i]
        var max = null

        if (t.preferences && t.preferences.maxPlayers) {
            max = t.preferences.maxPlayers
        } else if (t.Preferences && t.Preferences.MaxPlayers) {
            max = t.Preferences.MaxPlayers
        }

        if (max === selected) {
            matches.push(t)
        }
    }

    renderTables(matches)
})

tableCreatorButton.addEventListener('click', async function() {
    clearError()

    var user = getUserFromToken()
    var maxPlayers = parseInt(playerCountSlider.value)
    var gameType = document.getElementById('game-type').value
    var t = localStorage.getItem('token')

    if (!t) {
        showError('Your session is not valid. Please log in again.')
        return
    }

    try {
        var response = await fetch('https://localhost:5051/api/Tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + t
            },
            body: JSON.stringify({
                maxPlayers: maxPlayers,
                gameType: gameType
            })
        })

        if (response.ok) {
            var result = await response.json()
            waitingAtTableId = result.id

            var username = 'Player'
            if (user && user.username) {
                username = user.username
            }

            showWaitingScreen(username, 1, maxPlayers, result.id)
        } else {
            showError('Could not create table.')
        }
    } catch(err) {
        showError('Server error. Please try again!')
    }
})

async function joinTable(tableId) {
    var t = localStorage.getItem('token')

    var response = await fetch('https://localhost:5051/api/Tables/' + tableId + '/join', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + t
        }
    })

    if (response.ok) {
        var result = await response.json()
        waitingAtTableId = result.id
        showWaitingScreen(result)
    }
}

function showWaitingScreen(playerName, currentPlayers, maxPlayers, tableId) {
    document.getElementById('table-list').style.display = 'none'
    waitingText.style.display = 'block'
    waitingSubtitle.textContent = currentPlayers + ' / ' + maxPlayers + ' players here'

    var seatsHtml = ''

    for (var i = 0; i < maxPlayers; i++) {
        var seatLabel = '-'
        var seatClass = 'seat empty'

        if (i === 0) {
            seatLabel = playerName.substring(0, 3)
            seatClass = 'seat'
        } else if (i < currentPlayers) {
            seatLabel = '...'
            seatClass = 'seat'
        }

        seatsHtml += '<div class="' + seatClass + '">' + seatLabel + '</div>'
    }

    waitingSeats.innerHTML = seatsHtml


    var oldBtn = waitingText.querySelector('.leave-button')
    if (oldBtn) {
        oldBtn.remove()
    }

    var leaveBtn = document.createElement('button')
    leaveBtn.className = 'buttonTable-secondary leave-button'
    leaveBtn.style.marginTop = '0.75rem'
    leaveBtn.textContent = 'Leave Table'
    leaveBtn.onclick = function() {
        leaveTable(tableId)
    }

    waitingText.appendChild(leaveBtn)
}

async function leaveTable(tableId) {
    clearError()

    try {
        var t = localStorage.getItem('token')

        var response = await fetch('https://localhost:5051/api/Tables/' + tableId + '/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + t
            }
        })

        if (response.ok) {
            document.getElementById('table-list').style.display = 'block'
            waitingText.style.display = 'none'
            loadTables()
        } else {
            showError('Could not leave the table.')
        }
    } catch(err) {
        showError('Server error. Please try again!')
    }
}

function showError(msg) {
    document.getElementById('error-message').textContent = msg
}

function clearError() {
    document.getElementById('error-message').textContent = ''
}