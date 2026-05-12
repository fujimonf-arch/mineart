async function loadPuzzle() {

  const params = new URLSearchParams(location.search);

  const puzzleName = params.get("p") || "cat";

  const res = await fetch(`./puzzles/${puzzleName}.json`);

  const puzzle = await res.json();

  console.log(puzzle);

  drawBoard(puzzle);

}

function drawBoard(puzzle) {

  const game = document.getElementById("game");

  game.innerHTML = "";

  for (let y = 0; y < puzzle.height; y++) {

    const row = document.createElement("div");

    row.className = "row";

    for (let x = 0; x < puzzle.width; x++) {

      const cell = document.createElement("div");

      cell.className = "cell";

      if (puzzle.board[y][x] === 1) {

        cell.style.background = "white";

      }

      row.appendChild(cell);

    }

    game.appendChild(row);

  }

}

loadPuzzle();
