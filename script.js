const passages = [
  {
    text: "The JavaScript event loop is what allows Node.js to perform non-blocking I/O operations. Despite JavaScript being single-threaded, the event loop offloads operations to the system kernel whenever possible. The kernel is multi-threaded and can handle multiple operations executing in the background. When one of these operations completes, the kernel tells Node.js so that the appropriate callback may be added to the poll queue to be executed.",
    questions: [
      { q: "What allows Node.js to perform non-blocking I/O?", opts: ["Multi-threading", "The event loop", "Callback functions", "The V8 engine"], ans: 1 },
      { q: "Why can the kernel handle multiple operations?", opts: ["It uses JavaScript", "It is single-threaded", "It is multi-threaded", "It uses the event loop"], ans: 2 },
      { q: "What happens when a kernel operation completes?", opts: ["Node.js restarts", "A callback is added to the poll queue", "The thread is blocked", "Memory is cleared"], ans: 1 }
    ]
  },
  {
    text: "Docker containers are lightweight, standalone packages that include everything needed to run a piece of software, including the code, runtime, system tools, and libraries. Containers isolate software from its environment and ensure that it works uniformly despite differences between development and staging environments. Unlike virtual machines, containers share the host OS kernel, making them faster to start and more resource-efficient.",
    questions: [
      { q: "What do Docker containers include?", opts: ["Only the code", "Code, runtime, tools, and libraries", "Only the OS kernel", "Only libraries"], ans: 1 },
      { q: "How are containers different from VMs?", opts: ["Containers are slower", "Containers don't use OS", "Containers share host OS kernel", "Containers are larger"], ans: 2 },
      { q: "What benefit does container isolation provide?", opts: ["Slower performance", "Uniform working across environments", "Larger file size", "Requires more RAM"], ans: 1 }
    ]
  }
];

const typingTexts = {
  easy: [
    "the quick brown fox jumps over the lazy dog and runs into the forest",
    "practice makes perfect when you type every single day without stopping",
    "good developers write clean code that is easy to read and understand",
    "every bug is just a feature that has not been documented yet today"
  ],
  medium: [
    "async functions always return a promise and you can await them inside other async functions",
    "version control with git allows you to track changes collaborate and revert to previous states",
    "the dom represents the page structure that javascript can query and manipulate dynamically",
    "responsive design uses media queries and flexible layouts to adapt to different screen sizes"
  ],
  hard: [
    "const fetchData = async (url) => { try { const res = await fetch(url); return res.json(); } catch(e) { console.error(e); } };",
    "useEffect(() => { const sub = observable.subscribe(setData); return () => sub.unsubscribe(); }, [observable]);",
    "SELECT u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;",
    "git rebase -i HEAD~3 && git push --force-with-lease origin feature/refactor-auth-module"
  ]
};

const focusWords = [
  "function","const","return","async","await","fetch","state","props","render","class",
  "import","export","module","array","object","string","number","boolean","null","undefined",
  "promise","callback","event","dom","api","http","json","loop","scope","closure",
  "map","filter","reduce","component","hook","effect","context","router","redux","node",
  "react","next","vue","git","docker","sql","css","html"
];

let typingState = { running: false, timer: null, timeLeft: 60, words: [], currentWord: 0, errors: 0, correct: 0, diff: 'easy' };
let readingState = { running: false, startTime: null, endTime: null, passage: null, answered: [] };
let focusState = { running: false, timer: null, timeLeft: 60, streak: 0, correct: 0, total: 0, currentWord: '' };

function switchMode(mode) {
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
  event.target.classList.add('active');
}

