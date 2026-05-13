async function loadPuzzle() {

  const params = new URLSearchParams(location.search);

  const puzzleName = params.get("p") || "cat";

  const res = await fetch(`./puzzles/${puzzleName}.json`);

  const puzzle = await res.json();

  drawBoard(puzzle);

}

function drawBoard(puzzle) {

  const game = document.getElementById("game");

  game.innerHTML = "";

  const W = puzzle.size_x;
  const H = puzzle.size_y;

  let states = [...Array(H)].map(
    () => Array(W).fill(0)
  );

  const undoStack = [];
  const redoStack = [];

  let mouseDown = false;

  let dragMode = null;

  let dragSourceState = null;

  let touched = new Set();

  function pushHistory() {

    undoStack.push(
      JSON.stringify(states)
    );

    if (undoStack.length > 30) {
      undoStack.shift();
    }

    redoStack.length = 0;

  }

  function refreshBoard() {

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {

        const cell = cells[y][x];

        cell.classList.remove("filled");
        cell.classList.remove("x");

        if (states[y][x] === 1) {
          cell.classList.add("filled");
        }

        if (states[y][x] === 2) {
          cell.classList.add("x");
        }

      }
    }
  }

  function resetBoard() {

    states = [...Array(H)].map(
      () => Array(W).fill(0)
    );

    refreshBoard();

  }

  const cells = [];

  for (let y = 0; y < H; y++) {

    const row = document.createElement("div");

    row.className = "row";

    cells[y] = [];

    for (let x = 0; x < W; x++) {

      const cell = document.createElement("div");

      cell.className = "cell";
      const key = `${y},${x}`;

if (key in puzzle.hints) {

  const hint = document.createElement("div");

  hint.className = "hint";

  hint.textContent = puzzle.hints[key];

  cell.appendChild(hint);

}

      cell.dataset.x = x;
      cell.dataset.y = y;

      cells[y][x] = cell;

      row.appendChild(cell);

      cell.addEventListener("mousedown", (e) => {

        e.preventDefault();

        touched.clear();

        mouseDown = true;

        dragMode = e.button === 0 ? "black" : "x";

        dragSourceState = states[y][x];

        pushHistory();

        apply(cell);

      });

      cell.addEventListener("mouseenter", () => {

        if (mouseDown) {
          apply(cell);
        }

      });

    }

    game.appendChild(row);

  }

  function apply(cell) {

    const x = Number(cell.dataset.x);

    const y = Number(cell.dataset.y);

    const key = `${x},${y}`;

    if (touched.has(key)) {
      return;
    }

    touched.add(key);

    const state = states[y][x];

    // 左ドラッグ
    if (dragMode === "black") {

      if (state === 2) return;

      // 空白→黒
      if (dragSourceState === 0) {

        if (state !== 0) return;

        states[y][x] = 1;

      }

      // 黒→空白
      else if (dragSourceState === 1) {

        if (state !== 1) return;

        states[y][x] = 0;

      }

    }

    // 右ドラッグ
    else {

      if (state === 1) return;

      // 空白→×
      if (dragSourceState === 0) {

        if (state !== 0) return;

        states[y][x] = 2;

      }

      // ×→空白
      else if (dragSourceState === 2) {

        if (state !== 2) return;

        states[y][x] = 0;

      }

    }

    refreshBoard();

  }

  document.addEventListener("mouseup", () => {

    mouseDown = false;

    touched.clear();

  });

  document.addEventListener(
    "contextmenu",
    e => e.preventDefault()
  );

  undoBtn.onclick = () => {

    if (!undoStack.length) return;

    redoStack.push(
      JSON.stringify(states)
    );

    states = JSON.parse(
      undoStack.pop()
    );

    refreshBoard();

  };

  redoBtn.onclick = () => {

    if (!redoStack.length) return;

    undoStack.push(
      JSON.stringify(states)
    );

    states = JSON.parse(
      redoStack.pop()
    );

    refreshBoard();

  };

  resetBtn.onclick = () => {

    pushHistory();

    resetBoard();

  };

}

loadPuzzle();
