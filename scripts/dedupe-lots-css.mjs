import fs from "node:fs";

for (const file of ["public/legacy/styles/sections.css"]) {
  let css = fs.readFileSync(file, "utf8");
  const marker = ".lot-sub { font-size: 1.15rem; color: #fff; }";
  const first = css.indexOf(marker);
  const second = css.indexOf(marker, first + marker.length);
  if (second > 0) {
    const tax = css.indexOf(".tax-row", second);
    css = `${css.slice(0, second)}${css.slice(tax)}`;
  }
  if (!css.includes(".lot.is-current { order: -1; }")) {
    css = css.replace(
      "@media (min-width: 760px) {\n  .lot-grid { grid-template-columns: 1fr 1fr; }\n}",
      "@media (max-width: 759px) {\n  .lot.is-current { order: -1; }\n}\n@media (min-width: 760px) {\n  .lot-grid { grid-template-columns: 1fr 1fr; }\n}",
    );
  }
  fs.writeFileSync(file, css);
  console.log(file, css.split(marker).length - 1);
}
