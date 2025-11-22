// ===== Particle Background =====
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 245, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== Typewriter Effect =====
function initTypewriter() {
    const element = document.querySelector('.typewriter');
    const texts = [
        "Decode AI Systems.",
        "Analyze Prompts.",
        "Visualize Costs.",
        "Optimize Performance."
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = texts[textIndex];
        if (isDeleting) {
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }
    type();
}

// ===== Tab Navigation =====
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
}

// ===== AI Analysis Engine =====
class AIAnalyzer {
    constructor() {
        this.modelCosts = {
            'gpt-4': { input: 0.01, output: 0.03 },
            'gpt-3.5': { input: 0.001, output: 0.002 },
            'claude': { input: 0.003, output: 0.015 },
            'gemini': { input: 0.0015, output: 0.002 }
        };
    }

    estimateTokens(text) {
        if (!text.trim()) return 0;
        return Math.ceil(text.length / 4);
    }

    calculateCost(tokens, model) {
        const costModel = this.modelCosts[model];
        // Assume 70% input, 30% output for estimation
        const cost = (tokens * 0.7 * costModel.input + tokens * 0.3 * costModel.output) / 1000;
        return cost.toFixed(5);
    }

    analyzePrompt(text) {
        const patterns = {
            instruction: /\b(write|create|generate|make|explain|summarize|analyze|calculate|compare|list|describe)\b/i,
            code: /\b(code|function|script|program|python|javascript|js|java|c\+\+|ruby|php|sql|api)\b/i,
            format: /\b(table|list|bullet|json|xml|markdown|html|regex|csv)\b/i,
            style: /\b(professional|casual|funny|formal|friendly|technical|simple|detailed|brief)\b/i,
            constraints: /\b(max|limit|only|no more than|exactly|precisely|approximately)\b/i
        };

        let insights = [];

        if (text.length < 20) {
            insights.push('⚠️ <strong>Too Short:</strong> Add more context for better results');
        } else if (text.length > 2000) {
            insights.push('⚠️ <strong>Too Long:</strong> Consider breaking into smaller prompts');
        } else {
            insights.push('✅ <strong>Optimal Length:</strong> Good prompt length');
        }

        const foundPatterns = [];
        Object.entries(patterns).forEach(([key, regex]) => {
            if (regex.test(text)) foundPatterns.push(key);
        });

        if (foundPatterns.includes('instruction')) {
            insights.push('✅ <strong>Clear Instruction:</strong> Action verbs detected');
        } else {
            insights.push('❌ <strong>No Instruction:</strong> Add action verbs like "write", "explain"');
        }

        if (foundPatterns.includes('format')) {
            insights.push('✅ <strong>Format Specified:</strong> Will improve output quality');
        }

        if (foundPatterns.includes('code')) {
            insights.push('💻 <strong>Code Request:</strong> Specify language and requirements');
        }

        if (!foundPatterns.includes('style') && text.length > 50) {
            insights.push('💡 <strong>Tip:</strong> Specify tone (professional, casual, etc.)');
        }

        return insights;
    }

    visualizeTokens(text) {
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const container = document.getElementById('tokenDisplay');
        
        if (words.length === 0) {
            container.innerHTML = '<div class="empty-state">Start typing to see token breakdown...</div>';
            return;
        }

        container.innerHTML = '';
        words.slice(0, 25).forEach((word, i) => {
            const bubble = document.createElement('div');
            bubble.className = 'token-bubble';
            bubble.textContent = `${i}:${word}`;
            bubble.style.animationDelay = `${i * 0.05}s`;
            container.appendChild(bubble);
        });

        if (words.length > 25) {
            const more = document.createElement('small');
            more.textContent = `+${words.length - 25} more tokens...`;
            more.style.width = '100%';
            more.style.marginTop = '0.5rem';
            more.style.color = 'var(--text-secondary)';
            container.appendChild(more);
        }
    }

    updateMetrics() {
        const text = document.getElementById('promptInput').value;
        const model = document.getElementById('modelSelect').value;
        const tokens = this.estimateTokens(text);

        // Animate counters
        this.animateCounter('charCount', text.length);
        this.animateCounter('wordCount', text.split(/\s+/).filter(w => w.length > 0).length);
        this.animateCounter('tokenCount', tokens);
        document.getElementById('costEstimate').textContent = `$${this.calculateCost(tokens, model)}`;

        // Update bars
        document.getElementById('charBar').style.width = `${Math.min(text.length / 20, 100)}%`;
        document.getElementById('wordBar').style.width = `${Math.min(text.split(/\s+/).filter(w => w.length > 0).length / 2, 100)}%`;
        document.getElementById('tokenBar').style.width = `${Math.min(tokens / 2, 100)}%`;
        document.getElementById('costBar').style.width = `${Math.min(parseFloat(this.calculateCost(tokens, model)) * 1000, 100)}%`;

        // Update analysis
        const analysis = this.analyzePrompt(text);
        const analysisDiv = document.getElementById('promptAnalysis');
        analysisDiv.innerHTML = `<ul>${analysis.map(item => `<li>${item}</li>`).join('')}</ul>`;

        // Visualize tokens
        this.visualizeTokens(text);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        requestAnimationFrame(updateCounter);
    }

