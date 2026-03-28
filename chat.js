<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Guia do Sono — Chat</title>
<meta name="theme-color" content="#faf6ef">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.json">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --cream:   #faf6ef;
  --warm:    #fff9f2;
  --sage:    #8a9e7f;
  --sage-l:  #b5c9a8;
  --sage-d:  #5a7050;
  --sage-p:  #edf3e8;
  --tc:      #c47a52;
  --tc-l:    #e8a97e;
  --tc-p:    #f5e0d0;
  --brown:   #7a5c3e;
  --brown-l: #a07850;
  --linen:   #ede5d8;
  --linen-d: #d8ccb8;
  --night:   #2c3e2d;
  --gold:    #c9a84c;
  --gold-l:  #e8cc7e;
  --gold-p:  #faf3df;
}

* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color: transparent; }

html, body {
  height: 100%;
  height: 100dvh;
  overflow: hidden;
  background: var(--cream);
}

body {
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
  color: var(--night);
}

/* ── HEADER ── */
.chat-header {
  flex-shrink: 0;
  background: var(--night);
  padding: max(env(safe-area-inset-top, 0px), 48px) 16px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 10;
}

.btn-back {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7);
  font-size: 18px;
  flex-shrink: 0;
  text-decoration: none;
  transition: background .2s;
}
.btn-back:hover { background: rgba(255,255,255,0.15); }

.header-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sage), var(--sage-d));
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 2px solid rgba(181,201,168,0.3);
}

.header-info { flex: 1; min-width: 0; }
.header-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px; font-weight: 600;
  color: #fff;
  line-height: 1.2;
}
.header-status {
  font-size: 11px;
  color: var(--sage-l);
  display: flex; align-items: center; gap: 5px;
  margin-top: 2px;
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--sage-l);
  animation: pulse-dot 2.5s infinite;
}
@keyframes pulse-dot {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.3; transform:scale(.7); }
}

.btn-clear {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.45);
  font-size: 14px;
  flex-shrink: 0;
  transition: all .2s;
}
.btn-clear:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }

/* ── MESSAGES ── */
.messages-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 16px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--cream);
  background-image:
    radial-gradient(ellipse at 90% 5%, rgba(196,122,82,0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 10% 70%, rgba(138,158,127,0.05) 0%, transparent 40%);
}
.messages-area::-webkit-scrollbar { display: none; }

/* date divider */
.date-divider {
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brown-l);
  opacity: 0.55;
  margin: 8px 0 4px;
}

/* message rows */
.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: msg-in .25s ease;
}
@keyframes msg-in {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}

.msg-row.user  { flex-direction: row-reverse; }
.msg-row.ai    { flex-direction: row; }

/* avatar small */
.msg-av {
  width: 28px; height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  margin-bottom: 2px;
}
.msg-av.ai-av  { background: linear-gradient(135deg, var(--sage-p), var(--sage-l)); }
.msg-av.user-av { background: var(--tc-p); }

/* bubbles */
.bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: min(78%, 320px);
}
.msg-row.user .bubble-wrap { align-items: flex-end; }
.msg-row.ai   .bubble-wrap { align-items: flex-start; }

.bubble {
  padding: 11px 15px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.bubble.user {
  background: var(--night);
  color: rgba(255,255,255,0.92);
  border-bottom-right-radius: 5px;
}
.bubble.ai {
  background: var(--warm);
  color: var(--brown);
  border: 1px solid var(--linen);
  border-bottom-left-radius: 5px;
  box-shadow: 0 1px 4px rgba(60,40,15,0.06);
}
.bubble.ai strong { color: var(--night); font-weight: 600; }
.bubble.ai em     { color: var(--tc); font-style: italic; }

.msg-time {
  font-size: 9.5px;
  color: var(--brown-l);
  opacity: 0.45;
  margin-top: 3px;
  padding: 0 3px;
}

/* consecutive messages */
.msg-row.user + .msg-row.user .msg-av,
.msg-row.ai  + .msg-row.ai  .msg-av  { visibility: hidden; }

.msg-row.user + .msg-row.user .bubble.user { border-bottom-right-radius: 18px; border-top-right-radius: 5px; }
.msg-row.ai  + .msg-row.ai  .bubble.ai    { border-bottom-left-radius: 18px; border-top-left-radius: 5px; }

/* typing indicator */
.typing-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: msg-in .25s ease;
}
.typing-bubble {
  background: var(--warm);
  border: 1px solid var(--linen);
  border-radius: 18px;
  border-bottom-left-radius: 5px;
  padding: 13px 16px;
  display: flex; gap: 4px; align-items: center;
  box-shadow: 0 1px 4px rgba(60,40,15,0.06);
}
.typing-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--sage);
  animation: typing 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: .2s; }
