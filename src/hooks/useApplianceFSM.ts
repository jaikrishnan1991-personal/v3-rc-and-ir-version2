import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  AMBIENT_TEMP_C,
  ApplianceMode,
  ApplianceState,
  ButtonId,
  ERROR_DETAILS,
  ErrorCode,
  MODES,
  WifiState,
  Zone,
} from "@/lib/appliance-types";

export type ManualField = "TEMP" | "TIME" | "ZONE";
export type AutoField = "QTY" | "THICK" | "OIL" | "ZONE";

interface State {
  state: ApplianceState;
  prevState: ApplianceState | null;
  cursorIndex: number; // menu cursor
  selectedModeId: string | null;
  // setup params
  temp: number;
  timeSec: number;
  quantity: number;
  thickness: number;
  oil: number;
  // setup field cursor
  manualField: ManualField;
  autoField: AutoField;
  // running
  remainingSec: number;
  progressPct: number;
  totalSec: number;
  liveTempA: number;
  liveTempB: number;
  // misc
  wifi: WifiState;
  zone: Zone;
  childLockHoldStart: number | null;
  childLockProgress: number;
  error: ErrorCode | null;
  bootProgress: number;
}

type Action =
  | { type: "TICK_SLOW" }
  | { type: "TICK_TEMP" }
  | { type: "TICK_BOOT" }
  | { type: "BOOT_DONE" }
  | { type: "WIFI"; wifi: WifiState }
  | { type: "PRESS"; btn: ButtonId }
  | { type: "INJECT_ERROR"; code: ErrorCode }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOCK_PROGRESS"; v: number }
  | { type: "ENTER_LOCK" }
  | { type: "EXIT_LOCK" }
  | { type: "SET_ZONE"; zone: Zone }
  | { type: "TOGGLE_ZONE" };

const initial: State = {
  state: "BOOT",
  prevState: null,
  cursorIndex: 0,
  selectedModeId: null,
  temp: 200,
  timeSec: 300,
  quantity: 1,
  thickness: 3,
  oil: 1,
  manualField: "TEMP",
  autoField: "QTY",
  remainingSec: 0,
  progressPct: 0,
  totalSec: 0,
  liveTempA: AMBIENT_TEMP_C,
  liveTempB: AMBIENT_TEMP_C,
  wifi: "SEARCHING",
  zone: "A",
  childLockHoldStart: null,
  childLockProgress: 0,
  error: null,
  bootProgress: 0,
};

const getMode = (id: string | null): ApplianceMode | null =>
  MODES.find((m) => m.id === id) ?? null;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const MANUAL_FIELDS: ManualField[] = ["TEMP", "TIME", "ZONE"];
const AUTO_FIELDS_FORCED: AutoField[] = ["QTY", "THICK", "OIL"]; // Dosa/Crepe — zone locked to BOTH
const AUTO_FIELDS_FULL: AutoField[] = ["QTY", "THICK", "OIL", "ZONE"];

const isForcedZoneMode = (m: ApplianceMode | null) =>
  !!m && (m.id === "dosa" || m.id === "crepe");

const cycleZone = (z: Zone, dir: 1 | -1): Zone => {
  const order: Zone[] = ["A", "B", "BOTH"];
  const i = order.indexOf(z);
  const n = (i + dir + order.length) % order.length;
  return order[n];
};

