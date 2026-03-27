// api/webhook.js — Webhook Stripe
// Atualiza o plano da usuária no Supabase após pagamento confirmado.
// Variáveis de ambiente:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   (gerado no painel Stripe > Webhooks)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (chave com acesso admin — nunca expor no frontend)

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody   = await getRawBody(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId  = session.metadata?.user_id;
    const plan    = session.metadata?.plan;

    if (userId && plan) {
      await supabase
        .from('baby_profiles')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      console.log(`✓ Plano "${plan}" ativado para user ${userId}`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // Downgrade para free quando assinatura cancelada
    const subscription = event.data.object;
    const customer = await stripe.customers.retrieve(subscription.customer);

    if (customer.email) {
      // Busca o user pelo email no Supabase Auth
      const { data } = await supabase.auth.admin.listUsers();
      const user = data?.users?.find(u => u.email === customer.email);
      if (user) {
        await supabase
          .from('baby_profiles')
          .update({ plan: 'free' })
          .eq('user_id', user.id);
        console.log(`↩ Plano revertido para "free" — user ${user.id}`);
      }
    }
  }

  return res.status(200).json({ received: true });
}
