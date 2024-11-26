let socket: WebSocket | null = null;

export default function createWebSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    const wsUrl = process.env.WS_URL || "wss://skribblll.onrender.com";
    if (!wsUrl) {
      throw new Error("WebSocket URL (WS_URL) is not defined.");
    }

    // Create the WebSocket instance
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    socket.onerror = (error: any) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (message: MessageEvent) => {
      console.log("WebSocket message received:", message.data);
    };
  }

  return socket;
}
