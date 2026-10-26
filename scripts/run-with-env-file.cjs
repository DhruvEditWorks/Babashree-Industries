const { config } = require('dotenv');
const { spawnSync } = require('node:child_process');
const [envFile, command, ...args] = process.argv.slice(2);
if (!envFile || !command) {
  console.error('Usage: node scripts/run-with-env-file.cjs <dotenv-file> <command> [args...]');
  process.exit(2);
}
const loaded = config({ path: envFile });
if (loaded.error) {
  console.error(`Could not load deployment environment file: ${envFile}`);
  process.exit(1);
}
const result = spawnSync(command, args, { stdio: 'inherit', env: { ...process.env, ...loaded.parsed } });
if (result.error) {
  console.error('Could not start the requested deployment command.');
  process.exit(1);
}
process.exit(result.status ?? 1);
