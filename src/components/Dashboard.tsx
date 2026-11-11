
import { useRef, useState } from "react";
import "../assets/styles/Dashboard.css";
import SquareGrid from "./SquareGrid";

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

// Tạo đường cong nối các điểm
const generateSmoothPath = (connections: Connection[]) => {
  if (connections.length === 0) return "";

  const points: Point[] = [
    connections[0].from,
    ...connections.map((connection) => connection.to),
  ];

  // console.log("Generating path for points:", points);
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
    // console.log("Point clicked:", point);
    if (!selectedPoint) {
      setSelectedPoint(point);
      return;
    }

    if (selectedPoint.id === point.id) return;

    setConnections((prev) => [
      ...prev,
      {
        id: ++connectionId.current,
        from: selectedPoint,
        to: point,
      },
    ]);

    setSelectedPoint(point);
  };

  // Zoom bảng
  const [scale, setScale] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const viewportRef = useRef<HTMLDivElement>(null);

  // Quản lý kéo bảng
  const dragging = useRef(false);
  const hasMoved = useRef(false);

  const startPointer = useRef({
    x: 0,
    y: 0,
  });

  const lastPointer = useRef({
    x: 0,
    y: 0,
  });

  const pointerDownPoint = useRef<Point | null>(null);

  // Zoom bằng Ctrl + lăn chuột
 const handleWheel = (
  e: React.WheelEvent<HTMLDivElement>
) => {
  if (!e.ctrlKey) return;

  e.preventDefault();

  const viewport = viewportRef.current;
  if (!viewport) return;

  const rect = viewport.getBoundingClientRect();

  // Tọa độ con trỏ trong viewport
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Tính hệ số zoom liên tục
  const zoomSpeed = 0.002;
  const zoomFactor = Math.exp(-e.deltaY * zoomSpeed);

  const newScale = Math.min(
    Math.max(scale * zoomFactor, 0.3),
    4
  );

  // Tính tỷ lệ thay đổi zoom
  const ratio = newScale / scale;

  // Giữ nguyên vị trí dưới con trỏ chuột
  setPosition({
    x: mouseX - (mouseX - position.x) * ratio,
    y: mouseY - (mouseY - position.y) * ratio,
  });

  setScale(newScale);
};

  // Bắt đầu nhấn chuột
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;

    dragging.current = true;
    hasMoved.current = false;

    startPointer.current = {
      x: e.clientX,
      y: e.clientY,
    };

    lastPointer.current = {
      x: e.clientX,
      y: e.clientY,
    };

    // Kiểm tra có nhấn vào điểm nối không
    const target = e.target;

    if (
      target instanceof Element &&
      target.closest(".connection-point")
    ) {
      const pointElement = target.closest(
        ".connection-point"
      ) as SVGCircleElement;

      pointerDownPoint.current = {
        id: pointElement.dataset.pointId!,
        x: Number(pointElement.dataset.pointX),
        y: Number(pointElement.dataset.pointY),
      };
    } else {
      pointerDownPoint.current = null;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Di chuyển chuột
  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging.current) return;

    const dx = e.clientX - startPointer.current.x;
    const dy = e.clientY - startPointer.current.y;

    // Di chuyển quá 5px thì xác định là kéo
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      hasMoved.current = true;
    }

    if (!hasMoved.current) return;

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

  // Kết thúc thao tác
  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging.current) return;

    // Chỉ tạo đường nối nếu thực sự click
    if (!hasMoved.current && pointerDownPoint.current) {
      handlePointClick(pointerDownPoint.current);
    }

    dragging.current = false;
    hasMoved.current = false;
    pointerDownPoint.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Hủy thao tác
  const handlePointerCancel = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    dragging.current = false;
    hasMoved.current = false;
    pointerDownPoint.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // danh sách tọa độ lấy từ databse
  const setCoordinates: number[] = [
    7, 83, 21, 56, 94, 12, 68,
    35, 1, 79, 43, 90, 26, 61,
    18, 72, 5, 47, 99, 32, 84,
    14, 53, 8, 66, 39, 92, 24,
    75, 11, 58, 3, 87, 41, 29,
    63, 16, 96, 50, 34, 70, 45
  ];
  return (
    <div
      ref={viewportRef}
      className="dashboard"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className="square-board"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
       {/* Các ô vuông */}
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const index = row * cols + col;

          return (
            <SquareGrid
              coordinates={setCoordinates[index] ?? null}
              key={`${row}-${col}`}
              row={row}
              col={col}
              rows={rows}
              cols={cols}
              onPointClick={handlePointClick}
            />
          );
        })
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
    d="M 0 0 L 6 3"
    fill="none"
    stroke="#ef4444"
    strokeWidth="1"
    strokeLinecap="round"
  />
</marker>
          </defs>

          <path
            d={generateSmoothPath(connections)}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1"
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
