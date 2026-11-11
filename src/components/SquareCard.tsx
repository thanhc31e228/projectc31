
import MiniSquares from "./MiniSquares";
import "../assets/styles/SquareCard.css";

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

const SquareCard = ({
  row,
  col,
  rows,
  cols,
  onPointClick,
}: SquareCardProps) => {
  return (
    <div className="square-card">
      <MiniSquares
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
