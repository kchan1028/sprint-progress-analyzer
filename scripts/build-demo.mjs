import { spawnSync } from 'node:child_process';

const env = { ...process.env, VITE_GA_MEASUREMENT_ID: '', VITE_ADSENSE_CLIENT_ID: '', VITE_ADSENSE_SLOT_HOME: '', VITE_ADSENSE_SLOT_DASHBOARD: '' };
for (const args of [['node_modules/typescript/bin/tsc', '-b'], ['node_modules/vite/bin/vite.js', 'build']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
