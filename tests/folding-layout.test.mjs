import { test } from "node:test";
import assert from "node:assert/strict";
import { transformSync } from "esbuild";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/services/FoldingLayout.ts", import.meta.url), "utf8");
const code = transformSync(source, { loader: "ts", format: "esm" }).code;
const { foldingRoots, foldingWidths } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const tab = id => ({ id, type: "tabs", children: [] });
const split = (direction, ...children) => ({ type: "split", direction, children });
test("one tab group remains one bundle", () => {
  const a = tab("A"); assert.deepEqual(foldingRoots(split("vertical", a)), [a]);
});
test("rows-only layout is one shared bundle", () => {
  const root = split("horizontal", tab("A"), tab("B")); assert.deepEqual(foldingRoots(root), [root]);
});
test("nested B/C over D stays intact beside A", () => {
  const a = tab("A"), bcd = split("horizontal", split("vertical", tab("B"), tab("C")), tab("D"));
  const root = split("vertical", a, bcd), before = JSON.stringify(root);
  assert.deepEqual(foldingRoots(root), [a, bcd]); assert.equal(JSON.stringify(root), before);
});
test("single-child wrappers do not hide the actual columns", () => {
  const a = tab("A"), b = tab("B");
  assert.deepEqual(foldingRoots(split("vertical", split("vertical", a, b))), [a, b]);
});
test("popout window columns follow same rule", () => {
  const a = tab("A"), b = tab("B"); assert.deepEqual(foldingRoots({ type: "window", direction: "vertical", children: [a, b] }), [a, b]);
});
test("tab detach yields a separate bundle without flattening remainder", () => {
  const a = tab("A"), bd = split("horizontal", tab("B"), tab("D")), e = tab("E");
  assert.deepEqual(foldingRoots(split("vertical", a, bd, e)), [a, bd, e]);
});

test("opening a tiny saved column borrows room without losing rails", () => {
  const widths = foldingWidths(1200, [80, 1, 19].map(dimension => ({ dimension, collapsed: false })));
  assert.ok(widths.every(w => w >= 260));
  assert.ok(Math.abs(widths.reduce((a, b) => a + b, 0) - 1200) < 0.001);
});
test("crowded groups share space equally and reserve collapsed rails", () => {
  assert.deepEqual(foldingWidths(800, [
    { dimension: 90, collapsed: false }, { dimension: 1, collapsed: false },
    { dimension: 1, collapsed: false }, { dimension: 8, collapsed: true },
  ]), [254, 254, 254, 38]);
});
test("comfortable manually resized widths retain their proportions", () => {
  assert.deepEqual(foldingWidths(1600, [{ dimension: 37.5, collapsed: false }, { dimension: 62.5, collapsed: false }]), [600, 1000]);
});
test("zero saved weights still open and repeated allocation does not mutate preferences", () => {
  const items = [0, 0, 100].map(dimension => ({ dimension, collapsed: false }));
  const before = JSON.stringify(items);
  assert.deepEqual(foldingWidths(1000, items), [260, 260, 480]);
  assert.equal(JSON.stringify(items), before);
});
