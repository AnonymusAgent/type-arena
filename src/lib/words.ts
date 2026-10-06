export const WORD_BANKS: Record<string, string[]> = {
  common:
    "the of and to in is you that it he was for on are as with his they at be this have from one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil now find long down day did get come made may part".split(
      " ",
    ),
  easy: "cat dog sun run fun map tip top hat bag red win jump star game play fast type key word race code line move high goal best time zone wave kind lion".split(
    " ",
  ),
  medium:
    "keyboard velocity accuracy momentum champion strategy frequent practice adapter diagram feature library machine network package quality resolve session texture virtual wireless".split(
      " ",
    ),
  hard: "asynchronous bureaucratic extraordinary juxtaposition kaleidoscope magnificently onomatopoeia phosphorescent quintessential rhythmically sophisticated unprecedented vulnerability xylophonist".split(
    " ",
  ),
  homeRow: "ask dad fall gash had flask lads salad glass half jail kayak lads sad flag fad gas has jak".split(" "),
  topRow: "que wet rope type you were our pity tore report pepper quiet writer power".split(" "),
  bottomRow: "zinc van cab man box can nab zoom mix vans comb back zebra bam vex".split(" "),
  leftHand: "west screw barge trade staff crate serve badge grease dessert".split(" "),
  rightHand: "pool link mink july hymn milk onion polyp lollipop journal".split(" "),
  numbers: "4821 90210 7 3345 18 2026 55012 729 64 1080 365 42 9981 2048".split(" "),
  symbols: "@# $% ^& *( )_ += {} [] <> /\\ |~ `? !; :\" '%".split(" "),
};

export const PARAGRAPHS: Record<string, string[]> = {
  general: [
    "The quick brown fox jumps over the lazy dog while the morning sun climbs slowly above the quiet hills and the river keeps moving toward the sea.",
    "Learning to type well is less about raw speed and more about rhythm, posture, and the patience to practice a little every single day until accuracy feels effortless.",
  ],
  business: [
    "Our quarterly revenue increased by eleven percent, driven primarily by strong retention in the enterprise segment and a measurable reduction in support costs.",
    "Please review the attached proposal before Friday so the team can finalize the budget, confirm the timeline, and share the roadmap with every stakeholder.",
  ],
  technology: [
    "Modern web applications stream data over persistent connections, cache aggressively at the edge, and render interfaces that adapt to any screen size.",
    "A good system is observable, resilient to failure, and simple enough that a new engineer can understand the critical path within a single afternoon.",
  ],
  education: [
    "Students who practice retrieval instead of rereading remember far more of what they study, because effortful recall strengthens the pathways in memory.",
  ],
  science: [
    "Photosynthesis converts light energy into chemical energy, producing the oxygen that most living organisms on this planet depend on to survive.",
  ],
  quotes: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts, and courage is built one small repetition at a time.",
  ],
  programming: [
    "const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);",
  ],
};

export const CODE_SNIPPETS: Record<string, string> = {
  javascript: `const sum = (a, b) => a + b;\nconst nums = [1, 2, 3].map((n) => n * 2);\nconsole.log(sum(nums[0], nums[1]));`,
  python: `def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a`,
  html: `<section class="card">\n  <h2>Type Arena</h2>\n  <p>Play now.</p>\n</section>`,
  css: `.btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(0,0,0,.35);\n}`,
  sql: `SELECT user_id, AVG(wpm) AS avg_wpm\nFROM game_sessions\nGROUP BY user_id\nORDER BY avg_wpm DESC;`,
  java: `public int max(int[] a) {\n  int m = a[0];\n  for (int v : a) m = Math.max(m, v);\n  return m;\n}`,
  cpp: `std::vector<int> v{3, 1, 2};\nstd::sort(v.begin(), v.end());\nfor (auto& x : v) std::cout << x << ' ';`,
};

export const NUMBER_MODES = ["random", "phone", "currency", "dates", "math"] as const;

export function makeNumberToken(mode: string): string {
  const r = (n: number) => Math.floor(Math.random() * n);
  switch (mode) {
    case "phone":
      return `(${100 + r(900)}) ${100 + r(900)}-${1000 + r(9000)}`;
    case "currency":
      return `$${(Math.random() * 9000).toFixed(2)}`;
    case "dates":
      return `${1 + r(12)}/${1 + r(28)}/20${10 + r(16)}`;
    case "math":
      return `${1 + r(99)} + ${1 + r(99)} = ${1 + r(198)}`;
    default:
      return String(100 + r(99900));
  }
}

const SYMBOLS = "@#$%^&*()_+={}[]<>/\\|~`".split("");
export function makeSymbolToken(len = 4): string {
  return Array.from({ length: len }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]).join("");
}

export function randomWords(bank: keyof typeof WORD_BANKS | string, count: number): string[] {
  const list = WORD_BANKS[bank] ?? WORD_BANKS.common;
  return Array.from({ length: count }, () => list[Math.floor(Math.random() * list.length)]);
}

export function randomSentence(category = "general"): string {
  const list = PARAGRAPHS[category] ?? PARAGRAPHS.general;
  return list[Math.floor(Math.random() * list.length)];
}
