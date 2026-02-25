// ╔══════════════════════════════════════════════════════════╗
// ║               COMMAND IMPLEMENTATIONS                   ║
// ╚══════════════════════════════════════════════════════════╝

// Token type: { t: text, cls: cssClass, html: bool }
function T(t, cls='', html=false) { return { t, cls, html }; }

function run(raw) {
  const input = raw.trim();
  if (!input) return [];

  // Pipe
  if (input.includes('|')) return runPipe(input);

  const tokens = tokenize(input);
  const [cmd, ...args] = tokens;

  switch (cmd) {
    case 'pwd':    return c_pwd();
    case 'ls':     return c_ls(args);
    case 'cd':     return c_cd(args);
    case 'cat':    return c_cat(args);
    case 'head':   return c_head(args);
    case 'tail':   return c_tail(args);
    case 'grep':   return c_grep(args, null);
    case 'find':   return c_find(args);
    case 'mkdir':  return c_mkdir(args);
    case 'cp':     return c_cp(args);
    case 'mv':     return c_mv(args);
    case 'rm':     return c_rm(args);
    case 'sort':   return c_sort(args, null);
    case 'uniq':   return c_uniq(args, null);
    case 'wc':     return c_wc(args, null);
    case 'echo':   return [T(args.join(' '))];
    case 'clear':  return c_clear();
    case 'help':   return c_help();
    case 'hint':   return c_hint();
    case 'unlock': return c_unlock(args);
    case 'man':    return c_man(args);
    case 'whoami': return [T('ghost')];
    case 'uname':  return [T('Linux NEXUS-7 5.15.0-nexus #1 SMP')];
    case 'date':   return [T(new Date().toLocaleString('fr-FR'))];
    case 'history':return cmdHistory.slice().reverse().slice(0,20).map((h,i)=>T(`  ${i+1}  ${h}`,'fg-dim'));
    default:
      return [T(`bash: ${cmd}: commande introuvable`,'fg-red')];
  }
}

function tokenize(s) {
  const re = /(?:"([^"]*)")|(?:'([^']*)')|(\S+)/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    out.push(m[1] ?? m[2] ?? m[3]);
  }
  return out;
}

function runPipe(input) {
  const segments = input.split('|').map(s => s.trim());
  let piped = null;
  let result = [];
  for (const seg of segments) {
    const tokens = tokenize(seg);
    const [cmd, ...args] = tokens;
    if (piped !== null) {
      switch (cmd) {
        case 'grep':  result = c_grep(args, piped); break;
        case 'head':  result = c_head_str(piped, args); break;
        case 'tail':  result = c_tail_str(piped, args); break;
        case 'sort':  result = c_sort([], piped); break;
        case 'uniq':  result = c_uniq([], piped); break;
        case 'wc':    result = c_wc(args, piped); break;
        default: result = [T(`bash: ${cmd}: commande introuvable`,'fg-red')];
      }
    } else {
      switch (cmd) {
        case 'cat':  result = c_cat(args); break;
        case 'ls':   result = c_ls(args); break;
        case 'find': result = c_find(args); break;
        case 'echo': result = [T(args.join(' '))]; break;
        default:     result = run(seg); break;
      }
    }
    piped = result.filter(r => !r.cls.includes('red')).map(r => r.t).join('\n');
  }
  return result;
}

// ── pwd ──
function c_pwd() { return [T(cwd)]; }

