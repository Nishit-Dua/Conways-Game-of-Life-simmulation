import { useCallback, useEffect, useRef, useState } from "react";
import produce from "immer";

const NUM_ROWS = 30;
const NUM_COLS = 50;

const operations = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [-1, 1],
  [-1, -1],
  [1, 1],
  [1, -1],
];

const makeGrid = (rand = 0) => {
  const rows = [];
  for (let i = 0; i < NUM_ROWS; i++) {
    rows.push(
      Array.from(Array(NUM_COLS), () => (Math.random() >= rand ? 0 : 1))
    );
  }
  return rows;
};

function App() {
  const [grid, setGrid] = useState(() => makeGrid(0.3));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [genCount, setGenCount] = useState(0);

  const runningRef = useRef(isRunning);
  console.log(isRunning);
  runningRef.current = isRunning;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const reset = () => {
    setGrid(() => makeGrid());
    setGenCount(0);
    setIsRunning(false);
  };

  // Fxn Wont be Made every render so we use refs
  const runSimmulation = useCallback(() => {
    if (!runningRef.current) return;
    setGrid((oldGrid) => {
      return produce(oldGrid, (gridCopy) => {
        for (let i = 0; i < NUM_ROWS; i++) {
          for (let j = 0; j < NUM_COLS; j++) {
            let neighbours = 0;

            operations.forEach(([x, y]) => {
              const newI = x + i;
              const newJ = y + j;
              if (
                newI >= 0 &&
                newI < NUM_ROWS &&
                newJ >= 0 &&
                newJ < NUM_COLS
              ) {
                neighbours += oldGrid[newI][newJ];
              }
            });

            if (neighbours < 2 || neighbours > 3) gridCopy[i][j] = 0;
            if (neighbours === 3 && oldGrid[i][j] === 0) gridCopy[i][j] = 1;
          }
        }
      });
    });
    setGenCount((old) => old + 1);
    setTimeout(runSimmulation, 1000 / speedRef.current);
  }, []);

  // If no Alive Cells, the simmulations stops!
  useEffect(() => {
    if (!grid.flat(2).filter((item) => item === 1).length) {
      setIsRunning(false);
    }
  }, [grid, isRunning]);

  //CSS
  const gridContainerCSS: React.CSSProperties = {
    display: "grid",
    // gap: "1px",
    gridTemplateColumns: `repeat(${NUM_COLS}, 20px)`,
    gridTemplateRows: `repeat(${NUM_ROWS}, 20px)`,
  };
  const gridBoxCSS = (i: number, j: number): React.CSSProperties => {
    return {
      border: "1px solid black",
      height: "21px",
      width: "21px",
      // borderRadius: "4px",
      backgroundColor: grid[i][j] ? "#93c5cc" : "#ffffff",
    };
  };

  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          id="speed-range"
          type="range"
          min="1"
          max="20"
          value={speed}
          onChange={(e) => {
            setSpeed(parseInt(e.target.value));
          }}
        />
        <button
          onClick={() => {
            setIsRunning(!isRunning);
            if (!isRunning) {
              runningRef.current = true;
              runSimmulation();
            }
          }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      </form>
      <label htmlFor="speed-range">speed: {speed} generations per second</label>
      <div className="grid-container" style={gridContainerCSS}>
        {grid.map((rows, i) =>
          rows.map((box, j) => {
            return (
              <div
                key={`${i}-${j}`}
                className="grid-box"
                onClick={() => {
                  const newGrid = produce(grid, (gridCopy) => {
                    gridCopy[i][j] = grid[i][j] ? 0 : 1;
                  });
                  setGrid(newGrid);
                }}
                style={gridBoxCSS(i, j)}
              />
            );
          })
        )}
      </div>
      genration: {genCount}, alive:{" "}
      {grid.flat(2).filter((item) => item === 1).length}
      <div className="btn-controls">
        <button
          onClick={() => {
            reset();
          }}
          // No particular reason to set innerHTML but to do it in "one line" :p
          dangerouslySetInnerHTML={{ __html: "Reset" }}
        />
        <button
          onClick={() => {
            reset();
            setGrid(() => makeGrid(0.3));
          }}
        >
          Randomize
        </button>
      </div>
    </main>
  );
}

export default App;
