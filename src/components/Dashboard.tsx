import { useRef, useState } from "react";

import SquareCard from "./SquareCard";

import "../assets/styles/Dashboard.css";

const Dashboard = () => {
  const rows = 6;
  const cols = 7;

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
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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
        x: mouseX - (mouseX - prevPosition.x) * ratio,
        y: mouseY - (mouseY - prevPosition.y) * ratio,
      }));

      return newScale;
    });
  };

  // Bắt đầu kéo
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;

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
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => (
            <SquareCard
              key={`${row}-${col}`}
              row={row}
              col={col}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;