// ── ls ──
function c_ls(args) {
  let showAll = false, longFmt = false;
  let target = cwd;
  for (const a of args) {
    if (a.startsWith('-')) { if (a.includes('a')) showAll = true; if (a.includes('l')) longFmt = true; }
    else { target = resolve(a, cwd); }
  }
  const node = getNode(target);
  if (!node) return [T(`ls: impossible d'accéder à '${target}': Aucun fichier ou dossier`, 'fg-red')];
  if (!node.d) return [T(basename(target))];

  const entries = Object.entries(node.c || {});
  const visible = showAll ? entries : entries.filter(([n]) => !n.startsWith('.'));
  if (!visible.length) return [];

  visible.sort(([a,an],[b,bn]) => {
    if (an.d && !bn.d) return -1;
    if (!an.d && bn.d) return 1;
    return a.localeCompare(b);
  });

  if (longFmt) {
    const out = [T(`total ${visible.length * 4}`, 'fg-dim')];
    for (const [name, n] of visible) {
      const perm = n.d ? 'drwxr-xr-x' : '-rw-r--r--';
      const size = n.d ? 4096 : (n.f?.length ?? 0);
      const cls  = n.d ? 'ls-dir' : (name.startsWith('.') ? 'ls-hidden' : 'ls-file');
      out.push(T(`${perm}  1 ghost ghost ${String(size).padStart(6)} Jan 01 00:00 ${name}${n.d ? '/' : ''}`, cls));
    }
    return out;
  }

  // Short format — 4 columns
  const cols = visible.map(([name, n]) => {
    const cls = n.d ? 'ls-dir' : (name.startsWith('.') ? 'ls-hidden' : 'ls-file');
    const label = name + (n.d ? '/' : '');
    return `<span class="${cls}">${label.padEnd(22)}</span>`;
  });
  const rows = [];
  for (let i = 0; i < cols.length; i += 4) {
    rows.push(T(cols.slice(i, i+4).join(''), '', true));
  }
  return rows;
}

// ── cd ──
function c_cd(args) {
  const target = resolve(args[0] || '/home/ghost', cwd);
  const n = getNode(target);
  if (!n) return [T(`cd: ${args[0]}: Aucun fichier ou dossier`, 'fg-red')];
  if (!n.d) return [T(`cd: ${args[0]}: N'est pas un répertoire`, 'fg-red')];
  cwd = target;
  return [];
}

// ── cat ──
function c_cat(args) {
  if (!args.length) return [T('cat: opérande manquant', 'fg-red')];
  const out = [];
  for (const a of args) {
    const p = resolve(a, cwd);
    const n = getNode(p);
    if (!n) { out.push(T(`cat: ${a}: Aucun fichier ou dossier`, 'fg-red')); continue; }
    if (n.d) { out.push(T(`cat: ${a}: Est un répertoire`, 'fg-red')); continue; }
    n.f.split('\n').forEach(l => out.push(T(l)));
  }
  return out;
}

// ── head ──
function c_head(args) {
  let n = 10; const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i+1]) { n = +args[++i]; }
    else if (/^-\d+$/.test(args[i])) { n = +args[i].slice(1); }
    else files.push(args[i]);
  }
  if (!files.length) return [T('head: opérande manquant', 'fg-red')];
  const out = [];
  for (const f of files) {
    const p = resolve(f, cwd);
    const node = getNode(p);
    if (!node) { out.push(T(`head: ${f}: Aucun fichier ou dossier`, 'fg-red')); continue; }
    if (node.d) { out.push(T(`head: ${f}: Est un répertoire`, 'fg-red')); continue; }
    node.f.split('\n').slice(0, n).forEach(l => out.push(T(l)));
  }
  return out;
}

function c_head_str(input, args) {
  let n = 10;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i+1]) { n = +args[++i]; }
    else if (/^-\d+$/.test(args[i])) { n = +args[i].slice(1); }
  }
  return input.split('\n').slice(0, n).map(l => T(l));
}

// ── tail ──
function c_tail(args) {
  let n = 10; const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i+1]) { n = +args[++i]; }
    else if (/^-\d+$/.test(args[i])) { n = +args[i].slice(1); }
    else files.push(args[i]);
  }
  if (!files.length) return [T('tail: opérande manquant', 'fg-red')];
  const out = [];
  for (const f of files) {
    const p = resolve(f, cwd);
    const node = getNode(p);
    if (!node) { out.push(T(`tail: ${f}: Aucun fichier ou dossier`, 'fg-red')); continue; }
    if (node.d) { out.push(T(`tail: ${f}: Est un répertoire`, 'fg-red')); continue; }
    node.f.split('\n').slice(-n).forEach(l => out.push(T(l)));
  }
  return out;
}

function c_tail_str(input, args) {
  let n = 10;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i+1]) { n = +args[++i]; }
    else if (/^-\d+$/.test(args[i])) { n = +args[i].slice(1); }
  }
  return input.split('\n').slice(-n).map(l => T(l));
}