.typing-dot:nth-child(3) { animation-delay: .4s; }
@keyframes typing {
  0%,60%,100% { transform:translateY(0); opacity:.4; }
  30%          { transform:translateY(-6px); opacity:1; }
}

/* empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 6px;
  text-align: center;
}
.empty-moon {
  font-size: 40px;
  margin-bottom: 8px;
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-6px); }
}
.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 17px; font-weight: 600;
  color: var(--night); margin-bottom: 4px;
}
.empty-sub {
  font-family: 'Lora', serif; font-style: italic;
  font-size: 13px; color: var(--brown-l);
  line-height: 1.7; max-width: 260px;
}

/* ── SUGESTÕES ── */
.suggestions-area {
  flex-shrink: 0;
  padding: 6px 14px 0;
  background: var(--cream);
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.suggestions-area::-webkit-scrollbar { display: none; }

.suggestion-chip {
  flex-shrink: 0;
  background: var(--warm);
  border: 1.5px solid var(--linen-d);
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--brown);
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.suggestion-chip:hover,
.suggestion-chip:active {
  background: var(--tc-p);
  border-color: var(--tc-l);
  color: var(--tc);
}

/* ── INPUT ── */
.input-area {
  flex-shrink: 0;
  background: var(--cream);
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--linen);
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-wrap {
  flex: 1;
  background: var(--warm);
  border: 1.5px solid var(--linen-d);
  border-radius: 24px;
  display: flex;
  align-items: flex-end;
  padding: 6px 6px 6px 16px;
  transition: border-color .2s, box-shadow .2s;
  gap: 6px;
}
.input-wrap:focus-within {
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(138,158,127,0.12);
}

#msgInput {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 14.5px;
  color: var(--night);
  line-height: 1.5;
  resize: none;
  max-height: 110px;
  min-height: 26px;
  padding: 3px 0;
  scrollbar-width: none;
}
#msgInput::-webkit-scrollbar { display: none; }
#msgInput::placeholder { color: var(--brown-l); opacity: 0.5; }

#sendBtn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: var(--night);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background .2s, transform .15s, opacity .2s;
}
#sendBtn:hover:not(:disabled) { background: var(--sage-d); transform: scale(1.05); }
#sendBtn:disabled { opacity: 0.35; cursor: default; }

