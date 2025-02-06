"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createWebSocket from "../lib/ws";
import Players from "./Players";
import Canvas from "./Canvas";
import Chat from "./Chat";
import { clientId, gameId, hostId } from "./HomePage";
import UnderlinedWord from "./UnderlinedWord";
import Timer from "./Timer";
interface GameClient {
  nickName: string;
  clientId: string;
  color: string;
  score: string;
}
export default function Game() {
  const [clients, setClients] = useState<GameClient[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<GameClient>();
  const [selectedPlayer, setSelectedPlayer] = useState<GameClient>();
  const [selectedWord, setSelectedWord] = useState("");
  const [popUp, setPopUp] = useState(true);
  const [isGameOver, setisGameOver] = useState(false);
  const [allowCursor, setAllowCursor] = useState(true);
  const [turnCount, setTurnCount] = useState(1);
  const [receivedDrawingData, setReceivedDrawingData] = useState([]);
  const router = useRouter();
  const [wordLength, setWordLength] = useState(0);
  useEffect(() => {
    if (!gameId) {
      router.push("/");
    }
  }, [router]);
  console.log(hostId, clientId);

  useEffect(() => {
    const ws = createWebSocket();
    setSocket(ws);
    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
      try {
        if (data.event == "state") {
          setClients(Object.values(data.game.clients));
          setMessage(data.game.state.messages);
          setUser(data.game.clients[clientId]);
          setReceivedDrawingData(data.game.state.drawing);
          if (data.game.isGameStarted) {
            setGameStarted(true);
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
          setReceivedDrawingData([]);
        }

        if (
          data.event === "your-turn" ||
          selectedPlayer?.clientId == clientId
        ) {
          setSelectedWord(data.word);
          setWordLength(data.wordLength);
          setPopUp(true);
          setAllowCursor(false);
          setTurnCount((p) => p + 1);
        }
        if (data.event == "turn-notification") {
          setPopUp(true);
          setAllowCursor(true);
          setWordLength(data.wordLength);
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
  return (
    <div className="w-full h-screen px-5 py-5 flex justify-start items-center flex-col gap-2 relative bg-black overflow-y-hidden">
      <div className="flex w-full h-full gap-2 z-10 ">
        <Players selectedPlayer={selectedPlayer} clients={clients} />
        <div className="relative flex justify-center items-center"> 
          <Canvas
            selectedPlayer={selectedPlayer?.clientId}
            receivedDrawingData={receivedDrawingData}
          />
          <div className="absolute top-2 flex justify-center items-center z-50 select-none ">
            <UnderlinedWord length={wordLength} selectedWord={selectedWord} />
          </div>
          <div className="absolute -top-7 right-7 flex justify-center items-center  z-50 select-none">
            <Timer turnCount={turnCount} gameStarted={gameStarted} />
          </div>
        </div>

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

            {hostId == clientId ? (
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
                {selectedWord}
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
              <Players clients={clients} selectedPlayer={selectedPlayer} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
