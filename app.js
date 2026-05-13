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

  const cells = [];

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

  function inside(x, y) {

    return (
      x >= 0 &&
      x < W &&
      y >= 0 &&
      y < H
    );

  }

  function getArea(cx, cy) {

    const arr = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {

        const nx = cx + dx;
        const ny = cy + dy;

        if (inside(nx, ny)) {
          arr.push([nx, ny]);
        }

      }
    }

    return arr;

  }

  function updateHintsAround(cx, cy) {

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {

        const x = cx + dx;
        const y = cy + dy;

        if (!inside(x, y)) continue;

        const cell = cells[y][x];

        const hint = cell.querySelector(".hint");

        if (!hint) continue;

        hint.classList.remove("hint-complete");
        hint.classList.remove("hint-error");

        const target = Number(
          hint.dataset.value
        );

        const area = getArea(x, y);

        let black = 0;
        let xcount = 0;

        for (const [ax, ay] of area) {

          const s = states[ay][ax];

          if (s === 1) black++;

          if (s === 2) xcount++;

        }

        // 周囲が全部確定
        if (
          black + xcount === area.length
        ) {

          if (black === target) {

            hint.classList.add(
              "hint-complete"
            );

          }

        }

        // 矛盾
        if (
          black > target ||
          xcount > area.length - target
        ) {

          hint.classList.add(
            "hint-error"
          );

        }

      }
    }

  }

  function updateAllHints() {

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {

        updateHintsAround(x, y);

      }
    }

  }

  function resetBoard() {

    states = [...Array(H)].map(
      () => Array(W).fill(0)
    );

    refreshBoard();

    updateAllHints();

  }

  function checkComplete() {

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {

        const answer =
          puzzle.solution[y][x];

        const player =
          states[y][x] === 1 ? 1 : 0;

        if (answer !== player) {
          return;
        }

      }
    }

    alert("CLEAR!");

  }

  for (let y = 0; y < H; y++) {

    const row = document.createElement("div");

    row.className = "row";

    cells[y] = [];

    for (let x = 0; x < W; x++) {

      const cell = document.createElement("div");

      cell.className = "cell";

      const key = `${y},${x}`;

      if (key in puzzle.hints) {

        const hint =
          document.createElement("div");

        hint.className = "hint";

        hint.dataset.value =
          puzzle.hints[key];

        hint.textContent =
          puzzle.hints[key];

        cell.appendChild(hint);

      }

      cell.dataset.x = x;
      cell.dataset.y = y;

      cells[y][x] = cell;

      row.appendChild(cell);

      cell.addEventListener(
        "mousedown",
        (e) => {

          e.preventDefault();

          touched.clear();

          mouseDown = true;

          dragMode =
            e.button === 0
              ? "black"
              : "x";

          dragSourceState =
            states[y][x];

          pushHistory();

          apply(cell);

        }
      );

      cell.addEventListener(
        "mouseenter",
        () => {

          if (mouseDown) {
            apply(cell);
          }

        }
      );

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

      else {
        return;
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

      else {
        return;
      }

    }

    refreshBoard();

    updateHintsAround(x, y);

    checkComplete();

  }

  document.addEventListener(
    "mouseup",
    () => {

      mouseDown = false;

      touched.clear();

    }
  );

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

    updateAllHints();

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

    updateAllHints();

  };

  resetBtn.onclick = () => {

    pushHistory();

    resetBoard();

  };

  refreshBoard();

  updateAllHints();

}

loadPuzzle();