function setDiff(diff, el) {
  typingState.diff = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  resetTyping();
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initChallenge() {
  const text = getRandomItem(typingTexts[typingState.diff]);
  typingState.words = text.split(' ');
  typingState.currentWord = 0;
  typingState.errors = 0;
  typingState.correct = 0;
  renderChallenge();
  updateStats();
}

function renderChallenge() {
  const box = document.getElementById('challenge-box');
  box.innerHTML = typingState.words.map((w, i) => {
    let cls = 'word pending';
    if (i < typingState.currentWord) cls = 'word correct';
    if (i === typingState.currentWord) cls = 'word current';
    return `<span class="${cls}" id="tw-${i}">${w}</span> `;
  }).join('');
}

function startTyping() {
  if (typingState.running) return;
  initChallenge();
  const inp = document.getElementById('type-input');
  inp.disabled = false;
  inp.value = '';
  inp.focus();
  document.getElementById('typing-result').classList.remove('show');
  typingState.running = true;
  typingState.timeLeft = 60;
  typingState.timer = setInterval(tickTyping, 1000);
}

function tickTyping() {
  typingState.timeLeft--;
  const t = document.getElementById('type-timer');
  t.textContent = typingState.timeLeft + 's';
  t.className = 'timer-display' + (typingState.timeLeft <= 10 ? ' danger' : '');
  if (typingState.timeLeft <= 0) finishTyping();
}

function finishTyping() {
  clearInterval(typingState.timer);
  typingState.running = false;
  document.getElementById('type-input').disabled = true;
  const wpm = typingState.correct;
  const total = typingState.correct + typingState.errors;
  const acc = total > 0 ? Math.round((typingState.correct / total) * 100) : 100;
  document.getElementById('r-wpm').textContent = wpm;
  document.getElementById('r-acc').textContent = acc + '%';
  document.getElementById('r-correct').textContent = typingState.correct;
  document.getElementById('r-errors').textContent = typingState.errors;
  const rank = wpm >= 80 ? ['S — Elite', 'rank-s'] : wpm >= 60 ? ['A — Advanced', 'rank-a'] : wpm >= 40 ? ['B — Average', 'rank-b'] : ['C — Beginner', 'rank-c'];
  document.getElementById('rank-badge-wrap').innerHTML = `<div class="rank-badge ${rank[1]}">${rank[0]}</div>`;
  document.getElementById('typing-result').classList.add('show');
}

function resetTyping() {
  clearInterval(typingState.timer);
  typingState.running = false;
  typingState.timeLeft = 60;
  document.getElementById('type-timer').textContent = '60s';
  document.getElementById('type-timer').className = 'timer-display';
  document.getElementById('type-input').disabled = true;
  document.getElementById('type-input').value = '';
  document.getElementById('typing-result').classList.remove('show');
  document.getElementById('type-progress').style.width = '0%';
  initChallenge();
  updateStats();
}

function updateStats() {
  document.getElementById('wpm-stat').textContent = typingState.correct;
  document.getElementById('acc-stat').textContent = (typingState.correct + typingState.errors > 0 ? Math.round(typingState.correct / (typingState.correct + typingState.errors) * 100) : 100) + '%';
  document.getElementById('correct-stat').textContent = typingState.correct;
  document.getElementById('errors-stat').textContent = typingState.errors;
}

document.getElementById('type-input').addEventListener('input', function () {
  if (!typingState.running) return;
  const val = this.value.trim();
  if (val.endsWith(' ') || val === typingState.words[typingState.currentWord]) {
    const typed = val.trim();
    const expected = typingState.words[typingState.currentWord];
    const el = document.getElementById('tw-' + typingState.currentWord);
    if (typed === expected) { el.className = 'word correct'; typingState.correct++; }
    else { el.className = 'word wrong'; typingState.errors++; }
    typingState.currentWord++;
    this.value = '';
    if (typingState.currentWord < typingState.words.length) {
      document.getElementById('tw-' + typingState.currentWord).className = 'word current';
    }
    const pct = Math.round((typingState.currentWord / typingState.words.length) * 100);
    document.getElementById('type-progress').style.width = pct + '%';
    updateStats();
    if (typingState.currentWord >= typingState.words.length) { initChallenge(); }
  }
});

function copyResult() {
  const wpm = document.getElementById('r-wpm').textContent;
  const acc = document.getElementById('r-acc').textContent;
  const rank = document.querySelector('.rank-badge') ? document.querySelector('.rank-badge').textContent : '';
  const txt = `I just tested my typing speed on DevSpeed!\n\nWPM: ${wpm}\nAccuracy: ${acc}\nRank: ${rank}\n\nTry it yourself: [paste your link here]`;
  navigator.clipboard.writeText(txt).then(() => alert('Copied! Paste it on LinkedIn.'));
}

function loadPassage() {
  readingState.passage = getRandomItem(passages);
  document.getElementById('read-para').textContent = readingState.passage.text;
}

function startReading() {
  if (readingState.running) {
    clearInterval(readingState._timer);
    readingState.running = false;
    readingState.endTime = Date.now();
    const secs = Math.round((readingState.endTime - readingState.startTime) / 1000);
    const wordCount = readingState.passage.text.split(' ').length;
    const wpm = Math.round((wordCount / secs) * 60);
    document.getElementById('read-wpm').textContent = wpm;
    document.getElementById('read-time').textContent = secs;
    document.getElementById('read-timer').textContent = secs + 's';
    showQuiz();
    return;
  }
  readingState.running = true;
  readingState.startTime = Date.now();
  document.getElementById('read-start-btn').textContent = 'Done reading';
  let elapsed = 0;
  readingState._timer = setInterval(() => {
    elapsed++;
    document.getElementById('read-timer').textContent = elapsed + 's';
  }, 1000);
}

function showQuiz() {
  document.getElementById('read-section').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  const c = document.getElementById('quiz-container');
  c.innerHTML = '';
  readingState.answered = new Array(readingState.passage.questions.length).fill(-1);
  readingState.passage.questions.forEach((q, qi) => {
    const div = document.createElement('div');
    div.style.marginBottom = '20px';
    div.innerHTML = `<p style="font-size:14px;color:var(--text);margin-bottom:10px;font-weight:500;">${qi + 1}. ${q.q}</p>`;
    const opts = document.createElement('div');
    opts.className = 'quiz-options';
    q.opts.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.onclick = () => {
        div.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('correct', 'wrong'));
        btn.classList.add('correct');
        readingState.answered[qi] = oi;
      };
      opts.appendChild(btn);
    });
    div.appendChild(opts);
    c.appendChild(div);
  });
}

