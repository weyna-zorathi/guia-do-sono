// api/checkout.js — Criar sessão Stripe Checkout
// Variáveis de ambiente necessárias (Vercel):
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_PLUS      (Price ID do plano Plus no Stripe)
//   STRIPE_PRICE_PREMIUM   (Price ID do plano Premium no Stripe)
//   NEXT_PUBLIC_URL        (URL do seu app, ex: https://guiadosono.vercel.app)

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userEmail, userId } = req.body;

  if (!plan || !userEmail) {
    return res.status(400).json({ error: 'Plano e e-mail são obrigatórios.' });
  }

  const priceMap = {
    plus:    process.env.STRIPE_PRICE_PLUS,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  };

  const priceId = priceMap[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Plano inválido.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://guiadosono.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      customer_email:       userEmail,
      line_items: [{
        price:    priceId,
        quantity: 1,
      }],
      metadata: {
        user_id: userId || '',
        plan,
      },
      success_url: `${baseUrl}/?upgrade=success&plan=${plan}`,
      cancel_url:  `${baseUrl}/?upgrade=cancelled`,
      locale:      'pt-BR',
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
