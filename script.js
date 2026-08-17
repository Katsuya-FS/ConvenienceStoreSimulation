/* =========================================================
   MY LITTLE CONVENIENCE STORE — GAME LOGIC
   Plain, beginner-friendly JavaScript. No frameworks.
   ========================================================= */

/* ---------------------------------------------------------
   1. DATA: products and currency denominations
   --------------------------------------------------------- */

// The store's products. Feel free to add more — the grid
// will simply show whatever is in this list.
const PRODUCTS = [
  { id: "bread",    name: "Bread",           emoji: "🍞", price: 45 },
  { id: "milk",      name: "Milk",            emoji: "🥛", price: 60 },
  { id: "choco",     name: "Chocolate",       emoji: "🍫", price: 35 },
  { id: "juice",     name: "Juice",           emoji: "🧃", price: 25 },
  { id: "cookies",   name: "Cookies",         emoji: "🍪", price: 30 },
  { id: "noodles",   name: "Instant Noodles", emoji: "🍜", price: 18 },
  { id: "candy",     name: "Candy",           emoji: "🍬", price: 10 },
  { id: "softdrink", name: "Soft Drink",      emoji: "🥤", price: 35 },
  { id: "water",     name: "Water",           emoji: "💧", price: 20 },
  { id: "chips",     name: "Chips",           emoji: "🍟", price: 55 },
  { id: "soap",      name: "Soap",            emoji: "🧼", price: 40 },
  { id: "sandwich",  name: "Sandwich",        emoji: "🥪", price: 75 },
];

// Bills and coins used in the game, largest to smallest.
// (₱20 exists as both a bill and a coin in real life — we treat
// the wallet's ₱20 as a coin and give a separate ₱20 bill too,
// so kids see both forms.)
const BILLS = [1000, 500, 200, 100, 50, 20];
const COINS = [20, 10, 5, 1];
const ALL_DENOMS_DESC = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

// Starting supply of each denomination in the player's wallet.
// Generous so many different combinations are possible.
function freshWalletSupply() {
  return {
    bills: { 1000: 2, 500: 3, 200: 4, 100: 6, 50: 6, 20: 6 },
    coins: { 20: 6, 10: 6, 5: 6, 1: 10 },
  };
}

/* ---------------------------------------------------------
   2. GAME STATE
   --------------------------------------------------------- */

const state = {
  totalMoney: 1000,      // the player's overall starting budget
  cart: [],              // [{ id, qty }]
  walletSupply: freshWalletSupply(),
  paymentSelected: [],   // [{ value, type: 'bill'|'coin' }]
  totalDue: 0,           // cost of the current cart at checkout time
  stars: 0,
  quiz: [],
  quizIndex: 0,
};

/* ---------------------------------------------------------
   3. SMALL HELPERS
   --------------------------------------------------------- */

function formatPeso(amount) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

function isCoinValue(value) {
  return COINS.includes(value) && value <= 20 && value !== 50 && value !== 100 && value !== 200 && value !== 500 && value !== 1000;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function cartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------------------------------------------------------
   4. WELCOME SCREEN
   --------------------------------------------------------- */

function renderWelcome() {
  document.getElementById("welcome-money-amount").textContent = formatPeso(state.totalMoney);
}

document.getElementById("btn-start-shopping").addEventListener("click", () => {
  renderStoreScreen();
  showScreen("screen-store");
});

/* ---------------------------------------------------------
   5. STORE SCREEN (products + cart)
   --------------------------------------------------------- */

function renderStoreScreen() {
  document.getElementById("store-total-money").textContent = formatPeso(state.totalMoney);
  document.getElementById("store-cart-total").textContent = formatPeso(cartTotal());
  document.getElementById("store-remaining").textContent = formatPeso(state.totalMoney - cartTotal());
  renderProductsGrid();
  renderCart();
}

function renderProductsGrid() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  PRODUCTS.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-emoji">${product.emoji}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-price">${formatPeso(product.price)}</div>
      <button class="product-add" data-id="${product.id}">ADD TO CART</button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".product-add").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const newTotal = cartTotal() + product.price;
  const messageEl = document.getElementById("cart-message");

  if (newTotal > state.totalMoney) {
    messageEl.textContent = "Oops! You don't have enough money for that. 💰";
    messageEl.className = "cart-message error";
    return;
  }

  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }

  messageEl.textContent = "";
  messageEl.className = "cart-message";
  renderStoreScreen();
}

