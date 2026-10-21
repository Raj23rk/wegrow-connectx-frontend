import { io } from 'socket.io-client';

const DEFAULT_BACKEND_URL = 'https://wegrow-connectx-backend.onrender.com';
const envBackendUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const rawBackendUrl = envBackendUrl || (isLocal ? '' : DEFAULT_BACKEND_URL);
const SOCKET_URL = rawBackendUrl ? rawBackendUrl.replace(/\/api$/, '') : '/';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket && this.userId === userId) return;

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', this.socket.id);
      if (this.userId) {
        this.socket.emit('auth:register', { userId: this.userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    // Reattach listeners if any
    for (const [event, callbacks] of this.listeners.entries()) {
      callbacks.forEach(cb => this.socket.on(event, cb));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  joinChannel(channelId) {
    if (this.socket) this.socket.emit('channel:join', { channelId });
  }

  leaveChannel(channelId) {
    if (this.socket) this.socket.emit('channel:leave', { channelId });
  }

  joinChat(chatId) {
    if (this.socket) this.socket.emit('chat:join', { chatId });
  }

  leaveChat(chatId) {
    if (this.socket) this.socket.emit('chat:leave', { chatId });
  }

  startTyping(contextType, contextId, user) {
    if (this.socket) this.socket.emit('typing:start', { contextType, contextId, user });
  }

  stopTyping(contextType, contextId, user) {
    if (this.socket) this.socket.emit('typing:stop', { contextType, contextId, user });
  }

  changeStatus(userId, status, statusMessage) {
    if (this.socket) this.socket.emit('status:change', { userId, status, statusMessage });
  }

  // Direct Call signaling
  initiateCall(callData) {
    if (this.socket) this.socket.emit('call:initiate', callData);
  }

  acceptCall(callData) {
    if (this.socket) this.socket.emit('call:accept', callData);
  }

  rejectCall(callData) {
    if (this.socket) this.socket.emit('call:reject', callData);
  }

  endCall(callData) {
    if (this.socket) this.socket.emit('call:end', callData);
  }

  sendCallSignal(signalData) {
    if (this.socket) this.socket.emit('call:signal', signalData);
  }

  sendCallBusy(busyData) {
    if (this.socket) this.socket.emit('call:busy', busyData);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
