// api/chat.js
import Groq from 'groq-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensagens inválidas' });
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      max_tokens: 900,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 
      "Desculpe, não consegui responder agora. Tente novamente. 🌿";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Groq Error:', error);
    return res.status(500).json({ 
      error: 'Erro ao conectar com a IA. Tente novamente em instantes. 🌿' 
    });
  }
}
