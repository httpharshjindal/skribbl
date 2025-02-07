"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createWebSocket from "../lib/ws";
import React from "react";
import UserProfile from "./ui/UserProfile";
import Loader from "./ui/Loader";
export let clientId = "";
export let gameId = "";
export let hostId = "";
const HomePage = () => {
  const [nickName, setNickName] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  const [color, setColor] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [popUp, setPopUp] = useState(true);
  const [popUpMessage, setPopUpMessage] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [screenLoader, setScreenLoader] = useState(true);

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
  
    if (storedClientId) {
      setScreenLoader(false);
      localStorage.removeItem("clientId");
    }
  
    // Otherwise, create the WebSocket connection.
    const ws = createWebSocket();
    setSocket(ws);
  
    ws.onopen = () => {
      console.log("WebSocket connected!");
    };
  
    ws.onmessage = (event: any) => {
      try {
        setScreenLoader(true)
        const data = JSON.parse(event.data);
        if (data.clientId) {
          setScreenLoader(false);
          clientId = data.clientId;
          localStorage.setItem("clientId", data.clientId);
        } else {
          console.warn("No clientId received, retrying...");
          setScreenLoader(false); // Make sure to turn off loader even if data is not as expected.
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setScreenLoader(false); // Turn off loader on error (or you could show an error message).
      }
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setScreenLoader(false); // Stop loader if an error occurs.
    };
  
  }, []);
  

  const sendMessage = (payload: any) => {
    if (socket) {
      if (!nickName) {
        setPopUp(true);
        setPopUpMessage("Enter NickName");
        setLoading(false);
        return;
      }
      if (!color) {
        setPopUp(true);
        setPopUpMessage("Select a Color");
        setLoading(false);
        return;
      }
      if (payload.gameId === "") {
        setPopUp(true);
        setPopUpMessage("Enter Game Id");
        setLoading(false);
        return;
      }

      if (payload.event === "create") {
        setPopUpMessage("creating game");
        socket.send(JSON.stringify(payload));
        setLoading(true);
      }

      if (payload.event === "join") {
        setPopUpMessage("joining game");
        socket.send(JSON.stringify(payload));
        gameId = gameIdInput;
        localStorage.setItem("gameId", gameIdInput);
        setColor("red");
        setLoading(true);
      }

      socket.onmessage = async (event: any) => {
        const data = JSON.parse(event.data);

        // Handle game creation response
        if (data.event === "create" || data.gameId) {
          setPopUp(false);
          setLoading(false);
          gameId = data.gameId;
          hostId = clientId;
          localStorage.setItem("gameId", data.gameId);
          router.replace("/game");
        }

        // Handle joining game response
        if (data.event === "join") {
          setPopUp(false);
          setLoading(false);
          router.replace("/game");
        }

        // Handle error scenario
        if (data.error) {
          setPopUpMessage("Something Went Wrong, Reloaing");
          setPopUp(true);
          setLoading(false);
          const pause = () =>
            new Promise((resolve) => setTimeout(resolve, 2000));
          await pause();
          // window.location.reload();
        }
      };
    } else {
      console.warn("WebSocket not initialized yet");
      setPopUpMessage("Server is starting, please wait");
      setPopUp(true); // Show the popup while waiting for the WebSocket to initialize
      setLoading(false); // Ensure loading is stopped
    }
  };


  return (
    <div className="w-full h-screen flex justify-center items-center bg-blue-950">
      {screenLoader ? (
        <div className="flex flex-col justify-center items-center">
          <Loader />
          <h1 className="text-white  text-lg mt-20 text-center absolute">
            Server is Starting, Please wait
          </h1>
        </div>
      ) : (
        <div className="w-80 bg-[#3760d121] rounded-md p-5 flex flex-col gap-2 relative z-30">

          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-[#26365fa6] bg-opacity-70 rounded-md z-40">
              <Loader />
            </div>
          )}


          <div className="relative h-2">
            {popUp && (
              <h1 className="text-white text-center w-full absolute -top-3 font-semibold  z-50">
                {popUpMessage}
              </h1>
            )}
          </div>

          <input
            type="text"
            placeholder="Enter nickName"
            value={nickName || ""}
            className="px-2 py-1 rounded-md outline-none font-semibold"
            onChange={(e) => {
              setNickName(e.target.value);
            }}
          />

          <div className="flex justify-center items-center gap-2 p-2 ">
            <UserProfile
              color="red"
              className={`w-1/5  text-red-500 hover:text-red-800 ${color == "red" && " text-red-800"}`}
              onClickFun={() => {
                setColor("red");
              }}
            />
            <UserProfile
              color="green"
              className={`w-1/5  text-green-500 hover:text-green-800 ${color == "green" && " text-green-800"}`}
              onClickFun={() => {
                setColor("green");
              }}
            />
            <UserProfile
              color="yellow"
              className={`w-1/5  text-yellow-500 hover:text-yellow-800 ${color == "yellow" && " text-yellow-800"}`}
              onClickFun={() => {
                setColor("yellow");
              }}
            />
            <UserProfile
              color="pink"
              className={`w-1/5  text-pink-500 hover:text-pink-800 ${color == "pink" && " text-pink-800"}`}
              onClickFun={() => {
                setColor("pink");
              }}
            />
            <UserProfile
              color="violet"
              className={`w-1/5  text-violet-500 hover:text-violet-800 ${color == "violet" && " text-violet-800"}`}
              onClickFun={() => {
                setColor("violet");
              }}
            />
          </div>
          <input
            type="text"
            name=""
            id=""
            placeholder="Game Id"
            className="px-2 py-1 rounded-md outline-none font-semibold"
            onChange={(e) => {
              setGameIdInput(e.target.value);
            }}
          />
          <button
            className="bg-[#38C41C] text-white px-2 py-3 rounded-lg font-semibold "
            onClick={() => {
              setPopUp(true);
              setPopUpMessage("please Wait");
              sendMessage({
                event: "join",
                clientId: clientId,
                gameId: gameIdInput,
                color: color,
                nickName: nickName,
              });
            }}
          >
            Join
          </button>
          <button
            className="bg-[#1671C5] text-white px-2 py-3 rounded-lg font-bold "
            onClick={() => {
              sendMessage({
                event: "create",
                clientId: clientId,
                nickName: nickName,
                color: color,
              });
            }}
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
