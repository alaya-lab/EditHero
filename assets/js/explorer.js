/* EditHero chain explorer: pick a chain and a turn. A chain with a "view3d" block shows every output as a 3D model
   (assets/chains/<slug>/<method>_tNN.glb in <model-viewer>); all tiles share one camera, so turning one turns them all.
   Other chains show the fixed-camera renders (assets/chains/<slug>/<method>_tNN.jpg). */
(function () {
  "use strict";
  const root = document.getElementById("chain-explorer");
  if (!root) return;
  const tabs = root.querySelector(".chain-tabs"), steps = root.querySelector(".turn-steps"),
        grid = root.querySelector(".method-grid"), opEl = root.querySelector(".turn-instr .op"),
        txtEl = root.querySelector(".turn-instr .txt"), note = root.querySelector(".explorer-note"),
        reset = root.querySelector(".view-reset");
  const OPCOL = { add: "var(--op-add)", remove: "var(--op-remove)", replace: "var(--op-replace)", retexture: "var(--op-retexture)" };
  const ENV = "assets/chains/studio.hdr";   // the environment light of the evaluation renders
  let chains = [], ci = 0, turn = 1, cam = null;   // cam: shared camera {orbit, target} after the user moved it; null = starting view

  function renderTabs() {
    tabs.innerHTML = "";
    chains.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "scene-tab" + (i === ci ? " active" : "");
      b.type = "button"; b.textContent = c.title;
      b.addEventListener("click", () => { ci = i; turn = 1; cam = null; renderAll(); });
      tabs.appendChild(b);
    });
  }
  function renderSteps() {
    const c = chains[ci]; steps.innerHTML = "";
    c.turns.forEach((t) => {
      const b = document.createElement("button");
      b.className = "turn-step" + (t.turn === turn ? " active" : ""); b.type = "button";
      b.innerHTML = `T${t.turn}<i style="background:${OPCOL[t.op]}"></i>`;
      b.title = `${t.op}: ${t.instruction}`;
      b.addEventListener("click", () => { turn = t.turn; renderTurn(); renderSteps(); });
      steps.appendChild(b);
    });
  }
  function setCamera(mv, orbit, target) {
    mv.setAttribute("camera-orbit", orbit); mv.setAttribute("camera-target", target);
    if (typeof mv.jumpCameraToGoal === "function") mv.jumpCameraToGoal();
  }
  function follow(src) {   // the user moved one model: move every other tile to the same camera
    const o = src.getCameraOrbit(), t = src.getCameraTarget();
    cam = { orbit: `${o.theta}rad ${o.phi}rad ${o.radius}m`, target: `${t.x}m ${t.y}m ${t.z}m` };
    grid.querySelectorAll("model-viewer").forEach((mv) => { if (mv !== src) setCamera(mv, cam.orbit, cam.target); });
  }
  function tile(c, m) {
    const f = document.createElement("figure"); f.className = "mtile " + m.kind;
    const base = `assets/chains/${c.slug}/${m.key}_t${String(turn).padStart(2, "0")}`;
    if (c.view3d) {
      const v = c.view3d, mv = document.createElement("model-viewer");
      const attrs = { src: base + ".glb", alt: `${m.name}, turn ${turn}`, "camera-controls": "", "interaction-prompt": "none",
        "camera-orbit": cam ? cam.orbit : v.orbit, "camera-target": cam ? cam.target : v.target,
        "field-of-view": v.fov, "min-field-of-view": v.fov, "max-field-of-view": v.fov,
        "min-camera-orbit": `auto auto ${v.rmin}m`, "max-camera-orbit": `auto auto ${v.rmax}m`,
        "environment-image": ENV, exposure: "1.6", "tone-mapping": "neutral", "shadow-intensity": "0",
        "touch-action": "pan-y" };   // one-finger vertical swipes still scroll the page on phones
      for (const k in attrs) mv.setAttribute(k, attrs[k]);
      mv.addEventListener("camera-change", (e) => { if (e.detail.source === "user-interaction") follow(mv); });
      f.appendChild(mv);
    } else {
      const img = document.createElement("img"); img.loading = "lazy"; img.alt = `${m.name}, turn ${turn}`; img.src = base + ".jpg";
      f.appendChild(img);
    }
    const cap = document.createElement("figcaption"); cap.textContent = m.name; f.appendChild(cap);
    return f;
  }
  function renderTurn() {
    const c = chains[ci], t = c.turns.find((x) => x.turn === turn);
    opEl.className = "op op-" + t.op; opEl.textContent = t.op; renderInstr(t);
    grid.innerHTML = "";
    grid.style.setProperty("--cols", Math.min(6, Math.ceil(c.methods.length / 2)));   // two even rows
    c.methods.forEach((m) => {
      if (!m.turns.includes(turn)) {
        const f = document.createElement("figure"); f.className = "mtile missing";
        f.textContent = `${m.name}: no output (chain ended)`; grid.appendChild(f); return;
      }
      grid.appendChild(tile(c, m));
    });
    reset.hidden = !c.view3d;
    note.textContent = c.view3d ? "Drag any model to turn all of them, scroll to zoom. Same camera and light for every tile."
                                : "Same camera and light for every tile.";
  }
  // [v:..] verb in the operation colour, [o:..] object names, [a:..] attributes; the rest stays plain
  function renderInstr(t) {
    txtEl.textContent = ""; const src = t.marked || t.instruction, re = /\[([voa]):([^\]]*)\]/g; let last = 0, m;
    while ((m = re.exec(src))) {
      if (m.index > last) txtEl.appendChild(document.createTextNode(src.slice(last, m.index)));
      const s = document.createElement("span"); s.className = "ins-" + m[1] + (m[1] === "v" ? " ins-" + t.op : ""); s.textContent = m[2];
      txtEl.appendChild(s); last = re.lastIndex;
    }
    if (last < src.length) txtEl.appendChild(document.createTextNode(src.slice(last)));
  }
  function renderAll() { renderTabs(); renderSteps(); renderTurn(); }
  root.querySelector(".turn-prev").addEventListener("click", () => { if (turn > 1) { turn--; renderSteps(); renderTurn(); } });
  root.querySelector(".turn-next").addEventListener("click", () => { if (turn < chains[ci].turns.length) { turn++; renderSteps(); renderTurn(); } });
  reset.addEventListener("click", () => {
    const v = chains[ci].view3d; if (!v) return; cam = null;
    grid.querySelectorAll("model-viewer").forEach((mv) => setCamera(mv, v.orbit, v.target));
  });
  fetch("assets/chains/chains.json").then((r) => r.json()).then((d) => { chains = d; renderAll(); })
    .catch(() => { grid.textContent = "Chain data could not be loaded."; });
})();
