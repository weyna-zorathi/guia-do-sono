/**
 * baby.js — Guia do Sono
 * ──────────────────────────────────────────────────────────────
 * Módulo completo de gerenciamento de múltiplos bebês.
 *
 * COMO USAR:
 *   1. Copie este arquivo para a raiz do projeto (mesmo nível de index.html).
 *   2. No dashboard.html, adicione antes do </body>:
 *        <script src="baby.js"></script>
 *   3. O módulo se auto-inicializa e expõe as funções globais:
 *        window.GDS_Baby.loadProfiles()
 *        window.GDS_Baby.setCurrentBaby(id)
 *        window.GDS_Baby.addNewBaby()
 *        window.GDS_Baby.getCurrentBaby()
 *
 * SUPABASE:
 *   - Lê de baby_profiles (schema existente) via client global `sb`
 *     que já existe no index.html/dashboard.html.
 *   - Para múltiplos bebês, remove a constraint UNIQUE em user_id
 *     e usa o campo `id` (uuid) como chave primária de cada bebê.
 *   - Script SQL de migração incluído no final deste arquivo (comentado).
 *
 * LOCALSTORAGE:
 *   gds_babies          → array de perfis em cache
 *   gds_current_baby_id → uuid do bebê ativo
 * ──────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONSTANTES
  ───────────────────────────────────────── */
  const LS_BABIES     = 'gds_babies';
  const LS_CURRENT_ID = 'gds_current_baby_id';
  const LS_PERFIL_MAE = 'gds_perfil_mae'; // chave legada, mantida p/ compatibilidade

  /* ─────────────────────────────────────────
     UTILITÁRIOS
  ───────────────────────────────────────── */
  function safeJSON(str, fallback) {
    try { return JSON.parse(str) || fallback; } catch { return fallback; }
  }

  function uuid() {
    return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  }

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  /** Calcula idade em texto legível a partir de uma data ISO */
  function calcIdade(dataStr) {
    if (!dataStr) return '–';
    const nasc  = new Date(dataStr + 'T00:00:00');
    const hoje  = new Date();
    let anos  = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth()    - nasc.getMonth();
    let dias  = hoje.getDate()     - nasc.getDate();
    if (dias  < 0) meses--;
    if (meses < 0) { anos--; meses += 12; }
    const totalDias   = Math.floor((hoje - nasc) / 86400000);
    const totalSemanas = Math.floor(totalDias / 7);
    const totalMeses  = anos * 12 + meses;

    let str;
    if (totalMeses < 1)   str = totalSemanas + (totalSemanas === 1 ? ' semana' : ' semanas');
    else if (totalMeses < 24) {
      str = totalMeses + (totalMeses === 1 ? ' mês' : ' meses');
      if (dias > 0) str += ' e ' + dias + (dias === 1 ? ' dia' : ' dias');
    } else {
      str = anos + (anos === 1 ? ' ano' : ' anos');
      if (meses > 0) str += ' e ' + meses + (meses === 1 ? ' mês' : ' meses');
    }
    return { str, totalMeses, totalSemanas, totalDias };
  }

  /** Janela de vigília recomendada por faixa etária */
  function janelaRecomendada(totalMeses) {
    const FAIXAS = [
      { max: 1,   label: '45–60 min' },
      { max: 2,   label: '60–90 min' },
      { max: 4,   label: '90–120 min' },
      { max: 6,   label: '2–2,5 h' },
      { max: 9,   label: '2,5–3 h' },
      { max: 12,  label: '3–3,5 h' },
      { max: 18,  label: '3,5–4,5 h' },
      { max: 999, label: '4–6 h' },
    ];
    return (FAIXAS.find(f => totalMeses <= f.max) || FAIXAS[FAIXAS.length - 1]).label;
  }

  /** Mostra um toast flutuante */
  function toast(msg) {
    let el = document.getElementById('gds-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gds-toast';
      el.style.cssText =
        'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);' +
        'background:#2c3e2d;color:#fff;padding:10px 22px;border-radius:100px;' +
        'font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all .3s;' +
        'pointer-events:none;white-space:nowrap;box-shadow:0 6px 24px rgba(0,0,0,.28);' +
        'font-family:"DM Sans",sans-serif;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(el._t);
    el._t = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  /* ─────────────────────────────────────────
     ESTADO INTERNO
  ───────────────────────────────────────── */
  let _babies    = [];   // array de objetos de bebê
  let _currentId = null; // id do bebê ativo

  /* ─────────────────────────────────────────
     ACESSO AO SUPABASE (compatível com index.html)
  ───────────────────────────────────────── */

  /** Retorna o client Supabase global (definido no index.html como `sb`) */
  function getSb() {
    return window.sb || null;
  }

  /** Retorna o usuário atual (definido no index.html como `currentUser`) */
  function getUser() {
    return window.currentUser || null;
  }

  /* ─────────────────────────────────────────
     PERSISTÊNCIA LOCAL
  ───────────────────────────────────────── */

  function saveBabiesToCache(babies) {
    _babies = babies;
    try { localStorage.setItem(LS_BABIES, JSON.stringify(babies)); } catch {}
  }

  function loadBabiesFromCache() {
    _babies = safeJSON(localStorage.getItem(LS_BABIES), []);
    return _babies;
  }

  function saveCurrentId(id) {
    _currentId = id;
    try { localStorage.setItem(LS_CURRENT_ID, id || ''); } catch {}
  }

  function loadCurrentId() {
    _currentId = localStorage.getItem(LS_CURRENT_ID) || null;
    return _currentId;
  }

  /** Converte um registro Supabase para o formato interno */
  function toInternal(row) {
    return {
      id:              row.id,
      user_id:         row.user_id,
      nome:            row.nome_bebe || row.baby_name || '',
      data_nascimento: row.data_nascimento || null,
      genero:          row.genero || 'n',
      peso:            row.peso_atual || row.weight || '',
      altura:          row.altura_atual || '',
      foto:            row.foto || null,
      plano:           row.plan || 'free',
      created_at:      row.created_at,
    };
  }

  /* ─────────────────────────────────────────
     CARREGAMENTO DE PERFIS
  ───────────────────────────────────────── */

  /**
   * Carrega todos os bebês do usuário atual.
   * Tenta Supabase primeiro; cai no cache local em caso de erro.
   * @returns {Promise<Array>} lista de bebês
   */
  async function loadProfiles() {
    const user = getUser();
    const sb   = getSb();

    // Modo offline / teste — usa cache local ou cria um padrão a partir de gds_perfil_mae
    if (!user || !sb) {
      loadBabiesFromCache();
      if (_babies.length === 0) _migrateLegazyProfile();
      _ensureCurrentId();
      return _babies;
    }

    try {
      const { data, error } = await sb
        .from('baby_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const babies = data.map(toInternal);
        saveBabiesToCache(babies);
        _ensureCurrentId();
        return babies;
      }
    } catch (e) {
      console.warn('[GDS Baby] Supabase indisponível, usando cache:', e.message);
    }

    // Fallback: cache local
    loadBabiesFromCache();
    if (_babies.length === 0) _migrateLegazyProfile();
    _ensureCurrentId();
    return _babies;
  }

  /**
   * Migra o perfil legado (gds_perfil_mae) para o novo formato multi-bebê,
   * criando o primeiro bebê no array se não existir nenhum.
   */
  function _migrateLegazyProfile() {
    const legacy = safeJSON(localStorage.getItem(LS_PERFIL_MAE), {});
    if (!legacy.nome_bebe && !legacy.baby_name) return; // nada para migrar

    const baby = {
      id:              uuid(),
      user_id:         getUser()?.id || 'local',
      nome:            legacy.nome_bebe || legacy.baby_name || 'Bebê',
      data_nascimento: legacy.data_nascimento || null,
      genero:          legacy.genero || 'n',
      peso:            legacy.peso || legacy.peso_atual || '',
      altura:          legacy.altura || legacy.altura_atual || '',
      foto:            legacy.bebe_foto || null,
      plano:           'free',
      created_at:      new Date().toISOString(),
    };
    _babies = [baby];
    saveBabiesToCache(_babies);
  }

  /** Garante que _currentId aponta para um bebê existente */
  function _ensureCurrentId() {
    loadCurrentId();
    if (!_currentId || !_babies.find(b => b.id === _currentId)) {
      const first = _babies[0];
      saveCurrentId(first ? first.id : null);
    }
  }

  /* ─────────────────────────────────────────
     BEBÊ ATIVO
  ───────────────────────────────────────── */

  /** Retorna o objeto do bebê atualmente ativo */
  function getCurrentBaby() {
    return _babies.find(b => b.id === _currentId) || _babies[0] || null;
  }

  /**
   * Define o bebê ativo e dispara o evento `gds:babyChanged`
   * para que o dashboard possa atualizar a UI.
   * @param {string} id — uuid do bebê
   */
  function setCurrentBaby(id) {
    const baby = _babies.find(b => b.id === id);
    if (!baby) return;
    saveCurrentId(id);
    // Sincroniza com cache legado para compatibilidade
    _syncToLegacy(baby);
    // Dispara evento customizado
    document.dispatchEvent(new CustomEvent('gds:babyChanged', { detail: baby }));
  }

  /** Mantém gds_perfil_mae sincronizado com o bebê ativo (compatibilidade) */
  function _syncToLegacy(baby) {
    try {
      const legacy = safeJSON(localStorage.getItem(LS_PERFIL_MAE), {});
      Object.assign(legacy, {
        nome_bebe:       baby.nome,
        data_nascimento: baby.data_nascimento,
        genero:          baby.genero,
        peso:            baby.peso,
        peso_atual:      baby.peso,
        altura:          baby.altura,
        altura_atual:    baby.altura,
        bebe_foto:       baby.foto,
      });
      localStorage.setItem(LS_PERFIL_MAE, JSON.stringify(legacy));
    } catch {}
  }

  /* ─────────────────────────────────────────
     INSERÇÃO DE NOVO BEBÊ
  ───────────────────────────────────────── */

  /**
   * Insere um novo bebê no Supabase e no cache local.
   * @param {Object} formData — { nome, data_nascimento, genero, peso, altura }
   */
  async function _insertBaby(formData) {
    const user = getUser();
    const sb   = getSb();
    const now  = new Date().toISOString();

    const newBaby = {
      id:              uuid(),
      user_id:         user?.id || 'local',
      nome:            formData.nome.trim(),
      data_nascimento: formData.data_nascimento || null,
      genero:          formData.genero || 'n',
      peso:            formData.peso?.trim() || '',
      altura:          formData.altura?.trim() || '',
      foto:            null,
      plano:           'free',
      created_at:      now,
    };

    // Persiste no Supabase se disponível
    if (user && sb) {
      try {
        const { data, error } = await sb.from('baby_profiles').insert({
          user_id:         user.id,
          nome_bebe:       newBaby.nome,
          baby_name:       newBaby.nome,
          data_nascimento: newBaby.data_nascimento,
          genero:          newBaby.genero,
          peso_atual:      newBaby.peso,
          altura_atual:    newBaby.altura,
          plan:            'free',
          updated_at:      now,
        }).select().single();

        if (!error && data) {
          newBaby.id = data.id; // usa o uuid do Supabase
        }
      } catch (e) {
        console.warn('[GDS Baby] Inserção Supabase falhou, salvando localmente:', e.message);
      }
    }

    _babies.push(newBaby);
    saveBabiesToCache(_babies);
    return newBaby;
  }

  /* ─────────────────────────────────────────
     MODAL DE ADICIONAR BEBÊ
  ───────────────────────────────────────── */

  /**
   * Abre o modal de cadastro de novo bebê.
   * Estilo alinhado ao questionário de boas-vindas do app.
   */
  function addNewBaby() {
    // Evita duplicata
    if (document.getElementById('gds-add-baby-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gds-add-baby-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9990;' +
      'background:rgba(44,62,45,.6);' +
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
      'display:flex;align-items:center;justify-content:center;padding:20px;';

    overlay.innerHTML = `
      <div id="gds-add-baby-modal" style="
        width:100%;max-width:440px;
        background:var(--cream,#fdfbf7);
        border:1px solid rgba(255,255,255,.7);
        border-radius:28px;overflow:hidden;
        display:flex;flex-direction:column;
        box-shadow:0 20px 60px rgba(30,42,30,.35);
        animation:gdsModalIn .4s cubic-bezier(.34,1.56,.64,1) both;
        max-height:90dvh;
      ">
        <!-- Cabeçalho -->
        <div style="
          background:linear-gradient(135deg,#1a2e1a 0%,#3d5a3e 100%);
          padding:22px 22px 18px;flex-shrink:0;
          text-align:center;position:relative;
        ">
          <button onclick="window.GDS_Baby._closeAddModal()" style="
            position:absolute;top:14px;right:14px;
            width:30px;height:30px;border-radius:50%;
            background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);
            color:#fff;font-size:16px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
          ">✕</button>
          <div style="font-size:32px;margin-bottom:8px;animation:leafSway 4s ease-in-out infinite;">🌸</div>
          <div style="font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:#fff;margin-bottom:4px;">
            Novo <em style="color:#e8a97e;font-style:italic;">bebê</em>
          </div>
          <div style="font-family:'Lora',serif;font-style:italic;font-size:12px;color:rgba(255,255,255,.5);">
            Mais amor chegando por aqui 💚
          </div>
          <!-- Barra de progresso -->
          <div style="height:3px;background:rgba(255,255,255,.15);margin-top:16px;border-radius:100px;">
            <div id="gds-baby-prog" style="height:100%;border-radius:100px;background:linear-gradient(90deg,#b5c9a8,#e8cc7e);transition:width .4s ease;width:0%;"></div>
          </div>
        </div>

        <!-- Corpo do formulário -->
        <div style="flex:1;overflow-y:auto;padding:22px 22px 0;scrollbar-width:none;">

          <!-- Passo 1: dados essenciais -->
          <div id="gds-step-1">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a9e7f;margin-bottom:6px;">🌱 Sobre o novo bebê</div>

            <div style="margin-bottom:13px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#a07850;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;">Nome do bebê *</label>
              <input id="ab-nome" type="text" placeholder="Como você chama seu pequeno?"
                style="width:100%;padding:12px 14px;border:1.5px solid #d8ccb8;border-radius:13px;font-family:'DM Sans',sans-serif;font-size:14px;color:#2c3e2d;background:#fff;outline:none;transition:border-color .2s;"
                onfocus="this.style.borderColor='#8a9e7f'" onblur="this.style.borderColor='#d8ccb8'">
            </div>

            <div style="margin-bottom:13px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#a07850;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;">Data de nascimento</label>
              <input id="ab-nasc" type="date"
                style="width:100%;padding:12px 14px;border:1.5px solid #d8ccb8;border-radius:13px;font-family:'DM Sans',sans-serif;font-size:14px;color:#2c3e2d;background:#fff;outline:none;transition:border-color .2s;"
                onfocus="this.style.borderColor='#8a9e7f'" onblur="this.style.borderColor='#d8ccb8'">
            </div>

            <!-- Gênero -->
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#a07850;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">Gênero</label>
              <div style="display:flex;gap:8px;">
                ${_generoBtn('ab-g-m','m','👦','Menino')}
                ${_generoBtn('ab-g-f','f','👧','Menina')}
                ${_generoBtn('ab-g-n','n','🌈','Prefiro não informar')}
              </div>
            </div>
          </div>

          <!-- Passo 2: dados opcionais -->
          <div id="gds-step-2" style="display:none;">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a9e7f;margin-bottom:6px;">📏 Dados de saúde (opcional)</div>
            <div style="font-family:'Lora',serif;font-style:italic;font-size:12px;color:#a07850;margin-bottom:14px;line-height:1.5;">
              Esses dados ajudam a personalizar as dicas — mas são completamente opcionais.
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:13px;">
              <div>
                <label style="display:block;font-size:11px;font-weight:600;color:#a07850;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;">Peso atual</label>
                <input id="ab-peso" type="text" placeholder="ex: 6,2 kg"
                  style="width:100%;padding:10px 12px;border:1.5px solid #d8ccb8;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#2c3e2d;background:#fff;outline:none;"
                  onfocus="this.style.borderColor='#8a9e7f'" onblur="this.style.borderColor='#d8ccb8'">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:600;color:#a07850;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;">Altura atual</label>
                <input id="ab-altura" type="text" placeholder="ex: 62 cm"
                  style="width:100%;padding:10px 12px;border:1.5px solid #d8ccb8;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#2c3e2d;background:#fff;outline:none;"
                  onfocus="this.style.borderColor='#8a9e7f'" onblur="this.style.borderColor='#d8ccb8'">
              </div>
            </div>

            <!-- Preview -->
            <div id="ab-preview" style="
              background:linear-gradient(135deg,#edf3e8,#faf3df);
              border:1px solid #b5c9a8;border-radius:14px;
              padding:14px 16px;margin-bottom:4px;display:none;
            ">
              <div style="font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:#2c3e2d;margin-bottom:4px;" id="ab-preview-nome"></div>
              <div style="font-family:'Lora',serif;font-style:italic;font-size:11px;color:#a07850;" id="ab-preview-idade"></div>
            </div>
          </div>

        </div>

        <!-- Rodapé com botões -->
        <div style="padding:16px 22px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
          <div style="font-family:'Lora',serif;font-style:italic;font-size:11px;color:#a07850;" id="ab-step-lbl">Etapa 1 de 2</div>
          <div style="display:flex;gap:8px;">
            <button id="ab-btn-back" onclick="window.GDS_Baby._modalBack()" style="
              background:transparent;border:1.5px solid #d8ccb8;border-radius:12px;
              padding:10px 18px;font-family:'DM Sans',sans-serif;font-size:13px;
              font-weight:500;color:#a07850;cursor:pointer;display:none;
            ">← Voltar</button>
            <button id="ab-btn-next" onclick="window.GDS_Baby._modalNext()" style="
              background:linear-gradient(135deg,#8a9e7f,#5a7050);
              color:#fff;border:none;border-radius:12px;padding:11px 24px;
              font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;
              cursor:pointer;box-shadow:0 3px 12px rgba(90,112,80,.3);
              transition:transform .18s,box-shadow .18s;
            ">Próximo →</button>
          </div>
        </div>
      </div>`;

    // Injetar animação se ainda não existir
    if (!document.getElementById('gds-baby-keyframes')) {
      const st = document.createElement('style');
      st.id = 'gds-baby-keyframes';
      st.textContent = `
        @keyframes gdsModalIn {
          from { opacity:0; transform:translateY(28px) scale(.96); }
          to   { opacity:1; transform:none; }
        }`;
      document.head.appendChild(st);
    }

    // Fechar ao clicar no overlay
    overlay.addEventListener('click', e => {
      if (e.target === overlay) _closeAddModal();
    });

    document.body.appendChild(overlay);
    _setModalStep(1);

    // Selecionar gênero neutro por padrão
    const defaultG = document.getElementById('ab-g-n');
    if (defaultG) defaultG.click();

    // Focus no nome
    setTimeout(() => document.getElementById('ab-nome')?.focus(), 200);
  }

  /** Gera HTML de botão de gênero */
  function _generoBtn(id, val, emoji, label) {
    return `<button id="${id}" data-genero="${val}" onclick="window.GDS_Baby._selectGenero('${val}')" style="
      flex:1;padding:10px 6px;border:1.5px solid #d8ccb8;border-radius:13px;
      background:#fff;cursor:pointer;transition:all .18s;
      font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;color:#7a5c3e;
      display:flex;flex-direction:column;align-items:center;gap:4px;
    ">
      <span style="font-size:20px;">${emoji}</span>
      <span>${label}</span>
    </button>`;
  }

  /** Passo atual do modal (1 ou 2) */
  let _modalStep = 1;
  let _selectedGenero = 'n';

  function _setModalStep(step) {
    _modalStep = step;
    const s1  = document.getElementById('gds-step-1');
    const s2  = document.getElementById('gds-step-2');
    const lbl = document.getElementById('ab-step-lbl');
    const bk  = document.getElementById('ab-btn-back');
    const nx  = document.getElementById('ab-btn-next');
    const pg  = document.getElementById('gds-baby-prog');
    if (!s1) return;

    if (step === 1) {
      s1.style.display = 'block';
      s2.style.display = 'none';
      if (lbl) lbl.textContent = 'Etapa 1 de 2';
      if (bk)  bk.style.display = 'none';
      if (nx)  nx.textContent = 'Próximo →';
      if (pg)  pg.style.width = '50%';
    } else {
      s1.style.display = 'none';
      s2.style.display = 'block';
      if (lbl) lbl.textContent = 'Etapa 2 de 2';
      if (bk)  bk.style.display = 'block';
      if (nx)  nx.textContent = 'Salvar bebê 🌿';
      if (pg)  pg.style.width = '100%';
      _updatePreview();
    }
  }

  function _selectGenero(val) {
    _selectedGenero = val;
    ['m','f','n'].forEach(v => {
      const btn = document.getElementById('ab-g-' + v);
      if (!btn) return;
      if (v === val) {
        btn.style.borderColor  = '#8a9e7f';
        btn.style.background   = '#edf3e8';
        btn.style.color        = '#5a7050';
        btn.style.fontWeight   = '700';
      } else {
        btn.style.borderColor  = '#d8ccb8';
        btn.style.background   = '#fff';
        btn.style.color        = '#7a5c3e';
        btn.style.fontWeight   = '500';
      }
    });
  }

  function _modalBack() {
    _setModalStep(1);
  }

  function _modalNext() {
    if (_modalStep === 1) {
      const nome = document.getElementById('ab-nome')?.value.trim();
      if (!nome) {
        const inp = document.getElementById('ab-nome');
        if (inp) { inp.style.borderColor='#c47a52'; inp.focus(); }
        toast('Por favor, informe o nome do bebê 🌸');
        return;
      }
      _setModalStep(2);
    } else {
      _submitModal();
    }
  }

  function _updatePreview() {
    const nome  = document.getElementById('ab-nome')?.value.trim()   || '';
    const nasc  = document.getElementById('ab-nasc')?.value           || '';
    const prev  = document.getElementById('ab-preview');
    const pNome = document.getElementById('ab-preview-nome');
    const pIdad = document.getElementById('ab-preview-idade');
    if (!prev) return;
    if (nome) {
      prev.style.display = 'block';
      if (pNome) pNome.textContent = nome;
      if (pIdad) {
        const info = nasc ? calcIdade(nasc) : null;
        pIdad.textContent = info ? info.str : 'Data de nascimento não informada';
      }
    } else {
      prev.style.display = 'none';
    }
  }

  async function _submitModal() {
    const nx = document.getElementById('ab-btn-next');
    if (nx) { nx.disabled = true; nx.textContent = 'Salvando…'; }

    const formData = {
      nome:            document.getElementById('ab-nome')?.value   || '',
      data_nascimento: document.getElementById('ab-nasc')?.value   || '',
      genero:          _selectedGenero,
      peso:            document.getElementById('ab-peso')?.value   || '',
      altura:          document.getElementById('ab-altura')?.value || '',
    };

    try {
      const newBaby = await _insertBaby(formData);
      _closeAddModal();
      setCurrentBaby(newBaby.id);
      toast('✓ ' + newBaby.nome + ' adicionado com carinho 🌿');
      // Dispara recarregamento da UI do dashboard
      document.dispatchEvent(new CustomEvent('gds:babiesUpdated', { detail: _babies }));
    } catch (e) {
      console.error('[GDS Baby] Erro ao salvar:', e);
      toast('Erro ao salvar. Tente novamente.');
      if (nx) { nx.disabled = false; nx.textContent = 'Salvar bebê 🌿'; }
    }
  }

  function _closeAddModal() {
    const ov = document.getElementById('gds-add-baby-overlay');
    if (ov) ov.remove();
    _modalStep = 1;
    _selectedGenero = 'n';
  }

  /* ─────────────────────────────────────────
     API PÚBLICA
  ───────────────────────────────────────── */
  window.GDS_Baby = {
    loadProfiles,
    getCurrentBaby,
    setCurrentBaby,
    addNewBaby,
    getBabies: () => [..._babies],

    // Exposto para os event listeners do modal
    _closeAddModal,
    _modalBack,
    _modalNext,
    _selectGenero,
  };

  /* ─────────────────────────────────────────
     AUTO-INIT
  ───────────────────────────────────────── */
  // Carrega perfis assim que o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadProfiles());
  } else {
    loadProfiles();
  }

})();

/*
 ┌──────────────────────────────────────────────────────────┐
 │  MIGRAÇÃO SUPABASE — execute no SQL Editor do Supabase   │
 │  APENAS SE quiser suportar múltiplos bebês por mãe.      │
 │  Caso contrário, o módulo funciona 100% com localStorage.│
 └──────────────────────────────────────────────────────────┘

-- 1. Remove a constraint UNIQUE de user_id (1 bebê por mãe)
ALTER TABLE public.baby_profiles
  DROP CONSTRAINT IF EXISTS baby_profiles_user_id_key;

-- 2. Adiciona campos de múltiplos bebês se não existirem
ALTER TABLE public.baby_profiles
  ADD COLUMN IF NOT EXISTS nome_bebe       text,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS genero          text DEFAULT 'n',
  ADD COLUMN IF NOT EXISTS peso_atual      text,
  ADD COLUMN IF NOT EXISTS altura_atual    text,
  ADD COLUMN IF NOT EXISTS foto            text;

-- 3. Recria o índice por user_id (agora não-único)
CREATE INDEX IF NOT EXISTS baby_profiles_user_id_idx
  ON public.baby_profiles (user_id, created_at ASC);

-- 4. Atualiza a função de criação automática de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Não cria mais perfil vazio automaticamente; o app cria pelo questionário
  RETURN new;
END;
$$;
*/
