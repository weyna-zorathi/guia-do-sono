// auth.js — Autenticação Supabase
// Importe este arquivo no seu index.html antes do </body>:
// <script type="module" src="/auth.js"></script>
//
// Variáveis de ambiente necessárias (Vercel):
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//
// No cliente (index.html) defina window.SUPABASE_URL e window.SUPABASE_ANON_KEY
// via uma rota /api/config.js (abaixo) para não expor no frontend.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// As variáveis chegam via /api/config (rota serverless segura)
async function getConfig() {
  const res = await fetch('/api/config');
  return res.json();
}

let supabase;

export async function initSupabase() {
  const { supabaseUrl, supabaseAnonKey } = await getConfig();
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Salvar perfil do bebê
export async function saveBabyProfile(userId, profile) {
  const { error } = await supabase
    .from('baby_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Buscar perfil do bebê
export async function getBabyProfile(userId) {
  const { data, error } = await supabase
    .from('baby_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

// Salvar registro de sono
export async function saveSleepLog(userId, log) {
  // log = { type: 'nap'|'night', start_at, end_at, duration_min, notes }
  const { error } = await supabase
    .from('sleep_logs')
    .insert({ user_id: userId, ...log });
  if (error) throw error;
}

// Buscar logs da semana
export async function getWeekLogs(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', since.toISOString())
    .order('start_at', { ascending: false });
  if (error) return [];
  return data;
}

// Ouvir mudanças de sessão (login/logout automático)
export function onAuthChange(callback) {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
