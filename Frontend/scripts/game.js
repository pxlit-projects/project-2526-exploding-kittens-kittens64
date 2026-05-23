const API_BASE = "https://localhost:5051/api";
const IMAGES_BASE = "images/cards";

// Card enum (exact values from C# backend)
const Card = {
  ExplodingKitten: 0,
  Defuse: 1,
  Skip: 2,
  Attack: 3,
  Favor: 4,
  Shuffle: 5,
  SeeTheFuture: 6,
  Nope: 7,
  BeardCat: 100,
  Cattermelon: 101,
  HairyPotatoCat: 102,
  RainbowRalphingCat: 103,
  TacoCat: 104,
};

const CARD_NAME = Object.fromEntries(Object.entries(Card).map(([k, v]) => [v, k]));

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
  BeardCat: ["Beard-Cat.jpg"],
  Cattermelon: ["Cattermelon.jpg"],
  HairyPotatoCat: ["Hairy-Potato-Cat.jpg"],
  RainbowRalphingCat: ["Rainbow-Ralphing-Cat.jpg"],
  TacoCat: ["Tacocat.jpg"],
};

function cardImageUrl(name, slotIndex) {
  const variants = CARD_IMAGES[name] ?? [];
  if (variants.length === 0) return null;
  const file = variants[slotIndex % variants.length];
  return `${IMAGES_BASE}/${file}`;
}

const CARD_LABEL = {
  ExplodingKitten: "Exploding Kitten",
  Defuse: "Defuse",
  Skip: "Skip",
  Attack: "Attack",
  Favor: "Favor",
  Shuffle: "Shuffle",
  SeeTheFuture: "See the Future",
  Nope: "Nope",
  BeardCat: "Beard Cat",
  Cattermelon: "Cattermelon",
  HairyPotatoCat: "Hairy Potato Cat",
  RainbowRalphingCat: "Rainbow Ralphing Cat",
  TacoCat: "Tacocat",
};

const CARD_ACTION_DESCRIPTION = {
  Skip: "Skip — skips the current turn without drawing.",
  Attack: "Attack — the next player must take two turns.",
  Favor: "Favor — a card is requested from the target player.",
  Shuffle: "Shuffle — the draw pile is shuffled.",
  SeeTheFuture: "See the Future — the top 3 cards of the draw pile are viewed.",
  BeardCat: "Cat combo — a random card is stolen from the target player.",
  Cattermelon: "Cat combo — a random card is stolen from the target player.",
  HairyPotatoCat: "Cat combo — a random card is stolen from the target player.",
  RainbowRalphingCat: "Cat combo — a random card is stolen from the target player.",
  TacoCat: "Cat combo — a random card is stolen from the target player.",
};

function getActionDescription(cards) {
  if (!cards || cards.length === 0)
    return "";
  const allCat = cards.every(c => CAT_CARDS.has(c));
  if (allCat && cards.length === 3)
    return "3-cat combo  a specific card is stolen from the target player.";
  if (allCat && cards.length === 2)
    return CARD_ACTION_DESCRIPTION["BeardCat"];
  const name = CARD_NAME[cards[0]];
  return CARD_ACTION_DESCRIPTION[name] ?? "";
}

const CAT_CARDS = new Set([Card.BeardCat, Card.Cattermelon, Card.HairyPotatoCat, Card.RainbowRalphingCat, Card.TacoCat]);
const NON_PLAYABLE = new Set([Card.ExplodingKitten, Card.Nope, Card.Defuse]);

const params = new URLSearchParams(window.location.search);
const TABLE_ID = params.get("tableId");
const PLAYER_ID = params.get("playerId");

let pollInterval = null;
let currentGame = null;
let selectedCards = [];

function hasUnresolvedAction(game) {
  return !!(game.pendingAction && !game.pendingAction.isExecuted);
}

function checkIfIHaveExploded(game) {
  let allPlayers = game.players;
  if(!allPlayers) {
    allPlayers = [];
  }

  let myPlayer= null;
  for(let i= 0; i < allPlayers.length; i++) {
    if(allPlayers[i].id === PLAYER_ID) {
      myPlayer = allPlayers[i];
    }
  }
  if(!myPlayer) {
    return false;
  }
  if(myPlayer.eliminated === true) {
    return true;
  }
  return false;
}

// startup Code 
if (!TABLE_ID) {
  setStatus("Found no table ID.");
} else {
  pollTable();
}



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

