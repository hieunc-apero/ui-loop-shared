// flow-graph.js — READ-ONLY. Paste as the `code` of one use_figma call (load figma-use first).
// Set SECTION_IDS below. Returns the flow graph of those sections plus computed checks.
// It never mutates the file: no setters, no create*/remove/detach calls. Keep it that way.
//
// Output: { page, sections, screens[], notes[], edges[], checks{...} }
// The orchestrator saves the returned JSON to a file and passes its absolute path to ui-critic.

const SECTION_IDS = ['1234:5678']; // ← replace
// A "screen" is a frame/instance/component the size of a device. Adjust for other devices.
const SCREEN_W = [375, 390, 393, 402, 414, 430, 360, 412];
const SCREEN_MIN_H = 640;

const first = await figma.getNodeByIdAsync(SECTION_IDS[0]);
if (!first) return { error: 'section not found: ' + SECTION_IDS[0] };
let page = first; while (page && page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);

const sections = [];
for (const id of SECTION_IDS) { const s = await figma.getNodeByIdAsync(id); if (s) sections.push(s); }

const isScreenShape = n => ['FRAME', 'INSTANCE', 'COMPONENT'].includes(n.type)
  && SCREEN_W.includes(Math.round(n.width)) && n.height >= SCREEN_MIN_H;
const noteText = n => {
  if ('characters' in n) return n.characters.slice(0, 160);
  if ('findOne' in n) { const t = n.findOne(x => x.type === 'TEXT'); if (t) return t.characters.slice(0, 160); }
  return '';
};
const box = n => { const b = n.absoluteBoundingBox; return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null; };

const screens = [], notes = [], edges = [];
const byId = {};
for (const s of sections) {
  // outermost screen-shaped nodes only (a screen's inner frames are not screens)
  const all = s.findAll(isScreenShape);
  const outer = all.filter(n => { let p = n.parent; while (p && p !== s) { if (isScreenShape(p)) return false; p = p.parent; } return true; });
  for (const n of outer) {
    let main = null;
    if (n.type === 'INSTANCE') { const mc = await n.getMainComponentAsync(); main = mc ? mc.name : null; }
    const rec = { id: n.id, name: n.name, type: n.type, mainComponent: main, section: s.name, box: box(n) };
    screens.push(rec); byId[n.id] = { kind: 'screen', ...rec };
  }
  for (const c of s.findAllWithCriteria({ types: ['CONNECTOR'] })) {
    const end = async e => {
      if (!e || !e.endpointNodeId) return { kind: 'floating' };
      if (byId[e.endpointNodeId]) return { kind: byId[e.endpointNodeId].kind, id: e.endpointNodeId, name: byId[e.endpointNodeId].name };
      const n = await figma.getNodeByIdAsync(e.endpointNodeId);
      if (!n) return { kind: 'missing', id: e.endpointNodeId };
      // climb to the nearest screen if the arrow is attached to something inside one
      let p = n; while (p && p.type !== 'PAGE') { if (byId[p.id] && byId[p.id].kind === 'screen') return { kind: 'screen', id: p.id, name: p.name, via: n.name }; p = p.parent; }
      const rec = { kind: 'note', id: n.id, name: n.name, text: noteText(n) };
      if (!byId[n.id]) { byId[n.id] = rec; notes.push(rec); }
      return { kind: 'note', id: n.id, name: n.name };
    };
    // a connector's label lives in c.text (TextSublayer), not in a child — and reading a missing
    // property on a Figma node THROWS rather than returning undefined, so guard with `in`.
    const label = ('text' in c && c.text && 'characters' in c.text) ? c.text.characters : '';
    edges.push({ id: c.id, name: c.name, label, from: await end(c.connectorStart), to: await end(c.connectorEnd), box: box(c) });
  }
}

// ---- computed checks -------------------------------------------------------------------------
const out = {}, inc = {};
for (const e of edges) { if (e.from.id) (out[e.from.id] = out[e.from.id] || []).push(e); if (e.to.id) (inc[e.to.id] = inc[e.to.id] || []).push(e); }
// does a note chain eventually reach a screen?
const reachesScreen = (id, seen = new Set()) => { if (seen.has(id)) return false; seen.add(id);
  return (out[id] || []).some(e => e.to.kind === 'screen' || (e.to.kind === 'note' && reachesScreen(e.to.id, seen))); };
const comesFromScreen = (id, seen = new Set()) => { if (seen.has(id)) return false; seen.add(id);
  return (inc[id] || []).some(e => e.from.kind === 'screen' || (e.from.kind === 'note' && comesFromScreen(e.from.id, seen))); };

const nameCount = {}; screens.forEach(s => nameCount[s.name] = (nameCount[s.name] || 0) + 1);
const overlaps = [];
for (const e of edges) {
  if (!e.box) continue;
  for (const s of screens) {
    if (s.id === e.from.id || s.id === e.to.id || !s.box) continue;
    const a = e.box, b = s.box, m = 4;
    if (a.x < b.x + b.w - m && a.x + a.w > b.x + m && a.y < b.y + b.h - m && a.y + a.h > b.y + m)
      overlaps.push({ edge: e.label || e.name, screen: s.name, note: 'bounding boxes intersect — confirm on the screenshot (elbow arrows have large boxes)' });
  }
}
const checks = {
  orphanScreens: screens.filter(s => !(inc[s.id] || []).length && !comesFromScreen(s.id)).map(s => s.name),
  deadEndScreens: screens.filter(s => !(out[s.id] || []).length).map(s => s.name),
  branchesEndingInNotes: notes.filter(n => !(out[n.id] || []).some(e => e.to.kind === 'screen') && !reachesScreen(n.id) && comesFromScreen(n.id))
    .map(n => ({ note: n.text || n.name, arrivingLabels: (inc[n.id] || []).map(e => e.label || e.name) })),
  floatingOrMissingEnds: edges.filter(e => ['floating', 'missing'].includes(e.from.kind) || ['floating', 'missing'].includes(e.to.kind)).map(e => e.label || e.name),
  unlabeledEdges: edges.filter(e => !e.label || /^\s*(→|->)?\s*$/.test(e.label)).length,
  duplicateScreenNames: Object.keys(nameCount).filter(k => nameCount[k] > 1),
  screensNotInstances: screens.filter(s => s.type !== 'INSTANCE').map(s => s.name),
  arrowScreenOverlaps: overlaps,
  hasGoldenPath: sections.some(s => /golden path/i.test(s.name)),
};
return { page: page.name, sections: sections.map(s => ({ id: s.id, name: s.name })), counts: { screens: screens.length, notes: notes.length, edges: edges.length }, screens, notes, edges, checks };
