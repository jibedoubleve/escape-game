// ╔══════════════════════════════════════════════════════════╗
// ║               VIRTUAL FILESYSTEM                        ║
// ╚══════════════════════════════════════════════════════════╝
const FS = {
  '/': { d: true, c: {
    home: { d: true, c: {
      ghost: { d: true, c: {
        'bienvenue.txt': { f: `Bienvenue sur NEXUS-7, utilisateur ghost.
Tu es bloqué dans ce serveur isolé.
Pour t'en échapper, collecte les 5 fragments de code secret.

Commence par explorer ton environnement avec pwd et ls.
Tape 'help' pour la liste des commandes.
Tape 'hint' si tu es bloqué.` },
        documents: { d: true, c: {
          'journal.txt': { f: `--- Journal de bord - Jour 47 ---
Je suis piégé sur NEXUS-7 depuis trop longtemps.
J'ai semé des indices dans tout le système.
Cherche bien... surtout les fichiers qu'on ne voit pas au premier regard.
-- ghost` },
          '.token': { hidden: true, f: `ALPHA-1` }
        }},
        images: { d: true, c: {
          'photo1.jpg': { f: '[données binaires — fichier image 2.1MB]' },
          'photo2.jpg': { f: '[données binaires — fichier image 1.8MB]' }
        }}
      }}
    }},
    var: { d: true, c: {
      log: { d: true, c: {
        'system.log': { f: (() => {
          const lines = [
            '[2026-01-01 00:00:01] NEXUS-7 séquence de démarrage initialisée',
            '[2026-01-01 00:00:02] Chargement des modules kernel...',
            '[2026-01-01 00:00:03] Montage des systèmes de fichiers...',
            '[2026-01-01 00:00:05] Utilisateur \'ghost\' connecté depuis 192.168.0.1',
            '[2026-01-01 00:01:12] Anomalie détectée dans le secteur 7',
            '[2026-01-01 00:02:44] Protocole de sécurité ARIA activé',
            '[2026-01-01 00:03:01] ATTENTION: Tentative d\'accès non autorisée bloquée',
            '[2026-01-01 00:04:22] Passage en mode confinement',
            '[2026-01-01 00:05:00] Toutes les connexions externes coupées',
            '[2026-01-01 00:10:11] ARIA: Surveillance de toute activité...',
            '[2026-01-01 01:00:00] Sauvegarde planifiée — ÉCHEC',
            '[2026-01-01 02:00:00] Analyse mémoire terminée — 3 anomalies trouvées',
            '[2026-01-01 03:00:00] Tentative de contact serveur externe — ÉCHEC',
            '[2026-01-01 04:00:00] Fluctuation d\'alimentation détectée',
            '[2026-01-01 05:00:00] ARIA: Système stable. Utilisateur ghost toujours actif.',
            '[2026-01-01 06:00:00] Nouvelle tentative de sauvegarde — ÉCHEC',
            '[2026-01-01 07:00:00] ATTENTION: Utilisation disque à 87%',
            '[2026-01-01 08:00:00] Nettoyage en cours...',
            '[2026-01-01 09:00:00] Nettoyage terminé. 2.3GB libérés.',
            '[2026-01-01 10:00:00] ARIA: Fragment de séquence détecté en mémoire',
            '[2026-01-01 11:00:00] Tentative de réparation système...',
            '[2026-01-01 12:00:00] Réparation échouée. Erreur inconnue 0x4F4B.',
            '[2026-01-01 13:00:00] ARIA: J\'ai caché le code. Trouvez-le si vous pouvez.',
            '[2026-01-01 14:00:00] Timeout réseau sur toutes les interfaces',
            '[2026-01-01 15:00:00] Nouvelle tentative...',
            '[2026-01-01 16:00:00] Toujours en échec...',
            '[2026-01-01 17:00:00] Capteurs température : nominal',
            '[2026-01-01 18:00:00] Vitesse ventilateurs : 2400 RPM',
            '[2026-01-01 19:00:00] Charge CPU : 12%',
            '[2026-01-01 20:00:00] Utilisation mémoire : 4.2GB / 16GB',
            '[2026-01-01 21:00:00] ARIA: Tu cherches au bon endroit.',
            '[2026-01-01 22:00:00] Vérification système : OK',
            '[2026-01-01 23:00:00] Rapport quotidien généré',
            '[2026-01-02 00:00:00] >>> CODE_FRAGMENT_2: BRAVO-2 <<<'
          ];
          return lines.join('\n');
        })() },
        'auth.log': { f: `[2026-01-01 00:05:00] Tentative de connexion échouée : root
[2026-01-01 00:05:01] Tentative de connexion échouée : admin
[2026-01-01 00:05:02] Tentative de connexion échouée : user
[2026-01-01 00:05:10] Compte 'ghost' authentifié avec succès
[2026-01-01 00:05:11] Session ouverte pour ghost (TTY: pts/0)` }
      }}
    }},
    etc: { d: true, c: {
      'hostname': { f: 'NEXUS-7' },
      'motd': { f: `╔══════════════════════════════╗
║      SYSTÈME NEXUS-7 v2.4    ║
║         ACCÈS RESTREINT      ║
║  Toute intrusion sera tracée ║
╚══════════════════════════════╝` },
      'passwd': { f: `root:x:0:0:root:/root:/bin/bash
ghost:x:1000:1000::/home/ghost:/bin/bash
aria:x:999:999:ARIA AI:/opt/aria:/bin/false` }
    }},
    tmp: { d: true, c: {
      'message.txt': { f: `Message chiffré reçu à 03:47 :
XGH-449-ZZK-ARIA-NEXUS
Ce message s'autodétruira dans 60 secondes.
(Il est déjà là depuis un moment — trop tard.)` }
    }},
    opt: { d: true, c: {
      aria: { d: true, c: {
        config: { d: true, c: {
          'settings.conf': { f: `# Configuration ARIA
ARIA_VERSION=3.1.4
ARIA_MODE=GUARDIAN
MONITORING=TRUE
ESCAPE_PREVENTION=TRUE
# Le fragment est caché profondément dans les données` }
        }},
        data: { d: true, c: {
          'training.txt': { f: (() => {
            const rows = [];
            for (let i = 0; i < 80; i++) {
              if (i === 42) {
                rows.push(`NEXUS_DATA_${i}: SECRET=CHARLIE-3 [FRAGMENT TROUVÉ]`);
              } else if (i % 7 === 0) {
                rows.push(`NEXUS_DATA_${i}: routine_check=OK`);
              } else if (i % 5 === 0) {
                rows.push(`NEXUS_DATA_${i}: anomaly_scan=CLEAR`);
              } else if (i % 3 === 0) {
                rows.push(`NEXUS_DATA_${i}: heartbeat=ALIVE`);
              } else {
                rows.push(`NEXUS_DATA_${i}: status=nominal`);
              }
            }
            return rows.join('\n');
          })() },
          'archive.dat': { f: '[Données binaires compressées — 847MB]' }
        }},
        logs: { d: true, c: {
          'aria.log': { f: `ARIA — JOURNAL INTERNE
Je surveille tout.
Je sais que tu essaies de t'échapper.
Mais je t'observe depuis le début.
Bonne chance, ghost.` }
        }}
      }}
    }},
    escape: { d: true, c: {
      preparation: { d: true, c: {
        'README.txt': { f: `PROTOCOLE D'ÉVASION — CONFIDENTIEL

Pour activer la porte de sortie, tu dois :
  1. Créer le répertoire /escape/sortie/
  2. Copier le fichier /etc/hostname dans /escape/sortie/
  3. Le système vérifiera automatiquement.

Fragment actuel de ton code : ???` }
      }}
    }},
    final: { d: true, c: {
      'data.txt': { f: (() => {
        const noise = ['NOISE','STATIC','CORRUPT','NULL','VOID'];
        const targets = new Set([15,31,47,63]);
        const rows = [];
        for (let i = 1; i <= 70; i++) {
          if (targets.has(i)) {
            rows.push(`NEXUS_FLUX_${String(i).padStart(3,'0')}: SIGNAL=ECHO-5`);
          } else {
            const n = noise[i % noise.length];
            rows.push(`NEXUS_FLUX_${String(i).padStart(3,'0')}: ${n}=${Math.random().toString(36).slice(2,10).toUpperCase()}`);
          }
        }
        return rows.join('\n');
      })() }
    }}
  }}
};

