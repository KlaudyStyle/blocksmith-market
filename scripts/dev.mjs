import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const children = [];
let stopping = false;

function javaExecutable() {
  const windows = process.platform === 'win32';
  const filename = windows ? 'java.exe' : 'java';
  if (process.env.JAVA_HOME) return join(process.env.JAVA_HOME, 'bin', filename);
  if (!windows) return filename;

  const result = spawnSync(filename, ['-XshowSettings:properties', '-version'], { encoding: 'utf8' });
  const home = result.stderr?.match(/^\s*java\.home\s*=\s*(.+)$/m)?.[1].trim();
  if (result.status !== 0 || !home) {
    throw new Error('Не удалось определить путь к Java. Проверьте JAVA_HOME.');
  }
  return join(home, 'bin', filename);
}

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) child.kill();
}

const commands = [
  [javaExecutable(), ['-jar', 'server/target/blocksmith-market.jar']],
  [process.execPath, ['node_modules/vite/bin/vite.js']],
];

for (const [command, args] of commands) {
  const child = spawn(command, args, {
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
