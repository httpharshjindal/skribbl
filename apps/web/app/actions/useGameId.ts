"use client";

import { useEffect, useState } from "react";

const useGameId = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("gameId");
      setGameId(id || "");
    }
  }, []);
  return gameId;
};

export default useGameId;