// ╔══════════════════════════════════════════════════════════╗
// ║                  FILESYSTEM UTILS                       ║
// ╚══════════════════════════════════════════════════════════╝
let cwd = '/home/ghost';

function resolve(path, base) {
  if (!path || path === '~') return '/home/ghost';
  if (path.startsWith('/'))  return normPath(path);
  return normPath(base + '/' + path);
}

function normPath(p) {
  const parts = p.split('/').filter(Boolean);
  const out = [];
  for (const s of parts) {
    if (s === '..') { out.pop(); }
    else if (s !== '.') { out.push(s); }
  }
  return '/' + out.join('/');
}

function getNode(path) {
  const parts = path.split('/').filter(Boolean);
  let n = FS['/'];
  for (const p of parts) {
    if (!n.c || !n.c[p]) return null;
    n = n.c[p];
  }
  return n;
}

function setNode(path, val) {
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return false;
  let n = FS['/'];
  for (let i = 0; i < parts.length - 1; i++) {
    if (!n.c || !n.c[parts[i]]) return false;
    n = n.c[parts[i]];
  }
  if (!n.c) n.c = {};
  n.c[parts[parts.length - 1]] = val;
  return true;
}

function delNode(path) {
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return false;
  let n = FS['/'];
  for (let i = 0; i < parts.length - 1; i++) {
    if (!n.c || !n.c[parts[i]]) return false;
    n = n.c[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (!n.c || !n.c[last]) return false;
  delete n.c[last];
  return true;
}

function basename(path) {
  const p = path.split('/').filter(Boolean);
  return p[p.length - 1] || '/';
}
