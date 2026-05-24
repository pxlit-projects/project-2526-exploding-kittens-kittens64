
const token = sessionStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

//  tijdelijke variabelen
let currentTables = [];
let currentWaitingTableId = null;
let currentFilter;

//  DOM variabelen 
const searchButton = document.getElementById('search');
const createTableButton = document.getElementById('create-table');
const tableList = document.getElementById('table-list');
const totalPlayersSlider = document.getElementById('total-players');
const playerCountLabel = document.getElementById('player-count-label');
const waitingMessage = document.getElementById('waiting-message');
const waitingTitle = document.getElementById('waiting_title');
const waitingSeats = document.getElementById('waiting-seats');
const waitingSubtitle = document.getElementById('waiting-subtitle');

//  Authenticatie processen

function getToken() {
    return sessionStorage.getItem('token');
}

function getUserFromToken() {
    let storedToken = getToken();
    if (storedToken == null) {
        return null;
    }
    let parts = storedToken.split('.');
    let payload = parts[1];
    let decoded = atob(payload);
    return JSON.parse(decoded);

}

// error block text tonen met behulp van functies

function showError(message) {
    document.getElementById('error-message').textContent = message;
}

function clearError() {
    document.getElementById('error-message').textContent = '';
}

// de zitplekken tonen van de table
function buildSeatsHtml(playerName, currentPlayers, maxPlayers) {
    let html = '';
    for (let i = 0; i < maxPlayers; i++) {

        let isTaken = i < currentPlayers;
        let content = '-';
        let className = 'seat empty';

        if (isTaken) {
            className = 'seat';
            if (i === 0) {
                content = playerName.substring(0, 3);
            } else {
                content = '...';
            }
        }

        html += `<div class="${className}">${content}</div>`;
    }
    return html;
}

function applyFilter() {
    if (currentFilter === null) {
        displayTables(currentTables);
        return;
    }
    let filtered = currentTables.filter(table => {
        let numberOfPlayers = 0;
        if (table.preferences) {
            numberOfPlayers = table.preferences.numberOfPlayers;
        }
        return numberOfPlayers === currentFilter.count;
    });

    if (currentFilter.gameType === 'Blitz Mode') {
        filtered = [];
    }

    displayTables(filtered);
}

//  displayTables -> functioneert om tables te weergeven die in de lijst staan

function displayTables(tablesToShow) {
    tableList.innerHTML = '';
    if (!tablesToShow || tablesToShow.length === 0) {
        tableList.innerHTML = '<p>No tables found.</p>';
        return;
    }
    tablesToShow.forEach(table => {
        const displayId = table.id;
        let displaySeated = 0;
        if (table.seatedPlayers) {
            displaySeated = table.seatedPlayers.length;
        }
        let displayMaxSeats = 0;
        if (table.preferences) {
            displayMaxSeats = table.preferences.numberOfPlayers;
        }

        tableList.innerHTML += `<div class="table-box"><h3>Table:
         ${displayId.substring(0, 8)}
        </h3><p>Players: ${displaySeated} / ${displayMaxSeats}
        </p><button onclick="joinTable('${displayId}')">Join
        </button></div>`;

    });
}
//  showTableWaiting -> toont de table wanneer je als user in een table al joined
//                   -> terwijl je aan het wachten bent

function showTableWaiting(playerName, currentPlayers, maxPlayers, tableId) {
    tableList.style.display = 'none';
    waitingMessage.style.display = 'block';
    createTableButton.disabled = true;
    searchButton.disabled = true;
    waitingSubtitle.textContent = `${currentPlayers} / ${maxPlayers} Players present`;

    let seatsHtml = '';
    for (let i = 0; i < maxPlayers; i++) {
        if (i < currentPlayers) {
            seatsHtml += `<div class="seat"></div>`;
        } else {
            seatsHtml += `<div class="seat empty">-</div>`;
        }

    }
    waitingSeats.innerHTML = seatsHtml;

    const oldLeaveButton = waitingMessage.querySelector('.leave-button');
    if (oldLeaveButton) oldLeaveButton.remove();

    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'buttonTable-secondary leave-button';
    leaveBtn.textContent = 'Verlaat Tafel';
    leaveBtn.onclick = () => leaveTable(tableId);
    waitingMessage.appendChild(leaveBtn);
}

// updateWaitingRoom(table) -> wanneer een speler leaved of joined update deze functie
//  -> de aantal spelers van de table

