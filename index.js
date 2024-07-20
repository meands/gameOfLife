const cellSize = 40;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#9a8c98";

const grid = document.getElementById("grid");
const gridCtx = grid.getContext("2d");
gridCtx.strokeStyle = "#9a8c98";

setupGrid();

const cellState = new CellState();
const rows = Math.round(canvas.height / cellSize);
const cols = Math.round(canvas.width / cellSize);

const hideGridBtn = document.getElementById("hideGrid");
const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");
const generationCount = document.getElementById("generation");
const populationCount = document.getElementById("population");

canvas.addEventListener("click", handleCellSelect);
playBtn.addEventListener("click", handleStopAndPlay);
resetBtn.addEventListener("click", handleReset);
hideGridBtn.addEventListener("click", handleHideGrid);

function CellState() {
  this.aliveCells = [];
  this.add = function (cell) {
    this.aliveCells.push(cell);
    colourCell(cell.split(" ")[0], cell.split(" ")[1]);
  };
  this.remove = function (cell) {
    const idx = this.aliveCells.indexOf(cell);
    if (idx !== -1) this.aliveCells.splice(idx, 1);
    decolourCell(cell.split(" ")[0], cell.split(" ")[1]);
  };
  this.toggle = function (cell) {
    if (this.aliveCells.includes(cell)) {
      this.remove(cell);
    } else this.add(cell);
  };
}

function setupGrid() {
  // vertical lines
  for (let i = 0; i <= grid.width; i += cellSize) {
    gridCtx.beginPath();
    gridCtx.moveTo(i, 0);
    gridCtx.lineTo(i, grid.height);
    gridCtx.stroke();
  }
  // horizontal lines
  for (let i = 0; i <= grid.height; i += cellSize) {
    gridCtx.beginPath();
    gridCtx.moveTo(0, i);
    gridCtx.lineTo(grid.width, i);
    gridCtx.stroke();
  }
}

function playAndUpdateStats() {
  const toKill = [];
  const toRevive = [];

  if (!cellState.aliveCells.length) {
    clearInterval(intervalId);
    playBtn.innerText = "Play";
    return;
  }

  cellState.aliveCells.forEach((cell) => {
    const aliveNeighbours = getLivingNeighbourCount(
      cell.split(" ")[0],
      cell.split(" ")[1]
    );
    if (aliveNeighbours < 2 || aliveNeighbours > 3) {
      toKill.push(cell);
    }
    const x = parseInt(cell.split(" ")[0]);
    const y = parseInt(cell.split(" ")[1]);
    for (
      let i = x < 1 ? 0 : x - 1;
      i <= (x + 1 > cols - 1 ? cols - 1 : x + 1);
      i++
    ) {
      for (
        let j = y < 1 ? 0 : y - 1;
        j <= (y + 1 > rows - 1 ? rows - 1 : y + 1);
        j++
      ) {
        if (!cellState.aliveCells.includes(`${i} ${j}`)) {
          const neighbours = getLivingNeighbourCount(i, j);
          if (neighbours === 3 && !toRevive.includes(`${i} ${j}`)) {
            toRevive.push(`${i} ${j}`);
          }
        }
      }
    }
  });

  toKill.forEach((cell) => cellState.remove(cell));
  toRevive.forEach((cell) => cellState.add(cell));

  generationCount.innerText =
    "Generation: " + (parseInt(generationCount.innerText.split(": ")[1]) + 1);
  populationCount.innerText = "Population: " + cellState.aliveCells.length;
}

function getLivingNeighbourCount(x, y) {
  let aliveNeighbours = 0;
  x = parseInt(x);
  y = parseInt(y);
  for (let i = x < 1 ? 0 : x - 1; i <= (x + 1 > cols ? cols : x + 1); i++) {
    for (let j = y < 1 ? 0 : y - 1; j <= (y + 1 > rows ? rows : y + 1); j++) {
      if ((x !== i || y !== j) && cellState.aliveCells.includes(`${i} ${j}`)) {
        aliveNeighbours++;
      }
    }
  }
  return aliveNeighbours;
}

function colourCell(x, y) {
  ctx.beginPath();
  ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
  ctx.fill();
  ctx.closePath();
}

function decolourCell(x, y) {
  ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function handleCellSelect(e) {
  const x = Math.floor(e.offsetX / cellSize);
  const y = Math.floor(e.offsetY / cellSize);
  cellState.toggle(`${x} ${y}`);
  populationCount.innerText = "Population: " + cellState.aliveCells.length;
}

function handleReset() {
  cellState.aliveCells = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clearInterval(intervalId);
  playBtn.innerText = "Play";
  generationCount.innerText = "Generation: 1";
  populationCount.innerText = "Population: 0";
}

let intervalId;
function handleStopAndPlay() {
  if (playBtn.innerText === "Play") {
    playAndUpdateStats();
    intervalId = setInterval(playAndUpdateStats, 1000);
    playBtn.innerText = "Pause";
  } else {
    clearInterval(intervalId);
    playBtn.innerText = "Play";
  }
}

function handleHideGrid() {
  if (hideGridBtn.innerText === "Hide Grid") {
    grid.style.visibility = "hidden";
    hideGridBtn.innerText = "Show Grid";
  } else {
    grid.style.visibility = "visible";
    hideGridBtn.innerText = "Hide Grid";
  }
}
