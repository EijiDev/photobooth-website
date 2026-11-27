/**
 * STICKERS CONFIG
 * ───────────────
 * Image stickers are original SVGs in src/assets/stickers/:
 *   props-*.svg  emoji photo-booth props (faces, mustache, lips, signs…)
 *   *.svg        kawaii stickers (animals, sweets, purikura ears…)
 * To add your own (SVG or transparent PNG):
 *   1. drop the file in src/assets/stickers/
 *   2. import it below and add an entry with kind: "image"
 *      (set `aspect` = width / height if it isn't square)
 */
import type { StickerDef } from "../types";
import { fontString } from "./fonts";

// Emoji photo-booth props (original artwork)
import pLaugh from "../../assets/stickers/props-laugh.svg";
import pHeartEyes from "../../assets/stickers/props-heart-eyes.svg";
import pCool from "../../assets/stickers/props-cool.svg";
import pKiss from "../../assets/stickers/props-kiss.svg";
import pWinkTongue from "../../assets/stickers/props-wink-tongue.svg";
import pGrin from "../../assets/stickers/props-grin.svg";
import pWow from "../../assets/stickers/props-wow.svg";
import pAngel from "../../assets/stickers/props-angel.svg";
import pAngry from "../../assets/stickers/props-angry.svg";
import pDizzy from "../../assets/stickers/props-dizzy.svg";
import pMustache from "../../assets/stickers/props-mustache.svg";
import pLips from "../../assets/stickers/props-lips.svg";
import pHeartGlasses from "../../assets/stickers/props-heart-glasses.svg";
import pBigHeart from "../../assets/stickers/props-big-heart.svg";
import pThumbsUp from "../../assets/stickers/props-thumbs-up.svg";
import pPoop from "../../assets/stickers/props-poop.svg";
import pSignLoveU from "../../assets/stickers/props-sign-love-u.svg";
import pSignXoxo from "../../assets/stickers/props-sign-xoxo.svg";
import pSignLol from "../../assets/stickers/props-sign-lol.svg";
import pSignHappy from "../../assets/stickers/props-sign-happy.svg";
import pSignSelfie from "../../assets/stickers/props-sign-selfie.svg";
import pSignParty from "../../assets/stickers/props-sign-party.svg";
import pSignOmg from "../../assets/stickers/props-sign-omg.svg";
import pSignSoCute from "../../assets/stickers/props-sign-so-cute.svg";
import pSignBesties from "../../assets/stickers/props-sign-besties.svg";
// Kawaii stickers
import bunny from "../../assets/stickers/bunny.svg";
import cat from "../../assets/stickers/cat.svg";
import bear from "../../assets/stickers/bear.svg";
import chick from "../../assets/stickers/chick.svg";
import cloud from "../../assets/stickers/cloud.svg";
import heartFace from "../../assets/stickers/heart-face.svg";
import starFace from "../../assets/stickers/star-face.svg";
import smiley from "../../assets/stickers/smiley.svg";
import loveFace from "../../assets/stickers/love-face.svg";
import catEars from "../../assets/stickers/cat-ears.svg";
import bunnyEars from "../../assets/stickers/bunny-ears.svg";
import crown from "../../assets/stickers/crown.svg";
import blush from "../../assets/stickers/blush.svg";
import strawberry from "../../assets/stickers/strawberry.svg";
import cherries from "../../assets/stickers/cherries.svg";
import boba from "../../assets/stickers/boba.svg";
import sakura from "../../assets/stickers/sakura.svg";
import daisy from "../../assets/stickers/daisy.svg";
import bow from "../../assets/stickers/bow.svg";
import butterfly from "../../assets/stickers/butterfly.svg";
import rainbow from "../../assets/stickers/rainbow.svg";
import loveLetter from "../../assets/stickers/love-letter.svg";
import sparkles from "../../assets/stickers/sparkles.svg";
import sweatDrop from "../../assets/stickers/sweat-drop.svg";
import anger from "../../assets/stickers/anger.svg";

export const STICKER_CATEGORIES = [
  { id: "emoji", name: "Emoji faces" },
  { id: "props", name: "Props" },
  { id: "signs", name: "Signs" },
  { id: "friends", name: "Cute friends" },
  { id: "wear", name: "Wear it (purikura)" },
  { id: "sweets", name: "Sweets & flowers" },
  { id: "fx", name: "Manga FX" },
  { id: "words", name: "Words" },
];

const img = (
  id: string,
  label: string,
  category: string,
  src: string,
  extra: Partial<StickerDef> = {},
): StickerDef => ({ id, label, kind: "image", category, src, aspect: 1, ...extra });

