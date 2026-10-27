const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('--- Starting HotelPro Development Services ---');

const isWindows = process.platform === 'win32';

const server = spawn('npm', ['run', 'start', '--prefix', 'server'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
  detached: !isWindows,
});

const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
  detached: !isWindows,
});

const killProcessGroup = (proc) => {
  if (!proc || !proc.pid) return;
  try {
    if (!isWindows) {
      process.kill(-proc.pid, 'SIGTERM');
    } else {
      proc.kill('SIGTERM');
    }
  } catch (e) {
    try {
      proc.kill('SIGTERM');
    } catch (err) {}
  }
};

const cleanup = (code = 0) => {
  console.log('\n--- Stopping HotelPro Development Services ---');
  killProcessGroup(server);
  killProcessGroup(client);
  process.exit(code);
};

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));
process.on('exit', () => cleanup(0));
server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Server process exited with code ${code}`);
  }
});
client.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Client process exited with code ${code}`);
  }
});
