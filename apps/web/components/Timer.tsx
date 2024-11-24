import { useEffect, useState } from "react";
import React from "react";
export default ({
  turnCount,
  gameStarted,
}: {
  turnCount: number;
  gameStarted: boolean;
}) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (gameStarted) {
      setTimer(60);
      const timerInterval = setInterval(() => {
        setTimer((p) => p - 1);
      }, 1000);
      setTimeout(() => {
        clearInterval(timerInterval);
      }, 60000);
    }
  }, [turnCount, gameStarted]);
  return (
    <div className="border-2 w-10 h-10 flex justify-center items-center select-none border-zinc-950 font-bold absolute px-3 py-2 rounded-full top-8">
      {timer}
    </div>
  );
};
