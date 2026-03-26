// api/chat.js
export default async function handler(req, res) {
  // CORS básico para Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensagens inválidas' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY não configurada');
    return res.status(500).json({ 
      reply: "Desculpe, estou com dificuldade técnica no momento. Tente novamente em alguns segundos ❤️" 
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",        // Modelo atual e estável (2026)
        max_tokens: 900,
        temperature: 0.75,                 // Bom equilíbrio entre criatividade e consistência
        system: system || "Você é um assistente útil e acolhedor.",
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API Error:', data);
      return res.status(500).json({ 
        reply: "Desculpe mamãe, estou com um probleminha técnico agora. Pode tentar enviar novamente? 🌿" 
      });
    }

    const reply = data.content?.[0]?.text || 
                  "Não consegui gerar uma resposta agora. Pode me contar mais detalhes?";

    // Retorna no formato que o frontend espera
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Erro no handler do chat:', err);
    return res.status(500).json({ 
      reply: "Ops... Tive um erro de conexão. Pode tentar novamente em alguns segundos? Estou aqui com você ❤️" 
    });
  }
}
