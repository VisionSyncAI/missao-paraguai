import { readFileSync, writeFileSync } from "fs";

const path = new URL("../prisma/schema.prisma", import.meta.url);
const source = readFileSync(path, "utf8");
if (source.includes('provider = "postgresql"')) {
  console.log("prisma provider já é postgresql");
  process.exit(0);
}
if (!source.includes('provider = "sqlite"')) {
  throw new Error("schema.prisma sem provider sqlite/postgresql reconhecido");
}
writeFileSync(path, source.replace('provider = "sqlite"', 'provider = "postgresql"'));
console.log("prisma provider -> postgresql");
