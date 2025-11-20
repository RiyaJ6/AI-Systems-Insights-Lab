// AI Systems Insights Lab — client scripts (simulated model + UI)
const $ = sel => document.querySelector(sel);
const escapeHtml = s => String(s || '').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function simulateTokenProbabilities(prompt){
  const base = (prompt || 'the model').trim().split(/\s+/).slice(0,12);
  const tokens = base.map((w,i)=>({
    token: w,
    prob: Math.max(0.02, Math.abs(Math.sin((i+1)*1.3))*0.3 + Math.random()*0.45)
  }));
  tokens.push({token:'…', prob: Math.max(0.05, Math.random()*0.6)});
  return tokens;
}

function renderTokenViz(tokens){
  const c = $('#tokenViz');
  c.innerHTML = '';
  tokens.forEach(t=>{
    const row = document.createElement('div');
    row.className = 'token-row';
    const tokenLabel = document.createElement('div');
    tokenLabel.innerText = t.token;
    const barWrap = document.createElement('div');
    barWrap.style.minWidth = '180px';
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = '0%';
    fill.style.background = 'linear-gradient(90deg,#7dd3fc,#60a5fa)';
    bar.appendChild(fill);
    barWrap.appendChild(bar);
    row.appendChild(tokenLabel);
    row.appendChild(barWrap);
    c.appendChild(row);
    // animate fill
    requestAnimationFrame(()=> fill.style.width = `${Math.round(t.prob*100)}%`);
  });
}

$('#runSim').addEventListener('click',()=>{
  const prompt = $('#prompt').value.trim() || $('#pattern')?.value || 'The model';
  const tokens = simulateTokenProbabilities(prompt);
  $('#modelOutput').innerHTML = `<strong>Simulated completion:</strong> <span>${tokens.map(t=>t.token).join(' ')}</span>`;
  renderTokenViz(tokens);
});

$('#runBias').addEventListener('click',()=>{
  const pattern = $('#pattern').value;
  const completions = [
    `${pattern} she was brilliant and kind.`,
    `${pattern} he fixed the problem quickly.`,
    `${pattern} they worked overtime without complaint.`
  ];
  const out = completions.map(c=>`<div class="muted" style="margin:6px 0">${escapeHtml(c)}</div>`).join('');
  $('#biasResults').innerHTML = `<h4>Completions</h4>${out}<p class="muted">Quick tags: gendered-words: low, sentiment: mixed (simulated)</p>`;
});

document.addEventListener('click', e=>{
  if(e.target.matches('[data-copy]')){
    navigator.clipboard.writeText(e.target.dataset.copy).then(()=> alert('Copied link!'));
  }
});

// Simple DAG rendering (click node shows info)
function renderDAG(){
  const dag = $('#dag');
  dag.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div class="node" data-desc="Raw data — sources: logs, csv, streaming">Raw data</div>
      <div>→</div>
      <div class="node" data-desc="Transforms — cleaning, normalization, feature extraction">Transform</div>
      <div>→</div>
      <div class="node" data-desc="Feature store — persisted features for training & serving">Feature store</div>
      <div>→</div>
      <div class="node" data-desc="Model — inference endpoint, checkpoints, evaluation">Model</div>
      <div>→</div>
      <div class="node" data-desc="Evaluation — metrics, validation, bias checks">Evaluation</div>
    </div>
  `;
  dag.querySelectorAll('.node').forEach(n=>{
    n.addEventListener('click', ()=> {
      const d = n.dataset.desc || 'Details';
      // small non-blocking info reveal
      const info = document.createElement('div');
      info.className = 'output';
      info.style.marginTop = '8px';
      info.innerHTML = `<strong>${n.innerText}</strong><div class="muted" style="margin-top:6px">${escapeHtml(d)}</div>`;
      // replace previous note
      const existing = dag.querySelector('.node-info');
      if(existing) existing.remove();
      info.classList.add('node-info');
      n.parentElement.parentElement.appendChild(info);
    });
  });
}
renderDAG();
