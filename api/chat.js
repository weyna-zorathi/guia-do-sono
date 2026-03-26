// api/chat.js - Guia do Sono • Powered by Anthropic Claude
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "Método não permitido" });
  }

  const { messages, system } = req.body;

  console.log("ANTHROPIC_API_KEY existe?", !!process.env.ANTHROPIC_API_KEY);
  console.log("Quantidade de mensagens recebidas:", messages?.length || 0);

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ 
      reply: "Chave da API não encontrada. Verifique a variável ANTHROPIC_API_KEY nas Environment Variables do Vercel." 
    });
  }

  try {
    // Monta o histórico no formato esperado pela Anthropic
    // Garante alternância correta user/assistant
    const formattedMessages = (messages || []).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // Modelo rápido e econômico
        max_tokens: 1024,
        system: system || `Você é a Guia do Sono, uma especialista acolhedora e maternal em sono infantil de 0 a 5 anos. 
Sua voz é calma, empática, suave e sem julgamentos. 
Sempre valide primeiro o cansaço da mãe ("Sei como é difícil...", "Você está fazendo um ótimo trabalho...").
Nunca sugira deixar o bebê chorar. 
Foque em métodos gentis, conexão emocional e rotinas previsíveis. 
Responda em português brasileiro, com linguagem simples, carinho e no máximo 4-5 parágrafos curtos. Use emojis com moderação.`,
        messages: formattedMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic erro:", JSON.stringify(data));
      return res.status(500).json({ 
        reply: "Tive um momento de dificuldade aqui. Pode tentar novamente? ❤️" 
      });
    }

    const reply = data.content?.[0]?.text || "Não consegui gerar uma resposta agora, mas estou aqui. Tente novamente 🌿";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erro completo:", err);
    return res.status(500).json({ 
      reply: "Tive um erro de conexão. Pode tentar novamente? ❤️" 
    });
  }
}
