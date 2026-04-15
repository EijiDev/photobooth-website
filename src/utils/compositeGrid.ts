export async function compositeGrid(grid: string, shots: string[]): Promise<string> {
  const W = 1200;
  const H = 900;
  const GAP = 6;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const loadImg = (src: string): Promise<HTMLImageElement> =>
    new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.src = src; });

  const imgs = await Promise.all(shots.map(loadImg));

  const draw = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const scale = Math.max(w / img.width, h / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
    ctx.restore();
  };

  if (grid === "single") {
    draw(imgs[0], 0, 0, W, H);
  } else if (grid === "sidebyside") {
    const hw = (W - GAP) / 2;
    draw(imgs[0], 0, 0, hw, H);
    draw(imgs[1], hw + GAP, 0, hw, H);
  } else if (grid === "stacked") {
    const hh = (H - GAP) / 2;
    draw(imgs[0], 0, 0, W, hh);
    draw(imgs[1], 0, hh + GAP, W, hh);
  } else if (grid === "2x2") {
    const hw = (W - GAP) / 2;
    const hh = (H - GAP) / 2;
    draw(imgs[0], 0, 0, hw, hh);
    draw(imgs[1], hw + GAP, 0, hw, hh);
    draw(imgs[2], 0, hh + GAP, hw, hh);
    draw(imgs[3], hw + GAP, hh + GAP, hw, hh);
  } else if (grid === "vertstrip") {
    const tw = (W - GAP * 2) / 3;
    imgs.slice(0, 3).forEach((img, i) => draw(img, i * (tw + GAP), 0, tw, H));
  } else if (grid === "horizstrip") {
    const th = (H - GAP * 2) / 3;
    imgs.slice(0, 3).forEach((img, i) => draw(img, 0, i * (th + GAP), W, th));
  } else if (grid === "triptych") {
    const tw = (W - GAP * 2) / 3;
    draw(imgs[0], 0, 0, tw, H * 0.6);
    draw(imgs[1], tw + GAP, 0, tw, H);
    draw(imgs[2], (tw + GAP) * 2, 0, tw, H * 0.6);
  } else if (grid === "collage") {
    const lw = W * 0.55;
    const rw = W - lw - GAP;
    const hh = (H - GAP) / 2;
    draw(imgs[0], 0, 0, lw, H);
    draw(imgs[1], lw + GAP, 0, rw, hh);
    draw(imgs[2], lw + GAP, hh + GAP, rw, hh);
  }

  return canvas.toDataURL("image/png");
}
