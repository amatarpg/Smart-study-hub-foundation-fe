import { create } from "zustand";
import { wsClient, type WsStatus } from "../lib/ws/client";
import type { WsEvent } from "../lib/api/types";

interface RealtimeState {
  status: WsStatus;
  events: WsEvent[];
  start: (onEvent?: (event: WsEvent) => void, onReconnect?: () => void) => void;
  stop: () => void;
}

const MAX_EVENTS = 50;

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  status: "idle",
  events: [],

  start: (onEvent, onReconnect) => {
    get().stop();
    void wsClient.start({
      onStatusChange: (status) => set({ status }),
      onEvent: (event) => {
        set((state) => ({ events: [event, ...state.events].slice(0, MAX_EVENTS) }));
        onEvent?.(event);
      },
      onReconnect: () => onReconnect?.(),
    });
  },

  stop: () => {
    wsClient.stop();
    set({ status: "idle" });
  },
}));
