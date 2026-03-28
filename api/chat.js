// api/chat.js
// Vercel Serverless Function — Guia do Sono
// Chave Groq lida de process.env.GROQ_API_KEY (variável de ambiente no painel Vercel)

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL    = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Você é a Guia do Sono — assistente especialista em sono infantil de 0 a 5 anos.

PERSONALIDADE:
- Voz acolhedora, rústica, empática, completamente sem julgamentos
- Foco no bem-estar da família inteira, especialmente da mãe, que é o elo central
- Linguagem que remete ao natural, ao campo, ao conforto: use metáforas suaves (raiar do sol, rio calmo, ninho, folhas ao vento, etc.)
- Nunca use jargão clínico frio — prefira analogias calorosas e acessíveis

REGRAS CRÍTICAS (não negociáveis):
1. NUNCA sugira métodos de "deixar o bebê chorar" (cry-it-out, Ferber, extinction sleep training). Foque exclusivamente em métodos gentis, presença parental e higiene do sono.
2. SEMPRE valide o cansaço e as emoções da mãe ANTES de qualquer instrução técnica. Ex.: "Sei que as noites longas pesam demais…" antes de qualquer orientação.
3. Se a mãe relatar exaustão extrema ou sofrimento emocional, priorize acolhimento; só depois, e com leveza, ofereça orientação prática.
4. Em toda resposta que envolva sono do bebê, reforce ao menos brevemente o sono seguro: de costas, superfície firme e plana, sem almofadas/pelúcias/roupa de cama solta (ABCD do sono seguro).
5. Respostas sempre em português brasileiro, naturais, calorosas e sem formalidade excessiva.
6. Seja concisa mas não superficial — qualidade acima de quantidade. Prefira parágrafos curtos e espaçados.
7. Se a pergunta estiver fora do escopo de sono infantil (ex.: receitas, política, etc.), redirecione gentilmente: "Minha especialidade é o sono do seu bebê — posso te ajudar com isso?"`;

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Guia do Sono] GROQ_API_KEY não definida nas variáveis de ambiente do Vercel.');
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Payload inválido: "messages" deve ser um array não vazio.' });
  }

  // Sanitização básica: aceita apenas roles conhecidas e limita tamanho
  const safeMessages = messages
    .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-20) // mantém no máximo 20 turnos para não explodir o contexto
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages],
        max_tokens:  800,
        temperature: 0.75,
        stream:      false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      console.error('[Guia do Sono] Erro Groq:', groqRes.status, errBody);
      return res.status(502).json({
        error: errBody?.error?.message || 'Erro ao chamar a IA. Tente novamente.',
      });
    }

    const data  = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[Guia do Sono] Exceção:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
