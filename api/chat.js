import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  const { message } = req.body;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Você é a Guia do Sono. Responda de forma técnica, direta e acolhedora sobre sono de bebês, amamentação (foco em desmame gentil) e vacinas do SUS. Use tons de verde sálvia e linho como referência estética. Não seja prolixa."
      },
      { role: "user", content: message }
    ],
    model: "llama3-8b-8192", // Modelo rápido e grátis
  });

  res.status(200).json({ response: chatCompletion.choices[0].message.content });
}
