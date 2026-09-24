import { spawnSync } from 'node:child_process';

const ports = [8081, 9090];

for (const port of ports) {
  const result = spawnSync('adb', ['reverse', `tcp:${port}`, `tcp:${port}`], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.warn(
      `[android] adb reverse tcp:${port} skipped: ${result.error.message}`,
    );
    continue;
  }

  if (result.status !== 0) {
    console.warn(`[android] adb reverse tcp:${port} skipped`);
  }
}
