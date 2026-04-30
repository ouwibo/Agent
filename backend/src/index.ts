import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleChat, chatOptions } from './handlers/chat';
import { handleBalance, handleSwap, handlePrice, cryptoOptions } from './handlers/crypto';
import { handleChatFrame, handleCryptoFrame, handleNFTFrame, frameOptions } from './handlers/frames';
import { handleWalletConnect, handleWalletStatus, handleWalletDisconnect, walletOptions } from './handlers/wallet';
import { getSupportedChains } from './services/web3-service';
import { getTokenPrices, TOKENS } from './services/swap-service';

export type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
  ALCHEMY_API_KEY?: string;
  MORALIS_API_KEY?: string;
  NEYNAR_API_KEY?: string;
  PRIVY_APP_ID?: string;
  PRIVY_API_SECRET?: string;
  JWT_SECRET?: string;
  FRAME_BASE_URL?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

function renderApp() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#060816" />
  <title>Ouwibo AI | Mini App</title>
  <meta name="description" content="Mini app style AI agent with smooth mobile-first UI, model selector, and onchain workflows." />
  <style>
    :root{color-scheme:dark;--bg:#060816;--panel:rgba(255,255,255,.05);--line:rgba(255,255,255,.1);--text:rgba(255,255,255,.92);--muted:rgba(255,255,255,.58);--cyan:#22d3ee;--fuchsia:#d946ef;--emerald:#34d399;--shadow:0 30px 100px -45px rgba(0,0,0,.95)}
    *{box-sizing:border-box} html,body{margin:0;min-height:100%;background:radial-gradient(circle at top left, rgba(34,211,238,.14), transparent 30%), radial-gradient(circle at top right, rgba(217,70,239,.12), transparent 26%), radial-gradient(circle at bottom, rgba(52,211,153,.08), transparent 32%), var(--bg); color:var(--text); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:inherit;text-decoration:none} button,input,select,textarea{font:inherit}
    .shell{max-width:1320px;margin:0 auto;padding:20px 16px 96px}
    .topbar{position:sticky;top:0;z-index:30;backdrop-filter:blur(18px);background:rgba(6,8,22,.78);border-bottom:1px solid var(--line)}
    .topbar-inner{max-width:1320px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .brand{display:flex;align-items:center;gap:12px;min-width:0}
    .logo{width:46px;height:46px;border-radius:16px;border:1px solid var(--line);background:linear-gradient(135deg, rgba(34,211,238,.22), rgba(217,70,239,.18));display:grid;place-items:center;box-shadow:var(--shadow)}
    .logo span{font-size:20px;font-weight:900}
    .eyebrow{font-size:11px;letter-spacing:.35em;text-transform:uppercase;color:rgba(255,255,255,.35)}
    .title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;font-weight:600}
    .pill{border:1px solid var(--line);background:rgba(255,255,255,.05);padding:4px 10px;border-radius:999px;font-size:11px;color:rgba(255,255,255,.52)}
    .toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
    .select,.btn,.chip,.textarea{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--text);border-radius:16px}
    .select{padding:10px 12px;min-height:42px}
    .btn{padding:12px 16px;cursor:pointer;transition:.2s transform,.2s background,.2s border-color,.2s opacity;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px}
    .btn:hover{transform:translateY(-1px);background:rgba(255,255,255,.08);border-color:rgba(34,211,238,.28)}
    .btn-primary{border:none;color:#041018;background:linear-gradient(90deg,var(--cyan),var(--fuchsia));font-weight:700;box-shadow:0 20px 60px -24px rgba(34,211,238,.65)}
    .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:22px;margin-top:22px}
    .card{border:1px solid var(--line);background:var(--panel);border-radius:28px;box-shadow:var(--shadow);backdrop-filter:blur(18px)}
    .hero{padding:24px}
    .badges{display:flex;gap:10px;flex-wrap:wrap}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.05);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.64)}
    .hero-grid{margin-top:18px;display:grid;grid-template-columns:1.3fr .7fr;gap:18px;align-items:center}
    h1{margin:0;font-size:clamp(2.2rem,5vw,4.5rem);line-height:.95;letter-spacing:-.05em}
    .lead{margin:14px 0 0;color:var(--muted);font-size:clamp(.98rem,1.5vw,1.08rem);line-height:1.75;max-width:60ch}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .stat{padding:14px 12px;border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,.04);text-align:center}
    .stat strong{display:block;font-size:1.35rem}
    .stat span{display:block;margin-top:4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.43)}
    .actions{margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .action{padding:16px;border-radius:22px;border:1px solid var(--line);background:rgba(255,255,255,.05);text-align:left;cursor:pointer;transition:.2s transform,.2s background,.2s border-color,.2s box-shadow}
    .action:hover{transform:translateY(-2px);background:rgba(255,255,255,.08);border-color:rgba(34,211,238,.25);box-shadow:0 18px 60px -26px rgba(34,211,238,.36)}
    .action strong{display:block;font-size:14px}.action span{display:block;margin-top:6px;font-size:12px;color:var(--muted)}
    .modes,.capabilities,.side-actions{display:grid;gap:10px}
    .mode{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,.05);cursor:pointer;transition:.2s transform,.2s background,.2s border-color}.mode:hover{transform:translateY(-1px);background:rgba(255,255,255,.08)}
    .mode.active{border-color:rgba(34,211,238,.28);background:rgba(34,211,238,.12)}
    .mode small{display:block;margin-top:4px;color:var(--muted)}
    .section{padding:18px}
    .section h2{margin:0;font-size:18px}.section .sub{margin-top:8px;color:var(--muted);line-height:1.7}
    .chat{display:flex;flex-direction:column;min-height:620px}
    .messages{padding:18px;display:flex;flex-direction:column;gap:12px;max-height:56vh;overflow:auto}
    .msg{max-width:88%;padding:14px 15px;border-radius:22px;border:1px solid var(--line);background:rgba(255,255,255,.05);box-shadow:0 18px 40px -24px rgba(0,0,0,.82)}
    .msg.user{margin-left:auto;background:linear-gradient(135deg, rgba(34,211,238,.18), rgba(217,70,239,.12));border-color:rgba(34,211,238,.2)}
    .msg .meta{margin-top:10px;font-size:11px;color:rgba(255,255,255,.38);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .copy{padding:6px 10px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.04);cursor:pointer;font-size:11px}
    .composer{border-top:1px solid var(--line);padding:16px;display:grid;gap:12px}
    .shortcuts{display:flex;gap:8px;flex-wrap:wrap}
    .shortcut{padding:9px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.05);cursor:pointer;font-size:12px;color:rgba(255,255,255,.72)}
    .textarea{width:100%;min-height:110px;resize:vertical;padding:14px 16px;outline:none;line-height:1.7}
    .textarea:focus,.select:focus{border-color:rgba(34,211,238,.34);background:rgba(255,255,255,.08)}
    .composer-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end}
    .hint{display:flex;justify-content:space-between;gap:12px;font-size:11px;color:rgba(255,255,255,.34)}
    .empty{padding:18px;color:rgba(255,255,255,.5)}
    .side{padding:18px;display:grid;gap:18px}
    .side-card{padding:18px;border:1px solid var(--line);border-radius:26px;background:rgba(255,255,255,.04)}
    .side-grid{display:grid;gap:10px}
    .side-grid.two{grid-template-columns:1fr 1fr}
    .footer-note{padding:18px;border:1px solid var(--line);border-radius:26px;background:linear-gradient(135deg, rgba(34,211,238,.1), rgba(217,70,239,.08), rgba(52,211,153,.08))}
    .footer-note p{margin:8px 0 0;line-height:1.7;color:var(--muted)}
    .mobile-nav{display:none}
    .pulse{position:fixed;inset:auto;pointer-events:none;filter:blur(70px);opacity:.65;animation:float 12s ease-in-out infinite}
    .pulse.a{width:260px;height:260px;background:rgba(34,211,238,.12);top:-70px;left:-90px}.pulse.b{width:220px;height:220px;background:rgba(217,70,239,.1);top:120px;right:-60px}.pulse.c{width:320px;height:320px;background:rgba(52,211,153,.07);bottom:-100px;left:30%}
    @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(16px) scale(1.05)}}
    @media (max-width: 1100px){.grid{grid-template-columns:1fr}.hero-grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.actions{grid-template-columns:repeat(2,1fr)}.chat{min-height:auto}}
    @media (max-width: 760px){.topbar-inner,.shell{padding-left:14px;padding-right:14px}.toolbar{display:none}.actions{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}.side-grid.two{grid-template-columns:1fr}.messages{max-height:none}.composer-row{grid-template-columns:1fr}.mobile-nav{display:grid;position:fixed;left:0;right:0;bottom:0;z-index:40;border-top:1px solid var(--line);background:rgba(6,8,22,.92);backdrop-filter:blur(16px);padding:10px 12px}.mobile-nav-inner{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.mnav{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:16px;border:1px solid transparent;background:transparent;color:rgba(255,255,255,.5);font-size:10px}.mnav.active{background:rgba(34,211,238,.12);color:#d7fbff}.mnav strong{font-size:12px}}
  </style>
</head>
<body>
  <div class="pulse a"></div><div class="pulse b"></div><div class="pulse c"></div>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <div class="logo"><span>O</span></div>
        <div style="min-width:0">
          <div class="eyebrow">Ouwibo AI</div>
          <div class="title-row"><span id="modeTitle">AI Chat</span><span id="statusChip" class="pill">Ready</span></div>
        </div>
      </div>
      <div class="toolbar">
        <select id="modelSelect" class="select" aria-label="Model selector">
          <option value="qwen3.5-turbo">Qwen Turbo</option>
          <option value="qwen3.5-plus" selected>Qwen Plus</option>
          <option value="qwen3.5-max">Qwen Max</option>
        </select>
        <a class="btn" href="https://github.com/ouwibo/Agent" target="_blank" rel="noreferrer">GitHub</a>
        <a class="btn" href="https://agent.ouwibo.workers.dev/health" target="_blank" rel="noreferrer">Health</a>
      </div>
    </div>
  </div>

  <main class="shell">
    <div class="grid">
      <section class="card hero">
        <div class="badges">
          <div class="badge">Mini app</div>
          <div class="badge">Model selector</div>
          <div class="badge">Mobile first</div>
          <div class="badge">Smooth motion</div>
        </div>
        <div class="hero-grid">
          <div>
            <h1>Ouwibo AI is a mini app, not a plain chat box.</h1>
            <p class="lead">Pick a model, choose a mode, then fire any prompt. No default conversation noise, no clutter, just a clean action surface for your agent.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
              <button class="btn btn-primary" id="launchBtn">Launch App</button>
              <button class="btn" id="focusComposerBtn">Focus Composer</button>
            </div>
          </div>
          <div class="stats">
            <div class="stat"><strong>UI</strong><span>Smooth</span></div>
            <div class="stat"><strong>5</strong><span>Modes</span></div>
            <div class="stat"><strong>12+</strong><span>Actions</span></div>
            <div class="stat"><strong>First</strong><span>Mobile</span></div>
          </div>
        </div>
        <div class="actions" style="margin-top:18px">
          <button class="action" data-prompt="Create a Farcaster-style mini app UI with smooth mobile interactions."><strong>Build a mini app</strong><span>Tap to prefill</span></button>
          <button class="action" data-prompt="Give me a concise crypto market scan for ETH, SOL, and BASE."><strong>Market scan</strong><span>Tap to prefill</span></button>
          <button class="action" data-prompt="Outline a safe onchain workflow for a user tip jar and treasury."><strong>Onchain plan</strong><span>Tap to prefill</span></button>
          <button class="action" data-prompt="Design 3 Farcaster Frames for chat, crypto, and NFT minting."><strong>Frames idea</strong><span>Tap to prefill</span></button>
          <button class="action" data-prompt="Rewrite my prompt into a clean product spec with sections and priorities."><strong>Prompt polish</strong><span>Tap to prefill</span></button>
          <button class="action" data-prompt="Write short launch copy for a premium AI agent website."><strong>Launch copy</strong><span>Tap to prefill</span></button>
        </div>
      </section>

      <aside class="side card">
        <div class="side-card">
          <div class="eyebrow">Mode deck</div>
          <h2 style="margin:8px 0 0">Mini app buttons</h2>
          <div class="modes" style="margin-top:12px">
            <button class="mode active" data-mode="chat"><span><strong>Chat</strong><small>Open chat tools</small></span><span>→</span></button>
            <button class="mode" data-mode="frames"><span><strong>Frames</strong><small>Open frame tools</small></span><span>→</span></button>
            <button class="mode" data-mode="wallet"><span><strong>Wallet</strong><small>Open wallet tools</small></span><span>→</span></button>
            <button class="mode" data-mode="market"><span><strong>Market</strong><small>Open market tools</small></span><span>→</span></button>
            <button class="mode" data-mode="docs"><span><strong>Docs</strong><small>Open docs tools</small></span><span>→</span></button>
          </div>
        </div>
        <div class="side-card">
          <div class="eyebrow">Actions</div>
          <h2 style="margin:8px 0 0">Ready buttons</h2>
          <div class="side-grid two" style="margin-top:12px">
            <a class="btn" href="https://github.com/ouwibo/Agent" target="_blank" rel="noreferrer">Open GitHub</a>
            <a class="btn" href="https://agent.ouwibo.workers.dev" target="_blank" rel="noreferrer">Launch App</a>
            <button class="btn" data-prompt="Draft a Farcaster Frames rollout plan for this product.">Frames plan</button>
            <button class="btn" data-prompt="Design an onchain treasury and tipping flow.">Onchain flow</button>
          </div>
        </div>
        <div class="footer-note">
          <div class="eyebrow">Final polish</div>
          <h2 style="margin:8px 0 0">Smooth like a mini app</h2>
          <p>If you want, next pass we can add a bottom nav, wallet connect button, Farcaster frame cards, and a command drawer.</p>
        </div>
      </aside>

      <section class="card chat" style="grid-column:1/-1">
        <div class="section" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div>
            <div class="eyebrow">Chat surface</div>
            <h2>Interactive AI panel</h2>
            <div class="sub">Pick a model, choose a mode, and send exactly the prompt you want. No default chat on load.</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <span class="pill">Voice</span>
            <span class="pill">Web</span>
            <span class="pill">API: /api/chat</span>
          </div>
        </div>
        <div id="messages" class="messages">
          <div id="emptyState" class="empty">No messages yet. Pick a model and send a prompt.</div>
        </div>
        <form id="composer" class="composer">
          <div class="shortcuts">
            <button type="button" class="shortcut" data-shortcut="Summarize BTC in 1 line">Summarize BTC in 1 line</button>
            <button type="button" class="shortcut" data-shortcut="Draft a Farcaster post">Draft a Farcaster post</button>
            <button type="button" class="shortcut" data-shortcut="Plan a token launch">Plan a token launch</button>
            <button type="button" class="shortcut" data-shortcut="Generate product copy">Generate product copy</button>
          </div>
          <div class="composer-row">
            <div>
              <textarea id="prompt" class="textarea" placeholder="Ask for a Farcaster post, crypto scan, mobile UI, or onchain plan"></textarea>
              <div class="hint"><span>Press Enter to send</span><span>Mobile-friendly controls</span></div>
            </div>
            <button id="sendBtn" class="btn btn-primary" type="submit"><span>Send</span></button>
          </div>
        </form>
      </section>
    </div>
  </main>

  <nav class="mobile-nav">
    <div class="mobile-nav-inner">
      <button class="mnav active" data-mobile-mode="chat"><strong>Chat</strong><span>Mode</span></button>
      <button class="mnav" data-mobile-mode="frames"><strong>Frames</strong><span>Mode</span></button>
      <button class="mnav" data-mobile-mode="wallet"><strong>Wallet</strong><span>Mode</span></button>
      <button class="mnav" data-mobile-mode="market"><strong>Market</strong><span>Mode</span></button>
      <button class="mnav" data-mobile-mode="docs"><strong>Docs</strong><span>Mode</span></button>
    </div>
  </nav>

  <script>
    const API_URL = 'https://agent.ouwibo.workers.dev';
    const messagesEl = document.getElementById('messages');
    const emptyState = document.getElementById('emptyState');
    const promptEl = document.getElementById('prompt');
    const modelSelect = document.getElementById('modelSelect');
    const statusChip = document.getElementById('statusChip');
    const modeTitle = document.getElementById('modeTitle');
    const sendBtn = document.getElementById('sendBtn');
    const composer = document.getElementById('composer');
    const launchBtn = document.getElementById('launchBtn');
    const focusComposerBtn = document.getElementById('focusComposerBtn');

    let activeMode = 'chat';
    let loading = false;

    function setStatus(text) { statusChip.textContent = text; }
    function timeString() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }
    function setMode(mode) {
      activeMode = mode;
      const labels = { chat: 'AI Chat', frames: 'Farcaster Frames', wallet: 'Wallet Ops', market: 'Market Pulse', docs: 'Agent Docs' };
      modeTitle.textContent = labels[mode] || 'AI Chat';
      document.querySelectorAll('.mode').forEach((btn) => btn.classList.toggle('active', btn.dataset.mode === mode));
      document.querySelectorAll('.mnav').forEach((btn) => btn.classList.toggle('active', btn.dataset.mobileMode === mode));
    }

    function addMessage(role, content, model) {
      emptyState.style.display = 'none';
      const bubble = document.createElement('div');
      bubble.className = 'msg ' + (role === 'user' ? 'user' : 'assistant');
      bubble.innerHTML = '<div style="white-space:pre-wrap;line-height:1.75;font-size:15px">' + content.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>' +
        '<div class="meta"><span>' + timeString() + '</span>' + (model ? '<span class="pill">' + model + '</span>' : '') + (role !== 'user' ? '<button type="button" class="copy">Copy</button>' : '') + '</div>';
      const copyBtn = bubble.querySelector('.copy');
      if (copyBtn) copyBtn.onclick = () => navigator.clipboard.writeText(content);
      messagesEl.appendChild(bubble);
      scrollBottom();
    }

    async function send(prompt) {
      const content = (prompt || promptEl.value || '').trim();
      if (!content || loading) return;
      const model = modelSelect.value;
      addMessage('user', content, model);
      promptEl.value = '';
      loading = true;
      setStatus('Thinking');
      sendBtn.disabled = true;
      try {
        const res = await fetch(API_URL + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ message: content, model })
        });
        const data = await res.json();
        addMessage('assistant', data.answer || data.reply || 'No response available.', model);
        setMode('chat');
      } catch (e) {
        addMessage('assistant', 'Connection error. Please try again.', model);
      } finally {
        loading = false;
        setStatus('Ready');
        sendBtn.disabled = false;
      }
    }

    document.querySelectorAll('[data-prompt]').forEach((btn) => btn.addEventListener('click', () => send(btn.getAttribute('data-prompt'))));
    document.querySelectorAll('[data-shortcut]').forEach((btn) => btn.addEventListener('click', () => { promptEl.value = btn.getAttribute('data-shortcut') || ''; promptEl.focus(); }));
    document.querySelectorAll('.mode').forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    document.querySelectorAll('.mnav').forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mobileMode)));

    composer.addEventListener('submit', (e) => { e.preventDefault(); send(); });
    promptEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    launchBtn.onclick = () => window.scrollTo({ top: document.body.scrollHeight * 0.25, behavior: 'smooth' });
    focusComposerBtn.onclick = () => promptEl.focus();

    fetch(API_URL + '/api/models', { headers: { 'Accept': 'application/json' } })
      .then((r) => r.json())
      .then((data) => {
        const models = data.models || [];
        if (models.length) {
          modelSelect.innerHTML = '';
          models.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name + (m.description ? ' — ' + m.description : '');
            modelSelect.appendChild(opt);
          });
          if (data.default) modelSelect.value = data.default;
        }
      })
      .catch(() => {});

    fetch(API_URL + '/api/health', { headers: { 'Accept': 'application/json' } }).then(() => setStatus('Ready')).catch(() => setStatus('Offline'));
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

