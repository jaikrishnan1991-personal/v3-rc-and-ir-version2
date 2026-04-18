import { MODES } from "@/lib/appliance-types";
import { ANIMATED_ICON_MAP } from "../AnimatedIcons";

interface Props {
  cursor: number;
}

export const MenuView = ({ cursor }: Props) => {
  // V2: large animated icons — show 5 at a time, centered around cursor
  const visibleCount = 5;
  const half = Math.floor(visibleCount / 2);
  const items = Array.from({ length: visibleCount }, (_, i) => {
    const idx = (cursor - half + i + MODES.length) % MODES.length;
    return { mode: MODES[idx], idx, isCursor: i === half, slot: i };
  });

  return (
    <div className="h-full flex flex-col px-2 py-0.5">
      <div className="flex items-center justify-between font-pixel text-[12px] leading-none mb-0.5 opacity-90">
        <span>◀ SELECT MODE ▶</span>
        <span className="opacity-70">
          {cursor + 1}/{MODES.length} · {MODES[cursor].kind === "AUTO" ? "AUTO" : "MANUAL"}
        </span>
      </div>
      <div className="flex-1 grid grid-cols-5 gap-1 items-center">
        {items.map(({ mode, isCursor, slot }) => {
          const Icon = ANIMATED_ICON_MAP[mode.icon];
          // distance from center for fade
          const dist = Math.abs(slot - half);
          const opacity = isCursor ? 1 : dist === 1 ? 0.55 : 0.25;
          return (
            <div
              key={`${mode.id}-${slot}`}
              className={`flex flex-col items-center justify-center h-full rounded-sm transition-all ${
                isCursor
                  ? "bg-lcd-pixel/10 outline outline-1 outline-lcd-pixel scale-105"
                  : ""
              }`}
              style={{ opacity }}
            >
              <Icon size={isCursor ? 36 : 26} animate={isCursor} />
              <span className="font-pixel text-[12px] leading-none mt-0.5 uppercase">
                {mode.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
