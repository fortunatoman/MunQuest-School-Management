import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:1000';
    console.log('🌐 Backend URL configured:', this.backendUrl);
  }

  connect(): Socket {
    if (!this.socket) {
      console.log('🔌 Connecting to socket server:', this.backendUrl);
      this.socket = io(this.backendUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.socket?.id);
        console.log('📡 Socket transport:', this.socket?.io.engine.transport.name);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🚨 Connection error:', error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('🚨 Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('🚨 Reconnection failed - giving up');
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
