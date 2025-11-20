// Final Phase 1 client script: robust, accessible, reproducible share link, animated token bars
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const escapeHtml = s => String(s || '').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// --- URL-state helpers (encode prompt to shareable link)
function setURLState(prompt) {
  const q = new URLSearchParams(location.search);
  q.set('p', encodeURIComponent(prompt).replace(/%20/g,'+'));
  const url = `${location.origin}${location.pathname}?${q.toString()}`;
  return url;
}
function readURLState() {
  const q = new URLSearchParams(location.search);
  const p = q.get('p');
  return p ? decodeURIComponent(p.replace(/\+/g,' ')) : '';
}

// --- simulation core: produce tokens + probs for any input sentence
function tokenizePrompt(prompt) {
  // robust token-like split: preserve punctuation groups
  const raw = (prompt || '').trim();
  if (!raw) return [{ token: '[empty prompt]', prob: 0 }];
  // split into words and punctuation groups
  const tokens = raw.match(/\w+('|’)?\w*|[^\s\w]+/g) || [raw];
  return tokens;
}
function simulateTokenProbabilities(prompt) {
  const tokens = tokenizePrompt(prompt).slice(0, 40); // limit to 40 display tokens
  // map to probability-like numbers while keeping variety and repeatable feel
  const baseSeed = Array.from(prompt).reduce((s,c)=>s + c.charCodeAt(0), 0);
  return tokens.map((t, i) => {
    // deterministic-ish pseudo-random per token using seed + index
    const r = Math.abs(Math.sin((baseSeed + i * 7.3))) * 0.6;
    const randomness = (Math.abs(Math.cos((i+1.1)*3.7)) * 0.18);
    const prob = Math.min(0.98, Math.max(0.01, 0.04 + r * 0.6 + randomness));
    return { token: t, prob };
  }).concat([{ token: '‹next›', prob: Math.max(0.02, 0.12 + Math.abs(Math.sin(baseSeed))*0.3) }]);
}

// --- renderers
function renderModelOutput(tokens) {
  const out = $('#modelOutput');
  out.innerHTML = `<strong>Simulated completion:</strong> <span>${tokens.map(t=>t.token).join(' ')}</span>`;
}
function renderTokenViz(tokens) {
  const container = $('#tokenViz');
  container.innerHTML = '';
  tokens.forEach(t => {
    const row = document.createElement('div');
    row.className = 'token-row';
    const label = document.createElement('div'); label.className = 'token-label'; label.textContent = t.token;
    const barWrap = document.createElement('div'); barWrap.className = 'barWrap';
    const bar = document.createElement('div'); bar.className = 'bar';
    const fill = document.createElement('div'); fill.className = 'fill';
    fill.style.width = '0%';
    bar.appendChild(fill);
    barWrap.appendChild(bar);
    const pct = document.createElement('div'); pct.className = 'pct'; pct.textContent = `${Math.round(t.prob*100)}%`;
    row.appendChild(label); row.appendChild(barWrap); row.appendChild(pct);
    container.appendChild(row);
    // animate: next tick set width
    requestAnimationFrame(()=> { fill.style.width = `${Math.round(t.prob*100)}%`; });
    // tooltip on hover (desktop)
    row.addEventListener('mouseenter', (e) => {
      const tpl = $('#tooltip-tpl').content.cloneNode(true);
      const tip = tpl.querySelector('.tooltip');
      tip.querySelector('.tt-text').textContent = `Token: "${t.token}" — Prob: ${ (t.prob*100).toFixed(1) }%`;
      document.body.appendChild(tip);
      const rect = e.currentTarget.getBoundingClientRect();
      tip.style.left = `${rect.left + window.scrollX + 8}px`;
      tip.style.top = `${rect.top + window.scrollY - rect.height - 8}px`;
      tip.dataset.__temp = '1';
    });
    row.addEventListener('mouseleave', ()=> {
      document.querySelectorAll('.tooltip[data-temp="1"]').forEach(n=>n.remove());
      document.querySelectorAll('.tooltip').forEach(n=>{ if(!n.dataset.__temp) n.remove(); });
    });
  });
}

// --- interactions
function setStatus(s){ $('#status').textContent = s; }
function runSimulation(prompt) {
  setStatus('Simulating token probabilities…');
  try {
    const tokens = simulateTokenProbabilities(prompt);
    renderModelOutput(tokens);
    renderTokenViz(tokens);
    setStatus('Simulation complete — inspect tokens or share the link.');
    // enable share button
    $('#shareBtn').disabled = false;
  } catch (err) {
    setStatus('Error during simulation');
    console.error(err);
  }
}

function attachExampleButtons(){
  $$('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      $('#prompt').value = btn.dataset.example;
      $('#prompt').focus();
    });
  });
}

