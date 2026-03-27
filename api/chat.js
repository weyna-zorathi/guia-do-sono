// api/chat.js - Guia do Sono • Powered by Groq
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ reply: "Método não permitido" });

  const { messages, system } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ reply: "Chave GROQ_API_KEY não configurada no Vercel." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1024,
        temperature: 0.75,
        messages: [
          { role: "system", content: system || "Você é a Guia do Sono." },
          ...(messages || []).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq erro:", JSON.stringify(data));
      return res.status(500).json({ reply: "Tive um momento de dificuldade. Pode tentar novamente? ❤️" });
    }

    const reply = data.choices?.[0]?.message?.content
      || "Não consegui responder agora. Tente novamente 🌿";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ reply: "Erro de conexão. Pode tentar novamente? ❤️" });
  }
}
