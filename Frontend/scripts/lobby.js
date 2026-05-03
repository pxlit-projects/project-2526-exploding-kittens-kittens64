const token = sessionStorage.getItem('token')
if (!token) {
    window.location.href = 'index.html'
}
console.log(token);

let currentTables = []
let currentWaitingTableId = null;
let currentFilter = null;

const search_button = document.getElementById('search')
const create_table_button = document.getElementById('create-table')
const table_list = document.getElementById('table-list')
const total_players_value = document.getElementById('total-players')
const total_player_label = document.getElementById('player-count-label')
const waiting_message = document.getElementById('waiting-message')
const waiting_title = document.getElementById('waiting_title')
const waiting_seats = document.getElementById('waiting-seats')
const waiting_subtitle = document.getElementById('waiting-subtitle')

total_players_value.addEventListener('input', () => {
    total_player_label.textContent = total_players_value.value
})

document.addEventListener('DOMContentLoaded', () => {
    currentWaitingTableId = null;
    waiting_message.style.display = 'none';
    document.getElementById('table-list').style.display = 'block';

    refreshTableList();
    setInterval(() => refreshTableList(), 1000);
});

function getUserFromToken() {
    const token = sessionStorage.getItem('token')
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}

async function refreshTableList() {
    const token = sessionStorage.getItem('token');

    const maxPlayers = parseInt(total_players_value.value) || 2;

    const url = `https://localhost:5051/api/Tables/with-available-seats?NumberOfPlayers=${maxPlayers}&NumberOfArtificialPlayers=0`;

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        currentTables = await response.json();
        // console.log("Tafels ontvangen:", currentTables);
        // console.log("URL aangeroepen:", url);
        // console.log("Data van server:", currentTables); 
        displayTables(currentTables);

        if (currentFilter !== null) {
            const filteredTables = [];

            for (const table of currentTables) {

                const max = table.preferences?.numberOfPlayers || 0;
                if (max === currentFilter) {
                    filteredTables.push(table);
                }
            }
            displayTables(filteredTables);
        } else {

            if (waiting_message.style.display === 'block') {
                let myTable = currentTables.find(table => {
                    let serverId = table.id || table.Id;
                    return serverId === currentWaitingTableId;
                });
                if (myTable) {
                    let currentPlayers = myTable.seatedPlayers.length
                    const maxPlayers = myTable.preferences?.numberOfPlayers
                    const playerName = getUserFromToken()?.username || 'Speler'

                    waiting_subtitle.textContent = `${currentPlayers} / ${maxPlayers} spelers aanwezig`;
                    seatsHtml = ""
                    for (let i = 0; i < maxPlayers; i++) {
                        let content = "-";
                        let className = 'seat empty';

                        if (i < currentPlayers) {
                            content = (i === 0) ? playerName.substring(0, 3) : "...";
                            className = "seat";
                        }
                        seatsHtml += `<div class="${className}">${content}</div>`;
                    }
                    waiting_seats.innerHTML = seatsHtml

                    let gid = myTable.gameId || myTable.GameId;
                    if (gid && gid !== "00000000-0000-0000-0000-000000000000") {
                        let tableId = myTable.id || myTable.Id;
                        window.location.href = `game.html?tableId=${tableId}`;

                    }
                }

            } else {
                displayTables(currentTables);
            }
        }
    }

}


search_button.addEventListener('click', async () => {
    clearError();
    await refreshTableList();

    const selectedCount = parseInt(total_players_value.value);
    const filteredTables = currentTables.filter(table => {

        const max = table.preferences?.numberOfPlayers || 0;
        return max === selectedCount;
    });
    displayTables(filteredTables);
});



function displayTables(tablesToShow) {
    const list = document.getElementById('table-list');
    list.innerHTML = '';

    if (!tablesToShow || tablesToShow.length === 0) {
        list.innerHTML = '<p>No tables found.</p>';
        return;
    }

    tablesToShow.forEach(table => {
        const tableId = table.id;
        const seatedCount = table.seatedPlayers ? table.seatedPlayers.length : 0;
        const maxPlayers = table.preferences ? table.preferences.numberOfPlayers : 0;

        list.innerHTML += `
        <div class="table-box" style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h3>Table: ${tableId.substring(0, 8)}</h3>
            <p>Players: ${seatedCount} / ${maxPlayers}</p>
            <button onclick="joinTable('${tableId}')">Join</button>
        </div>
        `;
    });
}


create_table_button.addEventListener('click', async () => {
    clearError()
    const user = getUserFromToken()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType = document.getElementById('game-type').value
    const token = sessionStorage.getItem('token')

    if (!token) {
        showError('Je sessie is niet geldig. Log opnieuw in.');
        return;
    }

    try {
        const response = await fetch(`https://localhost:5051/api/Tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ numberOfPlayers: maxPlayers, NumberOfArtificialPlayers: 0, GameType: gameType })
        })
        if (response.ok) {
            const data = await response.json()
            currentWaitingTableId = data.id;

            // FIXED: Get actual seated count from response
            const seatedCount = data.seatedPlayers ? data.seatedPlayers.length : 1;
            showTableWaiting(user?.username || 'Speler', seatedCount, maxPlayers, data.id)
        } else {
            showError('Kon tafel niet aanmaken.')
        }
    } catch (err) {
        showError('Server Error, try again')
    }
})

async function joinTable(tableId) {
    clearError();
    const token = sessionStorage.getItem('token');
    console.log(token);


    try {
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const joinedTable = await response.json();
            currentWaitingTableId = joinedTable.id;


            const user = getUserFromToken();
            const seatedCount = joinedTable.seatedPlayers ? joinedTable.seatedPlayers.length : 1;
            const maxPlayers = joinedTable.preferences?.numberOfPlayers || 0;

            showTableWaiting(user?.username || 'Speler', seatedCount, maxPlayers, joinedTable.id);
        } else {
            showError('Kon tafel niet joinen.');
        }
    } catch (err) {
        showError('Server Error, try again');
    }
}

function showTableWaiting(playerName, currentPlayers, maxPlayers, tableId) {
    document.getElementById('table-list').style.display = 'none';
    waiting_message.style.display = 'block';
    waiting_subtitle.textContent = `${currentPlayers} / ${maxPlayers} spelers aanwezig`;

    let seatsHtml = "";
    for (let i = 0; i < maxPlayers; i++) {
        let content = "-";
        let className = 'seat empty';


        if (i < currentPlayers) {
            content = (i === 0) ? playerName.substring(0, 3) : "...";
            className = "seat";
        }

        seatsHtml += `<div class="${className}">${content}</div>`;
    }
    waiting_seats.innerHTML = seatsHtml;

    const oldButton = waiting_message.querySelector('.leave-button');
    if (oldButton) oldButton.remove();

    waiting_message.insertAdjacentHTML('beforeend', `
        <button class="buttonTable-secondary leave-button" 
                style="margin-top: 0.75rem" 
                onclick="leaveTable('${tableId}')">
            Verlaat Tafel
        </button>
    `);
}

async function leaveTable(tableId) {
    clearError()
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
            currentWaitingTableId = null;
            document.getElementById('table-list').style.display = 'block';
            waiting_message.style.display = 'none'
            await refreshTableList();
        } else {
            showError('Can not leave the table')
        }
    } catch (err) {
        showError('Server Error try again')
    }
}

function showError(message) { document.getElementById('error-message').textContent = message }
function clearError() { document.getElementById('error-message').textContent = '' }