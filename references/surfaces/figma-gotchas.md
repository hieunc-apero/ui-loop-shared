# Figma gotchas — read when cloning screens, copying images/fonts, or re-anchoring sheets

Moved out of `figma.md` (size cap) and grown by topic. Each line is a trap that cost a round.

- Copying "the picture this screen shows": an image node can stack several image fills; the visible one is the LAST
  visible fill in `fills`, not the first. Taking `fills[0]` put a hidden, different photo on every notification thumbnail
  (USELOG 2026-11-05). Screenshot the copy next to the source before calling it matched.
- Don't judge a light-theme frame from an instance dropped into a temporary frame on the page: the
  instance can resolve variables to the dark mode and render a dark body. Screenshot the component
  itself (`node.screenshot()`) before calling a theme bug (USELOG 2026-11-05).
- A clone of a component that holds instances shows an **empty instance subtree inside the same
  script**: `findAll` on the clone returned 0 texts, so overrides silently did nothing (the first
  try threw on a null lookup and rolled back). Clone in one `use_figma` call, return the ids, set
  the instance overrides in the next call (USELOG 2026-11-06).
- Copying `fontName` from another node can throw `"wdth" is not a valid variation setting` when the
  target font has different axes. Pass `{family, style}` only, never the whole object (USELOG 2026-11-06).
- Hiding a button inside a bottom sheet shrinks the sheet from the bottom, so it floats above the
  screen edge with the page showing underneath (critic blocker, USELOG 2026-11-06). After any change
  to a sheet's content, re-anchor it: `sheet.y = screen.height - sheet.height`.
