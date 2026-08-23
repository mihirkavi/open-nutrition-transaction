import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const siteUrl = new URL("../site/", import.meta.url);

test("OpenNutri website includes accessible structure and core positioning", async () => {
  const html = await readFile(new URL("index.html", siteUrl), "utf8");
  const css = await readFile(new URL("styles.css", siteUrl), "utf8");
  for (const marker of ['<html lang="en">', '<meta name="viewport"', 'class="skip-link"', '<header', '<nav', '<main id="main">', '<footer']) assert.ok(html.includes(marker), marker);
  assert.ok(css.includes("prefers-reduced-motion"));
  assert.match(html, /Nutrition should travel with the food you buy/);
  assert.match(html, /Purchased does not mean consumed/);
  assert.match(html, /Not another food database/);
  assert.match(html, /Move nutrition/);
});

test("all local website resources exist and external links use HTTPS", async () => {
  const html = await readFile(new URL("index.html", siteUrl), "utf8");
  const localTargets = [...html.matchAll(/(?:href|src)="(?!https?:|#)([^"]+)"/g)].map((match) => match[1]);
  for (const target of localTargets) await access(new URL(target, siteUrl));
  const externalTargets = [...html.matchAll(/(?:href|src)="(https?:[^\"]+)"/g)].map((match) => match[1]);
  assert.ok(externalTargets.length > 10);
  assert.ok(externalTargets.every((target) => target.startsWith("https://")));
});

test("website is dependency-free and works at a GitHub Pages project path", async () => {
  const html = await readFile(new URL("index.html", siteUrl), "utf8");
  const css = await readFile(new URL("styles.css", siteUrl), "utf8");
  assert.doesNotMatch(html, /<script[^>]+https?:/);
  assert.doesNotMatch(css, /@import|url\(["']?https?:/);
  assert.doesNotMatch(html, /href="\//);
  assert.doesNotMatch(html, /src="\//);
});
