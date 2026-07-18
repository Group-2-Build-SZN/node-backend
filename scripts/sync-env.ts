import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env");
const examplePath = path.resolve(".env.example");

if (!fs.existsSync(envPath)) {
  console.error(" No .env file found to sync from.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const exampleLines = envContent
  .split("\n")
  .map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;

    const firstEquals = trimmed.indexOf("=");
    if (firstEquals === -1) return line;

    const key = trimmed.slice(0, firstEquals);
    return `${key}=`;
  })
  .join("\n");

fs.writeFileSync(examplePath, exampleLines, "utf-8");
console.log("Synchronized keys successfully into .env.example");
