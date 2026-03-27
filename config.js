// api/config.js — Expõe chaves públicas do Supabase ao frontend
// As chaves anon do Supabase são seguras para uso público.
// A chave SERVICE_ROLE nunca deve sair do servidor.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({
    supabaseUrl:     process.env.SUPABASE_URL      || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  });
}