function submitQuiz() {
  let correct = 0;
  readingState.passage.questions.forEach((q, qi) => {
    const opts = document.querySelectorAll(`#quiz-container > div:nth-child(${qi + 1}) .quiz-opt`);
    opts.forEach((btn, oi) => {
      if (oi === q.ans) btn.classList.add('correct');
      else if (readingState.answered[qi] === oi && oi !== q.ans) btn.classList.add('wrong');
    });
    if (readingState.answered[qi] === q.ans) correct++;
  });
  const score = Math.round((correct / readingState.passage.questions.length) * 100);
  document.getElementById('read-score').textContent = score + '%';
  const wpm = parseInt(document.getElementById('read-wpm').textContent) || 0;
  const rank = wpm >= 250 ? 'Speed reader' : wpm >= 180 ? 'Above avg' : 'Average';
  document.getElementById('read-rank').textContent = rank;
  document.getElementById('submit-quiz-btn').disabled = true;
  document.getElementById('submit-quiz-btn').textContent = 'Done!';
}

function resetReading() {
  clearInterval(readingState._timer);
  readingState.running = false;
  document.getElementById('read-section').style.display = 'block';
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('read-start-btn').textContent = 'Start reading';
  document.getElementById('read-timer').textContent = '—';
  document.getElementById('read-wpm').textContent = '—';
  document.getElementById('read-score').textContent = '—';
  document.getElementById('read-time').textContent = '—';
  document.getElementById('read-rank').textContent = '—';
  loadPassage();
}

