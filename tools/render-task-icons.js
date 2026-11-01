// Rendert tools/task-icons.txt als Bilder nach assets/ (Schrift: Noto Color Emoji, SIL OFL).
// Aufruf: CHROME=/pfad/zu/chrome NODE_PATH=... node tools/render-task-icons.js
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const root = path.join(__dirname, '..');
  const list = fs.readFileSync(path.join(__dirname, 'task-icons.txt'), 'utf8').trim().split('\n').map(l => l.split(' '));
  const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage();
  const out = await p.evaluate(list => list.map(([id, e]) => {
    const c = document.createElement('canvas'); c.width = c.height = 104;
    const g = c.getContext('2d'); g.font = '84px "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(e, 52, 56);
    return [id, c.toDataURL('image/webp', .85)];
  }), list);
  for (const [id, u] of out) fs.writeFileSync(path.join(root, 'assets', id + '.webp'), Buffer.from(u.split(',')[1], 'base64'));
  await p.setContent(`<body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(13,84px);gap:4px;padding:6px;font:11px sans-serif">${out.map(([i, u]) => `<div><img src="${u}" width=70 height=70><br>${i}</div>`).join('')}`);
  await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/pl-icons.png', fullPage: true });
  console.log(out.length, 'Icons'); await b.close();
})();
