
const token = sessionStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

//  tijdelijke variabelen
let currentTables= [];
let currentWaitingTableId = null;
let currentFilter= null;

//  DOM variabelen 
const searchButton= document.getElementById('search');
const createTableButton= document.getElementById('create-table');
const tableList= document.getElementById('table-list');
const totalPlayersSlider  = document.getElementById('total-players');
const playerCountLabel= document.getElementById('player-count-label');
const waitingMessage= document.getElementById('waiting-message');
const waitingTitle  = document.getElementById('waiting_title');
const waitingSeats = document.getElementById('waiting-seats');
const waitingSubtitle= document.getElementById('waiting-subtitle');

//  Authenticatie processen

function getToken() {
    return sessionStorage.getItem('token');
}
function getUserFromToken() {
    const storedToken = getToken();
    if (!storedToken) return null;
    try {
        const payload = storedToken.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
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
    let html  = '';
    for (let i = 0; i < maxPlayers; i++) {
        const isTaken= i < currentPlayers;
        const content = isTaken ? (i === 0 ? playerName.substring(0, 3) : '...') : '-';
        const className= isTaken ? 'seat' : 'seat empty';
        html += `<div class="${className}">${content}</div>`;
    }
    return html;
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
        const displaySeated= table.seatedPlayers ? table.seatedPlayers.length : 0;
        const displayMaxSeats  = table.preferences ? table.preferences.numberOfPlayers : 0;
       
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
    waitingMessage.style.display  = 'block';
    waitingSubtitle.textContent= `${currentPlayers} / ${maxPlayers} Players present`;
    waitingSeats.innerHTML  = buildSeatsHtml(playerName, currentPlayers, maxPlayers);

    const oldLeaveButton= waitingMessage.querySelector('.leave-button');
    if (oldLeaveButton) oldLeaveButton.remove();

    waitingMessage.innerHTML += `<button class="buttonTable-secondary leave-button" onclick="leaveTable('${tableId}')">
    Leave Table</button>`;
}

// updateWaitingRoom(table) -> wanneer een speler leaved of joined update deze functie
//                          -> de aantal spelers van de table

function updateWaitingRoom(table) {
    const waitingPlayerCount = table.seatedPlayers.length;
    const waitingMaxSeats= table.preferences?.numberOfPlayers;
    const waitingPlayerName = getUserFromToken()?.username || '';

    waitingSubtitle.textContent = `${waitingPlayerCount} / ${waitingMaxSeats} players present`;
    waitingSeats.innerHTML= buildSeatsHtml(waitingPlayerName, waitingPlayerCount, waitingMaxSeats);

    // De logica om de game te laten starten
    const gameId = table.gameId || table.GameId;
    const isRealGame = gameId && gameId !== '00000000-0000-0000-0000-000000000000';
    if (isRealGame) {
        const tableId = table.id || table.Id;
        const playerId = getUserFromToken()?.nameid;;
        window.location.href = `game.html?tableId=${tableId}&playerId=${playerId}`;;
    }
}
//  refreshTableList()  -> functie om de tables te refreshen in de list
async function refreshTableList() {
    const isWaiting = waitingMessage.style.display === 'block';

    if (isWaiting && currentWaitingTableId) {
        const waitingFetchResponse = await fetch(`https://localhost:5051/api/Tables/${currentWaitingTableId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!waitingFetchResponse.ok) return;
        const myTable = await waitingFetchResponse.json();
        updateWaitingRoom(myTable);
        return;
    }

    const sliderMaxPlayers = parseInt(totalPlayersSlider.value) || 2;
    const url = `https://localhost:5051/api/Tables/with-available-seats?NumberOfPlayers=${sliderMaxPlayers}&NumberOfArtificialPlayers=0`;

    const fetchResponse = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!fetchResponse.ok) return;

    currentTables = await fetchResponse.json();
    const filteredByFilter = currentTables.filter(t => (t.preferences?.numberOfPlayers || 0) === currentFilter);

    if (currentFilter !== null) 
        displayTables(filteredByFilter);
    else  
        displayTables(currentTables);
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

    const joinedTable= await joinFetchResponse.json();
    currentWaitingTableId  = joinedTable.id;
    const joinPlayerName= getUserFromToken()?.username || 'Speler';
    const joinSeatedCount = joinedTable.seatedPlayers ? joinedTable.seatedPlayers.length : 1;
    const joinMaxSeats  = joinedTable.preferences?.numberOfPlayers || 0;

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
    tableList.style.display = 'block';
    waitingMessage.style.display = 'none';
    await refreshTableList();
}

//  Event listeners 

totalPlayersSlider.addEventListener('input', () => {
    playerCountLabel.textContent = totalPlayersSlider.value;
});
searchButton.addEventListener('click', async () => {
    clearError();
    await refreshTableList();
    const searchSelectedCount = parseInt(totalPlayersSlider.value);
    const filteredBySearch = currentTables.filter(table => (table.preferences?.numberOfPlayers || 0) === searchSelectedCount);
    displayTables(filteredBySearch);
});

createTableButton.addEventListener('click', async () => {
    clearError();

    const createUser = getUserFromToken();
    const createMaxSeats = parseInt(totalPlayersSlider.value);
    const createGameType = document.getElementById('game-type').value;
    const createFetchResponse = await fetch('https://localhost:5051/api/Tables', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
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
    const createSeatedCount = newTable.seatedPlayers ? newTable.seatedPlayers.length : 1;
    showTableWaiting(createUser?.username ||'', createSeatedCount, createMaxSeats, newTable.id);
});

document.addEventListener('DOMContentLoaded', () => {
    currentWaitingTableId= null;
    waitingMessage.style.display = 'none';
    tableList.style.display= 'block';
    refreshTableList();
    setInterval(refreshTableList, 1000);
});