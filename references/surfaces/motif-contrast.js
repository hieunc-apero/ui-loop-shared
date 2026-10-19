const { chromium } = require("playwright-core");
const fs = require("fs");
const BASE = "http://127.0.0.1:8091/";
const CASES = [
  ["1440","petFor",".panel-web"], ["1440","upload",".drop-web"], ["1440","offer","#offer .of-web"],
  ["1440","paywall",".result-web"], ["1440","paywall",".card.fancy:not(.guar) .card-web"], ["1440","paywall",".guar .card-web"],
  ["390","upload",".drop-web"], ["390","paywall",".guar .card-web"], ["390","offer","#offer .of-web"],
];
(async()=>{
  const b = await chromium.launch({ executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const out = [];
  for (const [w,step,sel] of CASES){
    const mob = w==="390";
    const ctx = await b.newContext({ viewport:{width:+w,height:mob?844:900}, deviceScaleFactor:1, isMobile:mob });
    const p = await ctx.newPage();
    await p.goto(BASE+"?step="+step); await p.waitForTimeout(1500);
    await p.addStyleTag({ content:"*{animation-play-state:paused!important}" });
    const el = p.locator(sel).first();
    if (!(await el.count()) || !(await el.isVisible())){ out.push({w,step,sel,missing:true}); await ctx.close(); continue; }
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    const r = await el.boundingBox();
    const clip = { x:Math.max(0,r.x), y:Math.max(0,r.y), width:Math.round(r.width), height:Math.round(r.height) };
    const a = await p.screenshot({ clip });
    await el.evaluate(n => n.style.visibility = "hidden");
    const bimg = await p.screenshot({ clip });
    fs.writeFileSync(`../wm-${w}-${step}-${out.length}-on.png`, a); fs.writeFileSync(`../wm-${w}-${step}-${out.length}-off.png`, bimg);
    out.push({ w, step, sel, size: Math.round(r.width), file:`wm-${w}-${step}-${out.length}` });
    await ctx.close();
  }
  console.log(JSON.stringify(out));
  await b.close();
})();
