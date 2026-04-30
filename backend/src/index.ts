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

function renderShell() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#050816" />
  <meta name="description" content="Ouwibo AI mini app with premium dark UI, dynamic model selection, and onchain workflows." />
  <title>Ouwibo AI</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #050816;
      --bg2: #081022;
      --panel: rgba(10, 16, 34, 0.72);
      --panel-strong: rgba(10, 16, 34, 0.92);
      --line: rgba(255, 255, 255, 0.10);
      --line-strong: rgba(34, 211, 238, 0.24);
      --text: rgba(255, 255, 255, 0.96);
      --muted: rgba(255, 255, 255, 0.62);
      --soft: rgba(255, 255, 255, 0.08);
      --accent: #22d3ee;
      --accent2: #a855f7;
      --accent3: #34d399;
      --shadow: 0 30px 100px -45px rgba(0, 0, 0, 0.95);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; background: var(--bg); }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 26%),
        radial-gradient(circle at 60% 70%, rgba(52, 211, 153, 0.10), transparent 24%),
        linear-gradient(180deg, #050816 0%, #060a18 55%, #040711 100%);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }

    button, input, textarea, select { font: inherit; }
    ::selection { background: rgba(34, 211, 238, 0.28); color: white; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.03); }
    ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.36); border-radius: 999px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.56); }

    .shell {
      position: relative;
      min-height: 100vh;
      padding: 20px 16px 24px;
    }

    .orb {
      position: fixed;
      pointer-events: none;
      z-index: 0;
      filter: blur(80px);
      opacity: 0.52;
      animation: drift 14s ease-in-out infinite;
    }

    .orb.one { width: 340px; height: 340px; left: -120px; top: -100px; background: rgba(34, 211, 238, 0.18); }
    .orb.two { width: 300px; height: 300px; right: -120px; top: 14vh; background: rgba(168, 85, 247, 0.15); animation-delay: -5s; }
    .orb.three { width: 420px; height: 420px; left: 35%; bottom: -180px; background: rgba(52, 211, 153, 0.10); animation-delay: -10s; }

    .wrap {
      position: relative;
      z-index: 1;
      max-width: 1440px;
      margin: 0 auto;
    }

    .topbar {
      position: sticky;
      top: 14px;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      border: 1px solid var(--line);
      border-radius: 24px;
      background: rgba(5, 8, 22, 0.72);
      backdrop-filter: blur(22px);
      box-shadow: var(--shadow);
      margin-bottom: 18px;
    }

    .brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .brand-mark {
      position: relative;
      width: 46px; height: 46px; border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.10);
      background: linear-gradient(145deg, rgba(34, 211, 238, 0.16), rgba(168, 85, 247, 0.16));
      display: grid; place-items: center;
      box-shadow: 0 20px 50px -20px rgba(34, 211, 238, 0.35);
      flex: 0 0 auto;
    }
    .brand-mark::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 16px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(34,211,238,0.55), rgba(168,85,247,0.50), rgba(52,211,153,0.35));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      pointer-events: none;
    }
    .brand h1 { margin: 0; font-size: 12px; letter-spacing: .34em; text-transform: uppercase; color: rgba(255,255,255,.46); }
    .brand .sub {
      margin-top: 4px;
      display: flex; align-items: center; gap: 10px;
      min-width: 0;
      font-size: 15px; font-weight: 700; color: rgba(255,255,255,.95);
    }
    .pill, .chip, .mode-btn, .action-btn, .composer-btn, .tab-btn, .model-card, .chip-toggle, .side-card {
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.05);
      color: var(--text);
    }

    .pill {
      display: inline-flex; align-items: center; gap: 8px;
      height: 34px; padding: 0 12px; border-radius: 999px;
      font-size: 12px; color: rgba(255,255,255,.72);
      white-space: nowrap;
    }
    .pill.live { border-color: rgba(52, 211, 153, 0.24); background: rgba(52, 211, 153, 0.10); color: #c7f9e2; }
    .pill.soft { border-color: rgba(255,255,255,.09); background: rgba(255,255,255,0.04); }
    .pill.model { border-color: rgba(34, 211, 238, 0.22); background: rgba(34, 211, 238, 0.10); }

    .top-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
    .select {
      height: 40px; min-width: 180px; padding: 0 14px; border-radius: 14px; outline: none;
      background: rgba(255,255,255,.05); color: var(--text); border: 1px solid var(--line);
    }
    .select:focus { border-color: var(--line-strong); box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.08); }

    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(330px, 0.85fr);
      gap: 18px;
      align-items: start;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 28px;
      background: var(--panel);
      backdrop-filter: blur(22px);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .hero {
      padding: 24px;
    }
    .hero-head {
      display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;
    }
    .kicker {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid rgba(34, 211, 238, 0.18);
      background: rgba(34, 211, 238, 0.08);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 11px; letter-spacing: .28em; text-transform: uppercase;
      color: #cafafc;
      white-space: nowrap;
    }
    .hero h2 {
      margin: 18px 0 0;
      font-size: clamp(2.2rem, 4vw, 4.2rem);
      line-height: 1.02;
      letter-spacing: -0.04em;
      max-width: 11ch;
    }
    .hero p {
      margin: 14px 0 0;
      max-width: 62ch;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.8;
    }
    .hero-cta {
      display: flex; gap: 10px; flex-wrap: wrap;
      margin-top: 22px;
    }

    .accent-btn {
      height: 48px; padding: 0 18px; border-radius: 16px;
      border: 1px solid rgba(34, 211, 238, 0.24);
      background: linear-gradient(135deg, rgba(34,211,238,0.26), rgba(168,85,247,0.18));
      color: white; font-weight: 700; cursor: pointer;
      display: inline-flex; align-items: center; gap: 10px;
      transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease;
      box-shadow: 0 22px 60px -24px rgba(34,211,238,.45);
      text-decoration: none;
    }
    .accent-btn:hover { transform: translateY(-1px); border-color: rgba(34,211,238,0.36); }
    .ghost-btn {
      height: 48px; padding: 0 18px; border-radius: 16px; cursor: pointer; text-decoration:none;
      display: inline-flex; align-items: center; gap: 10px;
      border: 1px solid var(--line); background: rgba(255,255,255,0.04); color: white;
      transition: transform .16s ease, background .16s ease, border-color .16s ease;
    }
    .ghost-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.16); }

    .metrics {
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
      margin-top: 24px;
    }
    .metric {
      padding: 16px; border-radius: 20px; border: 1px solid var(--line); background: rgba(255,255,255,.04);
      text-align: center;
    }
    .metric strong { display:block; font-size: 24px; letter-spacing: -0.03em; }
    .metric span { display:block; margin-top: 4px; color: rgba(255,255,255,.48); font-size: 11px; text-transform: uppercase; letter-spacing: .24em; }

    .model-strip {
      margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap;
    }
    .chip-toggle {
      border-radius: 999px; padding: 10px 14px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 8px; font-size: 13px;
      transition: all .16s ease;
    }
    .chip-toggle.active { border-color: rgba(34, 211, 238, 0.28); background: rgba(34, 211, 238, 0.12); box-shadow: 0 12px 40px -20px rgba(34,211,238,.45); }

    .content-grid {
      display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 18px;
    }

    .chat {
      display: flex; flex-direction: column; min-height: 660px;
    }
    .chat-head {
      padding: 18px 20px; display:flex; justify-content: space-between; align-items: center; gap: 12px;
      border-bottom: 1px solid var(--line);
      background: rgba(255,255,255,0.03);
    }
    .chat-head h3 { margin: 0; font-size: 18px; }
    .chat-head p { margin: 4px 0 0; color: rgba(255,255,255,.48); font-size: 13px; }
    .chat-rail { padding: 18px 18px 0; display:flex; gap: 10px; flex-wrap: wrap; }
    .mode-btn {
      border-radius: 999px; padding: 10px 14px; cursor: pointer; font-size: 13px;
      display:inline-flex; align-items:center; gap:8px; transition: all .16s ease;
    }
    .mode-btn.active { border-color: rgba(34, 211, 238, 0.30); background: rgba(34, 211, 238, 0.12); }

    .messages {
      flex: 1; min-height: 420px; max-height: 58vh;
      overflow: auto; padding: 18px; display:flex; flex-direction: column; gap: 12px;
    }
    .empty-state {
      min-height: 100%; display:grid; place-items:center; padding: 24px; text-align:center;
      border: 1px dashed rgba(255,255,255,.10); border-radius: 24px; background: rgba(255,255,255,0.03);
    }
    .empty-state h4 { margin: 14px 0 8px; font-size: 22px; }
    .empty-state p { margin: 0; color: rgba(255,255,255,.54); max-width: 52ch; line-height: 1.8; }
    .empty-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; margin-top: 18px; width:100%; max-width: 680px; }
    .prompt-card {
      padding: 14px; border-radius: 18px; border: 1px solid var(--line); background: rgba(255,255,255,.04);
      text-align:left; cursor:pointer; transition: transform .16s ease, border-color .16s ease, background .16s ease;
      min-height: 92px;
    }
    .prompt-card:hover { transform: translateY(-1px); border-color: rgba(34, 211, 238, 0.20); background: rgba(255,255,255,.06); }
    .prompt-card strong { display:block; font-size: 14px; margin-bottom: 8px; }
    .prompt-card span { display:block; color: rgba(255,255,255,.50); font-size: 12px; line-height: 1.6; }

    .bubble {
      border-radius: 24px; border: 1px solid var(--line); padding: 14px 16px; max-width: 86%;
      box-shadow: 0 18px 40px -26px rgba(0,0,0,.92);
    }
    .bubble.user { margin-left: auto; background: linear-gradient(135deg, rgba(34,211,238,.18), rgba(168,85,247,.10)); border-color: rgba(34, 211, 238, 0.18); }
    .bubble.ai { margin-right: auto; background: rgba(255,255,255,.05); }
    .bubble .meta { display:flex; gap:8px; align-items:center; margin-top: 10px; color: rgba(255,255,255,.42); font-size: 11px; }
    .bubble .copy {
      display:inline-flex; align-items:center; gap:6px; cursor:pointer; padding: 6px 10px; border-radius: 999px;
      border: 1px solid var(--line); background: rgba(255,255,255,.04); color: white; font-size: 11px;
    }

    .composer {
      border-top: 1px solid var(--line); padding: 16px; background: rgba(255,255,255,0.03);
    }
    .composer-top { display:flex; align-items:flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .shortcut-row { display:flex; gap: 8px; flex-wrap: wrap; }
    .shortcut {
      border: 1px solid var(--line); background: rgba(255,255,255,0.04); color: rgba(255,255,255,.78);
      padding: 9px 12px; border-radius: 999px; cursor:pointer; font-size: 12px;
    }
    .composer-box { margin-top: 12px; display:grid; gap: 10px; }
    textarea {
      width: 100%; min-height: 104px; resize: vertical; border-radius: 22px;
      background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--line);
      padding: 16px; outline:none; line-height: 1.75; font-size: 15px;
    }
    textarea:focus { border-color: rgba(34, 211, 238, 0.28); box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.08); }
    .composer-actions { display:flex; justify-content: space-between; align-items:center; gap: 12px; flex-wrap: wrap; }
    .send-btn {
      height: 48px; padding: 0 18px; border-radius: 16px; border: 1px solid rgba(34,211,238,.24);
      background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(168,85,247,.86)); color: #040816;
      font-weight: 800; display:inline-flex; align-items:center; gap: 10px; cursor:pointer;
      box-shadow: 0 24px 60px -24px rgba(34,211,238,.68);
    }
    .send-btn:disabled { opacity: .55; cursor:not-allowed; }
    .subtle { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.34); }
    .helper { color: rgba(255,255,255,.46); font-size: 12px; }

    .sidebar { display:flex; flex-direction: column; gap: 18px; }
    .side-card { border-radius: 28px; padding: 18px; }
    .side-head { display:flex; justify-content: space-between; align-items:center; gap:10px; margin-bottom: 12px; }
    .side-head h4 { margin: 0; font-size: 18px; }
    .side-head p { margin: 4px 0 0; color: rgba(255,255,255,.48); font-size: 13px; }
    .model-list { display:grid; gap: 10px; }
    .model-card { padding: 14px; border-radius: 18px; cursor:pointer; transition: all .16s ease; }
    .model-card.active { border-color: rgba(34,211,238,.28); background: rgba(34,211,238,.12); }
    .model-card strong { display:block; font-size: 14px; }
    .model-card span { display:block; margin-top: 6px; color: rgba(255,255,255,.52); font-size: 12px; line-height: 1.6; }
    .link-grid { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
    .link-btn { display:flex; align-items:center; gap: 10px; justify-content:center; text-decoration:none; text-align:center; padding: 12px; border-radius: 16px; border:1px solid var(--line); background: rgba(255,255,255,.04); color:white; }

    .mobile-nav {
      display:none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
      padding: 10px 12px 12px; border-top: 1px solid var(--line); background: rgba(5, 8, 22, 0.92); backdrop-filter: blur(22px);
    }
    .mobile-nav .row { display:grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 8px; max-width: 720px; margin: 0 auto; }

    @keyframes drift { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(12px,-16px,0) scale(1.08); } }
    @keyframes pulseSoft { 0%, 100% { opacity: .32; } 50% { opacity: .64; } }
    .pulse-soft { animation: pulseSoft 6s ease-in-out infinite; }

    @media (max-width: 1100px) {
      .grid { grid-template-columns: 1fr; }
      .sidebar { order: 2; }
    }
    @media (max-width: 820px) {
      .shell { padding: 12px 10px 86px; }
      .topbar { position: static; padding: 14px; border-radius: 22px; }
      .hero { padding: 18px; }
      .messages { min-height: 360px; max-height: none; }
      .chat { min-height: auto; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .empty-grid { grid-template-columns: 1fr; }
      .link-grid { grid-template-columns: 1fr; }
      .mobile-nav { display: block; }
      .top-actions .select { min-width: 150px; }
    }
  </style>
</head>
<body>
  <div class="orb one"></div>
  <div class="orb two"></div>
  <div class="orb three"></div>

  <div class="shell">
    <div class="wrap">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark pulse-soft" aria-hidden="true">✦</div>
          <div style="min-width:0">
            <h1>Ouwibo AI</h1>
            <div class="sub">
              <span id="modeTitle">Interactive AI Agent</span>
              <span class="pill live" id="statusPill">● Ready</span>
            </div>
          </div>
        </div>

        <div class="top-actions">
          <span class="pill soft">Mini app</span>
          <span class="pill soft">Responsive</span>
          <span class="pill soft">Smooth UI</span>
          <select id="modelSelect" class="select" aria-label="Select model"></select>
        </div>
      </header>

      <main class="grid">
        <section>
          <div class="panel hero">
            <div class="hero-head">
              <div>
                <div class="kicker">Farcaster-like mini app</div>
                <h2>Ouwibo AI should feel like a premium app, not a plain chat box.</h2>
                <p>No default chat noise. Pick a model, switch a mode, then launch a prompt with a clean interface that works on mobile and desktop.</p>
                <div class="model-strip" id="modelChips"></div>
                <div class="hero-cta">
                  <a href="#composer" class="accent-btn">Start a prompt →</a>
                  <a href="https://github.com/ouwibo/Agent" target="_blank" rel="noreferrer" class="ghost-btn">GitHub</a>
                </div>
              </div>
              <div style="min-width:260px; flex:1 1 260px; max-width: 420px;">
                <div class="metrics">
                  <div class="metric"><strong>5+</strong><span>Modes</span></div>
                  <div class="metric"><strong id="modelCount">3</strong><span>Models</span></div>
                  <div class="metric"><strong>12+</strong><span>Actions</span></div>
                  <div class="metric"><strong>100%</strong><span>Responsive</span></div>
                </div>
              </div>
            </div>

            <div class="content-grid">
              <div class="chat panel" style="background: var(--panel-strong);">
                <div class="chat-head">
                  <div>
                    <h3 id="chatHeading">Conversation canvas</h3>
                    <p id="chatSub">Choose a model, then type your first request.</p>
                  </div>
                  <div class="pill model" id="selectedModelPill">Model: qwen3.5-plus</div>
                </div>

                <div class="chat-rail" id="modeRail"></div>

                <div class="messages" id="messages">
                  <div class="empty-state" id="emptyState">
                    <div>
                      <div class="kicker" style="margin: 0 auto; width: fit-content;">Blank by design</div>
                      <h4>Start with a model, not a default message.</h4>
                      <p>Use one of the prompt cards below or type your own request. The UI adapts automatically to your screen size.</p>
                      <div class="empty-grid" id="quickPrompts"></div>
                    </div>
                  </div>
                </div>

                <div class="composer" id="composer">
                  <div class="composer-top">
                    <div>
                      <div class="subtle">Quick prompts</div>
                      <div class="helper">Tap a prompt, or write one manually.</div>
                    </div>
                    <div class="shortcut-row" id="shortcuts"></div>
                  </div>

                  <form id="composerForm" class="composer-box">
                    <textarea id="messageInput" placeholder="Ask for a mini app layout, crypto scan, Farcaster post, or onchain workflow..."></textarea>
                    <div class="composer-actions">
                      <div class="helper" id="composerHint">Enter to send • Shift+Enter for new line</div>
                      <button type="submit" id="sendBtn" class="send-btn">Send prompt →</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside class="sidebar">
          <div class="side-card panel" style="background: var(--panel-strong);">
            <div class="side-head">
              <div>
                <div class="subtle">Model deck</div>
                <h4>All models from API</h4>
                <p>Auto-loaded from your `/api/models` capability.</p>
              </div>
              <span class="pill model">Dynamic</span>
            </div>
            <div class="model-list" id="modelList"></div>
          </div>

          <div class="side-card panel" style="background: var(--panel-strong);">
            <div class="side-head">
              <div>
                <div class="subtle">Mode deck</div>
                <h4>Switch the surface</h4>
                <p>Each mode changes the visual context.</p>
              </div>
            </div>
            <div class="model-list" id="modeList"></div>
          </div>

          <div class="side-card panel" style="background: linear-gradient(145deg, rgba(34,211,238,.10), rgba(168,85,247,.10));">
            <div class="side-head">
              <div>
                <div class="subtle">Ready buttons</div>
                <h4>Useful shortcuts</h4>
                <p>Quick actions for common prompts.</p>
              </div>
            </div>
            <div class="link-grid">
              <a class="link-btn" href="https://github.com/ouwibo/Agent" target="_blank" rel="noreferrer">GitHub</a>
              <a class="link-btn" href="https://agent.ouwibo.workers.dev/api/docs" target="_blank" rel="noreferrer">API docs</a>
              <button class="link-btn" type="button" data-quick="Build a mini app layout with smooth gradients and mobile buttons.">Mini app</button>
              <button class="link-btn" type="button" data-quick="Write a Farcaster post for a premium AI agent launch.">Launch copy</button>
            </div>
          </div>
        </aside>
      </main>
    </div>

    <nav class="mobile-nav">
      <div class="row" id="mobileModes"></div>
    </nav>
  </div>

  <script>
    (function () {
      const state = {
        models: [],
        selectedModel: '',
        messages: [],
        loading: false,
        mode: 'chat',
      };

      const fallbackModels = [
        { id: 'qwen3.5-turbo', name: 'Qwen Turbo', description: 'Fast responses' },
        { id: 'qwen3.5-plus', name: 'Qwen Plus', description: 'Balanced performance' },
        { id: 'qwen3.5-max', name: 'Qwen Max', description: 'Best quality' },
      ];

      const quickPrompts = [
        { title: 'Mini app', text: 'Create a Farcaster-style mini app UI with glass panels and smooth motion.' },
        { title: 'Market scan', text: 'Give me a concise crypto market scan for ETH, SOL, and BASE.' },
        { title: 'Onchain flow', text: 'Outline a safe onchain workflow for a user tip jar and treasury.' },
        { title: 'Frames', text: 'Design 3 Farcaster Frames for chat, crypto, and NFT minting.' },
      ];

      const shortcuts = [
        'Summarize BTC in 1 line',
        'Draft a Farcaster post',
        'Plan a token launch',
        'Generate product copy',
      ];

      const modes = [
        { id: 'chat', label: 'Chat' },
        { id: 'frames', label: 'Frames' },
        { id: 'wallet', label: 'Wallet' },
        { id: 'market', label: 'Market' },
        { id: 'docs', label: 'Docs' },
      ];

      const modeText = {
        chat: 'Conversation canvas',
        frames: 'Farcaster Frames deck',
        wallet: 'Wallet operations',
        market: 'Market pulse',
        docs: 'Agent docs',
      };

      const modeHint = {
        chat: 'Choose a model, then type your first request.',
        frames: 'Design frames, cards, and compact actions.',
        wallet: 'Plan wallet flows, signatures, and actions.',
        market: 'Ask for price scans or token breakdowns.',
        docs: 'Draft docs, specs, and release notes.',
      };

      function esc(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function fmtTime(ts) {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const els = {
        statusPill: document.getElementById('statusPill'),
        modelSelect: document.getElementById('modelSelect'),
        modelChips: document.getElementById('modelChips'),
        modelList: document.getElementById('modelList'),
        modelCount: document.getElementById('modelCount'),
        selectedModelPill: document.getElementById('selectedModelPill'),
        modeRail: document.getElementById('modeRail'),
        modeList: document.getElementById('modeList'),
        mobileModes: document.getElementById('mobileModes'),
        modeTitle: document.getElementById('modeTitle'),
        chatHeading: document.getElementById('chatHeading'),
        chatSub: document.getElementById('chatSub'),
        messages: document.getElementById('messages'),
        emptyState: document.getElementById('emptyState'),
        quickPrompts: document.getElementById('quickPrompts'),
        shortcuts: document.getElementById('shortcuts'),
        composerForm: document.getElementById('composerForm'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        composerHint: document.getElementById('composerHint'),
      };

      function setStatus(text, live) {
        els.statusPill.textContent = live ? '● ' + text : text;
        els.statusPill.className = live ? 'pill live' : 'pill soft';
      }

      function setMode(mode) {
        state.mode = mode;
        els.modeTitle.textContent = modeText[mode] || 'Conversation canvas';
        els.chatHeading.textContent = modeText[mode] || 'Conversation canvas';
        els.chatSub.textContent = modeHint[mode] || 'Choose a model, then type your first request.';
        document.querySelectorAll('[data-mode]').forEach((node) => {
          node.classList.toggle('active', node.getAttribute('data-mode') === mode);
        });
      }

      function renderModeLists() {
        const markup = modes.map((mode) => {
          const active = mode.id === state.mode ? ' active' : '';
          return '<button type="button" class="mode-btn' + active + '" data-mode="' + mode.id + '">' + esc(mode.label) + '</button>';
        }).join('');
        els.modeRail.innerHTML = markup;
        els.modeList.innerHTML = modes.map((mode) => {
          const active = mode.id === state.mode ? ' active' : '';
          return '<button type="button" class="model-card' + active + '" data-mode="' + mode.id + '"><strong>' + esc(mode.label) + '</strong><span>Switch the interface context</span></button>';
        }).join('');
        els.mobileModes.innerHTML = modes.map((mode) => {
          const active = mode.id === state.mode ? ' active' : '';
          return '<button type="button" class="mode-btn' + active + '" data-mode-mobile="' + mode.id + '">' + esc(mode.label) + '</button>';
        }).join('');
      }

      function renderModels() {
        const models = state.models.length ? state.models : fallbackModels;
        els.modelCount.textContent = String(models.length);
        if (!state.selectedModel || !models.some((m) => m.id === state.selectedModel)) {
          state.selectedModel = models[0].id;
        }
        els.modelSelect.innerHTML = models.map((m) => {
          const selected = m.id === state.selectedModel ? ' selected' : '';
          return '<option value="' + esc(m.id) + '"' + selected + '>' + esc(m.name) + '</option>';
        }).join('');
        els.selectedModelPill.textContent = 'Model: ' + state.selectedModel;
        els.modelChips.innerHTML = models.map((m) => {
          const active = m.id === state.selectedModel ? ' active' : '';
          return '<button type="button" class="chip-toggle' + active + '" data-model="' + esc(m.id) + '"><strong>' + esc(m.name) + '</strong><span style="color: rgba(255,255,255,.44); font-size: 12px;">' + esc(m.description || 'Model') + '</span></button>';
        }).join('');
        els.modelList.innerHTML = models.map((m) => {
          const active = m.id === state.selectedModel ? ' active' : '';
          return '<button type="button" class="model-card' + active + '" data-model-card="' + esc(m.id) + '"><strong>' + esc(m.name) + '</strong><span>' + esc(m.description || 'Choose this model for your next prompt.') + '</span></button>';
        }).join('');
        renderModelState();
      }

      function renderShortcuts() {
        els.shortcuts.innerHTML = shortcuts.map((s) => '<button type="button" class="shortcut" data-shortcut="' + esc(s) + '">' + esc(s) + '</button>').join('');
      }

      function renderQuickPrompts() {
        els.quickPrompts.innerHTML = quickPrompts.map((p) => {
          return '<button type="button" class="prompt-card" data-prompt="' + esc(p.text) + '"><strong>' + esc(p.title) + '</strong><span>' + esc(p.text) + '</span></button>';
        }).join('');
      }

      function renderModelState() {
        document.querySelectorAll('[data-model], [data-model-card]').forEach((node) => {
          const id = node.getAttribute('data-model') || node.getAttribute('data-model-card');
          node.classList.toggle('active', id === state.selectedModel);
        });
        els.selectedModelPill.textContent = 'Model: ' + state.selectedModel;
        els.modelSelect.value = state.selectedModel;
      }

      function renderMessages() {
        if (!state.messages.length) {
          els.emptyState.style.display = 'grid';
          return;
        }
        els.emptyState.style.display = 'none';
        els.messages.innerHTML = state.messages.map((m) => {
          const cls = m.role === 'user' ? 'bubble user' : 'bubble ai';
          const icon = m.role === 'user' ? 'Me' : 'AI';
          const model = m.model ? '<span class="pill soft">' + esc(m.model) + '</span>' : '';
          return '<div class="' + cls + '"><div style="display:flex; gap: 10px; align-items: start;"><div class="pill soft" style="height:32px;">' + icon + '</div><div style="min-width:0; flex:1;"><div style="white-space: pre-wrap; line-height:1.75; font-size:15px;">' + esc(m.content) + '</div><div class="meta"><span>' + esc(fmtTime(m.timestamp)) + '</span>' + model + (m.role === 'assistant' ? '<button type="button" class="copy" data-copy="' + esc(m.id) + '">Copy</button>' : '') + '</div></div></div></div>';
        }).join('');
        els.messages.scrollTop = els.messages.scrollHeight;
      }

      function renderComposer() {
        els.sendBtn.disabled = state.loading || !els.messageInput.value.trim();
        els.composerHint.textContent = state.loading ? 'Thinking with ' + state.selectedModel + '…' : 'Enter to send • Shift+Enter for new line';
        setStatus(state.loading ? 'Thinking' : 'Ready', !state.loading);
      }

      async function loadModels() {
        try {
          const res = await fetch('/api/models', { headers: { Accept: 'application/json' } });
          const data = await res.json();
          state.models = Array.isArray(data.models) ? data.models : [];
          state.selectedModel = data.default || (state.models[0] && state.models[0].id) || 'qwen3.5-plus';
        } catch (err) {
          state.models = fallbackModels;
          state.selectedModel = 'qwen3.5-plus';
        }
        renderModels();
      }

      async function sendPrompt(text) {
        const content = (text || '').trim();
        if (!content || state.loading) return;
        const userMessage = { id: Date.now() + '-user', role: 'user', content, timestamp: new Date(), model: state.selectedModel };
        state.messages.push(userMessage);
        els.messageInput.value = '';
        state.loading = true;
        renderMessages();
        renderComposer();
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ message: content, model: state.selectedModel }),
          });
          const data = await res.json();
          const answer = data.answer || data.reply || 'No response available.';
          state.messages.push({ id: Date.now() + '-assistant', role: 'assistant', content: answer, timestamp: new Date(), model: data.model || state.selectedModel });
        } catch (err) {
          state.messages.push({ id: Date.now() + '-error', role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date(), model: state.selectedModel });
        } finally {
          state.loading = false;
          renderMessages();
          renderComposer();
          renderModelState();
        }
      }

      function wireEvents() {
        document.addEventListener('click', (event) => {
          const target = event.target.closest('[data-mode], [data-mode-mobile], [data-model], [data-model-card], [data-shortcut], [data-prompt], [data-copy]');
          if (!target) return;

          const mode = target.getAttribute('data-mode') || target.getAttribute('data-mode-mobile');
          if (mode) {
            setMode(mode);
            renderModeLists();
            return;
          }

          const model = target.getAttribute('data-model') || target.getAttribute('data-model-card');
          if (model) {
            state.selectedModel = model;
            renderModels();
            return;
          }

          const shortcut = target.getAttribute('data-shortcut') || target.getAttribute('data-prompt');
          if (shortcut) {
            els.messageInput.value = shortcut;
            els.messageInput.focus();
            renderComposer();
            return;
          }

          const copyId = target.getAttribute('data-copy');
          if (copyId) {
            const item = state.messages.find((m) => m.id === copyId);
            if (item) {
              navigator.clipboard.writeText(item.content).catch(() => {});
              target.textContent = 'Copied';
              setTimeout(() => target.textContent = 'Copy', 1200);
            }
          }
        });

        els.modelSelect.addEventListener('change', (e) => {
          state.selectedModel = e.target.value;
          renderModels();
        });

        els.composerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          sendPrompt(els.messageInput.value);
        });

        els.messageInput.addEventListener('input', renderComposer);
        els.messageInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(els.messageInput.value);
          }
        });
      }

      function init() {
        renderModeLists();
        renderQuickPrompts();
        renderShortcuts();
        renderMessages();
        renderComposer();
        wireEvents();
        loadModels();
        setMode('chat');
      }

      init();
    })();
  </script>
