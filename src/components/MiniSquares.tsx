import "../assets/styles/MiniSquares.css";

interface MiniSquaresProps {
  row: number;
  col: number;
}

const MiniSquares = ({ row, col }: MiniSquaresProps) => {
  return (
    <div className="mini-squares">
      {Array.from({ length: 25 }, (_, index) => (
        <div
          key={index}
          className="mini-square"
          data-row={row}
          data-col={col}
          data-index={index}
        />
      ))}
    </div>
  );
};

export default MiniSquares;