app.get('/', () => renderApp());
app.get('/chat', () => renderApp());
app.get('/frames', () => renderApp());
app.get('/wallet', () => renderApp());
app.get('/market', () => renderApp());
app.get('/docs', () => renderApp());

app.get('/health', (c) => c.json({
  status: 'ok',
  agent: 'Ouwibo Agent',
  version: '2.0.0',
  model: c.env.DEFAULT_MODEL || 'qwen3.5-plus',
  features: ['chat', 'crypto', 'wallet', 'frames', 'nft'],
}));

app.get('/api/health', (c) => c.json({
  status: 'ok',
  agent: 'Ouwibo Agent',
  version: '2.0.0',
  model: c.env.DEFAULT_MODEL || 'qwen3.5-plus',
  features: ['chat', 'crypto', 'wallet', 'frames', 'nft'],
}));

app.options('/api/chat', chatOptions);
app.post('/api/chat', handleChat);

app.options('/api/crypto/*', cryptoOptions);
app.get('/api/crypto/balance', handleBalance);
app.post('/api/crypto/swap', handleSwap);
app.get('/api/crypto/prices', handlePrice);
app.get('/api/crypto/chains', async (c) => c.json({ ok: true, chains: await getSupportedChains() }));
app.get('/api/crypto/tokens', (c) => c.json({ ok: true, tokens: TOKENS }));

