# V3 Control Panel — RC and IR

Front-panel simulator for the V3 control board, in the remote-control and infrared variant.
Successor to `retro-cook-panel`.

## What changed from V3's predecessor

`AnimatedIcons` is the addition — icon states animate rather than switching flat, which matters
for communicating transitions (heating, holding, done) on a display with very little room.
Everything else follows the same structure:

| Component | Models |
|---|---|
| `AppliancePanel` | The panel, composing the parts below |
| `HardwareButtons` | Physical button presses |
| `AnimatedIcons` | Animated mode and state icons |
| `StatusBar` | Mode, temperature and state |
| `MarqueeText` | Scrolling character display |
| `DebugPanel` | Internal state, for development |

Screen states are in `src/components/appliance/views/`.

## Running it

```bash
npm install
npm run dev
```

## Related

- `retro-cook-panel` — the earlier panel this iterates on
- `evo-glow-dash` — connected-state variant
