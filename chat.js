// chat.js - Versão simples com Groq (atualizada)

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
        'Authorization': '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'   // ← TROQUE AQUI PELA SUA CHAVE REAL
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Você é a Guia do Sono. Uma assistente carinhosa, experiente e acolhedora sobre sono de bebês. Responda em português brasileiro, com empatia. Valide o cansaço da mãe primeiro. Nunca sugira deixar o bebê chorar." 
          },
          ...history
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    removeTyping();

    if (!res.ok) throw new Error('Erro na API');

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 
      "Desculpe mamãe, tive um probleminha agora. Pode tentar de novo? 🌿";

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

// Auto resize do textarea
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

// Enter para enviar
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