// ── grep ──
function c_grep(args, stdin) {
  let pat = null, files = [], ci = false, showLines = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-')) { if (args[i].includes('i')) ci=true; if (args[i].includes('n')) showLines=true; }
    else if (!pat) pat = args[i];
    else files.push(args[i]);
  }
  if (!pat) return [T('grep: motif manquant', 'fg-red')];

  const re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), ci ? 'gi' : 'g');

  const processLines = (lines, prefix='') => {
    const out = [];
    lines.forEach((line, idx) => {
      if (new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), ci ? 'i':'').test(line)) {
        const highlighted = line.replace(re, m => `<span class="fg-yellow">${m}</span>`);
        const pre = showLines ? `${prefix}${idx+1}:` : prefix;
        out.push(T(pre + highlighted, '', true));
      }
    });
    return out;
  };

  if (stdin !== null) return processLines(stdin.split('\n'));

  if (!files.length) return [T('grep: fichier manquant', 'fg-red')];
  const out = [];
  for (const f of files) {
    const p = resolve(f, cwd);
    const n = getNode(p);
    if (!n) { out.push(T(`grep: ${f}: Aucun fichier ou dossier`, 'fg-red')); continue; }
    if (n.d) { out.push(T(`grep: ${f}: Est un répertoire`, 'fg-red')); continue; }
    const pfx = files.length > 1 ? `${f}:` : '';
    out.push(...processLines(n.f.split('\n'), pfx));
  }
  return out;
}

// ── find ──
function c_find(args) {
  let start = cwd, name = null, type = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-name' && args[i+1]) { name = args[++i]; }
    else if (args[i] === '-type' && args[i+1]) { type = args[++i]; }
    else if (!args[i].startsWith('-')) { if (i === 0 || !args[i-1].startsWith('-')) start = resolve(args[i], cwd); }
  }
  const results = [];
  function walk(path, node) {
    if (!node) return;
    const n = basename(path) || '/';
    let match = true;
    if (name) {
      const re = new RegExp('^' + name.replace(/\*/g,'.*').replace(/\?/g,'.') + '$');
      if (!re.test(n)) match = false;
    }
    if (type) { if (type==='d' && !node.d) match=false; if (type==='f' && node.d) match=false; }
    if (match && path !== start) results.push(T(path, node.d ? 'fg-cyan' : ''));
    if (node.d && node.c) {
      for (const [cn, ch] of Object.entries(node.c)) {
        walk(path === '/' ? `/${cn}` : `${path}/${cn}`, ch);
      }
    }
  }
  const startNode = getNode(start);
  if (!startNode) return [T(`find: '${start}': Aucun fichier ou dossier`, 'fg-red')];
  walk(start, startNode);
  return results.length ? results : [T('find: aucun résultat', 'fg-dim')];
}

// ── mkdir ──
function c_mkdir(args) {
  if (!args.length) return [T('mkdir: opérande manquant', 'fg-red')];
  const dirs = args.filter(a => !a.startsWith('-'));
  const out = [];
  for (const d of dirs) {
    const p = resolve(d, cwd);
    if (getNode(p)) { out.push(T(`mkdir: impossible de créer '${d}': Le fichier existe`, 'fg-red')); continue; }
    if (!setNode(p, { d: true, c: {} })) {
      out.push(T(`mkdir: impossible de créer '${d}': Aucun fichier ou dossier parent`, 'fg-red'));
    }
  }
  triggerLevel4Check();
  return out;
}

// ── cp ──
function c_cp(args) {
  const files = args.filter(a => !a.startsWith('-'));
  if (files.length < 2) return [T('cp: opérande manquant', 'fg-red')];
  const dest = files[files.length - 1];
  const srcs = files.slice(0, -1);
  const out = [];
  for (const src of srcs) {
    const sp = resolve(src, cwd);
    const sn = getNode(sp);
    if (!sn) { out.push(T(`cp: ${src}: Aucun fichier ou dossier`, 'fg-red')); continue; }
    let dp = resolve(dest, cwd);
    const dn = getNode(dp);
    if (dn && dn.d) dp += '/' + basename(sp);
    setNode(dp, JSON.parse(JSON.stringify(sn)));
  }
  triggerLevel4Check();
  return out;
}

// ── mv ──
function c_mv(args) {
  const files = args.filter(a => !a.startsWith('-'));
  if (files.length < 2) return [T('mv: opérande manquant', 'fg-red')];
  const dest = files[files.length - 1];
  const srcs = files.slice(0, -1);
  const out = [];
  for (const src of srcs) {
    const sp = resolve(src, cwd);
    const sn = getNode(sp);
    if (!sn) { out.push(T(`mv: ${src}: Aucun fichier ou dossier`, 'fg-red')); continue; }
    let dp = resolve(dest, cwd);
    const dn = getNode(dp);
    if (dn && dn.d) dp += '/' + basename(sp);
    setNode(dp, JSON.parse(JSON.stringify(sn)));
    delNode(sp);
  }
  return out;
}

