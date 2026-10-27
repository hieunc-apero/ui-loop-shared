# Taste base — the shared eye

The default taste every ui-loop run starts from: fifteen axes distilled from a long run of real
design feedback (several hundred messages, many projects), with the stories and names taken out.
Read with the person's own profile, `~/.ui-loop/taste.md`, which sits **on top**: where the two
disagree, the person's own profile wins, and project rules (`DESIGN.md`, `.claude/design-rules.md`)
beat both where they are more specific.

Tags: `[web]` `[desktop]` `[app]` `[live]` `[figma]`; untagged = everywhere. `[đo]` = measurable,
the critic may block; `[gu]` = judgement, the critic advises with a confidence. `🔒` = never demoted.
`Uxx` = measured by ui-check (`tools/ui-check/README.md`) — take the number from Measured.

**The shape of this taste:** almost nothing is absolute — "a bit more", "but not too much". Judge
the *dose* against the page and its references, and correct a dose in **half-steps**, never by
jumping to the opposite end. Vietnamese feedback words map to axes: "nổi" → 1, "chính phụ" → 2,
"đồng bộ" → 3, "ríu / chật / sát" → 4, "lệch" → 5, "xấu / thô / quê" → 12, "bị đè" → 13.

## 1. Emphasis dose
One focal point per block, reached with the least force that works: weight, size, contrast, then
colour, then glow or shadow — last and light.
- 🔒`[đo]` Per block (card, sheet, fold) at most one element with a saturated accent fill, glow or
  coloured shadow (U20). What the brief says matters most is the strongest thing in its block.
- `[đo]` Resting chip/pill shadow alpha ≤ 0.35 (U21). A requested glow reads at a glance and hugs
  its frame. A surface on a dark page reads as a surface (lighter fill + edge).
- `[gu]` One signal per state (not a FAB and a badge saying the same thing). "Bigger / clearer"
  on an element = scale and sharpen *that* element; never swap it for a different object.

## 2. Primary vs secondary
- 🔒`[đo]` Each action group has exactly one primary-styled control; secondaries are outline, text or
  smaller, never the primary's fill (U19).
- `[gu]` More than three actions in one block → overload. Text has a primary/secondary split too:
  one big thing per block, sized against its neighbours (~2×).

## 3. Consistency
- 🔒`[đo]` The same component type has the same height, radius, fill, border and text style everywhere
  (U22, U12); section headings share one alignment; same-kind stacks go one direction.
- `[đo]` No native browser chrome (scrollbar, select, checkbox) inside a styled UI (U17, U23). One event
  looks the same on every screen (one toast style).
- `[gu]` One report = fix the pattern everywhere, sibling pages and flows included. The same item looks
  the same in every list it appears in. Loading states get the finished screen's care. Before changing
  fonts, show labelled options set in the real headline; one display family usually wins.

## 4. Room inside, big canvas outside
- 🔒`[đo]` Text to edge: chips ≥ 8 px vertical / 12 px horizontal (U13), cards ≥ 16 px (U25), measured on
  the wrapped case. Body ≥ 14 px on desktop, labels ≥ 12 px (U14).
- `[đo]` Display letter-spacing ≥ −0.02em, line-height ≥ 1.05 (U15); body line-height 1.35–1.6 (U24).
- `[web][desktop]` Small page-edge padding (the canvas feels huge), but no oversized padding inside a
  card and no big gaps between folds.
- `[gu]` Gaps group by meaning: inside a group clearly smaller than between groups. Readable ≠ plain:
  keep a reference's look in a readable face.

## 5. Alignment and balance
- 🔒`[đo]` Icon and text centres within 1 px (U11); a bar's centre item centred on the bar; controls
  that act as one unit touch or share a container.
- `[đo]` Columns top-aligned — a label over one column must not push its card down (U26). Phone
  single-column steps start at the top with the free band above a pinned CTA; don't centre to fill.
- `[gu]` "Off" also means a half-empty page or a hero card flush to the gutter. Something worn by a logo
  or a face (a hat, a crown) sits *on* it, low and tilted on a gentle arc — never floating above. When a
  design file gives the placement, match it to the pixel.

## 6. The image is the centre
- 🔒`[đo]` No face cut by a crop or covered by UI (zoom on every person). Images in a set visibly differ
  at thumbnail size. One frame per photo: no white border, no tile around a second framed panel.
- `[gu]` The image is the largest thing in its block and shows what the feature does. In a wall or
  collage every visible tile is a different picture (the same model in several styles is a repeat).

## 7. Survives real data
- 🔒`[đo][live]` Long names, a missing image, zero / one / many items: nothing reads as a bug.
- `[đo]` "Like the original" = the original's arrangement exactly (order, the one CTA and where it sits,
  price layout, nothing sticky that isn't); only the styling is ours.
