

const API_BASE    = "https://localhost:5051/api";
const IMAGES_BASE = "images/cards";

// Card enum (exact values from C# backend) 
const Card = {
  ExplodingKitten:    0,
  Defuse:             1,
  Skip:               2,
  Attack:             3,
  Favor:              4,
  Shuffle:            5,
  SeeTheFuture:       6,
  Nope:               7,
  BeardCat:           100,
  Cattermelon:        101,
  HairyPotatoCat:     102,
  RainbowRalphingCat: 103,
  TacoCat:            104,
};


const CARD_NAME = Object.fromEntries(Object.entries(Card).map(([k, v]) => [v, k]));

// Card image variants 
const CARD_IMAGES = {
  ExplodingKitten: [
    "Exploding-Kitten-Warp-Core.jpg",
    "Exploding-Kitten-Nuclear-Bombs.jpg",
    "Exploding-Kitten-House-Grenade.jpg",
    "Exploding-Kitten-TNT-Ship.jpg",
  ],
  Defuse: [
    "Defuse-Via-Laser-Pointer.jpg",
    "Defuse-Via-3AM-Flatulence.jpg",
    "Defuse-Via-Kitten-Therapy.jpg",
    "Defuse-Via-Participation-in-Kitten-Yoga.jpg",
    "Defuse-Via-Belly-Rubs.jpg",
    "Defuse-Via-Catnip-Sandwiches.jpg",
  ],
  Skip: [
    "Skip-Don-a-Portable-Cheetah-Butt.jpg",
    "Skip-Commandeer-a-Bunnyraptor.jpg",
    "Skip-Engage-the-Hypergoat.jpg",
    "Skip-Crab-Walk-with-Some-Crabs.jpg",
  ],
  Attack: [
    "Attack-Crab-a-Pult.jpg",
    "Attack-Catterwocky.jpg",
    "Attack-Bear-o-Dactyl.jpg",
    "Attack-Thousand-Year-Back-Hair.jpg",
  ],
  Favor: [
    "Favor-Take-Your-Friends-Beard-Sailing.jpg",
    "Favor-Get-Enslaved-by-Party-Squirrels.jpg",
    "Favor-Rub-Peanut-Butter-on-Your-Belly-Button.jpg",
  ],
  Shuffle: [
    "Shuffle-Abracrab-Lincoln.jpg",
    "Shuffle-A-Transdimensional-Litter-Box-Materializes.jpg",
    "Shuffle-An-Electromagnetic-Pomeranian-Storm.jpg",
    "Shuffle-A-Plague-of-Bat-Farts.jpg",
  ],
  SeeTheFuture: [
    "See-the-Future-Ask-the-All-Seeing-Goat-Wizard.jpg",
    "See-the-Future-Rub-the-Belly-of-a-Pig-a-Corn.jpg",
    "See-the-Future-Summon-the-Mantis-Shrimp.jpg",
    "See-the-Future-Deploy-the-Special-Ops-Bunnies.jpg",
    "See-the-Future-Fear-Upon-a-Unicorn-Enchilada.jpg",
  ],
  Nope: [
    "Nope-Win-the-Nopebell-Peace-Prize.jpg",
    "Nope-a-Nope-Ninja.jpg",
    "Nope-Nopestradamus-Speaks-the-Truth.jpg",
    "Nope-A-Jackanope-Bounds-into-the-Room.jpg",
    "Nope-Feed-your-Opponent-a-Nope-Sandwich.jpg",
  ],
  BeardCat:           ["Beard-Cat.jpg"],
  Cattermelon:        ["Cattermelon.jpg"],
  HairyPotatoCat:     ["Hairy-Potato-Cat.jpg"],
  RainbowRalphingCat: ["Rainbow-Ralphing-Cat.jpg"],
  TacoCat:            ["Tacocat.jpg"],
};

// Pick a stable random variant per card slot using its index in hand
function cardImageUrl(name, slotIndex) {
  const variants = CARD_IMAGES[name] ?? [];
  if (variants.length === 0) return null;
  const file = variants[slotIndex % variants.length];
  return `${IMAGES_BASE}/${file}`;
}

// readable label
const CARD_LABEL = {
  ExplodingKitten:    "Exploding Kitten",
  Defuse:             "Defuse",
  Skip:               "Skip",
  Attack:             "Attack",
  Favor:              "Favor",
  Shuffle:            "Shuffle",
  SeeTheFuture:       "See the Future",
  Nope:               "Nope",
  BeardCat:           "Beard Cat",
  Cattermelon:        "Cattermelon",
  HairyPotatoCat:     "Hairy Potato Cat",
  RainbowRalphingCat: "Rainbow Ralphing Cat",
  TacoCat:            "Tacocat",
};

// URL
const params    = new URLSearchParams(window.location.search);
const TABLE_ID  = params.get("tableId");
const PLAYER_ID = params.get("playerId");

let pollInterval = null;

// Boot 
if (!TABLE_ID) {
  setStatus("Found no table ID.");
} else {
  pollTable();
}

// poll table until full, then poll for gameId
function pollTable() {
  setStatus("Wait until the table is full.");

  pollInterval = setInterval(async () => {
    try {
      const table = await apiFetch(`/Tables/${TABLE_ID}`);
      renderTableWaiting(table);

      if (table.hasAvailableSeat === false) {
        clearInterval(pollInterval);
        pollInterval = null;

        if (table.gameId) {
          await startGamePolling(table.gameId);
        } else {
          pollTableForGameId();
        }
      }
    } catch (e) {
      setStatus(`error: ${e.message}`);
    }
  }, 2000);
}

