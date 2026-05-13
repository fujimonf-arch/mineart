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

  for (let y = 0; y < puzzle.size_y; y++) {

    const row = document.createElement("div");

    row.className = "row";

    for (let x = 0; x < puzzle.size_x; x++) {

      const cell = document.createElement("div");

      cell.className = "cell";

      // 左クリック
      cell.addEventListener("click", () => {

        cell.classList.toggle("filled");

      });

      // 右クリック
      cell.addEventListener("contextmenu", (e) => {

        e.preventDefault();

        cell.classList.toggle("x");

      });

      row.appendChild(cell);

    }

    game.appendChild(row);

  }

}

loadPuzzle();
