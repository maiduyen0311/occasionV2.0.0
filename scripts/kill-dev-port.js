#!/usr/bin/env node
/**
 * Free SHOPIFY_DEV_PORT (default 9293) when a previous `shopify theme dev` is still running.
 * Windows: netstat + taskkill. Unix: lsof + kill.
 */
const { execSync } = require('child_process');

const port = String(process.env.SHOPIFY_DEV_PORT || '9293').trim();

function killOnWindows() {
  const out = execSync(`netstat -ano | findstr ":${port}"`, { encoding: 'utf8', shell: true });
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (!line.includes('LISTENING')) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid)) pids.add(pid);
  }
  if (pids.size === 0) {
    console.log(`[dev:stop] Port ${port} is not in use.`);
    return;
  }
  for (const pid of pids) {
    console.log(`[dev:stop] Stopping PID ${pid} (port ${port})…`);
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit', shell: true });
  }
}

function killOnUnix() {
  try {
    const out = execSync(`lsof -ti :${port}`, { encoding: 'utf8' });
    const pids = out.trim().split(/\s+/).filter(Boolean);
    if (pids.length === 0) {
      console.log(`[dev:stop] Port ${port} is not in use.`);
      return;
    }
    for (const pid of pids) {
      console.log(`[dev:stop] Stopping PID ${pid}…`);
      execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
    }
  } catch {
    console.log(`[dev:stop] Port ${port} is not in use.`);
  }
}

try {
  if (process.platform === 'win32') killOnWindows();
  else killOnUnix();
} catch (e) {
  if (e.status === 1 && String(e.stdout || '').trim() === '') {
    console.log(`[dev:stop] Port ${port} is not in use.`);
    return;
  }
  console.error('[dev:stop]', e.message || e);
  process.exit(1);
}
