import fs from "node:fs";

const site = fs.readFileSync("public/site.html", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const grab = (html) => {
  const a = html.indexOf('<section class="invest"');
  const b = html.indexOf('<section class="faq');
  if (a < 0 || b < 0) throw new Error("markers missing");
  return html.slice(a, b);
};
fs.writeFileSync("index.html", index.replace(grab(index), grab(site)));
console.log("synced", grab(site).includes("Lote 01"));
