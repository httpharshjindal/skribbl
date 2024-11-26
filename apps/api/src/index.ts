import express, { json } from "express";
import { v4 as uuidv4 } from "uuid";
import { hash, compare } from "bcryptjs";
import cors from "cors";
const PORT = process.env.PORT || 3000;
import { WebSocket, WebSocketServer } from "ws";
const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "connected successfully",
  });
});
const httpServer = app.listen(PORT, () => {
  console.log(`server listining on port${PORT}`);
});
const wss = new WebSocketServer({ server: httpServer });

interface client {
  connection: WebSocket;
}

interface GameClient {
  nickName: string;
  clientId: string;
  color: string;
  score: number;
  guessed?: boolean;
}

interface Game {
  id: string;
  hostId: string;
  clients: Record<string, GameClient>;
  state: {
    messages: Array<{
      clientId: string;
      nickName: string;
      message: string;
    }>;
    drawing: Array<{
      startX: number;
      endX: number;
      startY: number;
      endY: number;
      color: string;
    }>;
  };
  currentTurn: number;
  isGameOver: boolean;
  isGameStarted: boolean;
  selectedPlayer: string;
  selectedWord: string;
  wordLength:number
}

const words = [
  "cat",
  "rat",
  "car",
  "pen",
  "caterpillar",
  "rocket",
  "alligator",
  "pizza",
  "shirt",
  "kite",
  "eyes",
  "chair",
  "cup",
  "jacket",
  "hippo",
  "bird",
  "monster",
  "bracelet",
  "coat",
  "balloon",
  "dinosaur",
  "head",
  "book",
  "mouse",
  "smile",
  "bridge",
  "blocks",
  "milk",
  "eye",
  "oval",
  "snowflake",
  "broom",
  "cheese",
  "lion",
  "lips",
  "beach",
  "cloud",
  "bus",
  "elephant",
  "sunglasses",
  "lemon",
  "star",
  "spoon",
  "boat",
  "turtle",
  "drum",
  "doll",
  "ant",
  "motorcycle",
  "bike",
  "pencil",
  "bunk bed",
  "moon",
  "inchworm",
  "slide",
  "hat",
  "tail",
  "helicopter",
  "square",
  "Mickey Mouse",
  "octopus",
  "door",
  "table",
  "egg",
  "bell",
  "nose",
  "spider",
  "horse",
  "finger",
  "glasses",
  "jar",
  "girl",
  "ear",
  "lizard",
  "flower",
  "snowman",
  "baby",
  "bread",
  "blanket",
  "apple",
  "bench",
  "skateboard",
  "pig",
  "ice cream cone",
  "frog",
  "feet",
  "lollipop",
  "heart",
  "ears",
  "bed",
  "carrot",
  "person",
  "boy",
];
const clients: Record<string, client> = {};
const games: Record<string, Game> = {};

let broadcastInterval;