export const STICKERS: StickerDef[] = [
  // ── Emoji photo-booth props ──
  img("props-laugh", "Laughing", "emoji", pLaugh, { defaultSize: 0.2 }),
  img("props-heart-eyes", "Heart eyes", "emoji", pHeartEyes, { defaultSize: 0.2 }),
  img("props-cool", "Cool", "emoji", pCool, { defaultSize: 0.2 }),
  img("props-kiss", "Kiss", "emoji", pKiss, { defaultSize: 0.2 }),
  img("props-wink-tongue", "Silly", "emoji", pWinkTongue, { defaultSize: 0.2 }),
  img("props-grin", "Big grin", "emoji", pGrin, { defaultSize: 0.2 }),
  img("props-wow", "Wow", "emoji", pWow, { defaultSize: 0.2 }),
  img("props-angel", "Angel", "emoji", pAngel, { defaultSize: 0.2 }),
  img("props-angry", "Angry", "emoji", pAngry, { defaultSize: 0.2 }),
  img("props-dizzy", "Dizzy mustache", "emoji", pDizzy, { defaultSize: 0.2 }),
  img("props-mustache", "Mustache", "props", pMustache, { aspect: 200 / 90, defaultSize: 0.22 }),
  img("props-lips", "Lips", "props", pLips, { aspect: 200 / 110, defaultSize: 0.18 }),
  img("props-heart-glasses", "Heart glasses", "props", pHeartGlasses, { aspect: 2, defaultSize: 0.28 }),
  img("props-big-heart", "Heart", "props", pBigHeart),
  img("props-thumbs-up", "Thumbs up", "props", pThumbsUp),
  img("props-poop", "Poop", "props", pPoop),
  img("props-sign-love-u", "LOVE U", "signs", pSignLoveU, { aspect: 315 / 110, defaultSize: 0.34 }),
  img("props-sign-xoxo", "XOXO", "signs", pSignXoxo, { aspect: 190 / 110, defaultSize: 0.34 }),
  img("props-sign-lol", "LOL", "signs", pSignLol, { aspect: 170 / 110, defaultSize: 0.34 }),
  img("props-sign-happy", "HAPPY", "signs", pSignHappy, { aspect: 285 / 110, defaultSize: 0.34 }),
  img("props-sign-selfie", "SELFIE", "signs", pSignSelfie, { aspect: 250 / 110, defaultSize: 0.34 }),
  img("props-sign-party", "#PARTY TIME", "signs", pSignParty, { aspect: 400 / 110, defaultSize: 0.34 }),
  img("props-sign-omg", "OMG", "signs", pSignOmg, { aspect: 170 / 110, defaultSize: 0.34 }),
  img("props-sign-so-cute", "SO CUTE", "signs", pSignSoCute, { aspect: 345 / 110, defaultSize: 0.34 }),
  img("props-sign-besties", "BESTIES", "signs", pSignBesties, { aspect: 280 / 110, defaultSize: 0.34 }),

  // ── Kawaii stickers ──
  img("bunny", "Bunny", "friends", bunny),
  img("cat", "Kitty", "friends", cat),
  img("bear", "Bear", "friends", bear),
  img("chick", "Chick", "friends", chick),
  img("cloud", "Cloud", "friends", cloud),
  img("heart-face", "Happy heart", "friends", heartFace),
  img("star-face", "Happy star", "friends", starFace),

  img("smiley", "Smiley", "emoji", smiley),
  img("love-face", "Blushing", "emoji", loveFace),

  // Wearables are bigger by default so they fit on heads/cheeks.
  img("cat-ears", "Cat ears", "wear", catEars, { aspect: 200 / 180, defaultSize: 0.32 }),
  img("bunny-ears", "Bunny ears", "wear", bunnyEars, { defaultSize: 0.3 }),
  img("crown", "Crown", "wear", crown, { aspect: 200 / 170, defaultSize: 0.26 }),
  img("blush", "Blush", "wear", blush, { aspect: 200 / 80, defaultSize: 0.28 }),

  img("strawberry", "Strawberry", "sweets", strawberry),
  img("cherries", "Cherries", "sweets", cherries),
  img("boba", "Milk tea", "sweets", boba),
  img("sakura", "Sakura", "sweets", sakura),
  img("daisy", "Daisy", "sweets", daisy),
  img("bow", "Ribbon bow", "sweets", bow),
  img("butterfly", "Butterfly", "sweets", butterfly),
  img("rainbow", "Rainbow", "sweets", rainbow, { aspect: 200 / 170, defaultSize: 0.24 }),
  img("love-letter", "Love letter", "sweets", loveLetter),

  img("sparkles", "Sparkles", "fx", sparkles),
  img("sweat-drop", "Sweat drop", "fx", sweatDrop, { defaultSize: 0.1 }),
  img("anger", "Anger mark", "fx", anger, { defaultSize: 0.12 }),

  {
    id: "txt-bff",
    label: "bff",
    kind: "text",
    category: "words",
    content: "bff",
    family: '"Outfit", sans-serif',
    weight: 800,
    fill: "#ff4d8d",
    stroke: "#ffffff",
    scale: 0.7,
  },
  {
    id: "txt-best-friends",
    label: "best friends",
    kind: "text",
    category: "words",
    content: "best friends",
    family: '"Caveat", cursive',
    weight: 700,
    fill: "#7c3aed",
    stroke: "#ffffff",
    scale: 0.55,
  },
  {
    id: "txt-love",
    label: "love",
    kind: "text",
    category: "words",
    content: "love",
    family: '"Caveat", cursive',
    weight: 700,
    fill: "#e11d48",
    stroke: "#ffffff",
    scale: 0.8,
  },
  {
    id: "txt-xoxo",
    label: "xoxo",
    kind: "text",
    category: "words",
    content: "xoxo",
    family: '"Outfit", sans-serif',
    weight: 800,
    fill: "#f472b6",
    stroke: "#ffffff",
    scale: 0.6,
  },
  {
    id: "txt-besties",
    label: "besties",
    kind: "text",
    category: "words",
    content: "besties",
    family: '"DM Serif Display", serif',
    weight: 400,
    fill: "#0ea5e9",
    stroke: "#ffffff",
    scale: 0.6,
  },
];

/** Default sticker width as a fraction of the frame width. */
export const DEFAULT_STICKER_SIZE = 0.18;

/** Outline thickness for text stickers, relative to sticker size. */
export const STICKER_STROKE = 0.14;

export function getSticker(id: string): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id);
}

/** Text stickers: the exact `font` string used by both the DOM and the canvas export. */
export function stickerFont(def: StickerDef, size: number): string {
  return fontString(def.weight ?? 800, size * (def.scale ?? 0.6), def.family ?? "sans-serif");
}