async function startGamePolling(gameId) {
  try {
    const game = await apiFetch(`/Games/${gameId}`);
    currentGame = game;
    renderGame(game);
  } catch (e) {
    setStatus(`Error when loading game: ${e.message}`);
    return;
  }

  pollInterval = setInterval(async () => {
    try {
      const game = await apiFetch(`/Games/${gameId}`);
      currentGame = game;
      renderGame(game);
      if (game.hasEnded) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    } catch (e) {
      console.warn("Poll error:", e.message);
    }
  }, 5000);
}



async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? ": " + body : ""}`);
  }
  return res.status === 204 ? null : res.json();
}


function renderTableWaiting(table) {
  const seated = table.seatedPlayers ?? [];
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

function renderGame(game) {
  renderStatus(game);
  renderDrawPile(game);
  renderDiscardPile(game);
  renderMyCards(game);
  renderOpponents(game);
  renderActionPanel(game);
  renderNopePanel(game);
  renderFutureCards(game);
  renderGiveCardPanel(game);
  renderMyPlayer(game);
  renderDeadPopup(game);  
  renderSpectator(game);
}

function renderStatus(game) {
  if (game.hasEnded) {
    const winner = (game.players ?? []).find(p => !p.eliminated);
    setStatus(`🎉 ${winner?.name ?? "Someone"} Has won!`);
    return;
  }
  const current = (game.players ?? []).find(p => p.id === game.playerToPlayId);
  const isMyTurn = PLAYER_ID && game.playerToPlayId === PLAYER_ID;
  setStatus(isMyTurn
    ? " It is your turn!"
    : `Turn of ${current?.name ?? "…"}`
  );
}

function renderDrawPile(game) {
  const drawPileElement = document.getElementById("drawPile");
  if (!drawPileElement) return;

  const isMyTurn = PLAYER_ID && game.playerToPlayId === PLAYER_ID;
  const cardCount = game.drawPileCount ?? 0;

  // We create a clean HTML structure with classes
  drawPileElement.innerHTML = `
    <div class="deck-wrapper">
      <img class="deck_img" src="images/game_img/deck_img.png" alt="Deck">
      <div class="deck-count-label">${cardCount} cards left</div>
    </div>
  `;

  if (isMyTurn) {
    const drawButton = document.createElement("button");
    drawButton.textContent = "Draw Card";
    drawButton.className = "draw-action-btn";
    const blocked = hasUnresolvedAction(game);
    drawButton.disabled = blocked;
    drawButton.title = blocked
      ? "Resolve the pending action before drawing."
      : "End your turn by drawing a card.";

    drawButton.onclick = () => {
      if (hasUnresolvedAction(game)) {
        alert("You must resolve the pending action first!");
        return;
      }
      drawCard();
    };

    // Find the wrapper we just made and put the button inside
    drawPileElement.querySelector(".deck-wrapper").appendChild(drawButton);
  }
}

function renderDiscardPile(game) {
  const el = document.getElementById("playPile");
  if (!el) return;

  const pile = game.discardPile ?? [];
  if (pile.length === 0) {
    el.innerHTML = "Empty";
    el.style.padding = "";
    return;
  }

  const topInt = pile[pile.length - 1];
  const name = CARD_NAME[topInt] ?? "?";
  const imgUrl = cardImageUrl(name, pile.length);

  if (imgUrl) {
    el.innerHTML = `<img src="${imgUrl}" alt="${CARD_LABEL[name] ?? name}" style="width:100%;height:100%;object-fit:fill;border-radius:8px;">`;
    el.style.padding = "0";
  } else {
    el.textContent = CARD_LABEL[name] ?? name;
  }
}

function renderMyCards(game) {
  const el = document.getElementById("myCards");
  if (!el) return;
  el.innerHTML = "";

  const isMyTurn = PLAYER_ID && game.playerToPlayId === PLAYER_ID;
  const me = (game.players ?? []).find(p => p.id === PLAYER_ID);

  if (!me) { el.innerHTML = "<p>Player not found.</p>"; return; }
  if (me.eliminated) { el.innerHTML = `<p style="color:#c0392b;font-weight:bold;">YOU ARE ELIMINATED</p>`; return; }

  const hand = me.cardsInHand ?? [];
  if (hand.length === 0) { el.innerHTML = "<p>No cards in hand.</p>"; return; }

  hand.forEach((cardInt, i) => {
    const name = CARD_NAME[cardInt] ?? "?";
    const isSelected = selectedCards.some(s => s.slotIndex === i);
    const canSelect = isMyTurn && !NON_PLAYABLE.has(cardInt) && !hasUnresolvedAction(game);

    const div = makeCardEl(name, i, isSelected, canSelect);

    if (canSelect) {
      div.style.cursor = "pointer";
      div.addEventListener("click", () => toggleCardSelection(cardInt, i, game));
    } else {
      div.style.opacity = "0.75";
      div.style.cursor = "default";
    }

    el.appendChild(div);
  });
}

function renderOpponents(game) {
  const el = document.getElementById("opponents");
  if (!el) return;
  el.innerHTML = "";

  const opponents = (game.players ?? []).filter(p => p.id !== PLAYER_ID);
  opponents.forEach(p => {
    const count = p.cardsInHandCount ?? 0;

    let opponentTurn = "";
    if (p.id === game.playerToPlayId) {
      opponentTurn = "opponentTurn";
    }
    // dit nog moet je toevogen eliminated ???
    //   <h3>${p.name} ${p.eliminated ? "💀" : isActive ? "⭐" : ""}</h3>

    let avatarSrc = "";
    let displayName = "";
    let displayCount = 0;
    let cardsBackHtml = "";

    if(p.eliminated === true){
      avatarSrc = "images/avatars/avatar-dead.png";
      displayName = `${p.name}  (ELIMINATED)`;
      displayCount = 0;
      cardsBackHtml = ""; 
    }else{
      avatarSrc = "images/avatars/avatar-1.png";
      displayName= p.name;
      displayCount= count;
      cardsBackHtml = "<div class='opponents_card'> <img src='images/game_img/deck_img.png' alt='op_card'> </div>".repeat(Math.min(displayCount, 5));
    }


    el.innerHTML += `
      <div class="opponent ${opponentTurn} ${p.eliminated ? 'eliminated-opponent' : ''}" data-player-id="${p.id}">
          <h3 class="opponent_name">${p.name}</h3>
        <img class="avatar_img" src="images/avatars/avatar-1.png" alt="opponent-img">
        <div class="opponents_cards">
              <span class="card_counter">${count}</span>
          ${"<div id='opponents_card'> <img src='images/game_img/deck_img.png' alt='op_card'> </div>".repeat(Math.min(count, 5))}
        </div>
        <div class="message-container"></div>
      </div>
    `;
  });
}

function renderMyPlayer(game) {
  const el = document.getElementById("myPlayer");
  if (!el) return;

  const me = (game.players ?? []).find(p => p.id === PLAYER_ID);
  if (!me) return;

  const myTurnClass = game.playerToPlayId === PLAYER_ID ? "opponentTurn" : "";

  el.innerHTML = `
    <div class="opponent ${myTurnClass}">
      <h3 class="opponent_name">${me.name}</h3>
      <img class="avatar_img" src="images/avatars/avatar-1.png" alt="my-avatar">
    </div>
  `;
}


function renderActionPanel(game) {
  let panel = document.getElementById("actionPanel");
  if (!panel) {
    return
  }

  panel.innerHTML = "";

   let iAmEliminated = checkIfIHaveExploded(game);
  if (iAmEliminated === true) {
    panel.innerHTML= `<p>You are eliminated, spectator mode is ON, no action are allowed</p>`;
    return;
  }

  // AUTO Defuse card if Exploding kitten is picked from card deck and place it back to choosed position
  const action = game.pendingAction;

  let MyTurn
  if(game.playerToPlayId === PLAYER_ID){
    MyTurn=true
  }

  if (action && !action.isExecuted && action.cards.includes(Card.Defuse)&&MyTurn) {

    panel.innerHTML = `
    <div>Defuse! Choose in which position you want to put the Exploding Kitten Card :</div>
    <input type="range" id="ex-kit-slider" min="0" max="${game.drawPileCount}" value="0">
    <div id="label">Positie: 0</div>
    <button id="confirm-btn">Bevestigen</button>
  `;

    document.getElementById("ex-kit-slider").addEventListener("input", (input) => {
      document.getElementById("label").textContent = `Positie: ${input.target.value}`;
    });

    document.getElementById("confirm-btn").addEventListener("click", async () => {
      const slider = document.getElementById("ex-kit-slider");
      const position = parseInt(slider.value);

      await apiFetch(`/Games/${game.id}/play-action`, {
        method: "POST",
        body: JSON.stringify({
          cards: [Card.Defuse],
          targetCard: Card.ExplodingKitten,
          drawPileIndex: position
        })
      });

      const update = await apiFetch(`/Games/${game.id}`);
      currentGame = update;
      renderGame(update);
    });

    return;
  }

  const pendingAction = game.pendingAction;

  if (pendingAction && !pendingAction.isExecuted) {
    const actor = (game.players ?? []).find(p => p.id === pendingAction.playerId);
    const cardNames = (pendingAction.cards ?? [])
      .map(c => CARD_LABEL[CARD_NAME[c]] ?? "?")
      .join(" + ");
    const actionDesc = getActionDescription(pendingAction.cards ?? []);

    let nopeStatus = "";
    if (pendingAction.isNoped) {
      nopeStatus = `<span class="nope-badge nope-active">NOPED, action is cancelled</span>`;
    } else if ((pendingAction.nopeCount ?? 0) > 0 && !pendingAction.isNoped) {
      nopeStatus = `<span class="nope-badge nope-restored">Counter-noped, action is ACTIVE again</span>`;
    }

    const banner = document.createElement("div");
    banner.className = "pending-action-banner";
    banner.innerHTML = `
      <div class="pending-action-who">
        <strong>${actor?.name ?? "Someone"}</strong> played
        <strong>${cardNames}</strong>
      </div>
      <div class="pending-action-desc">${actionDesc}</div>
      ${nopeStatus}
    `;
    panel.appendChild(banner);
    return;
  }

  // Action is executed or there is no pending action — show card selection UI
  const isMyTurn = PLAYER_ID && game.playerToPlayId === PLAYER_ID;
  if (!isMyTurn || game.hasEnded) return;

  const selCount = selectedCards.length;
  const summary = document.createElement("span");
  summary.style.flex = "1";

  if (selCount === 0) {
    summary.textContent = "Select cards from your hand to play.";
    panel.appendChild(summary);
    return;
  }

  const names = selectedCards.map(s => CARD_LABEL[CARD_NAME[s.cardInt]] ?? "?");
  summary.textContent = `Selected: ${names.join(", ")}`;
  panel.appendChild(summary);

  const needsTarget = needsTargetPlayer(selectedCards, game);
  if (needsTarget) {
    const sel = document.createElement("select");
    sel.id = "targetPlayerSelect";
    sel.style.cssText = "padding:4px 8px;border-radius:6px;border:2px solid #4a3a1a;background:#d1be84;color:#2a1a00;";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "— Select target player —";
    sel.appendChild(placeholder);

    (game.players ?? [])
      .filter(p => p.id !== PLAYER_ID && !p.eliminated)
      .forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        sel.appendChild(opt);
      });
    panel.appendChild(sel);
  }

  const needsTargetCard = selectedCards.length === 3 && selectedCards.every(s => CAT_CARDS.has(s.cardInt));
  if (needsTargetCard) {
    const sel = document.createElement("select");
    sel.id = "targetCardSelect";
    sel.style.cssText = "padding:4px 8px;border-radius:6px;border:2px solid #4a3a1a;background:#d1be84;color:#2a1a00;";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "— Select card to steal —";
    sel.appendChild(placeholder);

    Object.entries(CARD_LABEL).forEach(([name, label]) => {
      const cardInt = Card[name];
      if (cardInt === undefined || NON_PLAYABLE.has(cardInt)) return;
      const opt = document.createElement("option");
      opt.value = cardInt;
      opt.textContent = label;
      sel.appendChild(opt);
    });
    panel.appendChild(sel); 
  }

  const btn = document.createElement("button");
  btn.textContent = "▶ Play cards";
  btn.style.cssText = "padding:8px 16px;background:#4a3a1a;border:none;border-radius:6px;color:#e4cf91;font-weight:bold;cursor:pointer;";
  btn.addEventListener("click", () => playSelectedCards(game));
  panel.appendChild(btn);

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "✕ Clear";
  clearBtn.style.cssText = "padding:8px 12px;background:#d1be84;border:2px solid #4a3a1a;border-radius:6px;color:#2a1a00;cursor:pointer;";
  clearBtn.addEventListener("click", () => {
    selectedCards = [];
    renderMyCards(game);
    renderActionPanel(game);
  });
  panel.appendChild(clearBtn);

  const errEl = document.createElement("div");
  errEl.id = "playError";
  errEl.style.cssText = "width:100%;color:#e74c3c;font-size:13px;";
  panel.appendChild(errEl);
}

function needsTargetPlayer(selected, game) {
  if (selected.length === 0) return false;

  let allCat = true;
  for (const select of selected) {
    if (!CAT_CARDS.has(select.cardInt)) {
      allCat = false;
      break;
    }
  }
  if (allCat && selected.length >= 2) return true;
  if (selected.length === 1 && selected[0].cardInt === Card.Favor) return true;
  return false;
}

function validateCardCombination(cards) {
  const allCat = cards.every(c => CAT_CARDS.has(c));
  const allSame = cards.every(c => c === cards[0]);
  if (cards.length === 0) return "No cards selected.";
  if (allCat && cards.length === 1) return "You can't play a single cat card — combine 2 or 3 identical ones.";
  if (cards.length > 1 && (!allCat || !allSame)) return "You can only combine identical cat cards (2 or 3 of the same).";
  if (cards.length > 3) return "Maximum 3 cat cards can be combined.";
  return null;
}

async function playSelectedCards(game) {
  const errEl = document.getElementById("playError");
  if (errEl) errEl.textContent = "";

// const cards = [];
// for (const selected of selectedCards) {
//   cards.push(selected.cardInt);
// }

// let allCat = true;
// for (const card of cards) {
//   if (!CAT_CARDS.has(card)) {
//     allCat = false;
//     break;
//   }
// }
const cards = selectedCards.map(s => s.cardInt);

let allSame = true;
for (const card of cards) {
  if (card !== cards[0]) {
    allSame = false;
    break;
  }
}

  const validationError = validateCardCombination(cards);
  if (validationError) {
    if (errEl) errEl.textContent = validationError;
    return;
  }

  let targetPlayerId = null;
  const targetPlayerSel = document.getElementById("targetPlayerSelect");
  if (targetPlayerSel) {
    targetPlayerId = targetPlayerSel.value || null;
    if (!targetPlayerId) {
      if (errEl) errEl.textContent = "Please select a target player.";
      return;
    }
  }

  let targetCard = null;
  const targetCardSel = document.getElementById("targetCardSelect");
  if (targetCardSel) {
    const val = targetCardSel.value;
    if (!val) {
      if (errEl) errEl.textContent = "Please select a card to steal.";
      return;
    }
    targetCard = parseInt(val, 10);
  }

  const body = { cards, targetPlayerId, targetCard, drawPileIndex: null };

  try {
    await apiFetch(`/Games/${game.id}/play-action`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    selectedCards = [];
    // Force immediate refresh
    const updated = await apiFetch(`/Games/${game.id}`);
    currentGame = updated;
    renderGame(updated);
  } catch (e) {
    if (errEl) errEl.textContent = `Error: ${e.message}`;
  }
}

function renderNopePanel(game) {
  const panel = document.getElementById("nopePanel");
  if (!panel) return;

  panel.innerHTML = "";


  let iAmEliminated= checkIfIHaveExploded(game);
  if(iAmEliminated === true){
    return;
  }

  const action = game.pendingAction;
  if (!action) return;

  if (action.isExecuted) return;

  if (action.canBeNoped === false) return;

  const myDecision = action.playerNopeDecisions?.[PLAYER_ID];

  if (myDecision === undefined) return;

  const isActor = action.playerId === PLAYER_ID;
  const isNoped = action.isNoped;
  const nopeCount = action.nopeCount ?? 0;

  const actorName = (game.players ?? []).find(p => p.id === action.playerId)?.name ?? "Someone";
  const cardNames = (action.cards ?? []).map(c => CARD_LABEL[CARD_NAME[c]] ?? "?").join(" + ");

  // Describe the current state of the nope chain
  let chainMsg = "";
  if (nopeCount === 0) {
    chainMsg = "Pending — waiting for players to decide.";
  } else if (isNoped) {
    chainMsg = `⛔ Noped ${nopeCount}x — action is <strong>cancelled</strong>.`;
  } else {
    chainMsg = `↩️ Counter-noped ${nopeCount}x — original action is <strong>active again</strong>.`;
  }

  const info = document.createElement("div");
  info.className = "nope-info";
  info.innerHTML = `
    <strong>${actorName}</strong> played <strong>${cardNames}</strong>.<br>
    <span class="nope-chain-status">${chainMsg}</span>
  `;
  panel.appendChild(info);

  if (myDecision !== 0) {
    const decided = document.createElement("div");
    decided.className = "nope-decided";
    decided.textContent = myDecision === 1 ? "You played Nope ⛔" : "You confirmed ✅";
    panel.appendChild(decided);
    return;
  }

  const me = (game.players ?? []).find(p => p.id === PLAYER_ID);
  const hasNope = (me?.cardsInHand ?? []).includes(Card.Nope);

  const btnRow = document.createElement("div");
  btnRow.className = "nope-btn-row";

  if (!isActor && hasNope) {
    const nopeBtn = document.createElement("button");
    nopeBtn.textContent = isNoped ? "↩️ Counter-nope it!" : "⛔ Nope it!";
    nopeBtn.className = "nope-btn";
    nopeBtn.addEventListener("click", () => sendNope(game.id));
    btnRow.appendChild(nopeBtn);
  }

  const passBtn = document.createElement("button");
  passBtn.textContent = isActor ? "✅ Proceed" : "✅ Let it pass";
  passBtn.className = "nope-pass-btn";
  passBtn.addEventListener("click", () => sendConfirmNotNoping(game.id));
  btnRow.appendChild(passBtn);

  panel.appendChild(btnRow);
}

async function sendNope(gameId) {
  try {
    await apiFetch(`/Games/${gameId}/nope`, { method: "POST" });
    const updated = await apiFetch(`/Games/${gameId}`);
    currentGame = updated;
    renderGame(updated);
  } catch (e) {
    setStatus(`Nope error: ${e.message}`);
  }
}

async function sendConfirmNotNoping(gameId) {
  try {
    await apiFetch(`/Games/${gameId}/confirm-not-noping`, { method: "POST" });
    const updated = await apiFetch(`/Games/${gameId}`);
    currentGame = updated;
    renderGame(updated);
  } catch (e) {
    setStatus(`Confirm error: ${e.message}`);
  }
}

function renderFutureCards(game) {
  const panel = document.getElementById("futureCardsPanel");
  if (!panel) return;

  panel.innerHTML = "";
  const me = (game.players ?? []).find(p => p.id === PLAYER_ID);
  const futureCards = me?.futureCards ?? [];

  if (futureCards.length === 0) return;

  const title = document.createElement("div");
  title.style.cssText = "width:100%;font-weight:bold;margin-bottom:8px;";
  title.textContent = "The next 3 cards are:";
  panel.appendChild(title);

  futureCards.forEach((cardInt, i) => {
    const name = CARD_NAME[cardInt] ?? "?";
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:4px;";

    const label = document.createElement("div");
    label.style.cssText = "font-size:11px;color:#4a3a1a;font-weight:bold;";
    label.textContent = `#${i + 1}`;

    const card = makeCardEl(name, i);
    card.style.opacity = "1";
    card.style.cursor = "default";

    wrapper.appendChild(label);
    wrapper.appendChild(card);
    panel.appendChild(wrapper);
  });
}

