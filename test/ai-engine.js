// --- 1. LOCAL STORAGE PERSISTENCE ENGINE ---

function syncCachedApiKeyOnMount() {
    const savedKey = localStorage.getItem('moergo_studio_openai_key');
    const badge = document.getElementById('api-status-badge');
    const clearBtn = document.getElementById('btn-clear-key');
    
    if (savedKey) {
        document.getElementById('ai-api-key-input').value = savedKey;
        badge.textContent = "SAVED ACTIVE";
        badge.className = "text-[8px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded";
        clearBtn.classList.remove('hidden');
    } else {
        badge.textContent = "NO KEY";
        badge.className = "text-[8px] font-mono bg-slate-200 dark:bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded";
        clearBtn.classList.add('hidden');
    }
}

function cacheApiKeyChange() {
    const keyVal = document.getElementById('ai-api-key-input').value.trim();
    if (keyVal.startsWith('sk-')) {
        localStorage.setItem('moergo_studio_openai_key', keyVal);
        syncCachedApiKeyOnMount();
    }
}

function flushCachedApiKey() {
    localStorage.removeItem('moergo_studio_openai_key');
    document.getElementById('ai-api-key-input').value = "";
    syncCachedApiKeyOnMount();
}

// --- 2. DETERMINISTIC GENERATIVE INTERFACE CORE ---
async function synthesizeLayoutIntent() {
    const userInput = document.getElementById('ai-intent-input').value.trim();
    const finalKey = document.getElementById('ai-api-key-input').value.trim() || localStorage.getItem('moergo_studio_openai_key');

    if (!userInput) return alert("Please express your ergonomic intention or layout needs first.");
    if (!finalKey) return alert("An OpenAI Token is needed. Input it securely in the key box above.");

    const btn = document.getElementById('btn-generate-layout');
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `⚡ Compiling...`;
    
    const geoCount = config.layers[0].length;

    const systemRule = `You are a professional ZMK layout configuration synthesis algorithm. 
Analyze the user's software workflows, thumb clusters, and physical rest comfort requests.
Mutate the workspace structure map and return a clean array topology.

CRITICAL INSTRUCTIONS:
1. Return ONLY pure minified structural executable JSON. Never wrap it in markdown code fences like \`\`\`json.
2. The payload object shape must follow this schema definition precisely:
{"layers": [[{"value": "&kp", "params": [{"value": "A"}]},{"value": "&trans", "params": []}]]}
3. Generate exactly ${geoCount} active parameter key nodes per matrix tier layer list block.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${finalKey}` 
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemRule },
                    { role: 'user', content: `Physical Matrix Geometry Requirement Count: ${geoCount}. Current Structure Context Map: ${JSON.stringify(config.layers)}. Target Intent Profile: ${userInput}` }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) throw new Error("The API endpoint was unauthenticated or ran out of operational credits.");
        
        const payload = await response.json();
        let rawText = payload.choices[0].message.content.trim();
        rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();

        const parsed = JSON.parse(rawText);
        if (parsed && parsed.layers) {
            pushHistory();
            config.layers = parsed.layers;
            renderAll();
            document.getElementById('ai-intent-input').value = "";
        }
    } catch (err) {
        alert(`AI Architect Exception: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = origHTML;
    }
}

// Attach listeners cleanly to runtime state frames
window.addEventListener('DOMContentLoaded', () => syncCachedApiKeyOnMount());