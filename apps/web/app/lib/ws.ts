let socket: WebSocket | null = null;

export default function createWebSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
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
      console.log("WebSocket error:", error);
    };

    socket.onmessage = (message: MessageEvent) => {
      console.log("WebSocket message received:", message.data);
    };
  }

  return socket;
}
