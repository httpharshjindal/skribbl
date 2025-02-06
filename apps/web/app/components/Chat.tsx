"use client";

import { useEffect, useState } from "react";
import createWebSocket from "../lib/ws";
import React from "react";
import { gameId } from "./HomePage";
const Chat = ({
  message,
  user,
  allowCursor,
  selectedPlayer,
}: {
  message: any;
  user: any;
  allowCursor: any;
  selectedPlayer: any;
}) => {
  const [userMessage, setUserMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const ws = createWebSocket(); // Provide your WebSocket server URL
    if (ws) {
      console.log("connected");
    }
    setSocket(ws);
    ws.onmessage = (event: any) => {
      console.log("Message from server:", event.data);
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          event: "message",
          clientId: user.clientId,
          nickName: user.nickName,
          gameId: gameId,
          message: userMessage.toLocaleLowerCase(),
        })
      );
      setUserMessage("");
    } else {
      console.warn("WebSocket not initialized yet");
    }
  };
  return (
    <div className={`w-1/5 h-full bg-zinc-200 p-2`}>
      <div className="h-[80vh] w-full overflow-y-scroll scrollbar-none">
        <div className="w-full flex justify-center items-center">
          {selectedPlayer && (
            <h1 className="text-md font-semibold">
              {selectedPlayer.nickName} is Drawing
            </h1>
          )}
        </div>
        {message.map((c: any, index: any) => (
          <div
            key={index}
            className={`w-full border-zinc-400 border-b`}
          >
            <h4>
              <span className="font-semibold">{c.nickName}</span>: {c.message}
            </h4>
          </div>
        ))}
      </div>
      <div
        className={`${!allowCursor ? "bg-slate-500" : "bg-white"}  w-full flex justify-center items-center gap-1 `}
      >
        <input
          type="text"
          value={allowCursor ? userMessage : ""}
          className={`${!allowCursor && "cursor-none caret-transparent"} bg-transparent w-4/5 px-2 py-1 outline-none`}
          placeholder="Enter Your Guess Here"
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          className={`${!allowCursor ? "cursor-none" : ""} w-1/5 flex justify-center items-center bg-green-500 py-1 text-white`}
          onClick={allowCursor ? sendMessage : () => {}}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat