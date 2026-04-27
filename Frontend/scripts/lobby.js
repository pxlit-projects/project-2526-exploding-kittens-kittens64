


const API_URL = 'https://localhost:5051/api/Lobby'


// PERSON 1 — Name: Damian Dabrowski
//
// User story 1 + 2 + 5 (gedeeltelijk)
//
// - Declareer alle constanten (API_URL, DOM elementen)
// - Slider event listener → update player count label
// - DOMContentLoaded → start de pagina op
// - Controleer of speler ingelogd is via JWT token
//   → niet ingelogd = doorsturen naar login pagina
// - fetchTables() → haal tafels op van de backend
// - Auto-refresh van de tafellijst (setInterval)
//   → zodat wijzigingen van andere spelers live zichtbaar zijn
// - showError() / clearError() → globale foutmelding
// ============================================================



// alle benodigde variabelen declareren

const search_button = document.getElementById('search')
const create_table_button = document.getElementById('create-table')
const table_list = document.getElementById('table-list')
const total_players_value = document.getElementById('total-players')
const total_player_label =  document.getElementById('player-count-label')


const dummyTables = [
    { id: 1, name: 'table 1', type: 'Default Game', playerCount: 2, maxPlayers: 4,  },
    { id: 2, name: 'table 2', type: 'Default Game', playerCount: 3, maxPlayers: 4,   },
    { id: 3, name: 'table 3', type: 'Blitz Mode',   playerCount: 4, maxPlayers: 4,  },
    { id: 4, name: 'table 4', type: 'Default Game', playerCount: 1, maxPlayers: 3,   },
    { id: 5, name: 'table 5', type: 'Blitz Mode',   playerCount: 0, maxPlayers: 5,  },
]

total_players_value.addEventListener('input', () => {
    total_player_label.textContent = total_players_value.value
})