</body>
</html>`;
}

app.get('/', (c) => c.html(renderShell()));
app.get('/chat', (c) => c.html(renderShell()));
app.get('/frames', (c) => c.html(renderShell()));
app.get('/wallet', (c) => c.html(renderShell()));
app.get('/market', (c) => c.html(renderShell()));
app.get('/docs', (c) => c.html(renderShell()));

app.get('/health', (c) => c.json({
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#050816"/><text x="50%" y="50%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">${text}</text><text x="50%" y="90%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo Agent</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/frame/crypto-image', async (c) => {
  const prices = await getTokenPrices(['ethereum', 'bitcoin', 'usd-coin']);
  const eth = prices.ethereum?.usd || 0;
  const btc = prices.bitcoin?.usd || 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#050816"/><text x="50%" y="30%" fill="#22d3ee" font-family="Arial" font-size="32" text-anchor="middle">Crypto Prices</text><text x="50%" y="50%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">ETH: $${eth.toLocaleString()}</text><text x="50%" y="70%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">BTC: $${btc.toLocaleString()}</text><text x="50%" y="95%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo Agent</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/frame/nft-image', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#050816"/><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#22d3ee"/><stop offset="100%" style="stop-color:#a855f7"/></linearGradient></defs><rect x="150" y="50" width="300" height="300" fill="url(#g)" rx="20"/><text x="50%" y="40%" fill="white" font-family="Arial" font-size="48" text-anchor="middle">🎨</text><text x="50%" y="95%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo NFT - Mint Now!</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/models', (c) => c.json({
  models: [
    { id: 'qwen3.5-turbo', name: 'Qwen Turbo', description: 'Fast responses' },
    { id: 'qwen3.5-plus', name: 'Qwen Plus', description: 'Balanced performance' },
    { id: 'qwen3.5-max', name: 'Qwen Max', description: 'Best quality' },
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

app.get('/favicon.svg', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#050816"/><circle cx="32" cy="32" r="20" fill="#22d3ee"/><text x="32" y="42" fill="#050816" font-family="Arial" font-size="24" text-anchor="middle" font-weight="bold">O</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/robots.txt', (c) => c.text('User-agent: *\nAllow: /'));

app.get('/sitemap.xml', (c) => c.text(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${c.req.url.split('?')[0]}</loc></url></urlset>`));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
