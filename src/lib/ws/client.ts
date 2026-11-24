import { api } from "../api/client";
import type { WsEvent } from "../api/types";

export type WsStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

export interface WsClientOptions {
  onEvent: (event: WsEvent) => void;
  onStatusChange?: (status: WsStatus) => void;
  onReconnect?: () => void;
}

const PING_INTERVAL_MS = 20_000;
const MAX_SEEN_EVENTS = 500;

export class WsClient {
  private socket: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private seen = new Set<string>();
  private status: WsStatus = "idle";
  private options: WsClientOptions | null = null;
  private running = false;

  get currentStatus(): WsStatus {
    return this.status;
  }

  private setStatus(status: WsStatus): void {
    this.status = status;
    this.options?.onStatusChange?.(status);
  }

  async start(options: WsClientOptions): Promise<void> {
    this.options = options;
    this.running = true;
    await this.connect();
  }

  stop(): void {
    this.running = false;
    this.clearTimers();
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.setStatus("idle");
  }

  private clearTimers(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.pingTimer = null;
    this.reconnectTimer = null;
  }

  private wsUrl(ticket: string): string {
    const base = api.baseUrl || window.location.origin;
    const url = new URL(`${base.replace(/\/$/, "")}/api/v1/ws`);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("ticket", ticket);
    return url.toString();
  }

  private async connect(): Promise<void> {
    if (!this.running) return;
    this.setStatus(this.attempts > 0 ? "reconnecting" : "connecting");
    try {
      const { ticket } = await api.post<{ ticket: string; expires_in: number }>("/api/v1/auth/ws-ticket");
      if (!this.running) return;
      const socket = new WebSocket(this.wsUrl(ticket));
      this.socket = socket;
      socket.onopen = () => {
        this.attempts = 0;
        this.setStatus("connected");
        this.pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data as string) as WsEvent;
          if (!event?.event_id || this.seen.has(event.event_id)) return;
          this.seen.add(event.event_id);
          if (this.seen.size > MAX_SEEN_EVENTS) {
            const first = this.seen.values().next().value;
            if (first) this.seen.delete(first);
          }
          this.options?.onEvent(event);
        } catch {
          return;
        }
      };
      socket.onclose = () => {
        this.clearTimers();
        this.socket = null;
        if (!this.running) return;
        this.attempts += 1;
        this.setStatus("reconnecting");
        this.options?.onReconnect?.();
        const delay = Math.min(30_000, 1_000 * 2 ** Math.min(this.attempts, 5));
        this.reconnectTimer = setTimeout(() => {
          void this.connect();
        }, delay);
      };
      socket.onerror = () => {
        socket.close();
      };
    } catch {
      if (!this.running) return;
      this.attempts += 1;
      this.setStatus("reconnecting");
      const delay = Math.min(30_000, 1_000 * 2 ** Math.min(this.attempts, 5));
      this.reconnectTimer = setTimeout(() => {
        void this.connect();
      }, delay);
    }
  }
}

export const wsClient = new WsClient();
