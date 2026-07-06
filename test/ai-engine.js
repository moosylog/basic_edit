// --- 1. LOCAL STORAGE PERSISTENCE SYNC ENGINE ---
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

// --- 2. ASYNCHRONOUS INTENT TRANSFORMATION COMPILER ---
async function synthesizeLayoutIntent() {
    const userInput = document.getElementById('ai-intent-input').value.trim();
    const finalKey = document.getElementById('ai-api-key-input').value.trim() || localStorage.getItem('moergo_studio_openai_key');

    if (!userInput) return alert("Please express your layout transmutation requirements first.");
    if (!finalKey) return alert("An OpenAI Token is missing. Provide it securely in the key box input container above.");

    const btn = document.getElementById('btn-generate-layout'); const origHTML = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = `⚡ Transmuting...`;
    const geoCount = config.layers[0].length;

    const systemRule = `You are a professional ZMK firmware layout architect mapping user requests onto physical matrix configurations.
Interpret user anatomical requirements, software developer preferences, and macro behaviors.
Mutate the matrix array layout map parameter nodes and return optimized code structures.

CRITICAL DIRECTIVES:
1. Return ONLY pure minified raw executable structural JSON. Do not include descriptions, warnings, or backtick markdown fencings like \`\`\`json.
2. The payload configuration layout structure must strictly match this exact blueprint shape:
{"layers": [[{"value": "&kp", "params": [{"value": "A"}]},{"value": "&trans", "params": []}]]}
3. Generate precisely ${geoCount} matching functional elements inside each array block tier layer.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${finalKey}` },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemRule },
                    { role: 'user', content: `Geometry Targets Count: ${geoCount}. Current Layers Context State: ${JSON.stringify(config.layers)}. Intent: ${userInput}` }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) throw new Error("The API connection was rejected or has run out of tokens.");
        const payload = await response.json();
        
        let rawText = payload.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(rawText);
        
        if (parsed && parsed.layers) {
            pushHistory(); config.layers = parsed.layers; renderAll();
            document.getElementById('ai-intent-input').value = "";
        }
    } catch (err) {
        alert(`AI Sync Failure: ${err.message}`);
    } finally {
        btn.disabled = false; btn.innerHTML = origHTML;
    }
}

// Bind runtime validation checks directly to document scope frames
window.addEventListener('DOMContentLoaded', () => syncCachedApiKeyOnMount());