// Willem Beckers

async function sendGiveCard(gameId, cardInt) {
  try {
    await apiFetch(`/Games/${gameId}/select-card-to-give-as-a-favor`, {
      method: "POST",
      body: JSON.stringify({ card: cardInt }),
    });
    const updater = await apiFetch(`/Games/${gameId}`);
    currentGame = updater;
    renderGame(updater);
  } catch (e) {
    setStatus(`Error Found: ${e.message}`);
  }
}

function renderGiveCardPanel(game) {

  let iAmEliminated = checkIfIHaveExploded(game);
  if (iAmEliminated === true) {
    return;
  }

  let panel = document.getElementById("giveCardPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "giveCardPanel";
    panel.style.cssText = "margin:10px 0;padding:15px;background:#e4cf91;border-radius:10px;color:#2a1a00;display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:50px;border:2px solid #c03424;";
    const nopePanel = document.getElementById("nopePanel");
    nopePanel?.parentNode?.insertBefore(panel, nopePanel.nextSibling);
  }

  panel.innerHTML = "";

  const action = game.pendingAction;
  if (!action) return panel.innerHTML = "";


  const iAmTarget = action.targetPlayerId === PLAYER_ID;
  const isFavor = (action.cards ?? []).includes(Card.Favor);
  const isNoped = action.isNoped;

  if (!iAmTarget || !isFavor || isNoped) return;

  const actor = (game.players ?? []).find(p => p.id === action.playerId);
  const me = (game.players ?? []).find(p => p.id === PLAYER_ID);
  const hand = me?.cardsInHand ?? [];

  const info = document.createElement("div");
  info.style.cssText = "width:100%;margin-bottom:8px;font-weight:bold;";
  info.textContent = `${actor?.name ?? "Someone"} needs a card from you! pick one you'd like to give:`;
  panel.appendChild(info);

  hand.forEach((cardInt, i) => {
    const name = CARD_NAME[cardInt] ?? "?";
    const div = makeCardEl(name, i, false, true);
    div.style.cursor = "pointer";
    div.addEventListener("click", () => sendGiveCard(game.id, cardInt));
    panel.appendChild(div);
  });
}

