export const filters = [
  { name: "Normal",  style: "none",                                          color: "#f4a261" },
  { name: "B&W",     style: "grayscale(100%)",                               color: "#9ca3af" },
  { name: "Vintage", style: "sepia(60%) contrast(90%) brightness(90%)",      color: "#c8a97a" },
  { name: "Dreamy",  style: "saturate(120%) brightness(110%) hue-rotate(10deg)", color: "#c4b5fd" },
  { name: "Cool",    style: "hue-rotate(180deg) saturate(80%) brightness(105%)", color: "#7dd3fc" },
  { name: "Warm",    style: "sepia(40%) saturate(150%) brightness(105%)",    color: "#fbbf24" },
  { name: "Vivid",   style: "saturate(200%) contrast(110%)",                 color: "#f97316" },
  { name: "Fade",    style: "opacity(85%) saturate(60%) brightness(115%)",   color: "#d1d5db" },
];

export const timers = ["3s", "5s", "10s"];

export const gridShots: Record<string, number> = {
  single: 1, sidebyside: 2, stacked: 2,
  "2x2": 4, vertstrip: 3, horizstrip: 3,
  triptych: 3, collage: 3,
};

export const gridLabels: Record<string, string> = {
  single: "Single", sidebyside: "Side by Side", stacked: "Stacked",
  "2x2": "2×2 Grid", vertstrip: "Vert Strip", horizstrip: "Horiz Strip",
  triptych: "Triptych", collage: "Collage",
};
