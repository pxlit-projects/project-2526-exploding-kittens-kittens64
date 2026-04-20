const slider = document.getElementById('total-players');
const sliderDisplay = document.getElementById('slider-display');
const playerCountLabel = document.getElementById('player-count-label');

slider.addEventListener('input', () => {
    sliderDisplay.textContent = slider.value;
    playerCountLabel.textContent = slider.value;
});

const mockTables = [
    { id: 1, name: 'Table #1', gameType: 'Default Game', seated: 2, total: 3 },
    { id: 2, name: 'Table #2', gameType: 'Default Game', seated: 4, total: 5 },
    { id: 3, name: 'Table #3', gameType: 'Default Game', seated: 3, total: 3 },
];

let joinedTable = null;

function renderTables(tables) {
    const list = document.getElementById('table-list');
    list.innerHTML = '';

    if (tables.length === 0) {
        list.innerHTML = '<p class="empty-state">No tables found — create one!</p>';
        return;
    }

    tables.forEach(t => {
        const isFull = t.seated >= t.total;
        const card = document.createElement('div');
        card.className = 'table-card';

        
        let pips = '';
        for (let i = 0; i < t.total; i++) {
            pips += `<span class="pip ${i < t.seated ? 'filled' : ''}"></span>`;
        }

        card.innerHTML = `
            <div class="table-card-info">
                <span class="table-card-name">${t.name}</span>
                <span class="table-card-meta">${t.gameType} &nbsp;·&nbsp; ${t.seated}/${t.total} players</span>
                <div class="seat-pips" style="margin-top:6px">${pips}</div>
            </div>
            <button ${isFull ? 'disabled' : ''} data-id="${t.id}">
                ${isFull ? 'Full' : 'Join'}
            </button>
        `;

        if (!isFull) {
            card.querySelector('button').addEventListener('click', () => joinTable(t));
        }

        list.appendChild(card);
    });
}

function joinTable(table) {
    joinedTable = { ...table, seated: table.seated + 1 };
    showWaiting(joinedTable);
}

function showWaiting(table) {
    const banner = document.getElementById('waiting-banner');
    const seatsEl = document.getElementById('waiting-seats');
    const subEl = document.getElementById('waiting-sub');

    banner.classList.add('visible');

    let pips = '';
    for (let i = 0; i < table.total; i++) {
        pips += `<span class="pip ${i < table.seated ? 'filled' : ''}"></span>`;
    }
    seatsEl.innerHTML = pips;
    subEl.textContent = `${table.seated} / ${table.total} players joined`;

    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('search').addEventListener('click', () => {
    const maxPlayers = parseInt(slider.value);

    const filtered = mockTables.filter(t => t.total === maxPlayers);
    renderTables(filtered);
});

document.getElementById('create-room').addEventListener('click', () => {
    const maxPlayers = parseInt(slider.value);
    const gameType = document.getElementById('game-type').selectedOptions[0].text;
    const newTable = {
        id: Date.now(),
        name: `Table #${mockTables.length + 1}`,
        gameType,
        seated: 1,
        total: maxPlayers,
    };
    mockTables.push(newTable);
    joinTable(newTable);
    renderTables(mockTables.filter(t => t.total === maxPlayers));
});

renderTables(mockTables);