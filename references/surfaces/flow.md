# Surface: flow — check a whole user flow, not one screen

A flow is a sequence of screens joined by user actions: sign-in, top-up, onboarding, paywall,
generate → result. The unit of quality is the **sequence**: can the user get from every entry
to every outcome, does every branch end somewhere real, does it match the spec.

Three kinds of flow check, pick the ones that apply:

| | Target | How it's read |
|---|---|---|
| **A. Live flow** | a running build (web / simulator) | the critic walks the steps — see `funnel.md` for the walking rules |
| **B. Figma flow** | a section of screens joined by connector arrows | `flow-graph.js` extracts the graph; the critic judges it plus screenshots |
| **C. Spec conformance** | a spec / PO doc + A or B | the critic lists the spec's cases and maps each to screens and arrows |

## A. Live flow (web or app build)

Use `funnel.md`'s procedure — ordered steps, test data only, never complete a real purchase —
and add, for product flows:
- walk **every branch the brief names**, not only the happy path: error, empty, out of credit,
  cancelled payment, session expired, no network;
- at each step: Back keeps the input; reload either restores the step or lands somewhere sane;
- the end state of each branch is a screen the user can act on, never a spinner or a blank.

## B. Figma flow

**Extract the graph** (orchestrator, not the critic — the critic stays read-only):
1. Load `figma-use`. Open `references/surfaces/flow-graph.js`, set `SECTION_IDS` to the
   flow section(s) (from the link's `node-id`, `-` → `:`), and run it as one `use_figma` call.
   It is read-only — it never mutates the file; keep it that way if you edit it.
2. Save the returned JSON to a file in the scratchpad and pass its **absolute path** to the
   critic, with the fileKey and section nodeIds (for screenshots) and the spec path if any.

What the script computes (`checks`):

| Check | Means | Usually |
|---|---|---|
| `orphanScreens` | no arrow leads in | a missing entry arrow, or a stray screen |
| `deadEndScreens` | no arrow leads out | fine for a true end state; otherwise a missing branch |
| `branchesEndingInNotes` | an arrow chain from a screen ends in a note, never reaching a screen | either a pointer to another case (verify it exists) or a branch drawn as text instead of screens (missing screens) |
| `floatingOrMissingEnds` | an arrow not attached to anything at one end | broken arrow |
| `duplicateScreenNames` | two screens share a name | ambiguous for dev ("trùng tên HI-03c ở hai nơi") |
| `screensNotInstances` | a screen in the flow is a frame/copy, not an instance | breaks "edit once, every flow updates" (a project rule) |
| `arrowScreenOverlaps` | an arrow's bounding box crosses a screen it doesn't connect | possible arrow over a screen — confirm on the screenshot; elbow arrows have big boxes |
| `unlabeledEdges` | arrows with no label | the action that moves the user is not stated |
| `hasGoldenPath` | a section named "golden path" exists | a project rule |

Two blind spots of these checks (USELOG 2026-10-28): `arrowScreenOverlaps` skips the two screens an arrow joins, so a label wider than the gap still sits on them — compare label width with the gap; and nothing checks that an arrow leaves the state where its action is possible (Generate from a disabled button). Look for both on the screenshot.

Notes ("chip · ghi chú") are treated as **pass-through steps**: an arrow screen → note → screen
is one transition with a condition written on the note.

**Finding screens that duplicate each other** (the user asks you to remove duplicates or regroup by feature): first fingerprint
each screen by its visible text (digits normalised), then screenshot every pair with Jaccard ≥ 0.9 before calling it a
duplicate. Equal text is often a state variant: the button turns enabled, only the image changes, or a price badge
is drawn as an icon rather than text. The real duplicates were the same sheet copied onto another
feature's background (diff the texts and ignore the background's own strings). Before deleting a screen,
repoint its arrows to the copy you keep, and drop any arrow that then duplicates an existing one. Endpoint ids
can be a child of the screen, so match on the subtree, not the frame id (USELOG 2026-10-26).

## C. Spec conformance

Give the critic the spec (Confluence page exported to text, PDF, or md) by absolute path. It:
1. lists the spec's cases / screen IDs (e.g. `LG-01`, `TR-03`, "CASE Q");
2. maps each to screens in the graph by ID prefix or name, and to the arrows between them;
3. reports **missing** (in spec, not drawn), **extra** (drawn, not in spec — maybe stale),
   and **mismatched** (drawn but the arrow/condition differs from the spec);
4. checks every pointer note ("→ CASE Q", "→ TR-02") resolves to something that exists.

## Capture checklist for the brief

```
Surface: flow     Platform: ios | web …     Medium: figma | live
Target: fileKey + section nodeIds   (live: the ordered steps)
Flow graph: <absolute path to the JSON from flow-graph.js>
Spec: <absolute path, optional>
Intent: what the flow must achieve, its entry point(s), its expected end states
```