.send-icon {
  width: 17px; height: 17px;
  fill: none; stroke: #fff;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}

/* ── BOTTOM NAV ── */
.bottom-nav {
  flex-shrink: 0;
  background: var(--warm);
  border-top: 1px solid var(--linen);
  display: flex;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  padding: 4px 0;
  transition: opacity .15s;
}
.nav-icon { font-size: 20px; line-height: 1; }
.nav-lbl  { font-size: 9.5px; font-weight: 500; color: var(--brown-l); letter-spacing: 0.02em; }
.nav-item.active .nav-lbl { color: var(--tc); }
.nav-item.active .nav-icon { filter: drop-shadow(0 0 4px rgba(196,122,82,0.4)); }

/* ── TOAST ── */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%; transform: translateX(-50%) translateY(20px);
  background: var(--night);
  color: rgba(255,255,255,0.88);
  font-size: 12.5px;
  padding: 10px 20px;
  border-radius: 100px;
  opacity: 0;
  transition: opacity .3s, transform .3s;
  pointer-events: none;
  z-index: 999;
  white-space: nowrap;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* markdown-light rendering */
.bubble.ai p   { margin-bottom: 8px; }
.bubble.ai p:last-child { margin-bottom: 0; }
.bubble.ai ul  { margin: 6px 0 6px 16px; }
.bubble.ai li  { margin-bottom: 4px; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="chat-header">
  <a class="btn-back" href="dashboard.html">‹</a>

  <div class="header-avatar">🌿</div>

  <div class="header-info">
    <div class="header-name">Guia do Sono</div>
    <div class="header-status">
      <span class="status-dot"></span>
      <span>Disponível agora</span>
    </div>
  </div>

  <button class="btn-clear" onclick="clearChat()" title="Limpar conversa">↺</button>
</div>

<!-- MESSAGES -->
<div class="messages-area" id="messagesArea">
  <div class="empty-state" id="emptyState">
    <div class="empty-moon">🌙</div>
    <div class="empty-title">Olá, mamãe 🌿</div>
    <div class="empty-sub">Estou aqui para te apoiar no sono do seu bebê, a qualquer hora, sem julgamentos.</div>
  </div>
</div>

<!-- SUGESTÕES -->
<div class="suggestions-area" id="suggestionsArea">
  <div class="suggestion-chip" onclick="sendSuggestion(this)">🌙 Meu bebê não dorme sozinho</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">⏱️ Qual a janela de sono?</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">🌿 Como criar um ritual?</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">😴 Regressão de sono</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">👶 Bebê de 4 meses</div>
</div>

<!-- INPUT -->
<div class="input-area">
  <div class="input-wrap">
    <textarea
      id="msgInput"
      placeholder="Escreva sua dúvida…"
      rows="1"
      autocomplete="off"
      spellcheck="false"
    ></textarea>
    <button id="sendBtn" onclick="sendMessage()" disabled>
      <svg class="send-icon" viewBox="0 0 24 24">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>
</div>

<!-- BOTTOM NAV -->
<div class="bottom-nav">
  <a class="nav-item" href="dashboard.html"><span class="nav-icon">🏠</span><span class="nav-lbl">Início</span></a>
  <a class="nav-item" href="progresso.html"><span class="nav-icon">📊</span><span class="nav-lbl">Progresso</span></a>
  <a class="nav-item active" href="chat.html"><span class="nav-icon">💬</span><span class="nav-lbl">Chat</span></a>
  <a class="nav-item" href="guias.html"><span class="nav-icon">📚</span><span class="nav-lbl">Guias</span></a>
  <a class="nav-item" href="perfil.html"><span class="nav-icon">👤</span><span class="nav-lbl">Perfil</span></a>
</div>

<div class="toast" id="toast"></div>

<script>
const messagesArea  = document.getElementById('messagesArea');
const msgInput      = document.getElementById('msgInput');
const sendBtn       = document.getElementById('sendBtn');
const suggestionsArea = document.getElementById('suggestionsArea');
const emptyState    = document.getElementById('emptyState');

let history = [];

// ── UTILS ──────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// light markdown → html (bold, italic, lists, newlines)
function mdToHtml(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(?!<[uop])(.+)/, '<p>$1</p>');
}

// ── RENDER ─────────────────────────────────────────────
function addMessage(text, role) {
  if (emptyState) emptyState.remove();

  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  const av = document.createElement('div');
  av.className = `msg-av ${role === 'ai' ? 'ai-av' : 'user-av'}`;
  av.textContent = role === 'ai' ? '🌿' : '👤';

  const wrap = document.createElement('div');
  wrap.className = 'bubble-wrap';

  const bbl = document.createElement('div');
  bbl.className = `bubble ${role}`;
  bbl.innerHTML = role === 'ai' ? mdToHtml(text) : text.replace(/\n/g, '<br>');

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = now();

  wrap.appendChild(bbl);
  wrap.appendChild(time);
  row.appendChild(av);
  row.appendChild(wrap);
  messagesArea.appendChild(row);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function showTyping() {
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'typingRow';

  const av = document.createElement('div');
  av.className = 'msg-av ai-av';
  av.textContent = '🌿';

  const bbl = document.createElement('div');
  bbl.className = 'typing-bubble';
  bbl.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  row.appendChild(av);
  row.appendChild(bbl);
  messagesArea.appendChild(row);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingRow');
  if (t) t.remove();
}

// ── SEND ───────────────────────────────────────────────
async function sendMessage(text) {
  const msg = (text || msgInput.value).trim();
  if (!msg) return;

  suggestionsArea.style.display = 'none';
  msgInput.value = '';
  msgInput.style.height = 'auto';
  sendBtn.disabled = true;

  addMessage(msg, 'user');
  history.push({ role: 'user', content: msg });

  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });

    removeTyping();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.reply || 'Desculpe, mamãe, não consegui responder agora. Tente de novo 🌿';

    addMessage(reply, 'ai');
    history.push({ role: 'assistant', content: reply });

  } catch (err) {
    removeTyping();
    console.error('Chat error:', err);
    addMessage('Ops, tive uma dificuldade de conexão. Tente novamente em instantes 🌿', 'ai');
  }

  sendBtn.disabled = false;
  msgInput.focus();
}

function sendSuggestion(el) {
  const text = el.textContent.replace(/^[^\s]+\s/, '').trim();
  sendMessage(text);
}

function clearChat() {
  history = [];
  messagesArea.innerHTML = '';

  // re-add empty state
  const es = document.createElement('div');
  es.className = 'empty-state';
  es.id = 'emptyState';
  es.innerHTML = `
    <div class="empty-moon">🌙</div>
    <div class="empty-title">Conversa reiniciada 🌿</div>
    <div class="empty-sub">Estou aqui para te apoiar novamente, sem pressa e sem julgamentos.</div>
  `;
  messagesArea.appendChild(es);

  suggestionsArea.style.display = 'flex';
  showToast('Conversa limpa 🌿');
}

// ── INPUT EVENTS ───────────────────────────────────────
msgInput.addEventListener('input', () => {
  msgInput.style.height = 'auto';
  msgInput.style.height = Math.min(msgInput.scrollHeight, 110) + 'px';
  sendBtn.disabled = msgInput.value.trim().length === 0;
});

msgInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
</script>
</body>
</html>