app.options('/api/wallet/*', walletOptions);
app.post('/api/wallet/connect', handleWalletConnect);
app.get('/api/wallet/status', handleWalletStatus);
app.post('/api/wallet/disconnect', handleWalletDisconnect);

app.options('/api/farcaster/*', frameOptions);
app.post('/api/farcaster/frames/chat', handleChatFrame);
app.post('/api/farcaster/frames/crypto', handleCryptoFrame);
app.post('/api/farcaster/frames/nft', handleNFTFrame);

app.get('/api/frame/image', async (c) => {
  const text = c.req.query('text') || 'Hello!';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#0a0a0f"/><text x="50%" y="50%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">${text}</text><text x="50%" y="90%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo Agent</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/frame/crypto-image', async (c) => {
  const prices = await getTokenPrices(['ethereum', 'bitcoin', 'usd-coin']);
  const eth = prices.ethereum?.usd || 0;
  const btc = prices.bitcoin?.usd || 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#0a0a0f"/><text x="50%" y="30%" fill="#fbbf24" font-family="Arial" font-size="32" text-anchor="middle">Crypto Prices</text><text x="50%" y="50%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">ETH: $${eth.toLocaleString()}</text><text x="50%" y="70%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">BTC: $${btc.toLocaleString()}</text><text x="50%" y="95%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo Agent</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/frame/nft-image', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#0a0a0f"/><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fbbf24"/><stop offset="100%" style="stop-color:#f59e0b"/></linearGradient></defs><rect x="150" y="50" width="300" height="300" fill="url(#g)" rx="20"/><text x="50%" y="40%" fill="white" font-family="Arial" font-size="48" text-anchor="middle">🎨</text><text x="50%" y="95%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo NFT - Mint Now!</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/models', (c) => c.json({
  models: [
    { id: 'qwen3.5-turbo', name: 'Qwen 3.5 Turbo', description: 'Fast responses' },
    { id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus', description: 'Balanced performance' },
    { id: 'qwen3.5-max', name: 'Qwen 3.5 Max', description: 'Best quality' },
  ],
  default: c.env.DEFAULT_MODEL || 'qwen3.5-plus',
}));

app.get('/api/docs', (c) => c.json({
  version: '2.0.0',
  endpoints: {
    chat: { method: 'POST', path: '/api/chat', body: { message: 'string', model: 'string?' } },
    balance: { method: 'GET', path: '/api/crypto/balance', params: { address: 'string', chain: 'string?' } },
    swap: { method: 'POST', path: '/api/crypto/swap', body: { fromToken: 'string', toToken: 'string', amount: 'string', fromAddress: 'string' } },
    prices: { method: 'GET', path: '/api/crypto/prices', params: { tokens: 'string?' } },
    walletConnect: { method: 'POST', path: '/api/wallet/connect', body: { address: 'string', signature: 'string', message: 'string' } },
    frames: { method: 'POST', path: '/api/farcaster/frames/{chat|crypto|nft}' },
  },
}));

app.notFound((c) => {
  const path = new URL(c.req.url).pathname;
  if (path.startsWith('/api/')) return c.json({ error: 'Not found' }, 404);
  return renderApp();
});

export default app;
