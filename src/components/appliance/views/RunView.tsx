import { ApplianceMode, Zone } from "@/lib/appliance-types";
import { ANIMATED_ICON_MAP } from "../AnimatedIcons";

interface Props {
  mode: ApplianceMode;
  paused: boolean;
  done: boolean;
  zone: Zone;
  temp: number; // target
  liveTempA: number;
  liveTempB: number;
  remainingSec?: number;
  progressPct?: number;
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export const RunView = ({
  mode,
  paused,
  done,
  zone,
  temp,
  liveTempA,
  liveTempB,
  remainingSec,
  progressPct,
}: Props) => {
  const Icon = ANIMATED_ICON_MAP[mode.icon];
  const showA = zone === "A" || zone === "BOTH";
  const showB = zone === "B" || zone === "BOTH";

  return (
    <div className="h-full flex flex-col font-pixel">
      <div className="flex-1 flex items-stretch px-1 gap-1 min-h-0">
        {/* Left: Zone A */}
        <ZonePanel
          label="A"
          show={showA}
          live={liveTempA}
          target={temp}
          align="left"
        />

        {/* Center: animated icon + status */}
        <div className="flex flex-col items-center justify-center px-1 min-w-[90px]">
          <Icon size={36} animate={!paused} />
          <span className="text-[12px] leading-none mt-0.5 uppercase">{mode.name}</span>
          <span className={`text-[11px] leading-none mt-0.5 ${paused ? "lcd-blink" : ""}`}>
            {done ? "✓ READY" : paused ? "PAUSED" : "COOKING"}
          </span>
          {!done && (
            <span className="text-[18px] leading-none mt-0.5">
              {fmtTime(remainingSec ?? 0)}
            </span>
          )}
        </div>

        {/* Right: Zone B */}
        <ZonePanel
          label="B"
          show={showB}
          live={liveTempB}
          target={temp}
          align="right"
        />
      </div>

      {/* Bottom progress bar */}
      <div className="h-[5px] w-full border-t border-lcd-pixel/40 relative bg-lcd-pixel/5">
        <div
          className={`h-full bg-lcd-pixel ${paused ? "lcd-blink" : ""}`}
          style={{ width: `${progressPct ?? 0}%` }}
        />
      </div>
    </div>
  );
};

const ZonePanel = ({
  label,
  show,
  live,
  target,
  align,
}: {
  label: string;
  show: boolean;
  live: number;
  target: number;
  align: "left" | "right";
}) => {
  if (!show) {
    return (
      <div
        className={`flex-1 flex flex-col justify-center ${
          align === "left" ? "items-start pl-2 border-r" : "items-end pr-2 border-l"
        } border-lcd-pixel/30 opacity-30`}
      >
        <span className="text-[12px] leading-none">ZONE {label}</span>
        <span className="text-[11px] leading-none mt-0.5">— OFF —</span>
      </div>
    );
  }
  const liveR = Math.round(live);
  const reached = Math.abs(target - liveR) < 5;
  return (
    <div
      className={`flex-1 flex flex-col justify-center ${
        align === "left" ? "items-start pl-2 border-r" : "items-end pr-2 border-l"
      } border-lcd-pixel/30`}
    >
      <span className="text-[12px] leading-none opacity-80">ZONE {label}</span>
      <span className="text-[18px] leading-none mt-0.5">
        {liveR}°C {!reached && <span className="text-[14px]">↑</span>}
      </span>
      <span className="text-[10px] leading-none opacity-70 mt-0.5">
        TGT {target}°C
      </span>
    </div>
  );
};