function updateWaitingRoom(table) {
    let waitingPlayerCount = table.seatedPlayers.length;
    let waitingMaxSeats = 0;
    if (table.preferences) {
        waitingMaxSeats = table.preferences.numberOfPlayers;
    }
    let waitingPlayerName = '';
    if (getUserFromToken()) {
        waitingPlayerName = getUserFromToken().username;
    }

    waitingSubtitle.textContent = `${waitingPlayerCount} / ${waitingMaxSeats} players present`;
    // seats opbouwen
    let seatsHtml = '';
    for (let i = 0; i < waitingMaxSeats; i++) {
        if (i < waitingPlayerCount) {

            let userName = table.seatedPlayers[i].name
            let initials = (userName[0] + userName[userName.length - 1]).toUpperCase()
            seatsHtml += `<div class="seat">${initials}</div>`;
        } else {
            seatsHtml += `<div class="seat empty">-</div>`;
        }
    }
    waitingSeats.innerHTML = seatsHtml;

    // kijken of het spel al gestart is
    let gameId = null;
    if (table.gameId) {
        gameId = table.gameId;
    } else if (table.GameId) {
        gameId = table.GameId;
    }
    let isRealGame = gameId && gameId !== '00000000-0000-0000-0000-000000000000';
    if (isRealGame) {
        let tableId = table.id || table.Id;
        let playerId = getUserFromToken().nameid;
        window.location.href = `game.html?tableId=${tableId}&playerId=${playerId}`;
    }
}



//  refreshTableList()  -> functie om de tables te refreshen in de list
async function refreshTableList() {
    let isWaiting = waitingMessage.style.display === 'block';

    if (isWaiting && currentWaitingTableId != null) {

        let response = await fetch('https://localhost:5051/api/Tables/' + currentWaitingTableId, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!response.ok) {
            return;
        }
        let myTable = await response.json();
        updateWaitingRoom(myTable);
        return;
    }

    let aantalSpelers;
    if (currentFilter !== null) {
        aantalSpelers = currentFilter.count;
    } else {
        aantalSpelers = parseInt(totalPlayersSlider.value);
    }

    let url = 'https://localhost:5051/api/Tables/with-available-seats?NumberOfPlayers=' + aantalSpelers + '&NumberOfArtificialPlayers=0';
    console.log(url);
    let responseUrl = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!responseUrl.ok) {
        return;
    }

    currentTables = await responseUrl.json();
    applyFilter();


}



async function joinTable(tableId) {
    clearError();

    const joinFetchResponse = await fetch(`https://localhost:5051/api/Tables/${tableId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!joinFetchResponse.ok) {
        showError('Could not join table');
        return;
    }

    let joinedTable = await joinFetchResponse.json();
    currentWaitingTableId = joinedTable.id;
    let joinPlayerName = '';
    if (getUserFromToken()) {
        joinPlayerName = getUserFromToken().username;
    }
    let joinSeatedCount = 1;
    if (joinedTable.seatedPlayers) {
        joinSeatedCount = joinedTable.seatedPlayers.length;
    }
    let joinMaxSeats = 0;
    if (joinedTable.preferences) {
        joinMaxSeats = joinedTable.preferences.numberOfPlayers;
    }

    showTableWaiting(joinPlayerName, joinSeatedCount, joinMaxSeats, joinedTable.id);
}


async function leaveTable(tableId) {
    clearError();
    const leaveFetchResponse = await fetch(`https://localhost:5051/api/Tables/${tableId}/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    });

    if (!leaveFetchResponse.ok) {
        showError('The table could not be made');
        return;
    }
    currentWaitingTableId = null;
    currentFilter;
    tableList.style.display = 'block';
    waitingMessage.style.display = 'none';
    createTableButton.disabled = false;
    searchButton.disabled = false;
    await refreshTableList();
}


totalPlayersSlider.addEventListener('input', () => {
    playerCountLabel.textContent = totalPlayersSlider.value;
});
searchButton.addEventListener('click', async () => {
    clearError();
    // sla de gekozen filter op — refreshTableList gebruikt dit automatisch
    currentFilter = {
        count: parseInt(totalPlayersSlider.value),
        gameType: document.getElementById('game-type').value
    };
    await refreshTableList();
});


createTableButton.addEventListener('click', async () => {
    clearError();

    const createUser = getUserFromToken();
    const createMaxSeats = parseInt(totalPlayersSlider.value);
    const createGameType = document.getElementById('game-type').value;
    const createFetchResponse = await fetch('https://localhost:5051/api/Tables', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            numberOfPlayers: createMaxSeats,
            NumberOfArtificialPlayers: 0,
            GameType: createGameType
        })
    });

    if (!createFetchResponse.ok) {
        showError('The Table could not be made');
        return;
    }

    const newTable = await createFetchResponse.json();
    currentWaitingTableId = newTable.id;
    let createSeatedCount = 1;
    if (newTable.seatedPlayers) {
        createSeatedCount = newTable.seatedPlayers.length;
    }

    let createUsername = '';
    if (createUser) {
        createUsername = createUser.username;
    }

    showTableWaiting(createUsername, createSeatedCount, createMaxSeats, newTable.id);
});

document.addEventListener('DOMContentLoaded', () => {
    currentWaitingTableId = null;
    waitingMessage.style.display = 'none';
    tableList.style.display = 'block';
    refreshTableList();
    setInterval(refreshTableList, 1000);
});