    simulateResponse() {
        const length = parseInt(document.getElementById('responseLength').value);
        const latency = parseInt(document.getElementById('latency').value);
        const container = document.getElementById('streamedResponse');
        const indicator = document.getElementById('typingIndicator');
        const ttftEl = document.getElementById('ttft');
        const totalEl = document.getElementById('totalTime');
        const tpsEl = document.getElementById('tps');

        // Sample AI response
        const sampleResponses = [
            "The Fibonacci sequence is a series where each number is the sum of the two preceding ones. Using memoization, we can optimize the recursive approach by storing previously computed values. This reduces time complexity from exponential O(2^n) to linear O(n) with O(n) space. The memoized function checks if a value exists in the cache before computing, significantly improving performance for large inputs.",
            "Time complexity analysis: The naive recursive solution has O(2^n) time complexity due to repeated calculations. With memoization, each Fibonacci number is computed once, resulting in O(n) time. Space complexity is O(n) for the cache and call stack. For iterative solutions, we can achieve O(n) time and O(1) space."
        ];

        const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
        const words = response.split(/\s+/);
        const tokens = Math.floor(length * 0.75);

        container.innerHTML = '';
        indicator.classList.add('active');

        const startTime = performance.now();
        let firstTokenTime = null;
        let tokenCount = 0;

        function streamToken() {
            if (tokenCount < words.length) {
                if (!firstTokenTime) {
                    firstTokenTime = performance.now();
                    ttftEl.textContent = `${(firstTokenTime - startTime).toFixed(0)}ms`;
                }

                container.innerHTML += (tokenCount === 0 ? '' : ' ') + words[tokenCount];
                tokenCount++;

                const delay = 30 + Math.random() * 20; // Simulate token generation time
                setTimeout(streamToken, delay);
            } else {
                indicator.classList.remove('active');
                const endTime = performance.now();
                const totalTime = endTime - startTime;
                totalEl.textContent = `${totalTime.toFixed(0)}ms`;
                tpsEl.textContent = `${(tokens / (totalTime / 1000)).toFixed(1)}`;
            }
        }

        // Simulate latency
        setTimeout(streamToken, latency);
    }
}

// ===== Context Visualizer =====
class ContextVisualizer {
    constructor() {
        this.maxTokens = 128000;
        this.currentTokens = 0;
        this.messages = [];
    }

    addMessage(type) {
        const tokenSizes = { user: 50, assistant: 150, system: 100 };
        const tokenCount = tokenSizes[type] + Math.floor(Math.random() * 50);
        
        this.messages.push({ type, tokenCount });
        this.currentTokens += tokenCount;
        this.updateDisplay();
    }

    clearContext() {
        this.messages = [];
        this.currentTokens = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        const fillElement = document.getElementById('contextFill');
        const usedElement = document.getElementById('contextUsed');
        const percentage = (this.currentTokens / this.maxTokens) * 100;
        
        fillElement.style.width = `${percentage}%`;
        usedElement.textContent = `${this.currentTokens.toLocaleString()} / ${this.maxTokens.toLocaleString()} (${percentage.toFixed(1)}%)`;

        const messageList = document.getElementById('messageList');
        messageList.innerHTML = this.messages.map((msg, i) => `
            <div class="message-item" style="animation-delay: ${i * 0.1}s">
                <span>📝 ${msg.type.charAt(0).toUpperCase() + msg.type.slice(1)} (${msg.tokenCount} tokens)</span>
                <button onclick="contextViz.removeMessage(${i})" style="color: #ff6666; background: none; border: none; cursor: pointer;">✕</button>
            </div>
        `).join('');
    }

    removeMessage(index) {
        const tokenCount = this.messages[index].tokenCount;
        this.messages.splice(index, 1);
        this.currentTokens -= tokenCount;
        this.updateDisplay();
    }
}

// ===== Cost Chart =====
function drawCostChart() {
    const canvas = document.getElementById('costChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample data (cost per 1M tokens)
    const models = ['GPT-4', 'Claude 3.5', 'Gemini 1.5', 'GPT-3.5'];
    const costs = [10000, 3000, 1500, 1000]; // Cost per 1M tokens
    const colors = ['#ff00ff', '#00f5ff', '#ffff00', '#00ff00'];
    
    const maxCost = Math.max(...costs);
    const barWidth = 120;
    const spacing = 40;
    const startX = 50;
    const startY = 350;
    
    // Draw bars
    costs.forEach((cost, i) => {
        const barHeight = (cost / maxCost) * 300;
        const x = startX + i * (barWidth + spacing);
        const y = startY - barHeight;
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, y, 0, startY);
        gradient.addColorStop(0, colors[i]);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = gradient;
        
        // Draw bar
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Add glow
        ctx.shadowColor = colors[i];
        ctx.shadowBlur = 20;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.shadowBlur = 0;
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(models[i], x + barWidth / 2, startY + 20);
        ctx.fillText(`$${cost / 1000}k`, x + barWidth / 2, y - 10);
    });
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cost per 1M Tokens (Input)', canvas.width / 2, 30);
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initParticles();
    initTypewriter();
    initTabs();
    
    const analyzer = new AIAnalyzer();
    const contextViz = new ContextVisualizer();
    window.contextViz = contextViz; // For global access

    // Event Listeners
    document.getElementById('promptInput').addEventListener('input', () => {
        analyzer.updateMetrics();
    });

    document.getElementById('modelSelect').addEventListener('change', () => {
        analyzer.updateMetrics();
    });

    document.getElementById('tempSlider').addEventListener('input', (e) => {
        document.getElementById('tempValue').textContent = e.target.value;
    });

    document.getElementById('simulateBtn').addEventListener('click', () => {
        analyzer.simulateResponse();
    });

    // Sliders
    document.getElementById('responseLength').addEventListener('input', (e) => {
        document.getElementById('responseLengthValue').textContent = e.target.value;
    });

    document.getElementById('latency').addEventListener('input', (e) => {
        document.getElementById('latencyValue').textContent = `${e.target.value}ms`;
    });

    // Initial load
    analyzer.updateMetrics();
    drawCostChart();
});
