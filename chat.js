<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Guia do Sono — Chat</title>
<meta name="theme-color" content="#faf6ef">
<link rel="manifest" href="manifest.json">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Lora:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --cream:  #faf6ef; --warm:   #fff9f2;
  --sage:   #8a9e7f; --sage-l: #b5c9a8; --sage-d: #5a7050; --sage-p: #edf3e8;
  --tc:     #c47a52; --tc-l:   #e8a97e; --tc-p:   #f5e0d0;
  --brown:  #7a5c3e; --brown-l:#a07850;
  --linen:  #ede5d8; --linen-d:#d8ccb8;
  --night:  #2c3e2d;
  --gold:   #c9a84c; --gold-l: #e8cc7e; --gold-p: #faf3df;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;height:100dvh;overflow:hidden;}
body{
  font-family:'DM Sans',sans-serif;
  background:var(--cream);
  display:flex;flex-direction:column;
}

/* ── HEADER ── */
.chat-header{
  background:var(--night);
  padding:max(env(safe-area-inset-top,0px),44px) 20px 16px;
  display:flex;align-items:center;gap:14px;
  flex-shrink:0;position:relative;overflow:hidden;
}
.chat-header::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 70% 80% at 10% 80%,rgba(138,158,127,.2) 0%,transparent 60%);
  pointer-events:none;
}
.header-back{
  width:36px;height:36px;border-radius:11px;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;cursor:pointer;flex-shrink:0;
  text-decoration:none;transition:background .2s;position:relative;z-index:1;
}
.header-back:hover{background:rgba(255,255,255,.14);}
.header-av{
  width:40px;height:40px;border-radius:13px;
  background:var(--sage);border:1.5px solid rgba(255,255,255,.15);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;flex-shrink:0;position:relative;z-index:1;
}
.header-info{flex:1;position:relative;z-index:1;}
.header-name{
  font-family:'Playfair Display',serif;
  font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;
}
.header-status{
  font-size:11px;color:var(--sage-l);
  display:flex;align-items:center;gap:5px;
}
.status-dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--sage-l);animation:blink 2.5s infinite;
}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── MESSAGES ── */
.messages{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:20px 16px;
  display:flex;flex-direction:column;gap:4px;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;
  background:var(--cream);
  background-image:
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c47a52' fill-opacity='.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
}
.messages::-webkit-scrollbar{display:none;}

/* welcome */
.welcome-msg{
  text-align:center;padding:20px 16px 28px;
}
.welcome-icon{font-size:36px;margin-bottom:10px;}
.welcome-title{
  font-family:'Playfair Display',serif;
  font-size:17px;font-weight:700;color:var(--night);margin-bottom:6px;
}
.welcome-sub{
  font-family:'Lora',serif;font-style:italic;
  font-size:13px;color:var(--brown-l);line-height:1.7;
}

/* bubbles */
.msg-row{display:flex;flex-direction:column;margin-bottom:2px;}
.msg-row.user{align-items:flex-end;}
.msg-row.ai{align-items:flex-start;}

.bubble{
  max-width:82%;padding:12px 16px;
  font-size:14px;line-height:1.65;
  animation:fadeUp .3s ease forwards;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

.bubble.user{
  background:var(--night);color:#fff;
  border-radius:18px 18px 4px 18px;
  font-family:'Lora',serif;font-style:italic;
}
.bubble.ai{
  background:var(--warm);color:var(--night);
  border:1px solid var(--linen);
  border-radius:18px 18px 18px 4px;
}
.bubble.ai strong{color:var(--sage-d);}

.msg-time{
  font-size:10px;color:var(--brown-l);opacity:.45;
  padding:2px 6px;margin-bottom:6px;
}

/* typing */
.typing-bubble{
  background:var(--warm);
  border:1px solid var(--linen);
  border-radius:18px 18px 18px 4px;
  padding:13px 18px;
  display:flex;gap:5px;align-items:center;
}
.typing-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--sage-l);
  animation:typing .9s infinite;
}
.typing-dot:nth-child(2){animation-delay:.15s;}
.typing-dot:nth-child(3){animation-delay:.3s;}
@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}

/* chips de sugestão */
.suggestions{
  display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;
  padding:0 16px 12px;flex-shrink:0;
}
.suggestions::-webkit-scrollbar{display:none;}
.suggestion-chip{
  flex-shrink:0;background:var(--warm);
  border:1.5px solid var(--linen-d);border-radius:20px;
  padding:8px 14px;font-size:12px;font-weight:500;
  color:var(--night);cursor:pointer;white-space:nowrap;
  transition:border-color .2s,background .2s;
}
.suggestion-chip:hover{border-color:var(--sage);background:var(--sage-p);}

/* ── INPUT ── */
.input-area{
  padding:10px 16px;
  padding-bottom:max(env(safe-area-inset-bottom,10px),10px);
  background:rgba(250,246,239,.96);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border-top:1px solid var(--linen);
  display:flex;gap:10px;align-items:flex-end;
  flex-shrink:0;
}
.msg-input{
  flex:1;resize:none;
  padding:12px 16px;
  border:1.5px solid var(--linen-d);border-radius:20px;
  font-family:'DM Sans',sans-serif;font-size:14px;
  color:var(--night);background:var(--warm);
  outline:none;line-height:1.5;
  max-height:120px;overflow-y:auto;
  -webkit-appearance:none;
  transition:border-color .2s;
}
.msg-input::placeholder{color:var(--brown-l);opacity:.55;}
.msg-input:focus{border-color:var(--sage);}
.send-btn{
  width:44px;height:44px;border-radius:14px;
  background:var(--night);color:#fff;
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;flex-shrink:0;
  transition:background .2s,transform .15s;
}
.send-btn:hover{background:var(--sage-d);}
.send-btn:active{transform:scale(.95);}
.send-btn:disabled{background:var(--linen-d);cursor:not-allowed;}