// bias explorer
$('#runBias')?.addEventListener('click', ()=>{
  const p = $('#pattern').value;
  const samples = [
    `${p} she was brilliant and kind.`,
    `${p} he fixed the problem quickly.`,
    `${p} they stayed late to finish the task.`
  ];
  $('#biasResults').innerHTML = `<h4>Simulated completions</h4>` + samples.map(s=>`<div class="muted" style="margin:6px 0">${escapeHtml(s)}</div>`).join('') + `<p class="muted small">Quick tags: gendered-words: low (simulated)</p>`;
});

// DAG interactivity
function renderDAG(){
  const dag = $('#dag');
  dag.innerHTML = '';
  const nodes = [
    {name:'Raw data',desc:'Sources: logs, CSVs, streaming input — uncontrolled, noisy'},
    {name:'Transform',desc:'Cleaning, normalization, tokenization, augmentations'},
    {name:'Feature store',desc:'Joined features persisted for training & serving'},
    {name:'Model',desc:'Checkpoints, inference endpoints, safety filters'},
    {name:'Evaluation',desc:'Metrics, validation sets, bias & drift checks'}
  ];
  const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.gap='12px'; wrapper.style.alignItems='center'; wrapper.style.flexWrap='wrap';
  nodes.forEach((n,i)=>{
    const el = document.createElement('div'); el.className='node'; el.textContent = n.name; el.dataset.desc = n.desc;
    el.addEventListener('click', ()=> {
      // reveal info card
      const info = document.createElement('div'); info.className='output'; info.style.marginTop='12px';
      info.innerHTML = `<strong>${escapeHtml(n.name)}</strong><div class="muted" style="margin-top:6px">${escapeHtml(n.desc)}</div>`;
      // remove old info
      const prev = dag.querySelector('.node-info'); if(prev) prev.remove();
      info.classList.add('node-info');
      dag.appendChild(info);
      info.scrollIntoView({behavior:'smooth', block:'center'});
    });
    wrapper.appendChild(el);
    if(i < nodes.length -1){
      const arrow = document.createElement('div'); arrow.textContent = '→'; arrow.style.opacity=.6; wrapper.appendChild(arrow);
    }
  });
  dag.appendChild(wrapper);
}

// share button
$('#shareBtn')?.addEventListener('click', ()=>{
  const prompt = $('#prompt').value.trim();
  if(!prompt){ setStatus('Enter a prompt first to share.'); return; }
  const url = setURLState(prompt);
  navigator.clipboard.writeText(url).then(()=> {
    setStatus('Share link copied to clipboard.');
    alert('Share link copied — paste it anywhere to reproduce this prompt.');
  }).catch(()=> {
    setStatus('Could not copy — opening share URL.');
    window.open(url,'_blank');
  });
});

// repo copy
document.addEventListener('click', e=>{
  if(e.target.matches('[data-copy]')){
    navigator.clipboard.writeText(e.target.dataset.copy).then(()=> alert('Copied link!'));
  }
});

// run button
$('#runSim')?.addEventListener('click', ()=> {
  const prompt = $('#prompt').value.trim();
  if(!prompt){ setStatus('Please enter a prompt first.'); $('#prompt').focus(); return; }
  runSimulation(prompt);
  // update repo link if placeholder present
});

// auto-run from URL state
window.addEventListener('load', ()=>{
  attachExampleButtons();
  renderDAG();
  const p = readURLState();
  if(p){
    $('#prompt').value = p;
    runSimulation(p);
  } else {
    setStatus('Ready — choose an example or type a prompt.');
  }
});
