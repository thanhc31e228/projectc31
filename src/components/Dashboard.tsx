
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;
const DRAG_THRESHOLD = 5;

const generateSmoothPath = (connections: Connection[]) => {
  if (!connections.length) return "";

  const points = [
    connections[0].from,
    ...connections.map((item) => item.to),
  ];

  let path = `M ${points[0].x} ${points[0].y}`;

  const tension = 0.2;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    const previous = points[i - 1] ?? current;
    const following = points[i + 2] ?? next;

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

const coordinates: number[] = [
  7, 83, 21, 56, 94, 12, 68,
  35, 1, 79, 43, 90, 26, 61,
  18, 72, 5, 47, 99, 32, 84,
  14, 53, 8, 66, 39, 92, 24,
  75, 11, 58, 3, 87, 41, 29,
  63, 16, 96, 50, 34, 70, 45,
];

const Dashboard = () => {
  const rows = 6;
  const cols = 7;

  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // =================================
  // CONNECTION
  // =================================

  const [selectedPoint, setSelectedPoint] =
    useState<Point | null>(null);

  const [connections, setConnections] =
    useState<Connection[]>([]);

  const connectionId = useRef(0);

  const handlePointClick = useCallback((point: Point) => {
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
  }, [selectedPoint]);

  // =================================
  // TRANSFORM
  // =================================

  const transformRef = useRef<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const rafRef = useRef<number | null>(null);

  // Chỉ cập nhật DOM, không gọi setState
  const writeTransform = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const { x, y, scale } = transformRef.current;

    board.style.transform =
      `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  // =================================
  // POINTER
  // =================================

  const pointerRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,

    startX: 0,
    startY: 0,

    currentX: 0,
    currentY: 0,

    boardX: 0,
    boardY: 0,

    point: null as Point | null,
  });

  // Tính vị trí kéo mới nhất
  const updateDragPosition = useCallback(() => {
    const pointer = pointerRef.current;

    if (!pointer.active || !pointer.moved) return;

    transformRef.current.x =
      pointer.boardX + pointer.currentX - pointer.startX;

    transformRef.current.y =
      pointer.boardY + pointer.currentY - pointer.startY;
  }, []);

  // Gom nhiều sự kiện pointer vào một frame
  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      updateDragPosition();
      writeTransform();
    });
  }, [updateDragPosition, writeTransform]);

  // =================================
  // POINTER DOWN
  // =================================

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;

    const pointer = pointerRef.current;

    if (pointer.active) return;

    let point: Point | null = null;

    const target = e.target;

    if (target instanceof Element) {
      const element = target.closest(
        ".connection-point"
      ) as SVGCircleElement | null;

      if (element?.dataset.pointId) {
        point = {
          id: element.dataset.pointId,
          x: Number(element.dataset.pointX),
          y: Number(element.dataset.pointY),
        };
      }
    }

    const transform = transformRef.current;

    pointerRef.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,

      startX: e.clientX,
      startY: e.clientY,

      currentX: e.clientX,
      currentY: e.clientY,

      boardX: transform.x,
      boardY: transform.y,

      point,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // =================================
  // POINTER MOVE
  // =================================

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const pointer = pointerRef.current;

    if (!pointer.active) return;

    if (pointer.pointerId !== e.pointerId) return;

    pointer.currentX = e.clientX;
    pointer.currentY = e.clientY;

    if (!pointer.moved) {
      const dx = e.clientX - pointer.startX;
      const dy = e.clientY - pointer.startY;

      if (
        Math.abs(dx) <= DRAG_THRESHOLD &&
        Math.abs(dy) <= DRAG_THRESHOLD
      ) {
        return;
      }

      pointer.moved = true;
    }

    scheduleRender();
  };

  // =================================
  // FINISH POINTER
  // =================================

  const finishPointer = (
    e: React.PointerEvent<HTMLDivElement>,
    cancelled = false
  ) => {
    const pointer = pointerRef.current;

    if (!pointer.active) return;

    if (pointer.pointerId !== e.pointerId) return;

    const isClick = !pointer.moved;
    const clickedPoint = pointer.point;

    // Đảm bảo lấy đúng vị trí cuối cùng
    if (pointer.moved) {
      updateDragPosition();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      writeTransform();
    }

    pointer.active = false;
    pointer.point = null;

    if (
      e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!cancelled && isClick && clickedPoint) {
      handlePointClick(clickedPoint);
    }
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    finishPointer(e);
  };

  const handlePointerCancel = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    finishPointer(e, true);
  };

  // =================================
  // ZOOM
  // =================================

  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>
  ) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    const viewport = viewportRef.current;
    const board = boardRef.current;

    if (!viewport || !board) return;

    const viewportRect = viewport.getBoundingClientRect();

    const current = transformRef.current;

    // Tọa độ chuột tương đối với gốc ban đầu của board
    const mouseX =
      e.clientX - viewportRect.left - board.offsetLeft;

    const mouseY =
      e.clientY - viewportRect.top - board.offsetTop;

    const zoomFactor = Math.exp(-e.deltaY * 0.002);

    const newScale = Math.min(
      Math.max(
        current.scale * zoomFactor,
        MIN_SCALE
      ),
      MAX_SCALE
    );

    const ratio = newScale / current.scale;

    transformRef.current = {
      scale: newScale,

      x: mouseX - (mouseX - current.x) * ratio,

      y: mouseY - (mouseY - current.y) * ratio,
    };

    scheduleRender();
  };

  // =================================
  // CLEANUP
  // =================================

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // =================================
  // RENDER
  // =================================

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
        ref={boardRef}
        className="square-board"
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const index = row * cols + col;

            return (
              <SquareGrid
                key={`${row}-${col}`}
                coordinates={coordinates[index] ?? null}
                row={row}
                col={col}
                rows={rows}
                cols={cols}
                onPointClick={handlePointClick}
              />
            );
          })
        )}

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
