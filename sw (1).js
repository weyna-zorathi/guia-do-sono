// sw.js — Guia do Sono Service Worker
// Estratégia: Network First para HTML/JS/CSS → mudanças sempre aparecem
// Cache offline apenas para assets estáticos (fontes, ícones)

const CACHE_NAME = 'gds-v3';
const STATIC_ASSETS = [
  '/icon192.png',
  '/icon512.png',
  '/manifest.json'
];

// Instala e pré-cacheia apenas assets estáticos leves
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  // Ativa imediatamente sem esperar o reload
  self.skipWaiting();
});

// Limpa caches antigos ao ativar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network First: tenta a rede → fallback cache
// Para index.html e API: SEMPRE vai para a rede (sem cache)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Nunca cachear: chamadas de API, Supabase, Groq, fontes externas
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('groq.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // index.html: sempre da rede, sem cache
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Assets estáticos: Network First com fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Armazena no cache se for resposta válida
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