function renderTables(tables) {
    table_list.innerHTML = ''

    tables.forEach(table => {
        const isFull = table.playerCount >= table.maxPlayers

        // box
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



function getUserFromToken() {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}
 
async function fetchTables() {
    // GET /api/Tables/with-available-seats
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
// User story 1
//
// - dummyTables array → tijdelijke data voor visuele preview
// - renderTables() → bouw en toon tafelkaarten in de lijst
//   → toon naam en speltype per tafel
//   → toon duidelijk X / Y plaatsen per tafel
//   → disable join knop als tafel vol is
// ============================================================
 
const dummyTables = [
    { id: 1, name: 'Table 1', type: 'Default Game', playerCount: 2, maxPlayers: 4 },
    { id: 2, name: 'Table 2', type: 'Default Game', playerCount: 3, maxPlayers: 4 },
    { id: 3, name: 'Table 3', type: 'Blitz Mode',   playerCount: 4, maxPlayers: 4 },
    { id: 4, name: 'Table 4', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 5, name: 'Table 5', type: 'Blitz Mode',   playerCount: 0, maxPlayers: 5 },
]
 
function renderTables(tables) {
    table_list.innerHTML = ''
 
    if (tables.length === 0) {
        const empty = document.createElement('p')
        empty.classList.add('empty-msg')
        empty.textContent = 'Geen tafels gevonden.'
        table_list.appendChild(empty)
        return
    }
 
    tables.forEach(table => {
        const isFull = table.playerCount >= table.maxPlayers
 
        const box = document.createElement('div')
        box.classList.add('table-card')
 
        // top rij — naam en speltype
        const top = document.createElement('div')
        top.classList.add('table-top')
        const name = document.createElement('span')
        name.classList.add('table-name')
        name.textContent = `${table.name} — ${table.type}`
        top.append(name)
 
        // onderste rij — bezetting en join knop
        const bottom = document.createElement('div')
        bottom.classList.add('table-bottom')
 
        const info = document.createElement('span')
        info.classList.add('table-info')
        info.textContent = `${table.playerCount} / ${table.maxPlayers} spelers`
 
        const actions = document.createElement('div')
        actions.classList.add('table-actions')
 
        const joinButton = document.createElement('button')
        joinButton.classList.add('buttonTable-join')
        joinButton.textContent = isFull ? 'Vol' : 'Join'
        joinButton.disabled = isFull
        joinButton.addEventListener('click', () => joinTable(table.id, table.maxPlayers))
        actions.appendChild(joinButton)
 
        bottom.append(info, actions)
        box.append(top, bottom)
        table_list.appendChild(box)
    })
}
 
 
// ============================================================
// PERSON 3 — Name: ___________
//
// User story 1
//
// - search_button click → filter tafels op speltype en spelersaantal
//   → toon enkel tafels die voldoen aan de criteria
//   → toon enkel tafels met nog beschikbare plaatsen
// - create_table_button click → maak nieuwe tafel aan via backend
//   → POST met speltype en aantal spelers
//   → toon waiting banner na aanmaak
// ============================================================
 
search_button.addEventListener('click', () => {
    clearError()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType   = document.getElementById('game-type').value
 
    // filter op criteria — swap met fetchTables() als backend klaar is
    const filtered = dummyTables.filter(t =>
        t.maxPlayers === maxPlayers &&
        t.type === gameType &&
        t.playerCount < t.maxPlayers
    )
    renderTables(filtered)
})
 
create_table_button.addEventListener('click', async () => {
    clearError()
    const user       = getUserFromToken()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType   = document.getElementById('game-type').value
 
    // --- Backend call (uncomment als backend klaar is) ---
    // try {
    //     const response = await fetch(`${API_URL}/create`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ maxPlayers, gameType })
    //     })
    //     if (response.ok) {
    //         const data = await response.json()
    //         showWaitingBanner(user?.username || 'Speler', 1, maxPlayers, data.tableId)
    //     } else {
    //         showError('Kon tafel niet aanmaken.')
    //     }
    // } catch (err) {
    //     showError('Serverfout. Probeer opnieuw!')
    // }
 
    // dummy preview — verwijder als backend klaar is
    showWaitingBanner(user?.username || 'Speler', 1, maxPlayers, null)
})
 
 
// ============================================================
// PERSON 4 — Name: ___________
//
// User story 2 + 5
//
// - joinTable() → toetreden tot een tafel
//   → GET /api/Tables/{id}/join
//   → als tafel vol na toetreding → doorsturen naar game.html
// - showWaitingBanner() → visuele bevestiging dat speler aan tafel zit
//   → toon stoelcirkels met bezette en vrije plaatsen
//   → toon X / Y spelers joined
//   → voeg "Verlaat tafel" knop toe
// - leaveTable() → tafel verlaten voor start van het spel
//   → POST /api/Tables/{id}/leave
//   → als laatste speler → tafel verwijderd, terug naar lobby
//   → als niet laatste → verberg banner, toon tafellijst opnieuw
// ============================================================
 
async function joinTable(tableId, maxPlayers) {
    clearError()
    const user = getUserFromToken()
 
    // --- Backend call (uncomment als backend klaar is) ---
    // try {
    //     const response = await fetch(`${API_URL}/Tables/${tableId}/join`)
    //     const data = await response.json()
    //     if (response.ok) {
    //         if (data.gameStarted) {
    //             window.location.href = `game.html?tableId=${tableId}`
    //         } else {
    //             showWaitingBanner(user?.username || 'Speler', data.currentPlayers, data.maxPlayers, tableId)
    //         }
    //     } else {
    //         showError('Kon niet toetreden tot de tafel.')
    //     }
    // } catch (err) {
    //     showError('Serverfout. Probeer opnieuw!')
    // }
 
    // dummy preview — verwijder als backend klaar is
    showWaitingBanner(user?.username || 'Speler', 2, maxPlayers, tableId)
}
 
function showWaitingBanner(playerName, currentPlayers, maxPlayers, tableId) {
    waiting_banner.style.display = 'block'
    waiting_sub.textContent = `${currentPlayers} / ${maxPlayers} spelers aanwezig`
 
    // bouw stoelcirkels
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
 
    // verlaat tafel knop
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
 
    // --- Backend call (uncomment als backend klaar is) ---
    // try {
    //     const response = await fetch(`${API_URL}/Tables/${tableId}/leave`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' }
    //     })
    //     if (response.ok) {
    //         waiting_banner.style.display = 'none'
    //         fetchTables()
    //     } else {
    //         showError('Kon tafel niet verlaten.')
    //     }
    // } catch (err) {
    //     showError('Serverfout. Probeer opnieuw!')
    // }
 
    // dummy preview — verwijder als backend klaar is
    waiting_banner.style.display = 'none'
    renderTables(dummyTables)
}
 
