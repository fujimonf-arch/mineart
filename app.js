async function loadPuzzle() {

  const res = await fetch("./puzzles/cat.json");

  const puzzle = await res.json();

  console.log(puzzle);

}

loadPuzzle();