function toggleCardSelection(cardInt, slotIndex, game) {
  const existingIdx = selectedCards.findIndex(s => s.slotIndex === slotIndex);
  if (existingIdx !== -1) {
    selectedCards.splice(existingIdx, 1);
  } else {
    selectedCards.push({ cardInt, slotIndex });
  }
  renderMyCards(game);
  renderActionPanel(game);
}

function makeCardEl(name, slotIndex, isSelected = false, canSelect = false) {
  const div = document.createElement("div");
  div.className = "card";
  div.title = CARD_LABEL[name] ?? name;

  if (isSelected) {
    div.style.outline = "3px solid #e67e22";
    div.style.transform = "translateY(-8px)";
    div.style.boxShadow = "0 4px 16px rgba(230,126,34,0.6)";
    div.style.transition = "transform 0.15s,box-shadow 0.15s";
  }
  if (canSelect && !isSelected) {
    div.style.transition = "transform 0.15s";
  }

  const imgUrl = cardImageUrl(name, slotIndex);
  if (imgUrl) {
    div.style.padding = "0";
    div.style.overflow = "hidden";
    div.style.background = "#2a1a00";
    div.innerHTML = `
      <img src="${imgUrl}" alt="${CARD_LABEL[name] ?? name}"
        style="width:100%;height:100%;object-fit:cover;display:block;">
    `;
  } else {
    div.style.background = "#4a3a1a";
    div.style.color = "#fff";
    div.style.flexDirection = "column";
    div.style.fontSize = "13px";
    div.style.textAlign = "center";
    div.style.padding = "8px";
    div.textContent = CARD_LABEL[name] ?? name;
  }

  return div;
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.innerHTML = `<p>${msg}</p>`;
}

