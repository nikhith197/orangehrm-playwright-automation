const { spawnSync } = require('node:child_process');

const environment = process.argv[2];
if (!environment) {
  throw new Error('Usage: node scripts/run-tests.js <environment>');
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['playwright', 'test'], {
  stdio: 'inherit',
  env: { ...process.env, TEST_ENV: environment },
});

process.exit(result.status ?? 1);
