import { PadlockIcon } from "../icons";
import { EvoChefLogo } from "../AnimatedIcons";

export const ChildLockView = () => (
  <div className="h-full flex items-center justify-center gap-4 font-pixel">
    <PadlockIcon size={36} />
    <div className="flex flex-col">
      <span className="text-[20px] leading-none">CHILD LOCK</span>
      <span className="text-[12px] leading-none opacity-80 mt-1">
        HOLD BACK + PAUSE 3s TO UNLOCK
      </span>
    </div>
  </div>
);

export const ChildLockHoldOverlay = ({ progress }: { progress: number }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[hsl(var(--lcd-bg))]/85 font-pixel">
    <div className="flex flex-col items-center gap-1 px-4">
      <div className="flex items-center gap-3">
        <PixelButtonGuide label="BACK" />
        <div className="h-[2px] bg-lcd-pixel" style={{ width: 60 * progress + 8 }} />
        <PixelButtonGuide label="PAUSE" />
      </div>
      <span className="text-[14px] mt-1">HOLDING... {Math.round(progress * 100)}%</span>
    </div>
  </div>
);

const PixelButtonGuide = ({ label }: { label: string }) => (
  <div className="border-2 border-lcd-pixel px-2 py-0.5 text-[12px] lcd-flash">{label}</div>
);

export const BootView = ({ progress }: { progress: number }) => (
  <div className="h-full flex flex-col items-center justify-center font-pixel gap-1 animate-fade-in">
    <div className="text-lcd-pixel">
      <EvoChefLogo size={56} />
    </div>
    <div className="w-[55%] h-1.5 border border-lcd-pixel mt-1">
      <div
        className="h-full bg-lcd-pixel transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
    <span className="text-[10px] opacity-70 tracking-wider">
      FIRMWARE v2.0.0 · WIFI: EvoChef Office
    </span>
  </div>
);
