import { type Challenge } from "./base.js";

export const PuzzleGame: Challenge = {
  init: ({ visitCount, container, onWin }) => {
    const size = 4;
    const totalTiles = size * size;
    const emptyTileValue = totalTiles - 1; // This is the '15' value
    let tiles = Array.from({ length: totalTiles }, (_, i) => i);

    // 1. Shuffle Logic (Ensures solvability)
    const shuffle = (iterations: number) => {
      let emptyIndex = totalTiles - 1;
      for (let i = 0; i < iterations; i++) {
        const neighbors: number[] = [];
        if (emptyIndex % size > 0) neighbors.push(emptyIndex - 1);
        if (emptyIndex % size < size - 1) neighbors.push(emptyIndex + 1);
        if (emptyIndex >= size) neighbors.push(emptyIndex - size);
        if (emptyIndex < totalTiles - size) neighbors.push(emptyIndex + size);

        if (neighbors.length === 0) {
          continue;
        }

        const randomNeighborIndex = Math.floor(Math.random() * neighbors.length);
        const randomNeighbor = neighbors[randomNeighborIndex];
        if (randomNeighbor === undefined) {
          continue;
        }

        const emptyTile = tiles[emptyIndex];
        const neighborTile = tiles[randomNeighbor];
        if (emptyTile === undefined || neighborTile === undefined) {
          continue;
        }

        tiles[emptyIndex] = neighborTile;
        tiles[randomNeighbor] = emptyTile;
        emptyIndex = randomNeighbor;
      }
    };

    shuffle(100 + (visitCount * 20));

    // 2. Render Function (Declared as a variable so handleKeyDown can call it)
    const render = () => {
  container.innerHTML = '';
  container.style.display = 'grid';
  // Use '80px' for exact column widths
  container.style.gridTemplateColumns = `repeat(${size}, 80px)`; 
  container.style.gridTemplateRows = `repeat(${size}, 80px)`;
  container.style.gap = '4px';
  // Set the container width to match the content (4 * 80 + gaps)
  container.style.width = '332px'; 
  container.style.margin = '0 auto';

  tiles.forEach((tileValue, index) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    
    // Explicitly set the tile dimensions
    tile.style.width = '80px';
    tile.style.height = '80px';
    tile.style.boxSizing = 'border-box'; // Prevents borders from adding to width
    
    tile.style.display = 'flex';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'center';
    tile.style.fontSize = '20px';
    tile.style.fontWeight = 'bold';
    tile.style.borderRadius = '4px';

    if (tileValue === emptyTileValue) {
      tile.style.backgroundColor = '#f8f9fa';
      tile.style.border = '2px dashed #ccc';
    } else {
      tile.style.backgroundColor = '#3498db';
      tile.style.color = 'white';
      tile.style.cursor = 'pointer';
      tile.innerText = (tileValue + 1).toString();
      tile.onclick = () => tryMove(index);
    }
    container.appendChild(tile);
  });
};

    // 3. Central Move Logic
    const tryMove = (index: number) => {
      const emptyIdx = tiles.indexOf(emptyTileValue);
      const isNeighbor = [index - 1, index + 1, index - size, index + size].includes(emptyIdx);
      const isWrap = (index % size === 0 && emptyIdx === index - 1) || 
                     (index % size === size - 1 && emptyIdx === index + 1);

      if (isNeighbor && !isWrap) {
        const selectedTile = tiles[index];
        const emptyTile = tiles[emptyIdx];
        if (selectedTile === undefined || emptyTile === undefined) {
          return;
        }

        tiles[index] = emptyTile;
        tiles[emptyIdx] = selectedTile;
        render();
        if (tiles.every((v, i) => v === i)) {
          window.removeEventListener("keydown", handleKeyDown);
          onWin();
        }
      }
    };

    // 4. Keyboard Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const emptyIdx = tiles.indexOf(emptyTileValue);
      let targetIdx = -1;

      switch (e.key) {
        case "ArrowLeft":  if (emptyIdx % size < size - 1) targetIdx = emptyIdx + 1; break;
        case "ArrowRight": if (emptyIdx % size > 0) targetIdx = emptyIdx - 1; break;
        case "ArrowUp":    if (emptyIdx < totalTiles - size) targetIdx = emptyIdx + size; break;
        case "ArrowDown":  if (emptyIdx >= size) targetIdx = emptyIdx - size; break;
      }

      if (targetIdx !== -1) {
        e.preventDefault();
        tryMove(targetIdx);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    render();
  }
};