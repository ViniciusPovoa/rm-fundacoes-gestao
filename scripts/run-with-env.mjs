import { spawn } from "node:child_process";

const separatorIndex = process.argv.indexOf("--");

if (separatorIndex === -1) {
  console.error("Usage: node scripts/run-with-env.mjs KEY=value -- command [args...]");
  process.exit(1);
}

const assignments = process.argv.slice(2, separatorIndex);
const commandParts = process.argv.slice(separatorIndex + 1);

if (commandParts.length === 0) {
  console.error("Missing command to run.");
  process.exit(1);
}

const env = { ...process.env };

for (const assignment of assignments) {
  const equalsIndex = assignment.indexOf("=");
  if (equalsIndex <= 0) {
    console.error(`Invalid env assignment: ${assignment}`);
    process.exit(1);
  }

  const key = assignment.slice(0, equalsIndex);
  const value = assignment.slice(equalsIndex + 1);
  env[key] = value;
}

const [command, ...args] = commandParts;

const child = spawn(command, args, {
  stdio: "inherit",
  shell: true,
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
