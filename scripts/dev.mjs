import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const files = ['server/index.mjs', 'node_modules/vite/bin/vite.js'];
const children = [];
let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) child.kill();
}

for (const file of files) {
  const child = spawn(process.execPath, [fileURLToPath(new URL(file, root))], {
    cwd: fileURLToPath(root),
    stdio: 'inherit',
  });
  children.push(child);
  child.once('exit', (code) => stop(code ?? 1));
  child.once('error', (error) => {
    console.error(error.message);
    stop(1);
  });
}

process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