// ── rm ──
function c_rm(args) {
  if (!args.length) return [T('rm: opérande manquant', 'fg-red')];
  const recursive = args.some(a => a.includes('r') || a.includes('R'));
  const files = args.filter(a => !a.startsWith('-'));
  const out = [];
  for (const f of files) {
    const p = resolve(f, cwd);
    const n = getNode(p);
    if (!n) { out.push(T(`rm: impossible de supprimer '${f}': Aucun fichier ou dossier`, 'fg-red')); continue; }
    if (n.d && !recursive) { out.push(T(`rm: impossible de supprimer '${f}': Est un répertoire (utilise -r)`, 'fg-red')); continue; }
    delNode(p);
  }
  return out;
}

// ── sort / uniq / wc ──
function c_sort(args, stdin) {
  let content;
  if (stdin !== null) { content = stdin; }
  else {
    const f = args.find(a => !a.startsWith('-'));
    if (!f) return [T('sort: opérande manquant', 'fg-red')];
    const n = getNode(resolve(f, cwd));
    if (!n) return [T(`sort: ${f}: Aucun fichier ou dossier`, 'fg-red')];
    content = n.f;
  }
  return content.split('\n').sort().map(l => T(l));
}

function c_uniq(args, stdin) {
  let content;
  if (stdin !== null) { content = stdin; }
  else {
    const f = args.find(a => !a.startsWith('-'));
    if (!f) return [T('uniq: opérande manquant', 'fg-red')];
    const n = getNode(resolve(f, cwd));
    if (!n) return [T(`uniq: ${f}: Aucun fichier ou dossier`, 'fg-red')];
    content = n.f;
  }
  const lines = content.split('\n');
  return lines.filter((l,i) => i === 0 || l !== lines[i-1]).map(l => T(l));
}

function c_wc(args, stdin) {
  let content, name = '';
  if (stdin !== null) { content = stdin; }
  else {
    const f = args.find(a => !a.startsWith('-'));
    if (!f) return [T('wc: opérande manquant', 'fg-red')];
    const n = getNode(resolve(f, cwd));
    if (!n) return [T(`wc: ${f}: Aucun fichier ou dossier`, 'fg-red')];
    content = n.f; name = ' ' + f;
  }
  const l = content.split('\n').length;
  const w = content.split(/\s+/).filter(Boolean).length;
  const c = content.length;
  return [T(`${String(l).padStart(6)} ${String(w).padStart(6)} ${String(c).padStart(6)}${name}`)];
}

// ── clear ──
function c_clear() {
  document.getElementById('terminalBody').innerHTML = '';
  return [];
}

// ── help ──
function c_help() {
  const lv = LEVELS[level - 1];
  return [
    T('╔══════════════════════════════════════════════╗', 'fg-cyan'),
    T('║          COMMANDES DISPONIBLES              ║', 'fg-cyan'),
    T('╚══════════════════════════════════════════════╝', 'fg-cyan'),
    T(''),
    T('Navigation :', 'fg-yellow'),
    T('  pwd                   répertoire actuel'),
    T('  ls [-a] [-l] [chemin] liste les fichiers  (-a: cachés, -l: détails)'),
    T('  cd [chemin]           change de répertoire'),
    T(''),
    T('Lecture :', 'fg-yellow'),
    T('  cat <fichier>             affiche un fichier'),
    T('  head [-n N] <fichier>     N premières lignes'),
    T('  tail [-n N] <fichier>     N dernières lignes'),
    T(''),
    T('Recherche :', 'fg-yellow'),
    T('  grep [-i] [-n] <motif> <fichier>  cherche un motif'),
    T('  find [chemin] [-name <nom>] [-type f/d]'),
    T(''),
    T('Manipulation :', 'fg-yellow'),
    T('  mkdir <rep>       crée un répertoire'),
    T('  cp <src> <dest>   copie un fichier'),
    T('  mv <src> <dest>   déplace / renomme'),
    T('  rm [-r] <cible>   supprime'),
    T(''),
    T('Combinaison :', 'fg-yellow'),
    T('  cmd1 | cmd2       passe la sortie de cmd1 à cmd2'),
    T('  sort / uniq / wc  trier, dédupliquer, compter'),
    T(''),
    T('Utilitaires :', 'fg-yellow'),
    T('  hint            indice pour le niveau actuel'),
    T('  unlock <CODE>   entre le code de déverrouillage'),
    T('  man <cmd>       manuel d\'une commande'),
    T('  history         historique des commandes'),
    T('  clear           efface l\'écran   (ou Ctrl+L)'),
    T(''),
    T('─────────────────────────────────────────────', 'fg-dim'),
    T(`OBJECTIF : ${lv.obj}`, 'fg-orange'),
    T('─────────────────────────────────────────────', 'fg-dim'),
  ];
}