function renderSpectator(game) {
  let spectatorBannerElement = document.getElementById("spectatorBanner");
  if (!spectatorBannerElement) {
    return;
  }

  spectatorBannerElement.innerHTML = "";

  let iAmEliminated = checkIfIHaveExploded(game);

  if (iAmEliminated === true) {
    spectatorBannerElement.innerHTML = `
      <div class="spectator-alert-banner">
        <strong>SPECTATOR MODE ACTIVE:</strong> You have been eliminated, you can only spectate.
      </div>
    `;
  }
}

function renderDeadPopup(game) {
  let deadPopupElement = document.getElementById("deadPopup");
  if (!deadPopupElement) {
    return;
  }

  deadPopupElement.innerHTML = "";

  let iAmEliminated = checkIfIHaveExploded(game);

  if (iAmEliminated === true) {
    deadPopupElement.innerHTML=`
      <div class="game-over-overlay">
      <div class="game-over-modal">
      <h2>BOOM!</h2>
      <p>You drew an Exploding Kitten and had no Defuse card!</p>
      <p class="sub-text">You are now watching the other players...</p>
      </div>
      </div>
    `;
    deadPopupElement.style.display = "block";
  } else {
    deadPopupElement.style.display = "none";
  }
}


async function drawCard() {
  if (!currentGame) return;

  try {

    await apiFetch(`/Games/${currentGame.id}/draw-card`, {
      method: "POST"
    });


    const updated = await apiFetch(`/Games/${currentGame.id}`);
    currentGame = updated;
    renderGame(updated);

  } catch (error) {

    alert("Cannot draw card: " + error.message);
  }
}