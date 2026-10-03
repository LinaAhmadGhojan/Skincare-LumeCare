"use client";

// Small shared UI state: bag drawer, mobile menu and toast message.
import { useSyncExternalStore } from "react";

let state = { cart: false, menu: false, toast: "" };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout>;

function set(patch: Partial<typeof state>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const ui = {
  openCart: () => set({ cart: true, menu: false }),
  toggleMenu: () => set({ menu: !state.menu }),
  closeAll: () => { if (state.cart || state.menu) set({ cart: false, menu: false }); },
  toast(msg: string) {
    set({ toast: msg });
    clearTimeout(timer);
    timer = setTimeout(() => set({ toast: "" }), 2400);
  },
};

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useUi = () => useSyncExternalStore(subscribe, () => state, () => state);

export const when = (at: number) =>
  new Date(at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
