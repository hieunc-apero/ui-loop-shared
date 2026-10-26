# Surface: Figma

## Build

- Load `figma-use` before **every** `use_figma` call — the Figma MCP marks it mandatory and
  skipping it causes hard-to-debug failures. For a full screen or multi-section layout also
  load `figma-generate-design`; for a component library `figma-generate-library`.
- Start from the file's design system: `search_design_system`, `get_variable_defs`,
  `get_libraries`. Bind fills, radii, spacing and type to existing variables/styles. A raw hex
  in a file that has variables is a defect, not a shortcut.
- Use auto-layout for anything that holds content; fixed positioning only for illustration.
- Real images over grey rectangles — `upload_assets` from the project's own assets (e.g.
  `apps/web/public/`, catalog stills). Name layers; the critic and the code handoff both read
  layer names.
- Draw each breakpoint the project ships as its own frame (e.g. 390 and 1440 at minimum).
  The critic can only judge frames that exist.

## Plugin API traps that cost a round (USELOG 2026-10-15, multi-gen)

- `figma.createAutoLayout()` makes a frame with a **white fill**. Set `fills = []` on every
  container you create, or white text inside it disappears. It looks like missing content,
  not a fill bug.
- `setBoundVariableForPaint` can drop the paint's `opacity` back to 1, and instances may keep
  showing opaque paint even when the main component reads 0.05. For translucent colours,
  bind an **alpha variable** (e.g. `White-Alpha/*`) with paint opacity 1. Don't bind
  `Neutral/white` and rely on paint opacity. Screenshot an instance, not the main
  component, after binding.
- Families the MCP can't load (e.g. `SF Pro Display`; `SF Pro` loads) make any edit to
  those text nodes throw. Catch the load error, swap to the loadable sibling family, then
  set the characters.
- `detachInstance()` inside a loop over a list of instances invalidates the nodes after it:
  the IDs of nested children change, and the next `i.parent` throws "node does not exist".
  Detach one, re-query, repeat. Read `parent.name` before calling detach.
- An instance replacing a node that sat inside a wrapper (`Overlay > Sheet`) must go into
  that same wrapper. `parent.children.indexOf()` of a deeper node is −1, so the instance
  lands at index 0, behind everything.

## Restyling one component across many frames

When the job is "make X look like the approved Y everywhere" (e.g. old CTAs → the new
primary style):
- Copy fills, strokes and effects from the approved reference node, per theme — never retype
  the values.
- If the target is smaller than the reference (a header pill copied from a full-width CTA),
  scale the shadow **alpha** as well as offset and blur, and check it against the taste cap.
  Shrinking only the geometry left a 0.75-alpha glow on a 32 px pill (USELOG 2026-10-14).
- Restyle the whole action group, not just the one node. Check the labels and fonts of
  sibling buttons too. Legacy frames may still use an old typeface: one project's token screens
  were in Manrope, and fixing only the primary left one group in two fonts, which cost a
  round.

## Capture for the critic

Pass `fileKey` and the frame `nodeId`s (one per breakpoint/state). Nothing else is needed —
the critic pulls screenshots and node data itself.

`get_screenshot` can return a **cached render** right after an edit: the image shows the old
copy or colour even though the node data has changed. If a self-check screenshot doesn't
match what the script returned, request it again with a different `maxDimension` (for
example 790 instead of 800). Tell the critic to do the same in the brief. (USELOG 2026-10-15,
ED-02a: the first re-check after the fix showed the old AI line and the grey chevron.)

## What doesn't carry over from web

Hover, drag, motion and reduced-motion can't be judged — prototype interactions don't run
through MCP. Say so at hand-off. Rules tagged `[live]` are skipped; so are `[web]`/`[desktop]` when the frames are an app, and `[app]` when they are web.

## Handoff to code

When the Figma design is approved and the user wants it built:
- Load `figma-design-to-code` before `get_design_context`, then build on the **web-app** or
  **landing** surface — same loop, the critic now judges the coded page.
- Ask the critic, in that round, to compare against the approved frames (pass the nodeIds as
  reference) — drift from the approved design is a blocker unless the user asked for it.
- If the components map 1:1, offer Code Connect (`figma-code-connect`) so the next handoff is
  cheaper.

The reverse (existing page → Figma, e.g. to iterate on design before coding) uses
`figma-generate-design`.

## Reskinning a whole flow into another product's design language (USELOG 2026-10-26)

- Read the target product first and build a small local kit from **its own** pieces (its sheet,
  button, field, 3D art set, background) before touching any screen. Redrawing them by hand drifts.
- Rebuild each screen **inside the existing main component** (clear children, rebuild) so its node
  ID is kept: every instance in the flow diagrams updates and connector arrows stay attached.
  Instances whose main component was deleted from the file (`getMainComponentAsync()` resolves to
  a node with no page) can't be edited that way: detach, then rebuild the frame.
- A `use_figma` call that throws is rolled back **entirely**. After an error, re-read the canvas
  before assuming the screens built before the throw are there.
- Guard label setters: some variants have no text (a button's Loading state).
- A TEXT component property's default leaks into variants meant to be empty (an empty OTP cell
  showed the default digit "4"). On such variants, unbind the property and leave the text empty.
- `resize()` on an auto-layout frame you want to hug resets it to FIXED (a column collapsed to
  10px): set `primaryAxisSizingMode = 'AUTO'` again after every resize.
- Brief the critic with the product's reference screens. Its blockers here were reference drift
  (rows and cards the original Settings had) and 36px buttons under the 44pt tap target.
