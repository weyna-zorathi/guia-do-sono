// api/chat.js - Google Gemini (gratuito)
export default async function handler(req, res) {
  // CORS
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
    console.error("GEMINI_API_KEY não configurada no Vercel");
    return res.status(500).json({ 
      reply: "A chave da API ainda não foi configurada no Vercel. Verifique as Environment Variables." 
    });
  }

  try {
    // Monta o prompt completo
    const fullPrompt = `${system}\n\nHistórico da conversa:\n${messages.map(m => 
      `${m.role === 'user' ? 'Mãe' : 'Guia'}: ${m.content}`
    ).join('\n\n')}\n\nResponda como a Guia do Sono, com carinho e empatia:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.78,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ 
        reply: "Desculpe mamãe, tive um probleminha técnico agora. Pode tentar enviar novamente? 🌿" 
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "Estou aqui com você. Pode me contar mais sobre o sono do seu bebê?";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro no chat handler:", err);
    return res.status(500).json({ 
      reply: "Ops... Tive um erro de conexão. Pode tentar novamente em alguns segundos? ❤️" 
    });
  }
}
