// api/chat.js - Versão simplificada e com debug
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "Método não permitido" });
  }

  const { messages, system } = req.body;

  // Debug: verificar se a chave está chegando
  console.log("GEMINI_API_KEY existe?", !!process.env.GEMINI_API_KEY);
  console.log("Quantidade de mensagens recebidas:", messages?.length || 0);

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      reply: "Chave da API não encontrada no Vercel. Verifique as Environment Variables." 
    });
  }

  try {
    const fullPrompt = `${system || ''}\n\nUsuário: ${messages[messages.length-1].content}\nResponda com carinho como Guia do Sono:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 800 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini erro:", data);
      return res.status(500).json({ reply: "Erro na API do Gemini. Tente novamente." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui gerar resposta agora.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro completo:", err);
    return res.status(500).json({ 
      reply: "Tive um erro de conexão. Pode tentar novamente? ❤️" 
    });
  }
}
