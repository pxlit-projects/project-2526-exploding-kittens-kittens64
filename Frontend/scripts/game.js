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

const CAT_CARDS = new Set([Card.BeardCat, Card.Cattermelon, Card.HairyPotatoCat, Card.RainbowRalphingCat, Card.TacoCat]);
const NON_PLAYABLE = new Set([Card.ExplodingKitten, Card.Nope, Card.Defuse]);

const params = new URLSearchParams(window.location.search);
const TABLE_ID = params.get("tableId");
const PLAYER_ID = params.get("playerId");

let pollInterval = null;
let currentGame = null;
// selectedCards: array of { cardInt, slotIndex }
let selectedCards = [];

// Boot
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
  }, 2000);
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
    ? "⭐ It is your turn!"
    : `Turn of ${current?.name ?? "…"}`
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
    el.innerHTML = "Empty";
    el.style.padding = "";
    return;
  }

  const topInt = pile[pile.length - 1];
  const name = CARD_NAME[topInt] ?? "?";
  const imgUrl = cardImageUrl(name, pile.length);

  if (imgUrl) {
    el.innerHTML = `<img src="${imgUrl}" alt="${CARD_LABEL[name] ?? name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
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
  const me = (game.players ?? []).find(p => p.cardsInHand && p.cardsInHand.length > 0);
  if (!me) { el.innerHTML = "<p>Player not found.</p>"; return; }
  if (me.eliminated) { el.innerHTML = `<p style="color:#c0392b;font-weight:bold;">You are eliminated 💀</p>`; return; }

  const hand = me.cardsInHand ?? [];
  if (hand.length === 0) { el.innerHTML = "<p>Cards are not visible.</p>"; return; }

  hand.forEach((cardInt, i) => {
    const name = CARD_NAME[cardInt] ?? "?";
    const isSelected = selectedCards.some(s => s.slotIndex === i);
    const canSelect = isMyTurn && !NON_PLAYABLE.has(cardInt);

    const div = makeCardEl(name, i, isSelected, canSelect);

    if (canSelect) {
      div.style.cursor = "pointer";
      div.addEventListener("click", () => toggleCardSelection(cardInt, i, game));
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
    const isActive = p.id === game.playerToPlayId;

    const div = document.createElement("div");
    div.className = "opponent";
    // div.innerHTML = `
    //   <h3>${p.name} ${p.eliminated ? "💀" : isActive ? "⭐" : ""}</h3>
    //   <p>${count} card${count !== 1 ? "s" : ""}</p>
    //   <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-top:6px;">
    //     ${"<div style='width:28px;height:40px;background:#4a3a1a;border-radius:4px;'></div>".repeat(Math.min(count, 10))}
    //   </div>
    // `;

    
    div.innerHTML = `
      <div class="opponent">
          <h3 id="opponent_name">${p.name}</h3>
        <img id="avatar_img" src="images/avatars/avatar-1.png" alt="opponent-img">
        <div class="opponents_cards">
              <span class="card_counter">${count}</span>
          ${"<div id='opponents_card'> <img src='images/game_img/deckCard.png' alt='op_card'> </div>".repeat(Math.min(count, 5))}
        </div>
      </div>
    `;
    el.appendChild(div);
  });
}


function renderActionPanel(game) {
  let panel = document.getElementById("actionPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "actionPanel";
    panel.style.cssText = "margin:10px 0;padding:15px;background:#e4cf91;border-radius:10px;color:#2a1a00;display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:50px;";
    const myCardsSection = document.getElementById("myCards");
    myCardsSection?.parentNode?.insertBefore(panel, myCardsSection.nextSibling);
  }

  panel.innerHTML = "";

  const isMyTurn = PLAYER_ID && game.playerToPlayId === PLAYER_ID;
  if (!isMyTurn || game.hasEnded) return;

  const selCount = selectedCards.length;

  // Selected summary
  const summary = document.createElement("span");
  summary.style.flex = "1";
  if (selCount === 0) {
    summary.textContent = "Select cards from your hand to play.";
  } else {
    const names = selectedCards.map(s => CARD_LABEL[CARD_NAME[s.cardInt]] ?? "?");
    summary.textContent = `Selected: ${names.join(", ")}`;
  }
  panel.appendChild(summary);

  if (selCount === 0) return;

  // Draw pile index input for defuse (not used here since defuse is non-playable via this flow,
  // but kept for completeness in case rules expand)

  // Target player selector (for Favor / 2-cat / 3-cat combos)
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

  // Target card selector (for 3-cat combo: steal specific card)
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

  // Play button
  const btn = document.createElement("button");
  btn.textContent = "▶ Play cards";
  btn.style.cssText = "padding:8px 16px;background:#4a3a1a;border:none;border-radius:6px;color:#e4cf91;font-weight:bold;cursor:pointer;";
  btn.addEventListener("click", () => playSelectedCards(game));
  panel.appendChild(btn);

  // Clear selection button
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "✕ Clear";
  clearBtn.style.cssText = "padding:8px 12px;background:#d1be84;border:2px solid #4a3a1a;border-radius:6px;color:#2a1a00;cursor:pointer;";
  clearBtn.addEventListener("click", () => { selectedCards = []; renderMyCards(game); renderActionPanel(game); });
  panel.appendChild(clearBtn);

  // Error message slot
  const errEl = document.createElement("div");
  errEl.id = "playError";
  errEl.style.cssText = "width:100%;color:#e74c3c;font-size:13px;";
  panel.appendChild(errEl);
}

