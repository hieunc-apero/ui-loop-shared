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
- Glyphs typed from memory as SVG paths can render as a broken shape that neither the self-check nor the critic
  notices at 1× (a "wrench" came out as a bent stroke; the user caught it). Take icon paths from a real set (Lucide,
  Solar, the codebase), and zoom every new glyph at 2× (`node.screenshot({scale:2})`) before the critic round.
- Porting an iOS frame to Android by cloning carries iOS geometry with it. Re-anchor everything, not just the frame
  size: content column and cards to the new width (FILL, no half-pixel x), bottom-anchored items (terms, pinned CTA)
  to the new bottom inset, the iOS home indicator inside shared sheets hidden per Android placement. Put the Android
  status bar on the top layer with no fill (edge-to-edge), above any scrim you add. Tap targets ≥ 48 dp.

## Pulling images out of a Figma fold for code

- `get_screenshot` renders at the node's 1× size whatever `maxDimension` says (a 141 px tile stays 141 px). For web
  assets call `download_assets` with `defaultScale: 3`: it returns the 3× export and the raw source images of the subtree
  (USELOG 2026-11-17).
- Ids inside an instance (`I123:4;567:8`) are refused by `get_screenshot` / `download_assets`; the part after the last
  `;` is the main component's own node — export that.
- Crop parts from the 3× export by the metadata's x/y/w/h × 3 and give the crop its own rounded alpha mask, so the
  frame's background colour never shows in the corners on a page of another colour.

- **Re-colouring a cloned paint with `{...paint, color}` keeps its `boundVariables`.** The variable still wins, so the
  main component can look right while an instance in another mode resolves to another colour (an icon showed purple in the
  component and `#f5f5f5` in the screen). Drop `boundVariables` from the paint, and from gradient stops, when you mean a fixed
  colour. Also check `instance.boundVariables.componentProperties`: a variant prop such as `Mode` can be bound to a library variable.

- **A file owned by a Starter-plan team cuts the MCP off after a short burst** ("tool call limit on the Starter plan"):
  reads may work again a minute later, writes keep failing. Check `whoami` for the plan that owns the file before
  promising to draw there; build in a new file under a plan where the user has a Full seat on a paid tier and tell the user
  to copy the page across (USELOG 2026-11-20, 97-screen redesign).
- **Resizing a main component's height does not reach every instance.** Instances placed in wrap/auto-layout rows kept
  36/39 px after both chip components were set to 44 px, and a verify round failed on it. After changing a component's
  size, walk its instances, set `layoutSizingVertical = 'FIXED'` + `resize(w, h)`, and read the heights back
  (USELOG 2026-11-20).
- **Fix token contrast before drawing many frames.** White labels on a bright orange primary (3.1:1) and light-grey
  captions (2.7:1) failed across a whole 97-frame file; the fix was token values + a page-wide pass that rebinds text by
  its background. Compute the 4–5 text/background pairs of a new palette first (USELOG 2026-11-20).
- **Colour options across many frames = variable modes.** Add one mode per option to the colour collection and set it as
  the explicit mode on cloned sample frames; the pick then rolls out to every frame with one `setExplicitVariableModeForCollection`
  each. Raw paints (gradient fades, translucent fills) don't follow — recolour them in the same pass (USELOG 2026-11-20).
- **Decor across many frames: place by measured free space, not fixed coordinates.** One fixed-coordinate set pasted on
  every frame put confetti on titles and a cloud under paywall copy (critic, 6 blockers). Collect the boxes of every text,
  instance and filled/stroked node, place each piece only where it clears them by ≥ 8 px, behind content, ≤ 4 per frame,
  and avoid 3+ pieces on one baseline (USELOG 2026-11-20).
- **Bind a paint with its real colour as the base, not black.** `setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}}, …)`
  rendered one Button/Secondary instance black although its binding and mode resolved to pink; rebinding with the variable's
  actual value as the base colour fixed it. Write helpers that read `variable.valuesByMode[mode]` for the base (USELOG 2026-11-20).
- **`vectorPaths` accepts only M, L, C, Q and Z.** An `H`/`V` command ("Invalid command at H") throws, and the whole
  `use_figma` call rolls back, so a 6-screen batch was lost and resent. Write every segment as `L x y` (USELOG 2026-11-20).
- **An icon helper fed a name missing from its SVG map draws nothing and still returns ok.** A CTA kept an empty
  `icon/mic` slot until the critic noticed. Make the lookup throw on an unknown key, because each `use_figma` call
  redeclares its own icon map and it drifts between calls (USELOG 2026-11-20).
- **A 90-frame build drifts when every call redeclares its helpers.** Store the helper library once as a text node on a
  `_lib` page and load it at the top of each call with `await new (Object.getPrototypeOf(async function(){}).constructor)(node.characters)()`
  (eval works in the sandbox). Bake the 48 dp hit area, centred sheet grabber and one toast recipe into those helpers from
  the start: retrofitting them afterwards made captions 12 px taller and pushed a hint card over the mic (USELOG 2026-11-22).
- **A huge OUTSIDE stroke does not draw a spotlight scrim.** A 1200 px stroke round a hole rendered nothing. Use
  `figma.subtract([fullRect, hole])` and fill the result (USELOG 2026-11-22).
- **A batch swap that replaces an image with a wrapper changes every later lookup.** After photos became
  `Scene/…` frames holding the mascot, a resize pass that looked for direct children found 0 and reported ok; search
  descendants (`findAll`) and assert the count. A rule keyed on row text ("Order your usual") also matched a whole
  screen and swapped its centre avatar for a list tile — scope such passes by parent (row frames only), and set x/y on
  anything inserted into a non-auto-layout parent or it lands at (0,0) (USELOG 2026-11-22).
- **Swapping in a bigger subject moves the face.** Recompute every overlay stack against the new chin line (Loqui: a
  mascot 1.3× the old photo dropped the chin 50 px under three captions) (USELOG 2026-11-22).
- `setBoundVariableForPaint` drops paint-level `opacity`: for translucent scrims/glows use node opacity or an unbound paint (Sayso v2, 2026-11-22).

- Progress rings: a stroked ELLIPSE with arcData draws the pie radii to the centre and covers the label — use a filled ellipse with `arcData.innerRadius` (donut) and put the text last. (Loqui 22/11)
- In `findAll` predicates, `n.findOne`/`n.findAll` throw on TEXT nodes — guard with `'children' in n`. A throwing script rolls back the whole call.
- Before building a multi-section app, write the mock-data ledger (streak, badges, scores, dates) once and reuse it; ledger drift was most of a 9-blocker critic round.
- The Figma MCP seat has a call cap: a 38-frame build plus per-frame screenshots ran it out, and the critic then saw 2 frames (NOT REVIEWED). Budget calls: build several screens per `use_figma`, self-check with one high-res section screenshot per row instead of one per frame, and give the critic row screenshots (or exported PNGs) instead of a nodeId list.
- Place frame captions/annotations last, after every resize and restack; captions placed early drift when a frame grows or a row moves.
