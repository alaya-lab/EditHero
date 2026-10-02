/* Fit the transparent, selectable "EditHero" text over the letters drawn in the wordmark image, so the selection box covers exactly
   what is seen. Letter faces with their outline span 3.4%..93.3% of the image width and about 18%..76% of its height (centre 47%),
   tilted about 2.6 degrees. The text box is scaled to that rectangle (its font's ascent and descent would otherwise make it taller). */
(function () {
  "use strict";
  function fit() {
    document.querySelectorAll(".wm").forEach(function (wm) {
      var img = wm.querySelector("img"), t = wm.querySelector(".wm-text");
      if (!img || !t || !img.clientWidth) return;
      var w = img.clientWidth, h = img.clientHeight;
      t.style.transform = "none"; t.style.fontSize = (0.3 * h) + "px"; t.style.left = "0px"; t.style.top = "0px";
      var r = t.getBoundingClientRect(), tw = r.width || 1, th = r.height || 1;
      var sx = (0.899 * w) / tw, sy = (0.58 * h) / th, cx = 0.4835 * w, cy = 0.47 * h;
      t.style.left = (cx - tw / 2) + "px"; t.style.top = (cy - th / 2) + "px";
      t.style.transformOrigin = "50% 50%";
      t.style.transform = "rotate(-2.6deg) scale(" + sx + "," + sy + ")";
    });
  }
  window.addEventListener("load", fit); window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
