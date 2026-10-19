# Surface: mobile app (iOS / Android)

Native app screens — drawn in Figma, or built in SwiftUI / Compose. The same loop; what changes
is how you capture, which rules apply, and the platform checklist.

## Declare platform and medium

Every app brief states:
- **Platform:** `ios` or `android` (and the device sizes: iOS 375 / 393 / 430 pt wide;
  Android 360 / 412 dp).
- **Medium:** `figma` (frames in a file) or `live` (a running build in a simulator/emulator).

The critic filters project rules by these: it skips `[web]`, `[desktop]`, and — on Figma —
`[live]`. Untagged rules and `[app]` rules apply.

## Build

- **Figma:** follow `figma.md` (load `figma-use` before every `use_figma`). Use the app's own
  components and variables; screens as components, screens inside flows as instances (if the
  project rules say so — the first project does).
- **Native code:** the platform skills — iOS: `swiftui-patterns`, `swiftui-layout-components`,
  `ios-accessibility`, `swiftui-liquid-glass` for glass; Android: the project's Compose
  conventions.

## When the complaint is about a device size

If the user's complaint is about a size ("ở các máy nhỏ thì user mất thêm chỗ"), draw at
least one frame at that size (iOS 375 × 667, SE/mini) before calling an option better at
saving space. Otherwise the critic can only infer, and says so under "Not checked" (USELOG
2026-10-15, multi-gen B/C/D).

## Capture for the critic

- **Figma:** fileKey + frame nodeIds, one per screen/state, dark and light if both exist.
- **Live iOS:** `ios-simulator-skill` to boot, run and screenshot each state; hand the critic
  **absolute paths** to each PNG (never a folder — `Read` can't list one). Include the
  smallest and largest device you support.

## Platform checklist (critic, on top of the universal one)

Measurable:
- **Touch targets** ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android) for anything tappable.
- **Safe areas:** nothing interactive or essential under the status bar / Dynamic Island /
  home indicator; bottom bars sit above the home indicator.
- **Text** ≥ 11 pt; body ≥ 15–17 pt on iOS. Layout survives one Dynamic Type step larger
  (live) — or, on Figma, the longest realistic string.
- **Tab bar** ≤ 5 items; the selected tab is unmistakable.
- **Keyboard:** a screen with an input shows the input above the keyboard (a project lost a round
  to "không nhìn thấy ô input để gõ").
- **Sheets:** grabber/close present where dismissible; the sheet's primary action reachable
  with the keyboard up.
- **Dark and light** both judged, separately.

Taste (with confidence):
- Feels native to the platform — back gesture/back button where expected, no web-only patterns
  (hover reveals, desktop-style dropdowns) carried over.
- One primary action per screen, in thumb reach.

## What doesn't carry over from web

Hover, URL state, scroll restoration, breakpoints above tablet: not applicable. Motion can't
be judged on Figma frames — list it under Not checked.
