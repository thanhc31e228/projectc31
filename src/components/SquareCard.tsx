
import "../assets/styles/SquareCard.css";
import SquareGrid from "./SquareGrid";

interface Point {
  id: string;
  x: number;
  y: number;
}

interface SquareCardProps {
  row: number;
  col: number;
  rows: number;
  cols: number;
  onPointClick: (point: Point) => void;
}
//5 ô vuông ảo
const SquareCard = ({
  row,
  col,
  rows,
  cols,
  onPointClick,
}: SquareCardProps) => {
console.log("Rendering SquareCard", { row, col, rows, cols });
  return (
    <div className="square-card">
      {/* <MiniSquares
        row={row}
        col={col}
        rows={rows}
        cols={cols}
        onPointClick={onPointClick}
      /> */}
      <SquareGrid
        row={row}
        col={col}
        rows={rows}
        cols={cols}
        onPointClick={onPointClick}
      />
    </div>
  );
};

export default SquareCard;