wss.on("connection", function connection(socket) {
  socket.on("error", console.error);
  console.log(wss.clients);
  socket.on("message", async function message(data, isBinary) {
    try {
      if (!isBinary) {
        const message = JSON.parse(data.toString());

        // create
        if (message.event == "create") {
          broadcast();
          const gameId = uuidv4();
          const color = message.color;
          const clientId = message.clientId;
          const nickName = message.nickName;
          games[gameId] = {
            id: gameId,
            hostId: clientId,
            clients: {},
            currentTurn: 0,
            isGameOver: false,
            isGameStarted: false,
            selectedPlayer: "",
            selectedWord: "",
            wordLength:0,
            state: {
              messages: [],
              drawing: [],
            },
          };

          games[gameId].clients[clientId] = {
            nickName: nickName,
            clientId: clientId,
            color: color,
            score: 0,
          };
          const con = clients[clientId].connection;
          con.send(
            JSON.stringify({
              event: "create",
              game: games[gameId],
              gameId: gameId,
            })
          );
          console.log(games), console.log(clients);
          broadcast();
        }

        //join
        if (message.event == "join") {
          const gameId = message.gameId;
          const clientId = message.clientId;
          const color = message.color;
          const nickName = message.nickName;
          if (!games[gameId]) {
            console.error("Game not found:", gameId);
            return;
          }
          games[gameId].clients[clientId] = {
            nickName: nickName,
            clientId: clientId,
            color: color,
            score: 0,
          };

          console.log("clients:", games[gameId].clients);
          for (let c of Object.keys(games[gameId].clients)) {
            const con = clients[c].connection;
            con.send(
              JSON.stringify({
                event: "join",
                clients: games[gameId].clients,
              })
            );
          }

          broadcast();
        }

        //start
        if (message.event == "start") {
          const gameId = message.gameId;

          if (!games[gameId]) {
            console.error("Game not found:", gameId);
            return;
          }

          if (
            !games[gameId].clients ||
            Object.keys(games[gameId].clients).length === 0
          ) {
            console.error("No players in the game:", gameId);
            return;
          }

          console.log("Starting game for gameId:", gameId);
          games[gameId].isGameStarted = true;
          startTurnCycle(gameId);
          handleTurn(gameId);
          broadcast();
        }

        //draw
        if (message.event == "draw") {
          const gameId = message.gameId;
          const clientId = message.clientId;
          if (!games[gameId]) {
            console.error("Game not found:", gameId);
            return;
          }
          games[gameId].state?.drawing.push({
            startX: message.startX,
            endX: message.endX,
            startY: message.startY,
            endY: message.endY,
            color: message.color,
          });
          broadcast();
        }

        if (message.event == "clear") {
          const clientId = message.clientId;
          const gameId = message.gameId;
          if (!games[gameId]) {
            console.error("Game not found:", gameId);
            return;
          }
          if (games[gameId].state) {
            games[gameId].state.drawing = [];
            broadcast();
          } else {
            console.error(`State is undefined for gameId: ${gameId}`);
          }

          for (const c of Object.keys(games[gameId].clients)) {
            clients[c].connection.send(
              JSON.stringify({
                event: "clear",
              })
            );
          }
          broadcast();
        }
        // guess
        if (message.event == "message") {
          try {
            broadcast();
            const gameId = message.gameId;
            const clientId = message.clientId;
            if (!games[gameId]) {
              console.error("Game not found:", gameId);
              return;
            }

            const result = await compare(
              message.message,
              games[gameId].selectedWord
            );

            if (result) {
              games[gameId].clients[clientId].score += 100;
              games[gameId].clients[clientId].guessed = true;
              const allGuessed = Object.values(games[gameId].clients).every(
                (client) => client.guessed === true
              );
              if (allGuessed) {
                handleTurn(gameId);
              }
              clients[clientId].connection.send(
                JSON.stringify({
                  event: "guessed-correctly",
                  clientId: clientId,
                })
              );
              broadcast();
              return;
            }

            games[gameId].state?.messages.push({
              clientId: message.clientId,
              nickName: message.nickName,
              message: message.message,
            });
            broadcast();
          } catch (e) {
            console.log(e);
          }
        }
      }
    } catch (e) {
      socket.send(
        JSON.stringify({
          error: "Invalid JSON format",
          original: data.toString(),
        })
      );
    }
  });

  const clientId = uuidv4();
  clients[clientId] = {
    connection: socket,
  };

  socket.send(
    JSON.stringify({
      message: "you are connected to server",
      clientId: clientId,
    })
  );
});

// functions

const broadcast = () => {
  for (const g of Object.keys(games)) {
    if (!games[g]) {
      console.error("Game not found:", g);
      return;
    }
    for (const c of Object.keys(games[g].clients)) {
      const con = clients[c].connection;
      con.send(
        JSON.stringify({
          event: "state",
          game: games[g],
        })
      );
    }
  }
};