// ── hint ──
function c_hint() {
  const lv = LEVELS[level - 1];
  return [
    T('╔─ INDICE ───────────────────────────────────╗', 'fg-yellow'),
    T(`║  ${lv.hint}`, 'fg-yellow'),
    T('╚────────────────────────────────────────────╝', 'fg-yellow'),
  ];
}

// ── unlock ──
function c_unlock(args) {
  if (!args.length) return [T('unlock: code manquant', 'fg-red')];
  const code = args[0].toUpperCase();
  const lv = LEVELS[level - 1];
  if (code === lv.code) return doAdvance();
  return [
    T(`[ACCÈS REFUSÉ] Code "${code}" invalide.`, 'fg-red'),
    T('Continue à chercher…', 'fg-dim'),
  ];
}

// ── man ──
function c_man(args) {
  const pages = {
    pwd:   'pwd\n  Affiche le chemin du répertoire courant.\n  Exemple : pwd',
    ls:    'ls [-a] [-l] [chemin]\n  Liste le contenu d\'un répertoire.\n  -a : affiche les fichiers cachés (commençant par ".")\n  -l : format détaillé avec permissions\n  Exemple : ls -a /home/ghost',
    cd:    'cd [chemin]\n  Change le répertoire courant.\n  Exemples : cd /var/log  |  cd ..  |  cd ~',
    cat:   'cat <fichier>\n  Affiche le contenu d\'un fichier.\n  Exemple : cat /etc/hostname',
    head:  'head [-n N] <fichier>\n  Affiche les N premières lignes (défaut : 10).\n  Exemple : head -n 5 fichier.txt',
    tail:  'tail [-n N] <fichier>\n  Affiche les N dernières lignes (défaut : 10).\n  Exemple : tail -n 3 /var/log/system.log',
    grep:  'grep [-i] [-n] <motif> <fichier>\n  Recherche un motif dans un fichier.\n  -i : insensible à la casse\n  -n : affiche les numéros de ligne\n  Exemple : grep "erreur" /var/log/system.log',
    find:  'find [chemin] [-name <nom>] [-type f|d]\n  Cherche des fichiers dans l\'arborescence.\n  Exemple : find / -name "*.txt"\n  Exemple : find /opt -type f',
    mkdir: 'mkdir <répertoire>\n  Crée un nouveau répertoire.\n  Exemple : mkdir /tmp/monrep',
    cp:    'cp <source> <destination>\n  Copie un fichier ou répertoire.\n  Exemple : cp fichier.txt /tmp/',
    mv:    'mv <source> <destination>\n  Déplace ou renomme un fichier.\n  Exemple : mv old.txt new.txt',
    rm:    'rm [-r] <cible>\n  Supprime un fichier (-r pour un répertoire).\n  Exemple : rm fichier.txt',
    sort:  'sort [fichier]\n  Trie les lignes par ordre alphabétique.\n  Utilisable avec pipe : cat f.txt | sort',
    uniq:  'uniq [fichier]\n  Supprime les lignes consécutives dupliquées.\n  Utilisable avec pipe : cat f.txt | sort | uniq',
    wc:    'wc [-l] [fichier]\n  Compte les lignes, mots et caractères.\n  Exemple : wc -l fichier.txt',
  };
  if (!args[0]) return [T('man: quelle page de manuel souhaitez-vous ?', 'fg-red')];
  const page = pages[args[0]];
  if (!page) return [T(`man: aucune entrée pour '${args[0]}'`, 'fg-red')];
  return page.split('\n').map(l => T(l, 'fg-dim'));
}
