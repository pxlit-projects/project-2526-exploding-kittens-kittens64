//  Andrii Tymoshenko
// check that u are logged in
const token = localStorage.getItem('token')
console.log("u are logged in");

if (!token) {
    window.location.href = 'index.html'
}



// ============================================================
// PERSON 1 — Name: Damian Dabrowski
//
// - Declareer alle constanten (API_URL, DOM elementen)
// - Slider event listener → update player count label
// - DOMContentLoaded → start de pagina op
// - getUserFromToken() → controleer of speler ingelogd is
// - fetchTables() → haal tafels op van de backend
// - showError() / clearError() → globale foutmelding
// ============================================================

const API_URL = 'https://localhost:5051/api/Lobby'

// De tafel-lay-out
const search_button = document.getElementById('search')
const create_table_button = document.getElementById('create-table')
const table_list = document.getElementById('table-list')
const total_players_value = document.getElementById('total-players')
const total_player_label =  document.getElementById('player-count-label')

// Variabelen voor -> Een user aan het wachten is bij een table
const waiting_message = document.getElementById('waiting-message')
const waiting_title = document.getElementById('waiting_title')
const waiting_seats = document.getElementById('waiting-seats')
const waiting_subs = document.getElementById('waiting-subtitle')

total_players_value.addEventListener('input', () => {
    total_player_label.textContent = total_players_value.value
})

document.addEventListener('DOMContentLoaded', () => {
    renderTables(dummyTables)
    //fetchTables()
    //setInterval(() => fetchTables(), 5000) // uncomment voor auto-refresh
})



function getUserFromToken() {
    const token = localStorage.getItem('token')
    console.log(token)
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}

async function fetchTables() {
    try {
        const response = await fetch(`${API_URL}/Tables/with-available-seats`)
        const tables = await response.json()
        renderTables(tables)
    } catch (err) {
        showError('Kon tafels niet laden. Is de server actief?')
    }
}

function showError(message) {
    document.getElementById('error-message').textContent = message
}

function clearError() {
    document.getElementById('error-message').textContent = ''
}


// ============================================================
// PERSON 2 — Name: ___________
//
// - dummyTables → tijdelijke data voor visuele preview
// - renderTables() → bouw en toon tafelkaarten in de lijst
//   → toon naam en speltype per tafel
//   → toon duidelijk X / Y plaatsen per tafel
//   → disable join knop als tafel vol is
// ============================================================

const dummyTables = [
    { id: 1, name: 'table 1', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 2, name: 'table 2', type: 'Default Game', playerCount: 3, maxPlayers: 4 },
    { id: 3, name: 'table 3', type: 'Blitz Mode',   playerCount: 4, maxPlayers: 4 },
    { id: 4, name: 'table 4', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 5, name: 'table 5', type: 'Blitz Mode',   playerCount: 0, maxPlayers: 5 },
]

function renderTables(tables) {
    table_list.innerHTML = ''

    if (tables.length === 0) {
        table_list.innerHTML = '<p class="empty-msg">Geen tafels gevonden.</p>'
        return
    }

    tables.forEach(table => {
        const isFull = table.playerCount >= table.maxPlayers
        const box = document.createElement('div')
        box.classList.add('table-box')

        // top row
        const top = document.createElement('div')
        top.classList.add('table-top')

        const name = document.createElement('span')
        name.classList.add('table-name')
        name.textContent = `${table.name} — ${table.type}`

       

        top.append(name)

        // bottom row
        const bottom = document.createElement('div')
        bottom.classList.add('table-bottom')

        const info = document.createElement('span')
        info.classList.add('table-info')
        info.textContent = `${table.playerCount} / ${table.maxPlayers} players`

        const actions = document.createElement('div')
        actions.classList.add('table-actions')

        const buttonTable = document.createElement('button')
        buttonTable.classList.add('buttonTable-join')
        buttonTable.textContent = isFull ? 'Full' : 'Join'
        buttonTable.disabled = isFull
        buttonTable.addEventListener('click', () => joinTable(table.id))
        actions.appendChild(buttonTable)

        bottom.append(info, actions)
        box.append(top, bottom)
        table_list.appendChild(box)
    })
}