function buildHeatmap() {
  const hm = document.getElementById('heatmap');
  hm.innerHTML = '';
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789 '.split('');
  letters.slice(0, 30).forEach(ch => {
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    cell.textContent = ch === ' ' ? '␣' : ch;
    cell.id = 'hm-' + ch.charCodeAt(0);
    hm.appendChild(cell);
  });
}

function loadFocusRound() {
  const display = [...focusWords.slice(0, 18)];
  const targetIdx = Math.floor(Math.random() * display.length);
  const target = getRandomItem(focusWords);
  display[targetIdx] = target;
  focusState.currentWord = target;
  const box = document.getElementById('focus-display');
  box.innerHTML = display.map((w, i) => i === targetIdx
    ? `<span style="color:var(--accent);font-weight:700;background:rgba(127,119,221,0.15);padding:2px 6px;border-radius:4px;">${w}</span> `
    : `<span style="color:#333;">${w}</span> `
  ).join('');
}

function startFocus() {
  if (focusState.running) return;
  focusState.running = true;
  focusState.timeLeft = 60;
  focusState.streak = 0;
  focusState.correct = 0;
  focusState.total = 0;
  buildHeatmap();
  loadFocusRound();
  const inp = document.getElementById('focus-input');
  inp.disabled = false;
  inp.value = '';
  inp.focus();
  focusState.timer = setInterval(() => {
    focusState.timeLeft--;
    const t = document.getElementById('focus-timer');
    t.textContent = focusState.timeLeft + 's';
    t.className = 'timer-display' + (focusState.timeLeft <= 10 ? ' danger' : '');
    if (focusState.timeLeft <= 0) {
      clearInterval(focusState.timer);
      focusState.running = false;
      inp.disabled = true;
      const pct = focusState.total > 0 ? Math.round(focusState.correct / focusState.total * 100) : 0;
      document.getElementById('focus-pct').textContent = pct + '%';
    }
  }, 1000);
}

function resetFocus() {
  clearInterval(focusState.timer);
  focusState.running = false;
  focusState.timeLeft = 60;
  focusState.streak = 0;
  focusState.correct = 0;
  focusState.total = 0;
  document.getElementById('focus-timer').textContent = '60s';
  document.getElementById('focus-streak').textContent = '0';
  document.getElementById('focus-correct').textContent = '0';
  document.getElementById('focus-total').textContent = '0';
  document.getElementById('focus-pct').textContent = '—';
  document.getElementById('focus-input').disabled = true;
  document.getElementById('focus-input').value = '';
  document.getElementById('focus-display').innerHTML = '';
  buildHeatmap();
}

document.getElementById('focus-input').addEventListener('input', function () {
  if (!focusState.running) return;
  const val = this.value.trim().toLowerCase();
  if (val === focusState.currentWord) {
    focusState.correct++;
    focusState.total++;
    focusState.streak++;
    this.value = '';
    updateFocusStats();
    const hmId = 'hm-' + focusState.currentWord.charCodeAt(0);
    const cell = document.getElementById(hmId);
    if (cell) cell.classList.add('hit');
    loadFocusRound();
  } else if (val.length >= focusState.currentWord.length) {
    focusState.total++;
    focusState.streak = 0;
    this.value = '';
    updateFocusStats();
    const hmId = 'hm-' + val.charCodeAt(0);
    const cell = document.getElementById(hmId);
    if (cell) cell.classList.add('miss');
    loadFocusRound();
  }
});

function updateFocusStats() {
  document.getElementById('focus-streak').textContent = focusState.streak;
  document.getElementById('focus-correct').textContent = focusState.correct;
  document.getElementById('focus-total').textContent = focusState.total;
  if (focusState.total > 0) {
    document.getElementById('focus-pct').textContent = Math.round(focusState.correct / focusState.total * 100) + '%';
  }
}

initChallenge();
loadPassage();
buildHeatmap();
