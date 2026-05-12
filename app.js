async function loadPuzzle() {

  const res = await fetch("./puzzles/cat.json");

  const data = await res.json();

  console.log(data);

}

loadPuzzle();
