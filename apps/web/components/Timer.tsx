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
      // Start the timer at 60 when the game starts or turn changes
      setTimer(60);

      const timerInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(timerInterval); // Stop the timer when it hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Clean up the interval when the component unmounts or the turnCount changes
      return () => clearInterval(timerInterval);
    }
  }, [turnCount, gameStarted]); // This effect will re-run when turnCount or gameStarted changes

  return (
    <div className="border-2 w-10 h-10 flex justify-center items-center select-none border-zinc-950 font-bold absolute px-3 py-2 rounded-full top-8">
      {timer}
    </div>
  );
};

export default Timer;
