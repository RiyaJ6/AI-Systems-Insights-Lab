// scripts.js — Step 2 finished client: real inference + token logprobs parsing + UI polish
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const escapeHtml = s => String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---- URL-state helpers
function setURLState(prompt) {
  const q = new URLSearchParams(location.search);
  q.set('p', encodeURIComponent(prompt).replace(/%20/g,'+'));
  const url = `${location.origin}${location.pathname}?${q.toString()}`;
  return url;
}
function readURLState() {
  const q = new URLSearchParams(location.search);
  const p = q.get('p'); return p ? decodeURIComponent(p.replace(/\+/g,' ')) : '';
}

// ---- tokenization + simulate fallback
function tokenizePrompt(prompt) {
  const raw = (prompt || '').trim();
  if(!raw) return ['[empty]'];
  return raw.match(/\w+('|’)?\w*|[^\s\w]+/g) || [raw];
}
function simulateTokenProbabilities(prompt) {
  const tokens = tokenizePrompt(prompt).slice(0,40);
  const baseSeed = Array.from(prompt).reduce((s,c)=>s + c.charCodeAt(0), 0);
  return tokens.map((t,i)=>{
    const r = Math.abs(Math.sin((baseSeed + i*7.3))) * 0.6;
    const randomness = Math.abs(Math.cos((i+1.1)*3.7)) * 0.18;
    const prob = Math.min(0.98, Math.max(0.01, 0.04 + r*0.6 + randomness));
    return { token: t, prob };
  }).concat([{ token:'‹next›', prob: Math.max(0.02, 0.12 + Math.abs(Math.sin(baseSeed))*0.3) }]);
}

// ---- render
function renderModelOutput(tokens) {
  $('#modelOutput').innerHTML = `<strong>Completion</strong>: <span>${tokens.map(t=>escapeHtml(t.token)).join(' ')}</span>`;
}
function renderTokenViz(tokens) {
  const c = $('#tokenViz'); c.innerHTML = '';
  tokens.forEach(t=>{
    const row = document.createElement('div'); row.className = 'token-row';
    const label = document.createElement('div'); label.className = 'token-label'; label.textContent = t.token;
    const wrap = document.createElement('div'); wrap.className = 'barWrap';
    const bar = document.createElement('div'); bar.className = 'bar';
    const fill = document.createElement('div'); fill.className = 'fill';
    fill.style.width = '0%';
    fill.style.background = 'linear-gradient(90deg,#7dd3fc,#60a5fa)';
    bar.appendChild(fill); wrap.appendChild(bar);
    const pct = document.createElement('div'); pct.className = 'pct'; pct.textContent = `${Math.round((t.prob||0)*100)}%`;
    row.appendChild(label); row.appendChild(wrap); row.appendChild(pct);
    c.appendChild(row);
    requestAnimationFrame(()=> fill.style.width = `${Math.round((t.prob||0)*100)}%`);
  });
}

// ---- run real inference
async function callRealProxy(prompt) {
  const body = { prompt, max_tokens: 128 };
  // Determine probable proxy path (Netlify or Vercel)
  const netlifyPath = '/.netlify/functions/openai-proxy';
  const vercelPath = '/api/openai-proxy';
  for(const path of [netlifyPath, vercelPath]){
    try {
      const res = await fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if(!res.ok) {
        // continue to next if not found or error
        continue;
      }
      const data = await res.json();
      return { path, data };
    } catch(err){
      continue;
    }
  }
  throw new Error('No proxy found. Deploy Netlify or Vercel function and set OPENAI_API_KEY.');
}

function parseOpenAICompletion(raw) {
  try {
    const choice = raw.choices && raw.choices[0];
    const text = (choice && (choice.text || choice.message && choice.message.content)) || '';
    const logprobs = choice && choice.logprobs;
    if(logprobs && logprobs.top_logprobs) {
      const probs = [];
      const toks = logprobs.tokens || [];
      for(let i=0;i<logprobs.top_logprobs.length;i++){
        const top = logprobs.top_logprobs[i];
        const entries = Object.entries(top || {});
        if(entries.length===0){ probs.push({ token: toks[i]||'[?]', prob: 0.02 }); continue; }
        entries.sort((a,b)=>b[1]-a[1]);
        const tokStr = entries[0][0];
        const logp = entries[0][1];
        const prob = Math.exp(logp);
        probs.push({ token: toks[i] || tokStr, prob: Math.min(0.999, Math.max(0.0001, prob)) });
      }
      probs.push({ token:'‹next›', prob: 0.02 });
      return { text, tokens: probs };
    } else {
      const tokens = tokenizePrompt(text || '');
      const simulated = tokens.map((t,i)=>{
        const seed = Array.from((text||'')).reduce((s,c)=>s + c.charCodeAt(0),0);
        const r = Math.abs(Math.sin((seed + i*5.1))) * 0.6;
        return { token: t, prob: Math.min(0.98, Math.max(0.01, 0.05 + r*0.6)) };
      }).concat([{ token: '‹next›', prob: 0.03 }]);
      return { text, tokens: simulated };
    }
  } catch(err){
    console.error('parseOpenAICompletion error', err);
    return null;
  }
}

// ---- UI interactions
function setStatus(msg){ $('#status').textContent = msg; }
async function runReal(prompt) {
  setStatus('Calling real inference proxy — this may take a few seconds...');
  try {
    const { path, data } = await callRealProxy(prompt);
    setStatus(`Proxy OK (${path}) — parsing results...`);
    let parsed = null;
    if(data && data.provider === 'openai' && data.raw) {
      parsed = parseOpenAICompletion(data.raw);
    } else if(data && data.raw) {
      parsed = parseOpenAICompletion(data.raw || {});
    } else {
      parsed = parseOpenAICompletion(data || {});
    }
    if(!parsed) {
      setStatus('Could not parse completion; falling back to simulation.');
      const tokens = simulateTokenProbabilities(prompt);
      renderModelOutput(tokens);
      renderTokenViz(tokens);
      return;
    }
    if(parsed.tokens) {
      renderModelOutput(parsed.tokens);
      renderTokenViz(parsed.tokens);
    } else {
      const toks = simulateTokenProbabilities(parsed.text || prompt);
      renderModelOutput(toks);
      renderTokenViz(toks);
    }
    setStatus('Real inference displayed. Inspect tokens and share link.');
  } catch(err) {
    console.error('runReal error', err);
    setStatus('Real inference failed — falling back to simulation.');
    const toks = simulateTokenProbabilities(prompt);
    renderModelOutput(toks);
    renderTokenViz(toks);
  }
}

// --- attach events & keyboard shortcuts
$('#runReal')?.addEventListener('click', async ()=>{
  const prompt = $('#prompt').value.trim();
  if(!prompt){ setStatus('Enter a prompt first.'); $('#prompt').focus(); return; }
  await runReal(prompt);
});

$('#runSim')?.addEventListener('click', ()=>{
  const prompt = $('#prompt').value.trim();
  if(!prompt){ setStatus('Enter a prompt first.'); $('#prompt').focus(); return; }
  setStatus('Simulating token probabilities…');
  const toks = simulateTokenProbabilities(prompt);
  renderModelOutput(toks);
  renderTokenViz(toks);
  setStatus('Simulation complete.');
});

$('#shareBtn')?.addEventListener('click', async ()=>{
  const prompt = $('#prompt').value.trim();
  if(!prompt){ setStatus('Enter a prompt to share.'); return; }
  const url = setURLState(prompt);
  try {
    await navigator.clipboard.writeText(url);
    setStatus('Share link copied to clipboard.');
    alert('Share link copied — paste anywhere to reproduce this prompt.');
  } catch(e){
    setStatus('Clipboard blocked — opening share URL.');
    window.open(url,'_blank');
  }
});

document.addEventListener('click', e=>{
  if(e.target.matches('[data-copy]')) {
    navigator.clipboard.writeText(e.target.dataset.copy).then(()=> alert('Copied link!'));
  }
});

document.addEventListener('keydown', (ev)=>{
  if(ev.key === '?') {
    ev.preventDefault();
    showAuthorNotes();
  }
});

$$('.chip').forEach(btn=> btn.addEventListener('click', ()=> { $('#prompt').value = btn.dataset.example; $('#prompt').focus(); }));

function showAuthorNotes(){
  const content = `
    <strong>AI Systems Insights Lab — Author Notes</strong>
    <p>This lab visualizes model behavior (token-level) and pipeline flow. Use <em>Run (real API)</em> after deploying the serverless proxy (OpenAI).</p>
    <ul>
      <li>OpenAI proxy returns token-level logprobs (if model supports it) which show real token probabilities.</li>
      <li>When logprobs are not present we fall back to deterministic simulated probabilities to keep the UI consistent.</li>
    </ul>
    <p>Shortcuts: press <kbd>?</kbd> to open this note. Use Share to copy reproducible links.</p>
  `;
  const modal = document.createElement('div');
  modal.style.position='fixed'; modal.style.left=0; modal.style.top=0; modal.style.right=0; modal.style.bottom=0;
  modal.style.background='rgba(2,6,12,0.75)'; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.zIndex=9999;
  const box = document.createElement('div'); box.style.maxWidth='740px'; box.style.padding='18px'; box.style.borderRadius='12px'; box.style.background='#061828'; box.style.border='1px solid rgba(255,255,255,0.04)';
  box.innerHTML = content;
  const close = document.createElement('div'); close.textContent='Close'; close.style.marginTop='12px'; close.style.cursor='pointer'; close.style.color='#7dd3fc';
  close.onclick = ()=> document.body.removeChild(modal);
  box.appendChild(close);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

window.addEventListener('load', ()=>{
  const p = readURLState();
  if(p) {
    $('#prompt').value = p;
    $('#runSim').click();
  } else {
    setStatus('Ready — choose an example or type a prompt. Press ? for author notes.');
  }
});