// Realistic ramp toward target with small jitter
const rampTemp = (current: number, target: number | null): number => {
  if (target == null) {
    // cool toward ambient
    const delta = AMBIENT_TEMP_C - current;
    return current + Math.sign(delta) * Math.min(Math.abs(delta), 1.2);
  }
  const delta = target - current;
  if (Math.abs(delta) < 2.5) {
    // hold near target with ±2°C jitter
    return target + (Math.random() * 4 - 2);
  }
  // Climb ~3-6°C/s when far, slowing as we approach
  const rate = clamp(Math.abs(delta) * 0.08, 1.5, 6);
  return current + Math.sign(delta) * rate + (Math.random() * 1.2 - 0.6);
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "TICK_BOOT": {
      const next = Math.min(100, s.bootProgress + 5);
      return { ...s, bootProgress: next };
    }
    case "TICK_SLOW": {
      if (s.state === "RUNNING") {
        const mode = getMode(s.selectedModeId);
        if (mode?.kind === "MANUAL") {
          const next = Math.max(0, s.remainingSec - 1);
          const pct = s.totalSec > 0 ? Math.round(((s.totalSec - next) / s.totalSec) * 100) : 0;
          if (next === 0) return { ...s, remainingSec: 0, progressPct: 100, state: "DONE" };
          return { ...s, remainingSec: next, progressPct: pct };
        }
        if (mode?.kind === "AUTO") {
          const next = Math.min(100, s.progressPct + 2);
          const remaining = Math.max(0, s.remainingSec - 1);
          if (next >= 100) return { ...s, progressPct: 100, remainingSec: 0, state: "DONE" };
          return { ...s, progressPct: next, remainingSec: remaining };
        }
      }
      return s;
    }
    case "TICK_TEMP": {
      // Live temperature simulation
      const targetA =
        s.state === "RUNNING" && (s.zone === "A" || s.zone === "BOTH") ? s.temp : null;
      const targetB =
        s.state === "RUNNING" && (s.zone === "B" || s.zone === "BOTH") ? s.temp : null;
      return {
        ...s,
        liveTempA: rampTemp(s.liveTempA, targetA),
        liveTempB: rampTemp(s.liveTempB, targetB),
      };
    }
    case "BOOT_DONE":
      return { ...s, state: "MENU", bootProgress: 100 };
    case "WIFI":
      return { ...s, wifi: a.wifi };
    case "SET_ZONE":
      return { ...s, zone: a.zone };
    case "TOGGLE_ZONE":
      return { ...s, zone: cycleZone(s.zone, 1) };
    case "INJECT_ERROR":
      return { ...s, prevState: s.state, state: "ERROR", error: a.code };
    case "CLEAR_ERROR":
      return { ...s, state: s.prevState ?? "MENU", error: null, prevState: null };
    case "SET_LOCK_PROGRESS":
      return { ...s, childLockProgress: a.v };
    case "ENTER_LOCK":
      return { ...s, prevState: s.state, state: "LOCKED", childLockProgress: 0, childLockHoldStart: null };
    case "EXIT_LOCK":
      return { ...s, state: s.prevState ?? "MENU", prevState: null, childLockProgress: 0, childLockHoldStart: null };
    case "PRESS": {
      if (s.state === "LOCKED") return s;
      if (s.state === "ERROR") {
        if (a.btn === "BACK" || a.btn === "POWER") {
          return { ...s, state: s.prevState ?? "MENU", error: null, prevState: null };
        }
        return s;
      }
      switch (a.btn) {
        case "POWER":
          return {
            ...s,
            state: "MENU",
            selectedModeId: null,
            remainingSec: 0,
            progressPct: 0,
            totalSec: 0,
            liveTempA: AMBIENT_TEMP_C,
            liveTempB: AMBIENT_TEMP_C,
          };
        case "UP":
        case "DOWN": {
          const dir = a.btn === "UP" ? -1 : 1;
          if (s.state === "MANUAL_SETUP") {
            const i = MANUAL_FIELDS.indexOf(s.manualField);
            const n = (i + dir + MANUAL_FIELDS.length) % MANUAL_FIELDS.length;
            return { ...s, manualField: MANUAL_FIELDS[n] };
          }
          if (s.state === "AUTO_SETUP") {
            const mode = getMode(s.selectedModeId);
            const fields = isForcedZoneMode(mode) ? AUTO_FIELDS_FORCED : AUTO_FIELDS_FULL;
            const i = Math.max(0, fields.indexOf(s.autoField));
            const n = (i + dir + fields.length) % fields.length;
            return { ...s, autoField: fields[n] };
          }
          return s;
        }
        case "LEFT":
        case "RIGHT": {
          const dir = a.btn === "LEFT" ? -1 : 1;
          if (s.state === "MENU") {
            // Horizontal menu navigation (V2)
            return { ...s, cursorIndex: (s.cursorIndex + dir + MODES.length) % MODES.length };
          }
          if (s.state === "MANUAL_SETUP") {
            const mode = getMode(s.selectedModeId);
            if (!mode) return s;
            if (s.manualField === "TEMP") {
              const r = mode.ranges?.temp ?? [80, 300, 5];
              return { ...s, temp: clamp(s.temp + dir * r[2], r[0], r[1]) };
            }
            if (s.manualField === "TIME") {
              const r = mode.ranges?.timeSec ?? [15, 99 * 60 + 45, 15];
              return { ...s, timeSec: clamp(s.timeSec + dir * r[2], r[0], r[1]) };
            }
            if (s.manualField === "ZONE") {
              return { ...s, zone: cycleZone(s.zone, dir as 1 | -1) };
            }
            return s;
          }
          if (s.state === "AUTO_SETUP") {
            const mode = getMode(s.selectedModeId);
            if (!mode) return s;
            if (isForcedZoneMode(mode) && s.autoField === "ZONE") return s;
            if (s.autoField === "QTY") {
              const r = mode.ranges?.quantity ?? [1, 99, 1];
              return { ...s, quantity: clamp(s.quantity + dir * r[2], r[0], r[1]) };
            }
            if (s.autoField === "THICK") {
              const r = mode.ranges?.thickness ?? [1, 5, 1];
              return { ...s, thickness: clamp(s.thickness + dir * r[2], r[0], r[1]) };
            }
            if (s.autoField === "OIL") {
              const r = mode.ranges?.oil ?? [0, 3, 1];
              return { ...s, oil: clamp(s.oil + dir * r[2], r[0], r[1]) };
            }
            if (s.autoField === "ZONE") {
              return { ...s, zone: cycleZone(s.zone, dir as 1 | -1) };
            }
          }
          return s;
        }
        case "SELECT": {
          if (s.state === "MENU") {
            const mode = MODES[s.cursorIndex];
            const forcedZone: Zone | null = isForcedZoneMode(mode) ? "BOTH" : null;
            return {
              ...s,
              selectedModeId: mode.id,
              temp: mode.defaults.temp ?? s.temp,
              timeSec: mode.defaults.timeSec ?? s.timeSec,
              quantity: mode.defaults.quantity ?? s.quantity,
              thickness: mode.defaults.thickness ?? s.thickness,
              oil: mode.defaults.oil ?? s.oil,
              manualField: "TEMP",
              autoField: "QTY",
              zone: forcedZone ?? (s.zone === "BOTH" ? "A" : s.zone),
              state: mode.kind === "AUTO" ? "AUTO_SETUP" : "MANUAL_SETUP",
            };
          }
          return s;
        }
        case "BACK": {
          if (s.state === "AUTO_SETUP" || s.state === "MANUAL_SETUP") {
            return { ...s, state: "MENU", selectedModeId: null };
          }
          if (s.state === "RUNNING" || s.state === "PAUSED" || s.state === "DONE") {
            return {
              ...s,
              state: "MENU",
              selectedModeId: null,
              remainingSec: 0,
              progressPct: 0,
              totalSec: 0,
              liveTempA: AMBIENT_TEMP_C,
              liveTempB: AMBIENT_TEMP_C,
            };
          }
          return s;
        }
        case "START": {
          if (s.state === "MANUAL_SETUP") {
            return {
              ...s,
              state: "RUNNING",
              remainingSec: s.timeSec,
              totalSec: s.timeSec,
              progressPct: 0,
              liveTempA: AMBIENT_TEMP_C,
              liveTempB: AMBIENT_TEMP_C,
            };
          }
          if (s.state === "AUTO_SETUP") {
            // estimated cycle time ~ 50s — drives temp ramp visualisation
            const est = 50;
            return {
              ...s,
              state: "RUNNING",
              progressPct: 0,
              remainingSec: est,
              totalSec: est,
              temp: 220, // implicit auto target
              liveTempA: AMBIENT_TEMP_C,
              liveTempB: AMBIENT_TEMP_C,
            };
          }
          if (s.state === "PAUSED") return { ...s, state: "RUNNING" };
          return s;
        }
        case "PAUSE": {
          if (s.state === "RUNNING") return { ...s, state: "PAUSED" };
          if (s.state === "PAUSED") return { ...s, state: "RUNNING" };
          return s;
        }
      }
      return s;
    }
  }
}

