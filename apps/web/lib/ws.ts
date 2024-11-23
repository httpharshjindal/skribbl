// Ensure the WebSocket is a singleton instance to avoid multiple connections.
let socket: any;

export default function createWebSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    socket.onerror = (error: any) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (message: any) => {
      console.log("WebSocket message received:", message.data);
    };
  }

  return socket;
}