function needsTargetPlayer(selected, game) {
  if (selected.length === 0) return false;
  const allCat = selected.every(s => CAT_CARDS.has(s.cardInt));
  if (allCat && selected.length >= 2) return true;
  if (selected.length === 1 && selected[0].cardInt === Card.Favor) return true;
  return false;
}

async function playSelectedCards(game) {
  const errEl = document.getElementById("playError");
  if (errEl) errEl.textContent = "";

  const cards = selectedCards.map(s => s.cardInt);

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
  let panel = document.getElementById("nopePanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "nopePanel";
    panel.style.cssText = "margin:10px 0;padding:15px;background:#e4cf91;border-radius:10px;color:#2a1a00;display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:50px;border:2px solid #4a3a1a;";
    const actionPanel = document.getElementById("actionPanel");
    actionPanel?.parentNode?.insertBefore(panel, actionPanel.nextSibling);
  }

  panel.innerHTML = "";

  const action = game.pendingAction;
  if (!action) return;

  const myDecision = action.playerNopeDecisions?.[PLAYER_ID];
  // undefined means I'm not in the decisions map (= I'm the one who played)
  if (myDecision === undefined) return;

  const isNoped = action.isNoped;

  const info = document.createElement("span");
  info.style.flex = "1";
  const actorName = (game.players ?? []).find(p => p.id === action.playerId)?.name ?? "Someone";
  const cardNames = (action.cards ?? []).map(c => CARD_LABEL[CARD_NAME[c]] ?? "?").join(", ");
  info.innerHTML = `<strong>${actorName}</strong> played <strong>${cardNames}</strong>. ${isNoped ? "⛔ Action is noped!" : "Pending…"}`;
  panel.appendChild(info);

  // Only show buttons if I haven't decided yet
  if (myDecision === 0 /* NotDecided */) {
    const me = (game.players ?? []).find(p => p.id === PLAYER_ID);
    const hasNope = (me?.cardsInHand ?? []).includes(Card.Nope);

    if (hasNope) {
      const nopeBtn = document.createElement("button");
      nopeBtn.textContent = "⛔ Nope it!";
      nopeBtn.style.cssText = "padding:8px 14px;background:#4a3a1a;border:none;border-radius:6px;color:#e4cf91;font-weight:bold;cursor:pointer;";
      nopeBtn.addEventListener("click", () => sendNope(game.id));
      panel.appendChild(nopeBtn);
    }

    const passBtn = document.createElement("button");
    passBtn.textContent = "✅ Let it pass";
    passBtn.style.cssText = "padding:8px 14px;background:#d1be84;border:2px solid #4a3a1a;border-radius:6px;color:#2a1a00;cursor:pointer;";
    passBtn.addEventListener("click", () => sendConfirmNotNoping(game.id));
    panel.appendChild(passBtn);
  }
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


function toggleCardSelection(cardInt, slotIndex, game) {
  const existingIdx = selectedCards.findIndex(s => s.slotIndex === slotIndex);

  if (existingIdx !== -1) {
    selectedCards.splice(existingIdx, 1);
  } else {
    // Validate the addition makes sense before adding
    const newSelection = [...selectedCards, { cardInt, slotIndex }];
    const allSameCard = newSelection.every(s => s.cardInt === newSelection[0].cardInt);
    const allCat = newSelection.every(s => CAT_CARDS.has(s.cardInt));
    const hasAction = newSelection.some(s => !CAT_CARDS.has(s.cardInt) && !NON_PLAYABLE.has(s.cardInt));
    const hasCat = newSelection.some(s => CAT_CARDS.has(s.cardInt));

    // Single action card is always fine
    // Multiple cards: must all be the same cat card, max 3
    if (newSelection.length > 1) {
      if (!allCat || !allSameCard) {
        showPlayError("You can only combine identical cat cards.");
        return;
      }
      if (newSelection.length > 3) {
        showPlayError("Maximum 3 cat cards can be combined.");
        return;
      }
    }

    selectedCards.push({ cardInt, slotIndex });
  }

  renderMyCards(game);
  renderActionPanel(game);
}

function showPlayError(msg) {
  const errEl = document.getElementById("playError");
  if (errEl) { errEl.textContent = msg; return; }
  // If panel not rendered yet, just alert
  alert(msg);
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