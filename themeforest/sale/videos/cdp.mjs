// Minimal Chrome DevTools Protocol client (Node 22+, no dependencies).
// Chrome must run with --remote-debugging-port (default 9334), see README.md.
export async function connect(port = 9334) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const errors = [];
  const listeners = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text);
    if (m.method) listeners.forEach(fn => fn(m));
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await send('Page.enable');
  await send('Runtime.enable');
  return { ws, send, ev, sleep, errors, on: fn => listeners.push(fn), close: () => ws.close() };
}
