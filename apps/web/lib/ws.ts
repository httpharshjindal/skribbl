let socket: WebSocket | null = null;

export default function createWebSocket() {
  // Ensure we don't create a new socket if one already exists and is open
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    // Make sure the WebSocket URL is defined in the environment variables
    const wsUrl = process.env.WS_URL || "wss://localhost:8080";
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
