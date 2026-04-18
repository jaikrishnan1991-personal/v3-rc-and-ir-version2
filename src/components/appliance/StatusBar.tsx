import { WifiIcon, PadlockIcon } from "./icons";
import { WifiState, Zone } from "@/lib/appliance-types";

interface Props {
  wifi: WifiState;
  locked: boolean;
  zone: Zone;
  clock?: string;
  ssid?: string;
}

export const StatusBar = ({ wifi, locked, zone, clock = "12:00", ssid = "EvoChef Office" }: Props) => {
  const bars = wifi === "CONNECTED" ? 3 : wifi === "ERROR" ? 1 : 2;
  const wifiLabel =
    wifi === "CONNECTED" ? ssid : wifi === "ERROR" ? "OFFLINE" : "CONN..";
  const aOn = zone === "A" || zone === "BOTH";
  const bOn = zone === "B" || zone === "BOTH";

  return (
    <div className="flex items-center justify-between px-2 py-0.5 border-b border-lcd-pixel/40 font-pixel text-[13px] leading-none gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={wifi === "SEARCHING" ? "wifi-pulse" : ""}>
          <WifiIcon size={14} bars={bars as 0 | 1 | 2 | 3} />
        </span>
        <span className="tracking-wide truncate max-w-[140px]" title={wifiLabel}>
          {wifiLabel}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[11px] mr-1 opacity-80">ZONE</span>
        <span className="text-[14px] leading-none">{aOn ? "[■]" : "[ ]"}</span>
        <span className="text-[12px]">A</span>
        <span className="text-[14px] leading-none ml-1">{bOn ? "[■]" : "[ ]"}</span>
        <span className="text-[12px]">B</span>
      </div>

      <div className="flex items-center gap-2">
        {locked && <PadlockIcon size={14} />}
        <span>{clock}</span>
      </div>
    </div>
  );
};