const sendRandomWordToPlayer = async (
  player: any,
  gameId: string,
  currentClient: string
) => {
  const randomWord = words[Math.floor(Math.random() * words.length)];
  games[gameId].wordLength = randomWord.length
  try {
    games[gameId].selectedWord = await hash(randomWord, 10);
    games[gameId].wordLength = randomWord.length
  } catch (e) {
    console.log(e);
  }
  player.connection.send(
    JSON.stringify({
      event: "your-turn",
      word: randomWord,
      wordLength:games[gameId].wordLength
    })
  );
  games[gameId].clients[currentClient].guessed = true;
};

const notifyOtherPlayers = ({
  exceptPlayerId,
  gameId,
}: {
  exceptPlayerId: string;
  gameId: string;
}) => {
  for (const c of Object.keys(games[gameId].clients)) {
    if (c !== exceptPlayerId) {
      clients[c].connection.send(
        JSON.stringify({
          event: "turn-notification",
          user: exceptPlayerId,
          wordLength:games[gameId].wordLength
        })
      );
    }
  }
};

function handleTurn(gameId: string, turnInterval?: any) {
  if (games[gameId].currentTurn == Object.keys(games[gameId].clients).length) {
    setTimeout(() => {
      endGame(gameId);
    }, 5000);
    return;
  }
  if (
    !games[gameId] ||
    !games[gameId].clients ||
    Object.keys(games[gameId].clients).length === 0
  ) {
    console.error("Invalid game or no players. Stopping turn cycle.");
    clearInterval(turnInterval);
    return;
  }
  const currentClient = Object.keys(games[gameId].clients)[
    games[gameId].currentTurn
  ];
  games[gameId].selectedPlayer = currentClient;
  if (!currentClient) {
    clearInterval(turnInterval);
    console.error("Current client not found. Skipping turn.");
    return;
  }

  console.log(
    "Current turn:",
    games[gameId].currentTurn,
    "for player:",
    currentClient
  );

  // Notify the current player
  sendRandomWordToPlayer(clients[currentClient], gameId, currentClient);

  // Notify other players
  notifyOtherPlayers({
    exceptPlayerId: currentClient,
    gameId: gameId,
  });

  for (const c of Object.keys(games[gameId].clients)) {
    games[gameId].clients[c].guessed = false;
  }
  games[gameId].currentTurn = games[gameId].currentTurn + 1;
  games[gameId].state.messages = [];
  games[gameId].state.drawing = [];
}

function startTurnCycle(gameId: string) {
  console.log("Starting turn cycle for game:", gameId);
  const game = games[gameId];
  if (
    !games[gameId] ||
    !games[gameId].clients ||
    Object.keys(games[gameId].clients).length === 0
  ) {
    console.error("Invalid game or no players. Stopping turn cycle.");
    return;
  }
  const turnInterval = setInterval(() => {
    if (games[gameId] && games[gameId].clients) {
      if (
        games[gameId].currentTurn == Object.keys(games[gameId].clients).length
      ) {
        console.log("All players have taken their turn. Ending game.");
        setTimeout(() => {
          endGame(gameId);
        }, 5000);
        clearInterval(turnInterval);
        return;
      } else {
        handleTurn(gameId, turnInterval);
      }
    }
  }, 60000);
}

function endGame(gameId: string) {
  if (!games[gameId]) {
    console.error(`Game with ID ${gameId} not found.`);
    return;
  }

  if (games[gameId].clients) {
    for (const c of Object.keys(games[gameId].clients)) {
      const clientConnection = clients[c]?.connection;
      if (clientConnection) {
        clientConnection.send(
          JSON.stringify({
            event: "game-over",
            message: "The game has ended!",
          })
        );
      }
    }
  }

  // Remove the game from the games object
  games[gameId].isGameOver = true;
  games[gameId].currentTurn = 0;
  delete games[gameId];
  console.log(`Game with ID ${gameId} has been removed.`);
}
setInterval(() => {
  broadcast()
}, 3000);