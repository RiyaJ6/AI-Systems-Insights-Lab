// Simple token estimation (actual tokenization is more complex)
function estimateTokens(text) {
    if (!text.trim()) return 0;
    // Rough estimate: 1 token ≈ 4 characters or 0.75 words
    const charTokens = Math.ceil(text.length / 4);
    const wordTokens = Math.ceil(text.split(/\s+/).filter(w => w.length > 0).length * 0.75);
    return Math.max(charTokens, wordTokens);
}

// Calculate cost based on model
function calculateCost(tokens, model) {
    const costs = {
        'gpt-4': 0.03 / 1000,
        'gpt-3.5': 0.0015 / 1000,
        'claude': 0.03 / 1000
    };
    return (tokens * costs[model]).toFixed(4);
}

// Generate token visualization bubbles
function visualizeTokens(text) {
    const container = document.getElementById('tokenDisplay');
    if (!text.trim()) {
        container.innerHTML = '<em>Start typing to see token visualization...</em>';
        return;
    }

    // Simple word-based tokenization for demo
    const words = text.split(/\s+/).filter(w => w.length > 0);
    container.innerHTML = '';
    
    words.slice(0, 20).forEach((word, i) => {
        const bubble = document.createElement('span');
        bubble.className = 'token-bubble';
        bubble.textContent = `${i}: ${word}`;
        container.appendChild(bubble);
    });

    if (words.length > 20) {
        container.innerHTML += `<small style="width: 100%; margin-top: 0.5rem; color: #666;">+${words.length - 20} more tokens...</small>`;
    }
}

// Analyze prompt structure
function analyzePrompt(text) {
    const analysisDiv = document.getElementById('promptAnalysis');
    if (!text.trim()) {
        analysisDiv.innerHTML = '<p>Enter a prompt to see AI system analysis...</p>';
        return;
    }

    const patterns = {
        instruction: /write|create|make|generate|explain|summarize|analyze/i,
        code: /code|function|script|program|python|javascript|js|java|c\+\+|ruby/i,
        format: /table|list|bullet|json|xml|markdown|html/i,
        style: /professional|casual|funny|formal|friendly|technical/i
    };

    let analysis = '<ul>';
    
    if (patterns.instruction.test(text)) {
        analysis += '<li>✅ <strong>Clear Instruction:</strong> Prompt contains action verbs that guide the AI.</li>';
    } else {
        analysis += '<li>⚠️ <strong>Instruction Missing:</strong> Consider adding action verbs like "write", "explain", or "create".</li>';
    }

    if (patterns.code.test(text)) {
        analysis += '<li>💻 <strong>Code Request:</strong> Asking for code generation - ensure language is specified.</li>';
    }

    if (patterns.format.test(text)) {
        analysis += '<li>📋 <strong>Format Specified:</strong> Output format is defined, which improves results.</li>';
    } else {
        analysis += '<li>⚠️ <strong>No Format:</strong> Specifying format (table, list, json) can improve output quality.</li>';
    }

    if (text.length < 20) {
        analysis += '<li>⚠️ <strong>Very Short:</strong> Consider providing more context for better results.</li>';
    } else if (text.length > 500) {
        analysis += '<li>⚠️ <strong>Very Long:</strong> Consider breaking into smaller, focused prompts.</li>';
    }

    analysis += '</ul>';
    analysisDiv.innerHTML = analysis;
}

// Update all metrics
function updateMetrics() {
    const text = document.getElementById('promptInput').value;
    const model = document.getElementById('modelSelect').value;
    
    // Update counts
    document.getElementById('charCount').textContent = text.length;
    document.getElementById('wordCount').textContent = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Update tokens and cost
    const tokens = estimateTokens(text);
    document.getElementById('tokenCount').textContent = tokens;
    document.getElementById('costEstimate').textContent = `$${calculateCost(tokens, model)}`;
    
    // Update visualizations
    visualizeTokens(text);
    analyzePrompt(text);
}

// Temperature slider sync
function setupTemperatureSlider() {
    const slider = document.getElementById('tempSlider');
    const valueDisplay = document.getElementById('tempValue');
    
    slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('promptInput');
    const modelSelect = document.getElementById('modelSelect');
    
    // Event listeners
    textarea.addEventListener('input', updateMetrics);
    modelSelect.addEventListener('change', updateMetrics);
    
    // Setup temperature slider
    setupTemperatureSlider();
    
    // Initial load
    updateMetrics();
});
