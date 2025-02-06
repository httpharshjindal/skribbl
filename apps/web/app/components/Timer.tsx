"use client"
import { useEffect, useState } from "react";
import React from "react";

const Timer = ({
  turnCount,
  gameStarted,
}: {
  turnCount: number;
  gameStarted: boolean;
}) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (gameStarted) {
      setTimer(120);

      const timerInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(timerInterval); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [turnCount, gameStarted]);

  return (
    <div className="border-2 w-10 h-10 flex justify-center items-center select-none border-zinc-950 font-bold absolute px-3 py-2 rounded-full top-8">
      {timer}
    </div>
  );
};

export default Timer;
