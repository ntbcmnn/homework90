import React, { useEffect, useRef, useState } from 'react';
import '../../App.css';
import { IncomingMessage, Line, Point } from '../../types';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<Point | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onmessage = (event) => {
      const decodedMessage = JSON.parse(event.data) as IncomingMessage;

      if (decodedMessage.type === 'INIT_CANVAS') {
        setLines((prev) => [...prev, ...decodedMessage.payload]);
        drawLines(decodedMessage.payload);
      }
    };

    ws.current.onclose = () => console.log('Connection closed');

    return () => {
      if (ws.current) {
        ws.current.close();
        console.log('Connection closed');
      }
    };
  }, []);

  useEffect(() => {
    drawLines(lines);
  }, [lines]);

  const drawLines = (newLines: Line[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    newLines.forEach(({start, end, color}) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLastPosition({x, y});
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition || !ws.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newLine: Line = {
      start: lastPosition,
      end: {x, y},
      color: 'white',
    };

    ws.current.send(JSON.stringify({type: 'DRAW', payload: [newLine]}));
    drawLines([newLine]);

    setLastPosition({x, y});
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  return (
    <div className="container">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="my-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;
