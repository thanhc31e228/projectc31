import MiniSquares from "./MiniSquares";
import "../assets/styles/SquareCard.css";

interface SquareCardProps {
  row: number;
  col: number;
}

const SquareCard = ({ row, col }: SquareCardProps) => {
  return (
    <div className="square-card">
      <MiniSquares row={row} col={col} />
    </div>
  );
};

export default SquareCard;