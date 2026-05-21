
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
    let storedToken= getToken();
    if(storedToken == null){
        return null;
    }
    let parts = storedToken.split('.');
    let payload= parts[1];
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
       
        let isTaken  = i < currentPlayers;
        let content= '-';
        let className = 'seat empty';

        if(isTaken){
            className = 'seat';
            if(i === 0) {
            content =playerName.substring(0, 3);
            }else{
            content = '...';
            }
        }

        html +=`<div class="${className}">${content}</div>`;
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
    tableList.classList.add('hidden');
    tableList.classList.remove('visible');
    waitingMessage.classList.add('visible');
    waitingMessage.classList.remove('hidden');
    waitingSubtitle.textContent= `${currentPlayers} / ${maxPlayers} Players present`;
   
    let seatsHtml= '';
    for(let i = 0; i < maxPlayers; i++){
        if(i < currentPlayers){
            seatsHtml +=`<div class="seat">...</div>`;
        }else{
            seatsHtml += `<div class="seat empty">-</div>`;
        }
        waitingSeats.innerHTML= seatsHtml;
    }

    const oldLeaveButton= waitingMessage.querySelector('.leave-button');
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
    let waitingPlayerCount  = table.seatedPlayers.length;
    let waitingMaxSeats  = 0;
    if(table.preferences) {
        waitingMaxSeats = table.preferences.numberOfPlayers;
    }
    let waitingPlayerName= '';
    if (getUserFromToken()) {
        waitingPlayerName = getUserFromToken().username;}

    waitingSubtitle.textContent = `${waitingPlayerCount} / ${waitingMaxSeats} players present`;
    // seats opbouwen
    let seatsHtml= '';
    for (let i = 0; i < waitingMaxSeats; i++) {
        if(i < waitingPlayerCount) {
            seatsHtml += `<div class="seat">...</div>`;
        }else{
        seatsHtml += `<div class="seat empty">-</div>`;
        }
    }
    waitingSeats.innerHTML = seatsHtml;

    // kijken of het spel al gestart is
    let gameId = null;
    if(table.gameId) {
        gameId = table.gameId;
    }else if (table.GameId) {
        gameId= table.GameId;
    }
    let isRealGame = gameId && gameId !=='00000000-0000-0000-0000-000000000000';
    if(isRealGame) {
    let tableId = table.id || table.Id;
    let playerId = getUserFromToken().nameid;
    window.location.href = `game.html?tableId=${tableId}&playerId=${playerId}`;
    }
}



//  refreshTableList()  -> functie om de tables te refreshen in de list
async function refreshTableList() {
   
    let isWaiting= waitingMessage.classList.contains('visible');

    if(isWaiting && currentWaitingTableId !=null){

        let response = await fetch('https://localhost:5051/api/Tables/' + currentWaitingTableId, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if(!response.ok){
            return;
        }
        let myTable = await response.json();
        updateWaitingRoom(myTable);
        return;
    }

    let aantalSpelers = parseInt(totalPlayersSlider.value);
    if(!aantalSpelers){
        aantalSpelers = 2;
    }

    let url = 'https://localhost:5051/api/Tables/with-available-seats?NumberOfPlayers=' + aantalSpelers + '&NumberOfArtificialPlayers=0';
    console.log(url);
    let responseUrl = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if(!responseUrl.ok){
        return;
    }

    currentTables = await responseUrl.json();
   

    if(currentFilter != null){
        let filteredTables = [];
        for (let i = 0; i < currentTables.length; i++){
            let table = currentTables[i];
            if(table.preferences && table.preferences.numberOfPlayers === currentFilter){
                filteredTables.push(table);
            }

        }
        displayTables(filteredTables);
    }else{
        displayTables(currentTables);
    }
    

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

    let joinedTable= await joinFetchResponse.json();
    currentWaitingTableId  = joinedTable.id;
    let joinPlayerName=  '';
    if(getUserFromToken()){
        joinPlayerName = getUserFromToken().username;
    }
    let joinSeatedCount =  1;
    if(joinedTable.seatedPlayers){
        joinSeatedCount = joinedTable.seatedPlayers.length;
    }
    let joinMaxSeats  = 0;
    if(joinedTable.preferences){
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
    tableList.classList.add('visible');
    tableList.classList.remove('hidden');
    waitingMessage.classList.add('hidden');
    waitingMessage.classList.remove('visible');
    await refreshTableList();
}


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
    waitingMessage.classList.add('hidden');
    waitingMessage.classList.remove('visible');
    tableList.classList.add('visible');
    tableList.classList.remove('hidden');
    refreshTableList();
    setInterval(refreshTableList, 1000);
});