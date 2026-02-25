// ╔══════════════════════════════════════════════════════════╗
// ║                     TERMINAL UI                         ║
// ╚══════════════════════════════════════════════════════════╝
const body = document.getElementById('terminalBody');

function promptHTML() {
  const short = cwd.replace('/home/ghost', '~');
  return `<span class="fg-green">ghost@nexus-7</span><span class="fg-dim">:</span><span class="fg-cyan">${short}</span><span class="fg-dim">$</span>`;
}

function appendLines(lines, delayPerLine = 12) {
  let i = 0;
  for (const l of lines) {
    setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'line ' + (l.cls || '');
      if (l.html) d.innerHTML = l.t;
      else        d.textContent = l.t;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }, i * delayPerLine);
    i++;
  }
  return i * delayPerLine;
}

function addPromptRow() {
  const row = document.createElement('div');
  row.className = 'prompt-row';
  row.id = 'activeRow';

  const span = document.createElement('span');
  span.className = 'prompt-text';
  span.innerHTML = promptHTML() + '&nbsp;';

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = '';
  inp.id = 'cmdInput';
  inp.autocomplete = 'off';
  inp.autocorrect  = 'off';
  inp.autocapitalize = 'off';
  inp.spellcheck   = false;

  row.appendChild(span);
  row.appendChild(inp);
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;

  inp.focus();
  inp.addEventListener('keydown', onKey);

  // Re-focus click anywhere
  body.addEventListener('click', () => document.getElementById('cmdInput')?.focus(), { once: false });
}

function onKey(e) {
  const inp = e.target;
  if (e.key === 'Enter') {
    const cmd = inp.value;
    // Freeze row
    const row = document.getElementById('activeRow');
    row.removeAttribute('id');
    inp.replaceWith(document.createTextNode(cmd));
    inp.removeEventListener('keydown', onKey);

    if (cmd.trim()) { cmdHistory.unshift(cmd); histIdx = -1; }

    const out = run(cmd);
    const delay = appendLines(out, 12);
    setTimeout(addPromptRow, Math.max(delay + 30, 80));

  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < cmdHistory.length - 1) inp.value = cmdHistory[++histIdx];

  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) inp.value = cmdHistory[--histIdx];
    else { histIdx = -1; inp.value = ''; }

  } else if (e.key === 'Tab') {
    e.preventDefault();
    doTabComplete(inp);

  } else if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    c_clear();
    addPromptRow();

  } else if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
    const row = document.getElementById('activeRow');
    row.removeAttribute('id');
    inp.replaceWith(document.createTextNode(inp.value + '^C'));
    setTimeout(addPromptRow, 40);
  }
}

function doTabComplete(inp) {
  const val = inp.value;
  const tokens = tokenize(val);
  if (!tokens.length) return;
  const last = tokens[tokens.length - 1];

  let basePath, prefix;
  if (last.includes('/')) {
    const cut = last.lastIndexOf('/');
    basePath = resolve(last.slice(0, cut) || '/', cwd);
    prefix   = last.slice(cut + 1);
  } else {
    basePath = cwd;
    prefix   = last;
  }

  const bn = getNode(basePath);
  if (!bn || !bn.d) return;

  const matches = Object.entries(bn.c || {})
    .filter(([n]) => n.startsWith(prefix) && !n.startsWith('.'))
    .map(([n, nd]) => n + (nd.d ? '/' : ''));

  if (matches.length === 1) {
    const base = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
    tokens[tokens.length - 1] = base + matches[0];
    inp.value = tokens.join(' ');
  } else if (matches.length > 1) {
    const d = document.createElement('div');
    d.className = 'line fg-dim';
    d.textContent = matches.join('  ');
    body.insertBefore(d, document.getElementById('activeRow'));
    body.scrollTop = body.scrollHeight;
  }
}