// ============================================================
// PERSON 3 — Name: ___________
//
// - search_button click → filter tafels op speltype en spelersaantal
// - create_table_button click → maak nieuwe tafel aan via backend
// ============================================================

search_button.addEventListener('click', () => {
    clearError()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType   = document.getElementById('game-type').value


    const filtered = dummyTables.filter(table_filter =>
        table_filter.maxPlayers === maxPlayers &&
        table_filter.type === gameType &&
        table_filter.playerCount < table_filter.maxPlayers
    )
    console.log('filtered:', filtered) 
    console.log('maxPlayers', maxPlayers)
    console.log('gameType from dropdown:', gameType)
    console.log('maxPlayers:', maxPlayers)
    console.log('matching tables:', dummyTables.filter(t => t.type === gameType))
    renderTables(filtered)
})

create_table_button.addEventListener('click', async () => {
    clearError()
    const user       = getUserFromToken()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType   = document.getElementById('game-type').value

  
    try {
        const response = await fetch(`${API_URL}/Tables/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maxPlayers, gameType })
        })
        if (response.ok) {
            const data = await response.json()
            showWaitingBanner(user?.username || 'Speler', 1, maxPlayers, data.tableId)
        } else {
            showError('Kon tafel niet aanmaken.')
        }
    } catch (err) {
        showError('Serverfout. Probeer opnieuw!')
    }

    
    showWaitingBanner(user?.username || 'Speler', 1, maxPlayers, null)
})


// ============================================================
// PERSON 4 — Name: ___________
//
// - joinTable() → toetreden tot een tafel
//   → als tafel vol na toetreding → doorsturen naar game.html
// - showWaitingBanner() → toon banner met stoelcirkels
// - leaveTable() → tafel verlaten voor start van het spel
// ============================================================

async function joinTable(tableId, maxPlayers) {
    clearError()
    const user = getUserFromToken()

    try {
        const response = await fetch(`${API_URL}/Tables/${tableId}/join`)
        const data = await response.json()
        if (response.ok) {
            if (data.gameStarted) {
                window.location.href = `game.html?tableId=${tableId}`
            } else {
                showWaitingBanner(user?.username || 'Speler', data.currentPlayers, data.maxPlayers, tableId)
            }
        } else {
            showError('Kon niet toetreden tot de tafel.')
        }
    } catch (err) {
        showError('Serverfout. Probeer opnieuw!')
    }

    showWaitingBanner(user?.username || 'Speler', 2, maxPlayers, tableId)
}

function showWaitingBanner(playerName, currentPlayers, maxPlayers, tableId) {
    waiting_message.style.display = 'block'
    waiting_sub.textContent = `${currentPlayers} / ${maxPlayers} spelers aanwezig`

    waiting_seats.innerHTML = ''
    for (let i = 0; i < maxPlayers; i++) {
        const seat = document.createElement('div')
        seat.classList.add('seat')
        if (i === 0) {
            seat.textContent = playerName.slice(0, 3)
        } else if (i < currentPlayers) {
            seat.textContent = '...'
        } else {
            seat.classList.add('empty')
            seat.textContent = '—'
        }
        waiting_seats.appendChild(seat)
    }

    const existingBtn = waiting_banner.querySelector('.leave-btn')
    if (existingBtn) existingBtn.remove()

    const leaveBtn = document.createElement('button')
    leaveBtn.textContent = 'Verlaat Tafel'
    leaveBtn.classList.add('buttonTable-secondary', 'leave-btn')
    leaveBtn.style.marginTop = '0.75rem'
    leaveBtn.addEventListener('click', () => leaveTable(tableId))
    waiting_banner.appendChild(leaveBtn)
}

async function leaveTable(tableId) {
    clearError()

    try {
        const response = await fetch(`${API_URL}/Tables/${tableId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
            waiting_banner.style.display = 'none'
            fetchTables()
        } else {
            showError('Kon tafel niet verlaten.')
        }
    } catch (err) {
        showError('Serverfout. Probeer opnieuw!')
    }

    
    waiting_banner.style.display = 'none'
    renderTables(dummyTables)
}