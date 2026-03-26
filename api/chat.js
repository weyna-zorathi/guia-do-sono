// api/chat.js
export default async function handler(req, res) {
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
    return res.status(500).json({ 
      reply: "Desculpe mamãe, a chave da API não está configurada corretamente. Verifique no Vercel." 
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
        model: "claude-sonnet-4-6",        // Modelo oficial atual (2026)
        max_tokens: 950,
        temperature: 0.75,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude Error:", data);
      return res.status(500).json({ 
        reply: "Desculpe, tive um probleminha técnico agora. Pode tentar enviar novamente? 🌿" 
      });
    }

    const reply = data.content?.[0]?.text || 
                  "Estou aqui com você. Pode me contar mais sobre o sono do bebê?";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro no chat handler:", err);
    return res.status(500).json({ 
      reply: "Ops... Tive um erro de conexão. Pode tentar novamente em alguns segundos? ❤️" 
    });
  }
}
