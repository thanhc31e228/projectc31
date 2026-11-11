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
  coordinates: number | null;
  // toa do o vuong con trong 25 o vuong
  subCoordinates?: string | null;
  onPointClick: (point: Point) => void;
}
//o vuong lon 5x5
const SquareGrid = ({
  row,
  col,
  rows,
  cols,
  coordinates,
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
      {coordinates !== null && innerRow === 2 && innerCol === 2 && (
        <div className="coordinates" style={{pointerEvents: 'none'}} >
          {coordinates}
        </div>
      )}
      <MiniSquares
      subCoordinates={innerRow + '' + innerCol}
        row={row * innerRows + innerRow}
        col={col * innerCols + innerCol}
        rows={rows * innerRows}
        cols={cols * innerCols}
        coordinates={coordinates}
        onPointClick={onPointClick}
      />
    </div>
  ))
)}
    </div>
  );
};

export default SquareGrid;