// ╔══════════════════════════════════════════════════════════╗
// ║                    BOOT SEQUENCE                        ║
// ╚══════════════════════════════════════════════════════════╝
const ASCII_LOGO = [
  ' ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗    ███████╗',
  ' ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝   ╚════██╔╝',
  ' ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗       ██╔╝ ',
  ' ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║      ██╔╝  ',
  ' ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║      ██║   ',
  ' ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝      ╚═╝   ',
];

const BOOT_MESSAGES = [
  '> Initialisation du kernel NEXUS-7 v2.4.1…',
  '> Chargement des modules de sécurité…',
  '> Montage du système de fichiers virtuel…',
  '> Démarrage du protocole ARIA…',
  '> Établissement du périmètre de confinement…',
  '> Vérification de l\'intégrité des données…',
  '> Connexion de l\'utilisateur ghost…',
  '> Préparation du terminal interactif…',
  '',
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function boot() {
  const asciiEl  = document.getElementById('bootAscii');
  const logEl    = document.getElementById('bootLog');
  const agEl     = document.getElementById('accessGranted');

  // Draw ASCII
  for (const line of ASCII_LOGO) {
    asciiEl.textContent += line + '\n';
    await sleep(55);
  }

  await sleep(200);

  // Boot messages
  for (const msg of BOOT_MESSAGES) {
    const d = document.createElement('div');
    d.className = 'line';
    d.style.animationDelay = '0s';
    d.textContent = msg;
    d.classList.add('line');
    logEl.appendChild(d);
    void d.offsetWidth;
    d.style.opacity = '0';
    d.style.animation = 'fadeLine 0.18s forwards';
    await sleep(msg ? 160 : 300);
  }

  await sleep(300);
  agEl.style.animation = 'fadeLine 0.4s forwards';
  await sleep(700);

  // Fade out
  const bs = document.getElementById('bootScreen');
  bs.style.opacity = '0';
  await sleep(700);
  bs.style.display = 'none';

  startGame();
}

function startGame() {
  startTime = Date.now();
  const lv = LEVELS[0];
  const intro = [
    T('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'fg-green'),
    T('  BASH ESCAPE GAME — Apprends les commandes bash', 'fg-cyan'),
    T('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'fg-green'),
    T(''),
    T('Bienvenue sur NEXUS-7, utilisateur ghost.', 'fg-white'),
    T('Tu es prisonnier de ce serveur isolé.', 'fg-white'),
    T('Pour t\'évader, collecte les 5 fragments de code secret.', 'fg-white'),
    T(''),
    T('  help   → liste toutes les commandes', 'fg-dim'),
    T('  hint   → indice pour le niveau actuel', 'fg-dim'),
    T('  man <cmd>  → manuel d\'une commande', 'fg-dim'),
    T(''),
    T('──────────────────────────────────────────────', 'fg-dim'),
    T(`▶  NIVEAU 1 : ${lv.name}`, 'fg-cyan'),
    T(`   Commandes : ${lv.cmds.join('  ')}`, 'fg-yellow'),
    T(''),
    T('OBJECTIF :', 'fg-orange'),
    ...lv.obj.split('\n').map(l => T('  ' + l, 'fg-orange')),
    T('──────────────────────────────────────────────', 'fg-dim'),
    T(''),
  ];

  const delay = appendLines(intro, 14);
  setTimeout(() => {
    updateHUD();
    addPromptRow();
  }, delay + 100);
}

window.addEventListener('load', boot);