- `[gu]` An effect makes sense with the data that exists at that step (no reveal of nothing). A paywall
  shows desire in the product's own world — one result, not a menu. After two rejected directions,
  offer short named options instead of a third guess.

## 8. Modern, not "AI-looking"
- References: the person's named references come first (their `taste.md`); otherwise the current
  best-in-class sites of the product's category (for AI image/video tools: higgsfield.ai,
  magnific.com, imagine.art). Name the reference when you judge against it.
- `[đo]` ≤ 1 hero-size gradient per viewport (U27). A panel or background never shares the CTA's hue
  (U28). A dropped motif stays dropped everywhere, look-alikes too.
- `[gu]` Beside the reference, does it look older or generic? Default tells: cream + serif + terracotta,
  identical rounded cards with one grey shadow, an eyebrow label over every heading. A reference image
  beats earlier words: copy its type, shapes and decor, not only its colours. Props next to photos are
  judged like photos (hands, light, scale) and graded to the scene's light; cut-outs at full brightness
  read pasted. Decor is dosed per screen: a screen already framed needs no extra prop.

## 9. Light mode is first-class
- 🔒`[đo]` Judge light with the same checks as dark, and report it separately.
- `[gu]` Light shadows and borders are designed (softer, warmer, fewer), not inverted.

## 10. Words: one message per fold
- 🔒`[đo]` One headline per fold (U30); CTA labels say the action; inputs start empty with a placeholder
  (U29); a fixed value never looks like an input.
- `[gu]` Could a first-timer say in five words what the screen wants? Labels don't name where a control
  leads ("Back", not "Back to chat"). No extra states for rare cases. Dates in the market's order.
  Tone warm, not cringe, not dry.

## 11. Motion that feels real
- `[đo]` Reduced motion honoured (U34); media progress per frame, not per `timeupdate`; a multi-step
  soundtrack never restarts between steps.
- `[gu]` Natural, irregular timing; nothing loops just to decorate. Drama = speed contrast (still →
  anticipation → fast move with overshoot → impact), not slowness. Smooth = one eased path, overlapping
  stages, cross-fades. "Slowly" ≈ 1.5–2 s; "faster" = one half-step (−25 %). An idle "tap me" is the
  object itself moving (a sway every few seconds), not rings around it. No page transition inside one
  workspace; a reveal hides its payoff until revealed.

## 12. Craft finish — what "ugly", "crude", "cheap" usually mean
Check first: a misaligned or too-small icon, a crude stroke, a stock-looking icon, a heavy shadow, a
hover that only changes colour, an element styled unlike its siblings, a plain card with a stock icon.
- `[đo]` A CTA is symmetric on all four sides (no torn foot, no sideways shadow), ~60 px tall on phone,
  and carries at most one quiet detail.
- `[gu]` In a themed piece every surface carries the theme (inherited cards and the success screen too);
  motifs look real (uneven, not cropped by their box, never mirrored pairs); one motif family per dense
  screen; a simple drawn border beats a chain of tiled photo ornaments.

## 13. Layering
- 🔒`[đo]` Popovers never clipped (portal + flip). Floating status never covers a CTA or a header action
  (U8, U31); on phone it is a corner button, hidden on work screens, judged on a small phone.
- `[gu]` Decor never covers the user's own content, and gives way to fixed controls — never move a
  control to make room for a prop.

## 14. Desktop is designed, not stretched; phone first for funnels
- 🔒`[đo]` Desktop: no narrow centred column, main action in the first viewport (U32, U33); a desktop made
  from a phone app is its own layout (SKILL.md step 3); a detail-page fix goes to every page of its kind.
- `[đo]` Funnels: shoot and fix phone first (390×664, 390×844, 430×739), then carry to desktop. Over a
  video, the whole subject counts (not only the face): nothing sits on it, the hero plays clean, and a
  control laid over it stays small (≤ ~150×32, no glow; keep the 44 px hit area invisibly).
- `[gu]` A themed payoff owns the whole screen, never a framed copy inside the page. The payoff (the
  offer) is the biggest, centred, staged thing. Each step gets its own prop and its own light inside one
  palette; identical backgrounds read lazy.

## 15. Long work runs in the background
- `[đo]` A wait of minutes says you can leave; every running job is reachable from every screen and
  announced when done (generation and payment alike). Notification permission only from a button.
- `[gu]` One job-notice rule across the app; every AI wait reuses the app's one generating look; a
  capability added to one flow is expected in its sibling flows.

## How to use
- **Critic:** read this, then the person's `taste.md` (it wins). Run every `[đo]` that applies (take
  Uxx from Measured), answer `[gu]` with a confidence, name the axis (1–15) in each finding.
- **Builder:** walk axes 1–6 (and 14 for desktop) before showing anything.
- **Changing it:** a retro that changes a *general* principle or threshold in a person's profile also
  updates the matching line here — anonymised, no quotes, no project names (`references/loop/retro.md`).
