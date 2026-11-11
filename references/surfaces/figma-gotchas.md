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
- A mask clips only the layers ABOVE it in its group. Grouping `[content, mask]` (mask last) left a
  blurred sheen spilling past a ticket's cut-outs; invisible over a busy wallpaper, a grey haze once the
  card sat on a black Dynamic Island (USELOG 2026-11-09). After `figma.group`, `g.insertChild(0, mask)`.
- Dynamic Island mocks cloned from an existing frame can be off-centre: measure the island centre (196.5
  in a 393 frame) and the camera zone (≈ x 134–259, y 11–48) before placing content (USELOG 2026-11-09).
- Placing a new block in a section the user is editing live: re-read the section's children right before
  `y = …` and go below the lowest one. A minimal block computed from a list read a minute earlier landed on an
  item the user had just added (critic blocker, USELOG 2026-11-09).
- Setting `x` on a child of an auto-layout frame does nothing (the layout re-places it) and the script still
  returns ok. To space nodes inside auto-layout columns, change the column's alignment (`counterAxisAlignItems`)
  or widths, then read positions back from the node tree (USELOG 2026-11-09: a "fixed" tracker stayed 107/88/107).
- A new section placed "next to" an existing one can land on the user's loose scratch nodes on the page. Before
  setting its x/y, test its box against every page child's absoluteBoundingBox and move it to free space (USELOG 2026-11-09).
- Use the product's real logo for icons from the first build (Android small icon = a one-colour glyph cut from the
  wordmark if no logomark exists); a placeholder sparkle got a "thay logo thật vào" (USELOG 2026-11-09).
- An image uploaded as **WebP** through `upload_assets` is accepted (hash returned, fill set) but renders blank in
  screenshots. Convert to JPG/PNG before uploading (a before/after card stayed empty for two self-checks).
- A gradient **alpha mask** (`isMask`) meant to fade a photo into its card did not fade in renders, even with
  `maskType='ALPHA'`. Put a gradient overlay in the card's sampled colour on top of the photo instead.
- A copied auto-layout chip's x is computed before it hugs its text: re-anchor right-aligned chips after the text is
  set (`x = parent.width - inset - width`), or the chip runs off the tile edge.
