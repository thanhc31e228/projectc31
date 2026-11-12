
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

const SquareCard = ({
  row,
  col,
  rows,
  cols,
  onPointClick,
}: SquareCardProps) => {
  return (
    <div className="square-card">
      <SquareGrid
        coordinates={2}
        subCoordinates={null}
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