function changeQty(productId, delta) {
  const item = state.cart.find((i) => i.id === productId);
  if (!item) return;

  if (delta > 0) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (cartTotal() + product.price > state.totalMoney) {
      const messageEl = document.getElementById("cart-message");
      messageEl.textContent = "Oops! You don't have enough money for that. 💰";
      messageEl.className = "cart-message error";
      return;
    }
  }

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((i) => i.id !== productId);
  }
  renderStoreScreen();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((i) => i.id !== productId);
  renderStoreScreen();
}

function renderCart() {
  const list = document.getElementById("cart-list");
  const checkoutBtn = document.getElementById("btn-checkout");

  list.innerHTML = "";

  if (state.cart.length === 0) {
    // Build the empty-state message fresh each time rather than reusing
    // an old element reference (a stale reference here previously caused
    // a crash the next time the cart became empty again).
    const empty = document.createElement("li");
    empty.className = "cart-empty";
    empty.textContent = "Your cart is empty. Add something yummy!";
    list.appendChild(empty);
    checkoutBtn.disabled = true;
  } else {
    state.cart.forEach((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <span class="cart-item-name">${product.emoji} ${product.name}</span>
        <span class="cart-item-controls">
          <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
          <span>${formatPeso(product.price * item.qty)}</span>
          <button class="remove-btn" data-action="remove" data-id="${item.id}">✕</button>
        </span>
      `;
      list.appendChild(li);
    });
    checkoutBtn.disabled = false;
  }

  document.getElementById("cart-total-amount").textContent = formatPeso(cartTotal());

  list.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (btn.dataset.action === "plus") changeQty(id, 1);
      else if (btn.dataset.action === "minus") changeQty(id, -1);
      else if (btn.dataset.action === "remove") removeFromCart(id);
    });
  });
}

document.getElementById("btn-checkout").addEventListener("click", () => {
  state.totalDue = cartTotal();
  state.walletSupply = freshWalletSupply();
  state.paymentSelected = [];
  renderPaymentScreen();
  showScreen("screen-payment");
});

/* ---------------------------------------------------------
   6. PAYMENT SCREEN (choose bills & coins)
   --------------------------------------------------------- */

function renderPaymentScreen() {
  document.getElementById("payment-total-due").textContent = formatPeso(state.totalDue);
  document.getElementById("payment-message").textContent = "";
  document.getElementById("payment-message").className = "cart-message";
  renderWalletGrid();
  renderPaymentSelected();
}

function renderWalletGrid() {
  const grid = document.getElementById("wallet-grid");
  grid.innerHTML = "";

  function makeMoneyCard(value, type) {
    const supply = type === "bill" ? state.walletSupply.bills : state.walletSupply.coins;
    const count = supply[value];
    const btn = document.createElement("button");
    btn.className = `money-card ${type}`;
    btn.disabled = count <= 0;
    btn.draggable = count > 0;
    btn.innerHTML = `<span class="money-emoji">${type === "bill" ? "💵" : "🪙"}</span> ${formatPeso(value)}<br><small>×${count}</small>`;

    // Tap/click still works (important for touch devices).
    btn.addEventListener("click", () => addPaymentMoney(value, type));

    // Drag support for desktop / trackpad use.
    btn.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ value, type }));
      e.dataTransfer.effectAllowed = "copy";
      btn.classList.add("dragging");
    });
    btn.addEventListener("dragend", () => btn.classList.remove("dragging"));

    return btn;
  }

  BILLS.forEach((value) => grid.appendChild(makeMoneyCard(value, "bill")));
  COINS.forEach((value) => grid.appendChild(makeMoneyCard(value, "coin")));
}

// Let the "Your Payment" box accept dropped money from the wallet.
const paymentDropzone = document.getElementById("payment-selected");
paymentDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  paymentDropzone.classList.add("drag-hover");
});
paymentDropzone.addEventListener("dragleave", () => {
  paymentDropzone.classList.remove("drag-hover");
});
paymentDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  paymentDropzone.classList.remove("drag-hover");
  const raw = e.dataTransfer.getData("text/plain");
  if (!raw) return;
  try {
    const { value, type } = JSON.parse(raw);
    addPaymentMoney(value, type);
  } catch (err) {
    // Ignore malformed drag data.
  }
});

function addPaymentMoney(value, type) {
  const supply = type === "bill" ? state.walletSupply.bills : state.walletSupply.coins;
  if (supply[value] <= 0) return;

  supply[value] -= 1;
  state.paymentSelected.push({ value, type });
  renderWalletGrid();
  renderPaymentSelected();
}

function removePaymentMoney(index) {
  const item = state.paymentSelected[index];
  const supply = item.type === "bill" ? state.walletSupply.bills : state.walletSupply.coins;
  supply[item.value] += 1;
  state.paymentSelected.splice(index, 1);
  renderWalletGrid();
  renderPaymentSelected();
}

function paymentTotal() {
  return state.paymentSelected.reduce((sum, item) => sum + item.value, 0);
}

function renderPaymentSelected() {
  const container = document.getElementById("payment-selected");
  container.innerHTML = "";

  if (state.paymentSelected.length === 0) {
    // Built fresh each time — see the note in renderCart() about why we
    // don't reuse a single cached "empty" element.
    const empty = document.createElement("p");
    empty.className = "payment-empty";
    empty.textContent = "Drag or tap bills and coins from your wallet.";
    container.appendChild(empty);
  } else {
    state.paymentSelected.forEach((item, index) => {
      const chip = document.createElement("button");
      chip.className = "selected-chip";
      chip.textContent = `${item.type === "bill" ? "💵" : "🪙"} ${formatPeso(item.value)}`;
      chip.title = "Tap to put this back in your wallet";
      chip.addEventListener("click", () => removePaymentMoney(index));
      container.appendChild(chip);
    });
  }

  document.getElementById("payment-total-amount").textContent = formatPeso(paymentTotal());
}

document.getElementById("btn-back-to-store").addEventListener("click", () => {
  // Give back anything selected, then return to the store.
  state.paymentSelected.forEach((item) => {
    const supply = item.type === "bill" ? state.walletSupply.bills : state.walletSupply.coins;
    supply[item.value] += 1;
  });
  state.paymentSelected = [];
  renderStoreScreen();
  showScreen("screen-store");
});

document.getElementById("btn-give-money").addEventListener("click", () => {
  const paid = paymentTotal();
  const messageEl = document.getElementById("payment-message");

  if (paid < state.totalDue) {
    const short = state.totalDue - paid;
    messageEl.textContent = `❌ You need ${formatPeso(short)} more.`;
    messageEl.className = "cart-message error";
    return;
  }

  messageEl.textContent = "";
  playGiveMoneyAnimation(() => {
    finishTransaction(paid);
  });
});

function playGiveMoneyAnimation(onDone) {
  const flying = document.getElementById("flying-money-pay");
  const caption = document.getElementById("stage-caption-pay");
  flying.innerHTML = state.paymentSelected
    .map((item) => (item.type === "bill" ? "💵" : "🪙"))
    .join(" ");
  caption.textContent = "Giving money...";
  flying.className = "flying-money fly-right";

  // Restart animation cleanly, then move to the result screen.
  window.setTimeout(() => {
    flying.className = "flying-money";
    caption.textContent = "";
  }, 950);

  window.setTimeout(onDone, 1000);
}

/* ---------------------------------------------------------
   7. TRANSACTION RESULT (change simulation)
   --------------------------------------------------------- */

function computeChangeBreakdown(amount) {
  let remaining = amount;
  const breakdown = [];
  ALL_DENOMS_DESC.forEach((value) => {
    const count = Math.floor(remaining / value);
    if (count > 0) {
      breakdown.push({ value, count });
      remaining -= value * count;
    }
  });
  return breakdown;
}

function finishTransaction(paid) {
  const change = paid - state.totalDue;

  // Spend the money: reduce the player's overall budget by the cost
  // of the items (payment and change cancel out to the item cost).
  state.totalMoney -= state.totalDue;
  state.cart = [];

  const headline = document.getElementById("result-headline");
  if (change === 0) {
    headline.textContent = "🎉 Perfect! You paid the exact amount!";
    headline.className = "result-headline";
    state.stars += 1;
  } else {
    headline.textContent = `🎉 Great! The cashier will give you ${formatPeso(change)} change.`;
    headline.className = "result-headline";
    state.stars += 1;
  }

  document.getElementById("result-total").textContent = formatPeso(state.totalDue);
  document.getElementById("result-paid").textContent = formatPeso(paid);
  document.getElementById("result-change").textContent = formatPeso(change);
  document.getElementById("stars-earned").textContent = "⭐".repeat(Math.min(state.stars, 10));

  const breakdownEl = document.getElementById("change-breakdown");
  const sumEl = document.getElementById("change-sum");
  breakdownEl.innerHTML = "";
  sumEl.textContent = "";

  const changeStage = document.getElementById("change-stage");
  const flying = document.getElementById("flying-money-change");
  const caption = document.getElementById("stage-caption-change");

  if (change > 0) {
    const breakdown = computeChangeBreakdown(change);
    const emojis = [];
    breakdown.forEach(({ value, count }) => {
      for (let i = 0; i < count; i++) {
        emojis.push(value >= 50 || value === 1000 ? "💵" : "🪙");
      }
    });
    flying.innerHTML = emojis.join(" ");
    caption.textContent = "Here is your change!";
    flying.className = "flying-money fly-left";
    changeStage.style.display = "flex";

    window.setTimeout(() => {
      flying.className = "flying-money";
      caption.textContent = "";

      breakdown.forEach(({ value, count }) => {
        for (let i = 0; i < count; i++) {
          const chip = document.createElement("div");
          chip.className = value >= 50 || value === 1000 ? "mini-money bill" : "mini-money coin";
          chip.textContent = formatPeso(value);
          breakdownEl.appendChild(chip);
        }
      });

      const sumText = breakdown
        .flatMap(({ value, count }) => Array(count).fill(value))
        .join(" + ");
      sumEl.textContent = `${sumText} = ${formatPeso(change)}`;
    }, 950);
  } else {
    changeStage.style.display = "none";
  }

  showScreen("screen-result");
}

document.getElementById("btn-continue-shopping").addEventListener("click", () => {
  renderStoreScreen();
  showScreen("screen-store");
});

document.getElementById("btn-go-quiz").addEventListener("click", () => {
  startQuiz();
});

/* ---------------------------------------------------------
   8. MONEY LEARNING QUIZ
   --------------------------------------------------------- */

const QUIZ_LENGTH = 6;

function startQuiz() {
  state.quiz = generateQuiz(QUIZ_LENGTH);
  state.quizIndex = 0;
  renderQuizQuestion();
  showScreen("screen-quiz");
}

function generateQuiz(length) {
  // Cycle through all three question types so every skill gets practiced:
  // identifying a single bill/coin, counting a combination, and building
  // an exact amount by dragging money.
  const makers = [makeIdentifyQuestion, makeComboQuestion, makeDragQuestion];
  const questions = [];
  for (let i = 0; i < length; i++) {
    questions.push(makers[i % makers.length]());
  }
  return questions;
}

function makeIdentifyQuestion() {
  const value = ALL_DENOMS_DESC[randomInt(0, ALL_DENOMS_DESC.length - 1)];
  const isCoin = value <= 20;
  const distractors = shuffle(ALL_DENOMS_DESC.filter((v) => v !== value)).slice(0, 3);
  const options = shuffle([value, ...distractors]);

  return {
    type: "identify",
    prompt: "💰 What is the value of this money?",
    visual: [{ value, isCoin }],
    options,
    correct: value,
  };
}

function makeComboQuestion() {
  const pieceCount = randomInt(2, 4);
  const pieces = [];
  for (let i = 0; i < pieceCount; i++) {
    const value = ALL_DENOMS_DESC[randomInt(2, ALL_DENOMS_DESC.length - 1)]; // skip the very largest bills
    pieces.push({ value, isCoin: value <= 20 });
  }
  const total = pieces.reduce((sum, p) => sum + p.value, 0);

  const distractors = new Set();
  while (distractors.size < 3) {
    const wiggle = randomInt(-30, 30);
    const candidate = Math.max(1, total + wiggle);
    if (candidate !== total) distractors.add(candidate);
  }
  const options = shuffle([total, ...distractors]);

  return {
    type: "combo",
    prompt: "💰 How much money is this altogether?",
    visual: pieces,
    options,
    correct: total,
  };
}

function makeDragQuestion() {
  // Pick 2-3 pieces that add up to the target amount.
  const pieceCount = randomInt(2, 3);
  const correctPieces = [];
  for (let i = 0; i < pieceCount; i++) {
    const value = ALL_DENOMS_DESC[randomInt(3, ALL_DENOMS_DESC.length - 1)]; // 100 and below
    correctPieces.push(value);
  }
  const target = correctPieces.reduce((sum, v) => sum + v, 0);

  // Add a couple of distractor pieces so dragging is a real choice,
  // not just "drag everything you see".
  const distractorPieces = [];
  while (distractorPieces.length < 2) {
    const value = ALL_DENOMS_DESC[randomInt(2, ALL_DENOMS_DESC.length - 1)];
    distractorPieces.push(value);
  }

  const pool = shuffle([...correctPieces, ...distractorPieces]).map((value, index) => ({
    uid: `d${index}-${value}-${Math.random().toString(36).slice(2, 7)}`,
    value,
    isCoin: value <= 20,
  }));

  return {
    type: "drag",
    prompt: "Drag the exact amount into the box below.",
    target,
    pool,
  };
}

function renderQuizQuestion() {
  const question = state.quiz[state.quizIndex];
  document.getElementById("quiz-progress").textContent = `${state.quizIndex + 1} / ${state.quiz.length}`;
  document.getElementById("quiz-question-text").textContent = question.prompt;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-feedback").className = "quiz-feedback";

  const visual = document.getElementById("quiz-visual");
  const optionsEl = document.getElementById("quiz-options");
  const dragQuizEl = document.getElementById("drag-quiz");

  if (question.type === "drag") {
    visual.style.display = "none";
    optionsEl.style.display = "none";
    dragQuizEl.style.display = "block";
    visual.innerHTML = "";
    optionsEl.innerHTML = "";
    renderDragQuestion(question);
  } else {
    visual.style.display = "flex";
    optionsEl.style.display = "grid";
    dragQuizEl.style.display = "none";

    visual.innerHTML = "";
    question.visual.forEach((piece) => {
      const chip = document.createElement("div");
      chip.className = piece.isCoin ? "mini-money coin" : "mini-money bill";
      chip.textContent = `${piece.isCoin ? "🪙" : "💵"} ${formatPeso(piece.value)}`;
      visual.appendChild(chip);
    });

    optionsEl.innerHTML = "";
    question.options.forEach((optionValue) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = formatPeso(optionValue);
      btn.addEventListener("click", () => checkAnswer(btn, optionValue, question.correct));
      optionsEl.appendChild(btn);
    });
  }
}

/* --- Drag-the-exact-amount question: setup and interaction --- */

// Tracks which pool pieces (by uid) are currently sitting in the dropzone.
let dragAnswerUids = [];

function renderDragQuestion(question) {
  dragAnswerUids = [];
  document.getElementById("drag-target-amount").textContent = formatPeso(question.target);

  const pool = document.getElementById("drag-pool");
  const dropzone = document.getElementById("drag-dropzone");
  const checkBtn = document.getElementById("btn-check-drag");
  checkBtn.disabled = false;

  pool.innerHTML = "";
  question.pool.forEach((piece) => {
    pool.appendChild(makeDragTile(piece));
  });

  updateDragTotal(question);

  // Allow dropping tiles onto the dropzone.
  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-hover");
  };
  dropzone.ondragleave = () => dropzone.classList.remove("drag-hover");
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-hover");
    const uid = e.dataTransfer.getData("text/plain");
    moveDragTileToAnswer(question, uid);
  };
}

function makeDragTile(piece) {
  const tile = document.createElement("button");
  tile.className = piece.isCoin ? "money-card coin" : "money-card bill";
  tile.draggable = true;
  tile.dataset.uid = piece.uid;
  tile.innerHTML = `<span class="money-emoji">${piece.isCoin ? "🪙" : "💵"}</span> ${formatPeso(piece.value)}`;

  tile.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", piece.uid);
    e.dataTransfer.effectAllowed = "move";
    tile.classList.add("dragging");
  });
  tile.addEventListener("dragend", () => tile.classList.remove("dragging"));

  // Tap fallback: tapping a tile toggles it between pool and dropzone.
  tile.addEventListener("click", () => {
    const question = state.quiz[state.quizIndex];
    if (dragAnswerUids.includes(piece.uid)) {
      dragAnswerUids = dragAnswerUids.filter((u) => u !== piece.uid);
    } else {
      dragAnswerUids.push(piece.uid);
    }
    refreshDragZones(question);
  });

  return tile;
}

function moveDragTileToAnswer(question, uid) {
  if (!uid || dragAnswerUids.includes(uid)) return;
  if (!question.pool.some((p) => p.uid === uid)) return;
  dragAnswerUids.push(uid);
  refreshDragZones(question);
}

function refreshDragZones(question) {
  const pool = document.getElementById("drag-pool");
  const dropzone = document.getElementById("drag-dropzone");

  pool.innerHTML = "";
  dropzone.innerHTML = "";

  question.pool.forEach((piece) => {
    const tile = makeDragTile(piece);
    if (dragAnswerUids.includes(piece.uid)) {
      dropzone.appendChild(tile);
    } else {
      pool.appendChild(tile);
    }
  });

  if (dragAnswerUids.length === 0) {
    const hint = document.createElement("span");
    hint.className = "drag-dropzone-hint";
    hint.textContent = "Drop or tap money here";
    dropzone.appendChild(hint);
  }

  updateDragTotal(question);
}

function updateDragTotal(question) {
  const total = question.pool
    .filter((p) => dragAnswerUids.includes(p.uid))
    .reduce((sum, p) => sum + p.value, 0);
  document.getElementById("drag-current-total").textContent = formatPeso(total);
}

document.getElementById("btn-check-drag").addEventListener("click", () => {
  const question = state.quiz[state.quizIndex];
  const total = question.pool
    .filter((p) => dragAnswerUids.includes(p.uid))
    .reduce((sum, p) => sum + p.value, 0);

  const feedback = document.getElementById("quiz-feedback");
  document.getElementById("btn-check-drag").disabled = true;
  document.querySelectorAll("#drag-pool .money-card, #drag-dropzone .money-card").forEach((t) => (t.disabled = true));

  if (total === question.target) {
    feedback.textContent = `🎉 Correct! That's ${formatPeso(total)}!`;
    feedback.className = "quiz-feedback correct";
    state.stars += 1;
  } else if (total < question.target) {
    feedback.textContent = `😊 Not quite — you need ${formatPeso(question.target - total)} more.`;
    feedback.className = "quiz-feedback wrong";
  } else {
    feedback.textContent = `😊 A little too much! The answer was ${formatPeso(question.target)}.`;
    feedback.className = "quiz-feedback wrong";
  }

  window.setTimeout(() => {
    state.quizIndex += 1;
    if (state.quizIndex < state.quiz.length) {
      renderQuizQuestion();
    } else {
      renderFinalScreen();
      showScreen("screen-final");
    }
  }, 1400);
});

function checkAnswer(button, chosenValue, correctValue) {
  const feedback = document.getElementById("quiz-feedback");
  const allButtons = document.querySelectorAll(".quiz-option");
  allButtons.forEach((b) => (b.disabled = true));

  if (chosenValue === correctValue) {
    button.classList.add("correct-answer");
    feedback.textContent = `🎉 Correct! This is ${formatPeso(correctValue)}!`;
    feedback.className = "quiz-feedback correct";
    state.stars += 1;
  } else {
    button.classList.add("wrong-answer");
    allButtons.forEach((b) => {
      if (Number(b.textContent.replace(/[^0-9]/g, "")) === correctValue) {
        b.classList.add("correct-answer");
      }
    });
    feedback.textContent = `😊 Try again next time! The answer was ${formatPeso(correctValue)}.`;
    feedback.className = "quiz-feedback wrong";
  }

  window.setTimeout(() => {
    state.quizIndex += 1;
    if (state.quizIndex < state.quiz.length) {
      renderQuizQuestion();
    } else {
      renderFinalScreen();
      showScreen("screen-final");
    }
  }, 1400);
}

/* ---------------------------------------------------------
   9. FINAL SCORE SCREEN
   --------------------------------------------------------- */

function renderFinalScreen() {
  document.getElementById("final-stars").textContent = `⭐ Stars: ${state.stars}`;
}

document.getElementById("btn-play-again").addEventListener("click", () => {
  state.totalMoney = 1000;
  state.cart = [];
  state.walletSupply = freshWalletSupply();
  state.paymentSelected = [];
  state.totalDue = 0;
  state.stars = 0;
  state.quiz = [];
  state.quizIndex = 0;

  renderWelcome();
  showScreen("screen-welcome");
});

/* ---------------------------------------------------------
   10. START
   --------------------------------------------------------- */

renderWelcome();
