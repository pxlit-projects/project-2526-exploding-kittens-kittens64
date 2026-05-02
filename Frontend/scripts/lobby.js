//  Andrii Tymoshenko
// check that u are logged in
const token = localStorage.getItem('token')
console.log("u are logged in");

if (!token) {
    window.location.href = 'index.html'
}
let currentTables = []
let currentWaitingTableId = null;


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
const waiting_subtitle = document.getElementById('waiting-subtitle')

total_players_value.addEventListener('input', () => {
    total_player_label.textContent = total_players_value.value
})

document.addEventListener('DOMContentLoaded', () => {
   
    refreshTableList()
    setInterval(() => refreshTableList(), 5000) 
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

async function refreshTableList() {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://localhost:5051/api/Tables/with-available-seats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        currentTables = await response.json();
        displayTables(currentTables); 

        if (waiting_message.style.display === 'block') {
            let myTable = null;

            for (let i = 0; i < currentTables.length; i++) {
                // Check zowel 'id' als 'Id' van de server
                let serverId = currentTables[i].id || currentTables[i].Id;

                if (serverId === currentWaitingTableId) {
                    myTable = currentTables[i];
                    console.log("Mijn tafel gevonden:", myTable);

                    // De redirect moet VOOR de break staan om gecheckt te worden
                    let gid = myTable.gameId || myTable.GameId;
                    if (gid && gid !== "00000000-0000-0000-0000-000000000000") {
                        window.location.href = `game.html?tableId=${serverId}`;
                    }
                    break; 
                }
            }
        }
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

/* const dummyTables = [
    { id: 1, name: 'table 1', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 2, name: 'table 2', type: 'Default Game', playerCount: 3, maxPlayers: 4 },
    { id: 3, name: 'table 3', type: 'Blitz Mode',   playerCount: 4, maxPlayers: 4 },
    { id: 4, name: 'table 4', type: 'Default Game', playerCount: 1, maxPlayers: 3 },
    { id: 5, name: 'table 5', type: 'Blitz Mode',   playerCount: 0, maxPlayers: 5 },
] */

function displayTables(tablesToShow) {
    const list = document.getElementById('table-list');
    list.innerHTML = ''; // Clear the list

    if (tablesToShow.length === 0) {
        list.innerHTML = '<p>No tables found.</p>';
        return;
    }
    
    tablesToShow.forEach(table => {
        // We maken variabelen aan die zowel kleine letters als hoofdletters checken
        const tableId = table.id || table.Id;
        const tableName = table.name || table.Name || 'Game Table';
        const seatedPlayers = table.seatedPlayers || table.SeatedPlayers || [];
        const preferences = table.preferences || table.Preferences;
        const maxPlayers = preferences?.maxPlayers || preferences?.MaxPlayers || 4;
    
       list.innerHTML += `
        <div class="table-box">
            <h3>${tableName}</h3>
            <p>Players: ${seatededPlayers.length} / ${maxPlayers}</p>
            <button onclick="joinTable('${tableId}')">Join</button>
        </div>
    `;
    });
}



// ============================================================
// PERSON 3 — Name: ___________
//
// - search_button click → filter tafels op speltype en spelersaantal
// - create_table_button click → maak nieuwe tafel aan via backend
// ============================================================

search_button.addEventListener('click', () => {
    const selectedCount = parseInt(total_players_value.value);
  
    console.log("Zoeken naar tafels met max spelers:", selectedCount);
    console.log("Huidige lijst in geheugen:", currentTables); // Check of dit leeg is!

    const matches = currentTables.filter(table => {
        const max = table.preferences?.maxPlayers || table.Preferences?.MaxPlayers;
        return max === selectedCount;
    });
    
    displayTables(matches);
});

create_table_button.addEventListener('click', async () => {
    clearError()
    const user  = getUserFromToken()
    const maxPlayers = parseInt(total_players_value.value)
    const gameType = document.getElementById('game-type').value
    const token = localStorage.getItem('token')

    

    if (!token){
        showError('Je sessie is niet geldig. Log opnieuw in.');
    }

    try {
        const response = await fetch(`https://localhost:5051/api/Tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
    
            body: JSON.stringify({ numerOfPlayers :maxPlayers, gameType })
        })
        if (response.ok) {
            const data = await response.json()
            console.log("Tafel succesvol aangemaakt. Server data:", data);
            currentWaitingTableId = data.id;
            showTableWaiting(user?.username || 'Speler', 1, maxPlayers, data.id)
        } else {
            showError('Kon tafel niet aanmaken.')
        }
    } catch (err) {
        showError('Serverfout. Probeer opnieuw!')
    }

    
})


// ============================================================
// PERSON 4 — Name: ___________
//
// - joinTable() → toetreden tot een tafel
//   → als tafel vol na toetreding → doorsturen naar game.html
// - showTableWaiting() → toon banner met stoelcirkels
// - leaveTable() → tafel verlaten voor start van het spel
// ============================================================

async function joinTable(tableId, maxPlayers) {
    clearError()
    const user = getUserFromToken()

    try {
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}/join`,{
            method: 'POST',
            headers: {'Content-Type': "application/json",
                'Authorization' : `Bearer ${token}`
            }
        })
        const data = await response.json()
        if (response.ok) {
            if (data.gameStarted) {
                window.location.href = `game.html?tableId=${tableId}`
            } else {
                showTableWaiting(user?.username || 'Speler', data.currentPlayers, data.maxPlayers, tableId)
            }
        } else {
            showError('Kon niet toetreden tot de tafel.')
        }
    } catch (err) {
        showError('Serverfout. Probeer opnieuw!')
    }

    
}

function showTableWaiting(playerName,currentPlayers,maxPlayers,tableId){

    document.getElementById('table-list').style.display = 'none';

    waiting_message.style.display = 'block';
    waiting_subtitle.textContent = `${currentPlayers} / ${maxPlayers} spelers aanwezig`;

    let seatsHtml = "";
    for (let i = 0; i < maxPlayers; i++){
        let content = "-";
        let className = 'seat empty';

        if (i == 0){
            content = playerName.substring(0,3)
            className = "seat";
        }else if (i < currentPlayers){
            content = "..."
            className = "seat"
        }
           seatsHtml += `<div class="${className}">${content}</div>`;

    }
 
    waiting_seats.innerHTML = seatsHtml;

    const buttonId = `leave-button-${tableId}`;
    const oldButton = waiting_message.querySelector('.leave-button');
    if (oldButton) {
        oldButton.remove();
    }
    // wanneer je een tabel aanroept blijf je steeds leave button opvragen
    // om dat te voorkomen zoekt de query voor een leave button als die bestaat verwijdert hij de button

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

    try {
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
             }
        })
        if (response.ok) {
            document.getElementById('table-list').style.display = 'block';
            waiting_message.style.display = 'none'
            refreshTableList()
        } else {
            showError('Kon de tafel niet verlaten.')
        }
    } catch (err) {
        showError('Serverfout. Probeer opnieuw!')
    }

    waiting_message.style.display = 'none'
   
}

