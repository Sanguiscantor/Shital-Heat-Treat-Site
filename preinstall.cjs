const fs = require("node:fs");
const path = require("node:path");

const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.startsWith("pnpm/");

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  const lockfilePath = path.join(process.cwd(), lockfile);
  if (fs.existsSync(lockfilePath)) {
    fs.rmSync(lockfilePath, { force: true });
  }
}

if (!isPnpm) {
  console.error("Use pnpm instead");
  process.exit(1);
}
