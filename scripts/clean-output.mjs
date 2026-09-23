import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const output = path.resolve(process.cwd(), "_site");

if (path.basename(output) !== "_site" || path.dirname(output) !== process.cwd()) {
  throw new Error(`Refusing to clean unexpected output directory: ${output}`);
}

fs.rmSync(output, { recursive: true, force: true });
