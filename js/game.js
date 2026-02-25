// ╔══════════════════════════════════════════════════════════╗
// ║                     GAME STATE                          ║
// ╚══════════════════════════════════════════════════════════╝
let level = 1;
let cmdHistory = [];
let histIdx    = -1;
let gameStarted = false;
let startTime   = null;

const LEVELS = [
  {
    n: 1, name: 'Orientation',
    cmds: ['pwd','ls','cd'],
    obj: 'Trouve le fichier caché .token dans /home/ghost/documents\net utilise : unlock ALPHA-1',
    hint: 'Les fichiers cachés commencent par ".". Essaie "ls -a documents" depuis ton home.',
    code: 'ALPHA-1',
    done: 'Fragment 1 récupéré — tu maîtrises la navigation !'
  },
  {
    n: 2, name: 'Écoute',
    cmds: ['cat','head','tail'],
    obj: 'Le fragment 2 est à la toute fin de /var/log/system.log\nUtilise tail pour le trouver.',
    hint: 'Essaie : tail -n 3 /var/log/system.log',
    code: 'BRAVO-2',
    done: 'Fragment 2 extrait — tu sais lire les fichiers !'
  },
  {
    n: 3, name: 'Recherche',
    cmds: ['grep','find'],
    obj: 'Le fragment 3 est caché dans /opt/aria/data/training.txt\nCherche le mot "SECRET" avec grep.',
    hint: 'Essaie : grep "SECRET" /opt/aria/data/training.txt',
    code: 'CHARLIE-3',
    done: 'Fragment 3 isolé — tu sais chercher dans les données !'
  },
  {
    n: 4, name: 'Manipulation',
    cmds: ['mkdir','cp','mv','rm'],
    obj: 'Crée /escape/sortie/ puis copie /etc/hostname dedans.\nUn fichier fragment.txt apparaîtra automatiquement.',
    hint: 'mkdir /escape/sortie  puis  cp /etc/hostname /escape/sortie/',
    code: 'DELTA-4',
    done: 'Fragment 4 sécurisé — tu contrôles le système de fichiers !'
  },
  {
    n: 5, name: 'Évasion Finale',
    cmds: ['|','sort','uniq','wc'],
    obj: 'Combine les commandes avec des pipes "|"\npour filtrer /final/data.txt et trouver SIGNAL=ECHO-5.',
    hint: 'Essaie : cat /final/data.txt | grep "ECHO-5"',
    code: 'ECHO-5',
    done: 'SÉQUENCE COMPLÈTE — NEXUS-7 VAINCU !'
  }
];

// ╔══════════════════════════════════════════════════════════╗
// ║                  LEVEL MANAGEMENT                       ║
// ╚══════════════════════════════════════════════════════════╝
function triggerLevel4Check() {
  if (level !== 4) return;
  const sortie   = getNode('/escape/sortie');
  const hostname = getNode('/escape/sortie/hostname');
  if (sortie && hostname && !getNode('/escape/sortie/fragment.txt')) {
    setNode('/escape/sortie/fragment.txt', {
      f: `FÉLICITATIONS !
Tu as correctement manipulé les fichiers.
Fragment déverrouillé : DELTA-4
─────────────────────────────────
Utilise : unlock DELTA-4`
    });
    setTimeout(() => {
      appendLines([
        T(''),
        T('[SYSTÈME] Vérification en cours…', 'fg-yellow'),
      ]);
      setTimeout(() => appendLines([
        T('[SYSTÈME] Conditions remplies !', 'fg-green'),
        T('[SYSTÈME] Nouveau fichier : /escape/sortie/fragment.txt', 'fg-green'),
      ]), 900);
    }, 400);
  }
}

function doAdvance() {
  const lv = LEVELS[level - 1];
  if (level === LEVELS.length) {
    setTimeout(showVictory, 600);
    return [
      T(''),
      T('██████████████████████████████████████████████', 'fg-green'),
      T('▓▓  SÉQUENCE D\'ÉVASION COMPLÈTE ! BRAVO !  ▓▓', 'fg-green'),
      T('██████████████████████████████████████████████', 'fg-green'),
    ];
  }
  level++;
  updateHUD();
  const next = LEVELS[level - 1];
  return [
    T(''),
    T('══════════════════════════════════════════════', 'fg-green'),
    T(`  ✓  ${lv.done}`, 'fg-green'),
    T('══════════════════════════════════════════════', 'fg-green'),
    T(''),
    T(`▶  NIVEAU ${level} : ${next.name}`, 'fg-cyan'),
    T(`   Nouvelles commandes : ${next.cmds.join('  ')}`, 'fg-yellow'),
    T(''),
    T(`OBJECTIF :`, 'fg-orange'),
    ...next.obj.split('\n').map(l => T('  ' + l, 'fg-orange')),
    T(''),
    T('  (tape "hint" si tu es bloqué)', 'fg-dim'),
    T(''),
  ];
}

function updateHUD() {
  const pct = Math.round(((level - 1) / LEVELS.length) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent  = pct + '%';
  document.getElementById('levelBadge').textContent   = `NIVEAU ${level} / 5`;
}

function showVictory() {
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressPct').textContent  = '100%';

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  document.querySelector('#victoryBox h1').insertAdjacentHTML(
    'afterend',
    `<div style="color:var(--dim);font-size:12px;margin-bottom:16px;">Temps : ${mins}m ${secs}s</div>`
  );

  document.getElementById('victoryOverlay').classList.add('show');

  let f = 0;
  const iv = setInterval(() => {
    document.getElementById('terminalWindow').style.boxShadow =
      f++ % 2 === 0
        ? '0 0 50px var(--green), 0 0 100px #00ff4166'
        : '0 0 10px var(--green)';
    if (f > 10) { clearInterval(iv); document.getElementById('terminalWindow').style.boxShadow = ''; }
  }, 180);
}
