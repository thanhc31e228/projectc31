
import { useRef, useState } from "react";
import SquareCard from "./SquareCard";
import "../assets/styles/Dashboard.css";

export interface Point {
  id: string;
  x: number;
  y: number;
}

interface Connection {
  id: number;
  from: Point;
  to: Point;
}
const generateSmoothPath = (connections: Connection[]) => {
  if (connections.length === 0) return "";

  // Lấy danh sách điểm liên tục
  const points: Point[] = [
    connections[0].from,
    ...connections.map((connection) => connection.to),
  ];

  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    const previous = points[i - 1] || current;
    const following = points[i + 2] || next;

    const tension = 0.2;

    const cp1x =
      current.x + (next.x - previous.x) * tension;

    const cp1y =
      current.y + (next.y - previous.y) * tension;

    const cp2x =
      next.x - (following.x - current.x) * tension;

    const cp2y =
      next.y - (following.y - current.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
};
const Dashboard = () => {
  const rows = 6;
  const cols = 7;

  // Quản lý điểm và đường nối
  const [selectedPoint, setSelectedPoint] =
    useState<Point | null>(null);

  const [connections, setConnections] =
    useState<Connection[]>([]);

  const connectionId = useRef(0);

  // Click điểm để tạo đường nối
  const handlePointClick = (point: Point) => {
  // Chưa chọn điểm bắt đầu
  if (!selectedPoint) {
    setSelectedPoint(point);
    return;
  }

  // Không nối một điểm với chính nó
  if (selectedPoint.id === point.id) return;

  // Tạo đường nối
  setConnections((prev) => [
    ...prev,
    {
      id: ++connectionId.current,
      from: selectedPoint,
      to: point,
    },
  ]);

  // Giữ điểm vừa click làm điểm bắt đầu tiếp theo
  setSelectedPoint(point);
};

  // Zoom và kéo bảng
  const [scale, setScale] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const viewportRef = useRef<HTMLDivElement>(null);

  const dragging = useRef(false);

  const lastPointer = useRef({
    x: 0,
    y: 0,
  });

  // Zoom bằng Ctrl + lăn chuột
  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>
  ) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setScale((prevScale) => {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

      const newScale = Math.min(
        Math.max(prevScale * zoomFactor, 0.3),
        4
      );

      const ratio = newScale / prevScale;

      setPosition((prevPosition) => ({
        x:
          mouseX -
          (mouseX - prevPosition.x) * ratio,
        y:
          mouseY -
          (mouseY - prevPosition.y) * ratio,
      }));

      return newScale;
    });
  };

  // Bắt đầu kéo bảng
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;

    // Không kéo bảng khi click vào điểm
    const target = e.target;

    if (
      target instanceof Element &&
      target.closest(".connection-point")
    ) {
      return;
    }

    dragging.current = true;

    lastPointer.current = {
      x: e.clientX,
      y: e.clientY,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Di chuyển bảng
  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging.current) return;

    const deltaX = e.clientX - lastPointer.current.x;
    const deltaY = e.clientY - lastPointer.current.y;

    lastPointer.current = {
      x: e.clientX,
      y: e.clientY,
    };

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };

  // Kết thúc kéo
  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={viewportRef}
      className="dashboard"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="square-board"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        {/* Các ô vuông */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => (
            <SquareCard
              key={`${row}-${col}`}
              row={row}
              col={col}
              rows={rows}
              cols={cols}
              onPointClick={handlePointClick}
            />
          ))
        )}

        {/* Lớp SVG vẽ đường nối */}
       <svg
  className="connection-layer"
  viewBox="0 0 1000 1000"
  preserveAspectRatio="none"
>
  <defs>
    <marker
      id="arrow"
      markerWidth="8"
      markerHeight="8"
      refX="6"
      refY="3"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <path
        d="M 0 0 L 6 3 L 0 6"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </marker>
  </defs>

  {/* Đường cong */}
  <path
    d={generateSmoothPath(connections)}
    fill="none"
    stroke="#ef4444"
    strokeWidth="2"
    vectorEffect="non-scaling-stroke"
    strokeLinecap="round"
    markerMid="url(#arrow)"
    markerEnd="url(#arrow)"
  />
</svg>
      </div>
    </div>
  );
};

export default Dashboard;
