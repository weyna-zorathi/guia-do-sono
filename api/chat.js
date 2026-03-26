// api/chat.js - Versão com Google Gemini (gratuita)
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

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      reply: "Desculpe mamãe, a chave da API não está configurada ainda. Vamos resolver isso agora ❤️" 
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: system + "\n\nHistórico da conversa:\n" + messages.map(m => `${m.role}: ${m.content}`).join("\n") }]
        }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 900,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return res.status(500).json({ 
        reply: "Desculpe, tive um probleminha técnico agora. Pode tentar enviar novamente? 🌿" 
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "Estou aqui com você. Pode me contar mais sobre como está o sono do bebê?";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro no chat:", err);
    return res.status(500).json({ 
      reply: "Ops... Tive um erro de conexão. Pode tentar novamente em alguns segundos? ❤️" 
    });
  }
}
