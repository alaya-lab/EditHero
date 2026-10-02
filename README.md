# EditHero project page

Static project page for *EditHero: A Benchmark for Long-Horizon Part-Level 3D Editing and Vibe Modeling* (Alaya Lab).
The page follows the Alaya Lab page design used by KaiNinja (`assets/css/base.css`, `assets/css/showcase.css`);
EditHero additions are in `assets/css/edithero.css` and the chain explorer in `assets/js/explorer.js`.

- `index.html` — the page
- `assets/figures/` — figures cropped from the paper PDF
- `assets/chains/` — the chain explorer: `chains.json`, and for every turn each method's output, either as a GLB shown in 3D with
  [`<model-viewer>`](https://modelviewer.dev/) (lit by `studio.hdr`, Poly Haven *brown_photostudio_06*, CC0) or as a render
- `assets/videos/edithero_mv.mp4` — trailer

Preview locally with `python3 -m http.server` in this folder and open `http://localhost:8000`.
