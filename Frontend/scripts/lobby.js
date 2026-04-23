const API_URL = 'https://localhost:5051/api/Lobby'


// PERSON 1 — Name: ___________
//
// User story 1 + 2 + 5 (gedeeltelijk)
//
// - Declareer alle constanten (API_URL, DOM elementen)
// - Slider event listener → update player count label
// - DOMContentLoaded → start de pagina op
// - Verifieer of speler ingelogd is via JWT token
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

        
        const passwordTable = document.createElement('input')
        passwordTable.classList.add('passwordTable-input')
        passwordTable.type = 'password'
        passwordTable.placeholder = 'Password'
        actions.appendChild(passwordTable)
        

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


document.addEventListener('DOMContentLoaded', () => {
    renderTables(dummyTables)})



// ============================================================
// PERSON 2 — Name: ___________
//
// User story 3
//
// - dummyTables array → tijdelijke data voor visuele preview
// - renderTables() → bouw en toon tafelkaarten in de lijst
//   → toon naam, speltype per tafel
//   → toon duidelijk X / Y plaatsen per tafel
//   → disable join knop als tafel vol is
//   → toon wachtwoord invoerveld per tafel
// ============================================================



// ============================================================
// PERSON 3 — Name: ___________
//
// User story 1
//
// - search_button click → filter tafels op speltype en spelersamtal
//   → toon enkel tafels die voldoen aan de criteria
//   → toon enkel tafels met nog beschikbare plaatsen
// - create_table_button click → maak nieuwe tafel aan via backend
//   → POST met speltype, aantal spelers en aantal AI spelers
//   → toon waiting banner na aanmaak
// ============================================================




// ============================================================
// PERSON 4 — Name: ___________  Name: ___________ 
// 
// User story 2 + 5
//
// - joinTable() → toetreden tot een tafel
//   → GET /api/Tables/{id}/join
//   → blokkeer als tafel vol is
//   → als tafel vol na toetreding → doorsturen naar game.html
// - showWaitingBanner() → visuele bevestiging dat speler aan tafel zit
//   → toon stoelcirkels met bezette en vrije plaatsen
//   → toon X / Y spelers joined
//   → voeg "Verlaat tafel" knop toe aan banner
// - leaveTable() → tafel verlaten voor start van het spel
//   → POST /api/Tables/{id}/leave
//   → als laatste speler → tafel wordt verwijderd, terug naar lobby
//   → als niet laatste → verberg banner, toon tafellijst opnieuw
// ============================================================
