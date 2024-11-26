"use client";

import { useEffect, useState } from "react";
import Canvas from "../../components/canvas";
import Chat from "../../components/chat";
import Players from "../../components/players";
import Timer from "../../components/Timer";
import { clientId, gameId } from "../../components/HomePage";
import createWebSocket from "../../lib/ws";
import { BackgroundBeams } from "../../components/ui/background-beams";
import { useRouter } from "next/navigation";
interface GameClient {
  nickName: string;
  clientId: string;
  color: string;
  score: string;
}
export default function Game() {
  const [state, setState] = useState();
  const [clients, setClients] = useState<GameClient[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<GameClient>();
  const [hostId, setHostId] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<GameClient>();
  const [slectedWord, setSelectedWord] = useState("");
  const [popUp, setPopUp] = useState(true);
  const [isGameOver, setisGameOver] = useState(false);
  const [allowCursor, setAllowCursor] = useState(true);
  const [turnCount, setTurnCount] = useState(1);
  const [receivedDrawingData, setReceivedDrawingData] = useState([]);
  const [clearCanvasEvent, setClearCanvasEvent] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // const [currentTurn, setCurrentTurn] = useState("");
  useEffect(() => {
    if (!gameId) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const ws = createWebSocket();
    setSocket(ws);
    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
      try {
        if (data.event == "state") {
          setState(data.game);
          setClients(Object.values(data.game.clients));
          setMessage(data.game.state.messages);
          setUser(data.game.clients[clientId]);
          setReceivedDrawingData(data.game.state.drawing);
          setClearCanvasEvent(false);
          if (data.game.isGameStarted) {
            setGameStarted(true);
          }
          if (data.game.hostId) {
            setHostId(data.game.hostId);
          }
          if (data.game.selectedPlayer) {
            setSelectedPlayer(data.game.clients[data.game.selectedPlayer]);
          }
          if (data.game.selectedPlayer != clientId) {
            setSelectedWord("");
          }
          if (data.game.isGameOver) {
            setisGameOver(true);
          }
        }

        if (data.event === "clear") {
          setClearCanvasEvent(true);
          setReceivedDrawingData([]);
        }

        if (
          data.event === "your-turn" ||
          selectedPlayer?.clientId == clientId
        ) {
          setSelectedWord(data.word);
          setPopUp(true);
          setAllowCursor(false);
          setTurnCount((p) => p + 1);
        }
        if (data.event == "turn-notification") {
          setPopUp(true);
          setAllowCursor(true);
          setTurnCount((p) => p + 1);
        }
        if (data.event == "game-over") {
          setTimeout(() => {
            setPopUp(true);
            setisGameOver(true);
            setGameStarted(false);
            setTurnCount((p) => p + 1);
          }, 5000);
        }
        if (data.event == "guessed-correctly" && data.clientId == clientId) {
          setAllowCursor(false);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, []);

  if (popUp && gameStarted) {
    setTimeout(() => {
      setPopUp(false);
    }, 5000);
  }
  console.log(clientId);
  console.log(hostId);
  return (
    <div className="w-full h-screen px-5 py-5 flex justify-start items-center flex-col gap-2 relative">
      <div>
        <BackgroundBeams />
      </div>
      <Timer turnCount={turnCount} gameStarted={gameStarted} />
      <div className="flex w-full h-full gap-2 z-10 ">
        <Players
          selectedPlayer={selectedPlayer}
          clients={clients}
          turnCount={turnCount}
        />
        <Canvas
          selectedPlayer={selectedPlayer?.clientId}
          receivedDrawingData={receivedDrawingData}
          clearCanvasEvent={clearCanvasEvent}
        />
        <Chat
          message={message}
          user={user}
          allowCursor={allowCursor}
          selectedPlayer={selectedPlayer}
        />
      </div>
      {!gameStarted && popUp && !isGameOver && (
        <div
          className={`absolute w-full h-full flex justify-center items-center cursor-pointer z-20`}
        >
          <div className="w-screen h-screen opacity-55 bg-zinc-900 "></div>
          <div className="absolute flex justify-center items-center flex-col gap-2 w-full h-full">
            <div className="w-1/2 h-10 font-semibold bg-yellow-200 rounded-full flex justify-center items-center cursor-auto ">
              {gameId ? (
                <div>
                  <span className="select-none">GameId: </span>
                  <span>{gameId}</span>
                </div>
              ) : (
                "Create Game First"
              )}
            </div>

            {hostId && hostId == clientId ? (
              <div className="flex justify-center items-center flex-col z-50 ">
                <h1 className="font-bold text-3xl text-white">
                  Start The Game
                </h1>
                <button
                  className="bg-green-400 rounded-lg w-72 h-10 text-white text-lg font-semibold"
                  onClick={() => {
                    if (socket) {
                      socket.send(
                        JSON.stringify({
                          event: "start",
                          gameId: gameId,
                        })
                      );
                    }
                  }}
                >
                  START
                </button>
              </div>
            ) : (
              <h1 className="font-bold text-3xl text-white ">
                Waiting For The Host To Start
              </h1>
            )}
          </div>
        </div>
      )}
      {selectedPlayer && popUp && gameStarted && (
        <div
          className={`absolute w-full h-full flex justify-center items-center cursor-pointer z-50`}
        >
          <div className="w-screen h-screen opacity-55 bg-zinc-900 "></div>
          <div className="absolute flex justify-center items-center flex-col gap-2 w-full h-full">
            <h1 className="font-bold text-3xl text-white ">
              {selectedPlayer.clientId == clientId
                ? "Its Your Turn"
                : `${selectedPlayer.nickName || "Anonymous"} is Drawing`}
            </h1>
            {selectedPlayer.clientId == clientId && (
              <h1 className="bg-green-400 rounded-lg w-72 h-10 text-white text-lg font-semibold flex justify-center items-center">
                {slectedWord}
              </h1>
            )}
          </div>
        </div>
      )}
      {popUp && isGameOver && (
        <div
          className={`absolute w-full h-full flex justify-center items-center cursor-pointer z-50 `}
        >
          <div className="w-screen h-screen opacity-55 bg-zinc-900 "></div>
          <div className="absolute flex justify-center items-center flex-col gap-2 w-full h-full">
            <h1 className="font-bold text-3xl text-white ">
              {isGameOver ? "Game Has Ended" : ""}
            </h1>
            <div className="w-full flex justify-center items-center">
              <Players
                clients={clients}
                turnCount={turnCount}
                selectedPlayer={selectedPlayer}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