/* ── BOTTOM NAV ── */
.bottom-nav{
  position:fixed;bottom:0;left:0;right:0;
  background:rgba(250,246,239,.96);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-top:1px solid var(--linen);
  display:flex;align-items:center;justify-content:space-around;
  padding:8px 8px;
  padding-bottom:max(env(safe-area-inset-bottom,8px),8px);
  z-index:100;
}
.nav-item{
  flex:1;display:flex;flex-direction:column;
  align-items:center;gap:3px;padding:8px 4px;
  border-radius:14px;cursor:pointer;text-decoration:none;
  transition:background .15s;
}
.nav-item:active{background:var(--linen);}
.nav-item.active{background:var(--sage-p);}
.nav-icon{font-size:20px;line-height:1;}
.nav-lbl{font-size:10px;font-weight:500;color:var(--brown-l);}
.nav-item.active .nav-lbl{color:var(--sage-d);}
</style>
</head>
<body>

<!-- HEADER -->
<div class="chat-header">
  <a class="header-back" href="dashboard.html">‹</a>
  <div class="header-av">🌿</div>
  <div class="header-info">
    <div class="header-name">Guia do Sono</div>
    <div class="header-status"><span class="status-dot"></span>Online agora · sempre disponível</div>
  </div>
</div>

<!-- MESSAGES -->
<div class="messages" id="messages">
  <div class="welcome-msg">
    <div class="welcome-icon">🌿</div>
    <div class="welcome-title">Olá, mamãe. Estou aqui.</div>
    <div class="welcome-sub">Pode me contar qualquer coisa sobre o sono do seu bebê. Sem julgamentos, sem pressa.</div>
  </div>
</div>

<!-- SUGESTÕES -->
<div class="suggestions" id="suggestions">
  <div class="suggestion-chip" onclick="sendSuggestion(this)">😴 Bebê não dorme sozinho</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">🌙 Acorda muito à noite</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">⏱️ Qual a janela de sono do meu bebê?</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">😮 O que é regressão do sono?</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">🌅 Bebê acorda muito cedo</div>
  <div class="suggestion-chip" onclick="sendSuggestion(this)">💤 Como criar um ritual de sono?</div>
</div>

<!-- INPUT -->
<div class="input-area">
  <textarea class="msg-input" id="msgInput" placeholder="Escreva sua mensagem…" rows="1"></textarea>
  <button class="send-btn" id="sendBtn" onclick="sendMessage()">›</button>
</div>

<!-- BOTTOM NAV -->
<div class="bottom-nav">
  <a class="nav-item" href="dashboard.html"><span class="nav-icon">🏠</span><span class="nav-lbl">Início</span></a>
  <a class="nav-item" href="progresso.html"><span class="nav-icon">📊</span><span class="nav-lbl">Progresso</span></a>
  <a class="nav-item active" href="chat.html"><span class="nav-icon">💬</span><span class="nav-lbl">Chat</span></a>
  <a class="nav-item" href="guias.html"><span class="nav-icon">📚</span><span class="nav-lbl">Guias</span></a>
  <a class="nav-item" href="perfil.html"><span class="nav-icon">👤</span><span class="nav-lbl">Perfil</span></a>
</div>

<script>
const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('msgInput');
const sendBtn    = document.getElementById('sendBtn');
const suggestEl  = document.getElementById('suggestions');

let history = [];

function getTime() {
  return new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}

function addBubble(text, role) {
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;
  const bbl = document.createElement('div');
  bbl.className = `bubble ${role}`;
  bbl.innerHTML = text.replace(/\n/g, '<br>');
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();
  row.appendChild(bbl);
  row.appendChild(time);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.id = 'typing';
  const bbl = document.createElement('div');
  bbl.className = 'typing-bubble';
  bbl.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  row.appendChild(bbl);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

async function sendMessage(text) {
  const msg = (text || inputEl.value).trim();
  if (!msg) return;

  suggestEl.style.display = 'none';
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;

  addBubble(msg, 'user');
  history.push({ role: 'user', content: msg });

  showTyping();

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é a Guia do Sono, uma assistente carinhosa e experiente em sono infantil gentil. Responda em português brasileiro, com empatia, sem julgamentos. Valide o cansaço da mãe primeiro. Nunca sugira deixar o bebê chorar."
          },
          ...history
        ],
        max_tokens: 900,
        temperature: 0.7
      })
    });

    removeTyping();

    if (!res.ok) throw new Error('Erro na API');

    const data = await res.json();
    const reply = data.choices[0]?.message?.content || 'Desculpe, não consegui responder agora. Tente novamente. 🌿';

    addBubble(reply, 'ai');
    history.push({ role: 'assistant', content: reply });

  } catch (err) {
    removeTyping();
    console.error(err);
    addBubble('Ops, tive uma dificuldade de conexão. Tente novamente em instantes. 🌿', 'ai');
  }

  sendBtn.disabled = false;
  inputEl.focus();
}

function sendSuggestion(el) {
  sendMessage(el.textContent.replace(/^[^\s]+\s/, ''));
}

// Auto resize textarea
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
</script>
</body>
</html>