// once table is full, poll for gameId
function pollTableForGameId() {
  setStatus("Table is full! Starting game soon.");
  pollInterval = setInterval(async () => {
    try {
      const table = await apiFetch(`/Tables/${TABLE_ID}`);
      if (table.gameId) {
        clearInterval(pollInterval);
        pollInterval = null;
        await startGamePolling(table.gameId);
      }
    } catch (e) {
      setStatus(`Waiting for game ID: ${e.message}`);
    }
  }, 2000);
}

// load + poll game every 2 seconds
async function startGamePolling(gameId) {
  try {
    const game = await apiFetch(`/Games/${gameId}`);
    renderGame(game);
  } catch (e) {
    setStatus(`Fout bij laden spel: ${e.message}`);
    return;
  }

  pollInterval = setInterval(async () => {
    try {
      const game = await apiFetch(`/Games/${gameId}`);
      renderGame(game);
      if (game.hasEnded) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    } catch (e) {
      console.warn("Poll error:", e.message);
    }
  }, 2000);
}

// API 
async function apiFetch(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

// Render: waiting
function renderTableWaiting(table) {
  const seated   = table.seatedPlayers ?? [];
  const capacity = table.preferences?.numberOfPlayers ?? "?";
  setStatus(`Wachten op spelers… ${seated.length} / ${capacity} aanwezig`);

  const el = document.getElementById("opponents");
  if (!el) return;
  el.innerHTML = "";
  seated.forEach(p => {
    const div = document.createElement("div");
    div.className = "opponent";
    div.innerHTML = `<h3>${p.name}</h3><p>Aanwezig ✅</p>`;
    el.appendChild(div);
  });
}

// Render: game
function renderGame(game) {
  renderStatus(game);
  renderDrawPile(game);
  renderDiscardPile(game);
  renderMyCards(game);
  renderOpponents(game);
}

function renderStatus(game) {
  if (game.hasEnded) {
    const winner = (game.players ?? []).find(p => !p.eliminated);
    setStatus(`🎉 ${winner?.name ?? "Someone"} Has won!`);
    return;
  }
  const current  = (game.players ?? []).find(p => p.id === game.playerToPlayId);
  const isMyTurn = PLAYER_ID && game.playerToPlayId === PLAYER_ID;
  setStatus(isMyTurn
    ? "⭐ Jij bent aan de beurt!"
    : `Beurt van ${current?.name ?? "…"}`
  );
}

function renderDrawPile(game) {
  const el = document.getElementById("drawPile");
  if (el) el.textContent = `${game.drawPileCount ?? "?"} Cards`;
}

function renderDiscardPile(game) {
  const el = document.getElementById("playPile");
  if (!el) return;

  const pile = game.discardPile ?? [];
  if (pile.length === 0) {
    el.innerHTML      = "Empty";
    el.style.padding  = "";
    return;
  }

  const topInt  = pile[pile.length - 1];
  const name    = CARD_NAME[topInt] ?? "?";
  const imgUrl  = cardImageUrl(name, pile.length);

  if (imgUrl) {
    el.innerHTML = `<img src="${imgUrl}" alt="${CARD_LABEL[name] ?? name}"
      style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
    el.style.padding = "0";
  } else {
    el.textContent = CARD_LABEL[name] ?? name;
  }
}

function renderMyCards(game) {
  const el = document.getElementById("myCards");
  if (!el) return;
  el.innerHTML = "";

  const me = (game.players ?? []).find(p => p.cardsInHand && p.cardsInHand.length > 0);;
  if (!me) {
    el.innerHTML = "<p>Player not found.</p>";
    return;
  }
  if (me.eliminated) {
    el.innerHTML = `<p style="color:#c0392b;font-weight:bold;">You are eliminated 💀</p>`;
    return;
  }

  const hand = me.cardsInHand ?? [];
  if (hand.length === 0) {
    el.innerHTML = "<p>Cards are not visible.</p>";
    return;
  }

  hand.forEach((cardInt, i) => {
    const name = CARD_NAME[cardInt] ?? "?";
    el.appendChild(makeCardEl(name, i));
  });
}

function renderOpponents(game) {
  const el = document.getElementById("opponents");
  if (!el) return;
  el.innerHTML = "";

  const opponents = (game.players ?? []).filter(p => p.id !== PLAYER_ID);
  opponents.forEach(p => {
    const count    = p.cardsInHandCount ?? 0;
    const isActive = p.id === game.playerToPlayId;

    const div = document.createElement("div");
    div.className = "opponent";
    div.innerHTML = `
      <h3>${p.name} ${p.eliminated ? "💀" : isActive ? "⭐" : ""}</h3>
      <p>${count} kaart${count !== 1 ? "en" : ""}</p>
      <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-top:6px;">
        ${"<div style='width:28px;height:40px;background:#4a3a1a;border-radius:4px;'></div>"
            .repeat(Math.min(count, 10))}
      </div>
    `;
    el.appendChild(div);
  });
}

// Card element
function makeCardEl(name, slotIndex) {
  const div = document.createElement("div");
  div.className = "card";
  div.title     = CARD_LABEL[name] ?? name;

  const imgUrl = cardImageUrl(name, slotIndex);
  if (imgUrl) {
    div.style.padding    = "0";
    div.style.overflow   = "hidden";
    div.style.background = "#2a1a00";
    div.innerHTML = `
      <img src="${imgUrl}" alt="${CARD_LABEL[name] ?? name}"
        style="width:100%;height:100%;object-fit:cover;display:block;">
    `;
  } else {
    // Fallback: text card
    div.style.background    = "#4a3a1a";
    div.style.color         = "#fff";
    div.style.flexDirection = "column";
    div.style.fontSize      = "13px";
    div.style.textAlign     = "center";
    div.style.padding       = "8px";
    div.textContent = CARD_LABEL[name] ?? name;
  }

  return div;
}

// Status helper
function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.innerHTML = `<p>${msg}</p>`;
}   