const LOCK_HOLD_MS = 3000;

export function useApplianceFSM() {
  const [state, dispatch] = useReducer(reducer, initial);

  const downRef = useRef<Record<ButtonId, boolean>>({
    POWER: false, BACK: false, START: false, PAUSE: false,
    UP: false, DOWN: false, LEFT: false, RIGHT: false, SELECT: false,
  });
  const lockStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Boot sequence — explicit 2s splash
  useEffect(() => {
    const t1 = setTimeout(() => dispatch({ type: "WIFI", wifi: "CONNECTED" }), 1400);
    const t2 = setTimeout(() => dispatch({ type: "BOOT_DONE" }), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Boot progress bar
  useEffect(() => {
    if (state.state !== "BOOT") return;
    const id = setInterval(() => dispatch({ type: "TICK_BOOT" }), 100);
    return () => clearInterval(id);
  }, [state.state]);

  // 1Hz cycle tick
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "TICK_SLOW" }), 1000);
    return () => clearInterval(id);
  }, []);

  // 4Hz live temperature tick
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "TICK_TEMP" }), 250);
    return () => clearInterval(id);
  }, []);

  // Auto-clear errors with autoClearMs
  useEffect(() => {
    if (state.state !== "ERROR" || !state.error) return;
    const def = ERROR_DETAILS[state.error];
    if (def.autoClearMs) {
      const id = setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), def.autoClearMs);
      return () => clearTimeout(id);
    }
  }, [state.state, state.error]);

  // Child-lock hold detection
  useEffect(() => {
    const loop = () => {
      const both = downRef.current.BACK && downRef.current.PAUSE;
      if (both) {
        if (lockStartRef.current == null) lockStartRef.current = performance.now();
        const elapsed = performance.now() - lockStartRef.current;
        const progress = Math.min(1, elapsed / LOCK_HOLD_MS);
        dispatch({ type: "SET_LOCK_PROGRESS", v: progress });
        if (progress >= 1) {
          if (state.state === "LOCKED") dispatch({ type: "EXIT_LOCK" });
          else dispatch({ type: "ENTER_LOCK" });
          lockStartRef.current = null;
          downRef.current.BACK = false;
          downRef.current.PAUSE = false;
          dispatch({ type: "SET_LOCK_PROGRESS", v: 0 });
        }
      } else {
        if (lockStartRef.current != null) {
          lockStartRef.current = null;
          dispatch({ type: "SET_LOCK_PROGRESS", v: 0 });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state.state]);

  const press = useCallback((btn: ButtonId) => {
    dispatch({ type: "PRESS", btn });
  }, []);

  const setDown = useCallback((btn: ButtonId, isDown: boolean) => {
    downRef.current[btn] = isDown;
  }, []);

  const injectError = useCallback((code: ErrorCode) => {
    dispatch({ type: "INJECT_ERROR", code });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);
  const toggleZone = useCallback(() => dispatch({ type: "TOGGLE_ZONE" }), []);
  const setWifi = useCallback((w: WifiState) => dispatch({ type: "WIFI", wifi: w }), []);

  return { state, press, setDown, injectError, clearError, toggleZone, setWifi };
}
