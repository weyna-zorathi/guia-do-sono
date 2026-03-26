// api/chat.js - Guia do Sono • Powered by Groq
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ reply: "Método não permitido" });

  const { messages, system } = req.body;

  console.log("GROQ_API_KEY existe?", !!process.env.GROQ_API_KEY);
  console.log("Mensagens recebidas:", messages?.length || 0);

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      reply: "Chave GROQ_API_KEY não encontrada nas variáveis de ambiente do Vercel." 
    });
  }

  try {
    const formattedMessages = [
      {
        role: "system",
        content: system || `Você é a Guia do Sono, uma especialista acolhedora e maternal em sono infantil de 0 a 5 anos.
Sua voz é calma, empática, suave e sem julgamentos.
Sempre valide primeiro o cansaço da mãe antes de dar orientações técnicas.
Nunca sugira deixar o bebê chorar. Foque em métodos gentis, conexão emocional e rotinas previsíveis.
Responda em português brasileiro, com linguagem simples, carinho e no máximo 4-5 parágrafos curtos. Use emojis com moderação.`
      },
      ...(messages || []).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

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
        messages: formattedMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq erro:", JSON.stringify(data));
      return res.status(500).json({ 
        reply: "Tive um momento de dificuldade. Pode tentar novamente? ❤️" 
      });
    }

    const reply = data.choices?.[0]?.message?.content 
      || "Não consegui responder agora, mas estou aqui. Tente novamente 🌿";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro completo:", err);
    return res.status(500).json({ 
      reply: "Tive um erro de conexão. Pode tentar novamente? ❤️" 
    });
  }
}
