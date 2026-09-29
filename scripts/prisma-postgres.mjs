import { readFileSync, writeFileSync } from "fs";

const path = new URL("../prisma/schema.prisma", import.meta.url);
const source = readFileSync(path, "utf8");
if (!source.includes('provider = "sqlite"')) {
  throw new Error("schema.prisma já não usa sqlite — abortando troca para postgresql");
}
writeFileSync(path, source.replace('provider = "sqlite"', 'provider = "postgresql"'));
console.log("prisma provider -> postgresql (somente neste build)");
