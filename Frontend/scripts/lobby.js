const token = localStorage.getItem('token')
if (!token) {
    window.location.href = 'index.html'
}

const API_URL = 'https://localhost:5051/api/Lobby'

const search_button       = document.getElementById('search')
const create_table_button = document.getElementById('create-table')
const table_list          = document.getElementById('table-list')
const total_players_value = document.getElementById('total-players')
const total_player_label  = document.getElementById('player-count-label')

let currentTableId = null

total_players_value.addEventListener('input', () => {
    total_player_label.textContent = total_players_value.value
})

document.addEventListener('DOMContentLoaded', () => {
    renderTables(dummyTables)
    // fetchTables()
    // setInterval(() => fetchTables(), 5000)
})

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
    try {
        const response = await fetch(`${API_URL}/Tables/with-available-seats`)
        const tables = await response.json()
        renderTables(tables)
    } catch (err) {
        showError('Could not load tables. Is the server running?')
    }
}

function showError(message) {
    document.getElementById('error-message').textContent = message
}

function clearError() {
    document.getElementById('error-message').textContent = ''
}

const dummyTables = [
    { id: 1, name: 'Table 1', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 2, name: 'Table 2', type: 'Default Game', playerCount: 3, maxPlayers: 4 },
    { id: 3, name: 'Table 3', type: 'Default Game',   playerCount: 4, maxPlayers: 4 },
    { id: 4, name: 'Table 4', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 5, name: 'Table 5', type: 'Default Game',   playerCount: 0, maxPlayers: 5 },
]

function renderTables(tables) {
    table_list.innerHTML = ''

    const visibleTables = tables.filter(t => t.playerCount > 0 || t.id === currentTableId)

    if (visibleTables.length === 0) {
        table_list.innerHTML = '<p class="empty-msg">No tables found.</p>'
        return
    }

    visibleTables.forEach(table => {
        const isFull   = table.playerCount >= table.maxPlayers
        const isJoined = table.id === currentTableId

        const box = document.createElement('div')
        box.classList.add('table-box')
        if (isJoined) box.classList.add('table-box--joined')

        const top  = document.createElement('div')
        top.classList.add('table-top')
        const name = document.createElement('span')
        name.classList.add('table-name')
        name.textContent = `${table.name} — ${table.type}`
        top.append(name)

        const bottom = document.createElement('div')
        bottom.classList.add('table-bottom')
        const info   = document.createElement('span')
        info.classList.add('table-info')
        info.textContent = `${table.playerCount} / ${table.maxPlayers} players`

        const actions     = document.createElement('div')
        actions.classList.add('table-actions')
        const buttonTable = document.createElement('button')
        buttonTable.classList.add('buttonTable-join')

        if (isJoined) {
            buttonTable.textContent = 'Leave'
            buttonTable.classList.add('buttonTable-leave')
            buttonTable.addEventListener('click', () => leaveTable(table.id))
        } else {
            buttonTable.textContent = isFull ? 'Full' : 'Join'
            buttonTable.disabled    = isFull
            buttonTable.addEventListener('click', () => joinTable(table.id))
        }

        actions.appendChild(buttonTable)
        bottom.append(info, actions)
        box.append(top, bottom)
        table_list.appendChild(box)
    })
}

search_button.addEventListener('click', () => {
    clearError()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType   = document.getElementById('game-type').value

    const filtered = dummyTables.filter(t =>
        t.maxPlayers === maxPlayers &&
        t.type === gameType &&
        t.playerCount < t.maxPlayers &&
        t.playerCount > 0
    )
    renderTables(filtered)
})

create_table_button.addEventListener('click', async () => {
    clearError()
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
            _addAndJoin(data.tableId, gameType, maxPlayers)
            return
        } else {
            showError('Could not create table.')
        }
    } catch (err) {
        // Server unavailable — fall back to local demo behaviour
    }

    const newId = dummyTables.length + 1
    _addAndJoin(newId, gameType, maxPlayers)
})

function _addAndJoin(id, gameType, maxPlayers) {
    dummyTables.push({ id, name: `Table ${id}`, type: gameType, playerCount: 1, maxPlayers })
    currentTableId = id
    renderTables(dummyTables)
}

async function joinTable(tableId) {
    clearError()
    if (currentTableId !== null) {
        showError('You are already at a table. Leave it first.')
        return
    }

    try {
        const response = await fetch(`${API_URL}/Tables/${tableId}/join`)
        const data = await response.json()
        if (response.ok) {
            if (data.gameStarted) {
                window.location.href = `game.html?tableId=${tableId}`
            } else {
                _applyJoin(tableId)
            }
        } else {
            showError('Could not join the table.')
        }
        return
    } catch (err) {
        // fall through to demo
    }

    _applyJoin(tableId)
}

function _applyJoin(tableId) {
    const table = dummyTables.find(t => t.id === tableId)
    if (!table) return
    table.playerCount = Math.min(table.playerCount + 1, table.maxPlayers)
    currentTableId    = tableId
    renderTables(dummyTables)
}

async function leaveTable(tableId) {
    clearError()

    try {
        const response = await fetch(`${API_URL}/Tables/${tableId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
            _applyLeave(tableId)
            return
        } else {
            showError('Could not leave the table.')
        }
    } catch (err) {
        // fall through to demo
    }

    _applyLeave(tableId)
}

function _applyLeave(tableId) {
    const index = dummyTables.findIndex(t => t.id === tableId)
    if (index !== -1) {
        dummyTables[index].playerCount = Math.max(dummyTables[index].playerCount - 1, 0)
        if (dummyTables[index].playerCount === 0) {
            dummyTables.splice(index, 1)
        }
    }
    currentTableId = null
    renderTables(dummyTables)
}