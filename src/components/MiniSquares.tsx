
interface Point {
  id: string;
  x: number;
  y: number;
}

interface MiniSquaresProps {
  numberMain?: number;
  row: number;
  col: number;
  rows: number;
  cols: number;
  onPointClick: (point: Point) => void;
}

const MiniSquares = ({
  numberMain,
  row,
  col,
  rows,
  cols,
  onPointClick,
}: MiniSquaresProps) => {
  const lineColor = "rgba(71, 85, 105, 0.35)";

  const points = [
    { id: "TL", x: 20, y: 20 },
    { id: "TR", x: 80, y: 20 },
    { id: "BL", x: 20, y: 80 },
    { id: "BR", x: 80, y: 80 },
    { id: "C", x: 50, y: 50 },
  ];

  // Chuyển tọa độ điểm sang hệ tọa độ toàn bảng 1000x1000
  const getPointPosition = (x: number, y: number) => ({
  x: ((col * 100 + x) / (cols * 100)) * 1000,
  y: ((row * 100 + y) / (rows * 100)) * 1000,
});

  return (
    <svg
      className="mini-squares"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Khung ngoài */}
      <rect
        x="1"
        y="1"
        width="98"
        height="98"
        fill="none"
        stroke={lineColor}
        strokeWidth="0.8"
      />

      {/* Các đường chia */}
      <line
        x1="50"
        y1="1"
        x2="50"
        y2="30"
        stroke={lineColor}
        strokeWidth="0.8"
      />

      <line
        x1="50"
        y1="70"
        x2="50"
        y2="99"
        stroke={lineColor}
        strokeWidth="0.8"
      />

      <line
        x1="1"
        y1="50"
        x2="30"
        y2="50"
        stroke={lineColor}
        strokeWidth="0.8"
      />

      <line
        x1="70"
        y1="50"
        x2="99"
        y2="50"
        stroke={lineColor}
        strokeWidth="0.8"
      />

      {/* Ô vuông trung tâm */}
      <rect
        x="30"
        y="30"
        width="40"
        height="40"
        fill="rgba(148, 163, 184, 0.08)"
        stroke={lineColor}
        strokeWidth="0.8"
      />

      {/* Nhãn */}
      <g className="region-labels">
        {/* <text x="67" y="20">1</text>
        <text x="33" y="20">2</text>
        <text x="33" y="82">3</text>
        <text x="67" y="82">4</text> */}
        <text x="50" y="55">{numberMain}</text>
      </g>

      {/* Các điểm có thể click */}
      {points.map((point) => (
        <circle
          key={point.id}
          className="connection-point"
          cx={point.x}
          cy={point.y}
          r="20"
          // fill="#2563eb"
          fill="transparent"
          // stroke="white"
          // strokeWidth="0.8"
          style={{
            cursor: "crosshair",
          }}
          onClick={(e) => {
            e.stopPropagation();

            const position = getPointPosition(
              point.x,
              point.y
            );

            onPointClick({
              id: `${row}-${col}-${point.id}`,
              x: position.x,
              y: position.y,
            });
          }}
        />
      ))}
    </svg>
  );
};

export default MiniSquares;
