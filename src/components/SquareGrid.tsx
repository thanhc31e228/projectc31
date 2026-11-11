import MiniSquares from "./MiniSquares";
import "../assets/styles/SquareGrid.css";

interface Point {
  id: string;
  x: number;
  y: number;
}

interface SquareGridProps {
  row: number;
  col: number;
  rows: number;
  cols: number;
  onPointClick: (point: Point) => void;
}
//25 ô vuông nhỏ bên trong 1 ô vuông lớn
const SquareGrid = ({
  row,
  col,
  rows,
  cols,
  onPointClick,
}: SquareGridProps) => {
  const innerRows = 5;
  const innerCols = 5;

  return (
    <div className="square-grid">
      {Array.from({ length: innerRows }).map((_, innerRow) =>
        Array.from({ length: innerCols }).map((_, innerCol) => (
          <div
            className="square-grid-cell"
            key={`${innerRow}-${innerCol}`}
          >
            <MiniSquares
              row={row * innerRows + innerRow}
              col={col * innerCols + innerCol}
              rows={rows * innerRows}
              cols={cols * innerCols}
              onPointClick={onPointClick}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default SquareGrid;