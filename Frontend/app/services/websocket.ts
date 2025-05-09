import { io, Socket } from "socket.io-client";
import { addNotification } from "../redux/slice/notificationSlice";
import { store } from "../redux/store/store";

interface NotificationMessage {
  type: string;
  message: string;
  data?: any;
  timestamp?: string;
}

class WebSocketService {
  private socket: Socket | null = null;

  async connect(callback: (message: NotificationMessage) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const socketUrl = process.env.NODE_ENV === "production"
        ? "https://taskmangementwebsite.onrender.com"
        : "http://localhost:4000";

      this.socket = io(socketUrl, {
        path: "/socket.io",
        withCredentials: true,
        transports: ["websocket"]
      });

      this.socket.on("connect", () => {
        console.log("Socket.IO connected");

        // Ensure user is registered for notifications
        const userId = store.getState().Auth.user?.id;
        if (userId) {
          this.socket?.emit("register", userId);
        }

        resolve();
      });

      this.socket.on("notification", (message: NotificationMessage) => {
        this.handleNotification(message, callback);
      });

      this.socket.on("connect_error", (err) => {
        console.error("Socket.IO connection error:", err);
        reject(err);
      });
    });
  }

  private handleNotification(message: NotificationMessage, callback: (message: NotificationMessage) => void) {
    store.dispatch(
      addNotification({
        id: `${message.type}-${Date.now()}`,
        type: message.type,
        message: message.message,
        data: message.data,
        read: false,
        timestamp: message.timestamp || new Date().toISOString(),
      })
    );

    callback(message);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();
