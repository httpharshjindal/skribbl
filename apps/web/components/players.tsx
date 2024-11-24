"use client";

import { useEffect, useState } from "react";
import { clientId } from "./HomePage";
import UserProfile from "./ui/userProfile";
import React from "react";
interface GameClient {
  nickName: string;
  clientId: string;
  color: string;
  score: number; // Ensure score is a number
  guessed?: boolean;
}

export default function ClientList({
  clients,
  turnCount,
  selectedPlayer,
}: {
  clients: any; // Explicit type for clients
  turnCount: any;
  selectedPlayer: any;
}) {
  const [players, setPlayers] = useState<GameClient[]>([]);

  useEffect(() => {
    const sortedPlayers = clients.sort((a: any, b: any) => b.score - a.score);
    setPlayers(sortedPlayers);
  }, [clients]);

  return (
    <div className="w-1/5 h-full bg-green-50">
      {players.map((client, index) => (
        <div
          key={index}
          className={`${
            client?.guessed &&
            selectedPlayer.clientId != client.clientId
              ? "bg-green-300"
              : "bg-zinc-200"
          } border border-b flex justify-center items-center`}
        >
          <h1 className="font-semibold w-1/4 flex justify-center items-center">
            #{index + 1}
          </h1>
          <div className="flex flex-col justify-center items-center w-1/2">
            <h1 className="font-bold">{client.nickName || "Anonymous"}</h1>
            <h1 className="font-medium text-gray-600">
              {client.score || "00"}
            </h1>
          </div>
          <div className="w-1/4 flex justify-center items-center">
            <div>
              <UserProfile color={client.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
