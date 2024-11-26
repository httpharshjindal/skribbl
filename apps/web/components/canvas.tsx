"use client";

import React, { useRef, useState, useEffect } from "react";
import { clientId, gameId } from "./HomePage";
import createWebSocket from "../lib/ws";
import UnderlinedWord from "./UnderlinedWord";
import Timer from "./Timer";
const CanvasComponent = ({
  selectedPlayer,
  receivedDrawingData,
  wordLength,
  turnCount,
  gameStarted,
  selectedWord,
}: {
  selectedPlayer: any;
  receivedDrawingData: any;
  wordLength: any;
  turnCount: any;
  gameStarted: any;
  selectedWord?: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [allDrawingData, setAllDrawingData] = useState<any[]>([]); // Store all drawing data here

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ws = createWebSocket();
    if (ws) {
      setSocket(ws);
    }

    // Set canvas dimensions
    canvas.width = window.innerWidth * 0.58;
    canvas.height = window.innerHeight * 0.9;

    // Clear the canvas initially
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    // Merge new drawing data with the existing data
    // if (receivedDrawingData.length == 0) {
    //   clearCanvas();
    //   setAllDrawingData([]);
    // }
    if (receivedDrawingData) {
      setAllDrawingData([]);
      setAllDrawingData((prevData) => [...prevData, ...receivedDrawingData]);
    }
  }, [receivedDrawingData]);

  // useEffect(() => {
  //   if (clearCanvasEvent == true) {
  //     clearCanvas;
  //   }
  // }, [clearCanvasEvent]);

  useEffect(() => {
    // Only render received drawing data if the client is not currently drawing
    if (isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas and redraw all actions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Render all drawing data
    if (selectedPlayer && selectedPlayer.clientId != clientId) {
      allDrawingData.forEach(({ startX, startY, endX, endY, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
    }
  }, [allDrawingData, isDrawing]); // Re-run whenever drawing data or isDrawing state changes

  useEffect(() => {
    clearCanvas(); // Clear the canvas whenever the selected player changes
  }, [selectedPlayer]);

  const sendDrawing = (endX: number, endY: number) => {
    socket?.send(
      JSON.stringify({
        gameId: gameId,
        clientId: clientId,
        event: "draw",
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        color: color,
      })
    );
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedPlayer !== clientId) return; // Block drawing for non-selected players

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDrawing(true);
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedPlayer !== clientId) return; // Block drawing for non-selected players

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    setStartX(endX);
    setStartY(endY);

    sendDrawing(endX, endY);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset all drawing data
    setAllDrawingData([]);

    // Send clear event to all other clients
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-3/5 h-full bg-white overflow-hidden relative">
      <canvas
        ref={canvasRef}
        style={{
          cursor: selectedPlayer === clientId ? "crosshair" : "not-allowed",
        }}
        className="z-50"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="absolute top-3 left-2 z-50 select-none">
        {clientId === selectedPlayer && (
          <div className="flex gap-2">
            <button
              onClick={() => setColor("red")}
              className="h-6 w-6 bg-red-500 text-white rounded"
            ></button>
            <button
              onClick={() => setColor("blue")}
              className="h-6 w-6 bg-blue-500 text-white rounded"
            ></button>
            <button
              onClick={() => setColor("black")}
              className="h-6 w-6 bg-black text-white rounded"
            ></button>
            <button
              onClick={() => {
                clearCanvas();
                socket?.send(
                  JSON.stringify({
                    event: "clear",
                    gameId: gameId,
                    clientId: clientId,
                  })
                );
              }}
              className="p-2 h-6 flex justify-center items-center bg-gray-500 text-white rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="absolute top-1 flex justify-center items-center z-50 select-none ">
        <UnderlinedWord length={wordLength} selectedWord={selectedWord} />
      </div>
      <div className="absolute -top-5 flex justify-center items-center right-10 z-50 select-none">
        <Timer turnCount={turnCount} gameStarted={gameStarted} />
      </div>
    </div>
  );
};

export default CanvasComponent;
