// --- 1. CORE COMPILER DOM ACCESS DIRECTORY ---
const els = {
    matrixWrap: document.getElementById('matrix-wrapper'),
    matrix: document.getElementById('matrix-container'),
    matrixBanner: document.getElementById('matrix-banner'),
    layerList: document.getElementById('layer-list'),
    behaviorNav: document.getElementById('behavior-nav-list'),
    inspector: document.getElementById('inspector'),
    inspContent: document.getElementById('inspector-content'),
    breadcrumbs: document.getElementById('breadcrumbs'),
    pickerDrawer: document.getElementById('picker-drawer'),
    physKeyboard: document.getElementById('phys-keyboard'),
    zoomControls: document.getElementById('zoom-controls'),
    zoomLevelText: document.getElementById('zoom-level-text'),
    btnZoomAuto: document.getElementById('btn-zoom-auto')
};

// --- 2. GLOBAL SYSTEM STATE INITIALIZERS ---
let config = null;
let activeLayer = 0;
let inspectorPath = []; 
let activePickerTarget = null; 
let autoZoom = true;
let currentScale = 1;
let matrixBounds = { w: 1260, h: 450 };
let termMode = 'friendly';

const MAX_HISTORY = 100;
let undoStack = [];
let redoStack = [];

// --- 3. DICTIONARY DEFINITIONS ---
const T = {
    friendly: {
        layers: "Matrix Layers", behaviors: "Global Behaviors", 
        holdTaps: "Hold-Taps", tapDances: "Multi-Taps", modMorphs: "Modifier Rules", combos: "Chords / Combos", macros: "Macros",
        kp: "Standard Keypress", mo: "Momentary Layer", mt: "Mod-Tap", lt: "Layer-Tap", sl: "Sticky Layer", sk: "Sticky Modifier", trans: "Transparent", none: "Dead Key", custom: "Custom Reference",
        to: "Switch To Layer", tog: "Toggle Layer", bt: "Bluetooth", out: "Output Select", rgb_ug: "RGB Underglow", ext_power: "External Power", bootloader: "Bootloader", sys_reset: "Reset", caps_word: "Caps Word", key_repeat: "Repeat Last Key",
        flavor: "Interaction Flavor", tappingTermMs: "Max Tap Delay", quickTapMs: "Quick Tap Timeout", requirePriorIdleMs: "Require Idle Time", waitMs: "Wait Delay", tapMs: "Tap Duration", timeoutMs: "Chord Timeout",
        holdAction: "Hold Action", tapAction: "Tap Action", baseAction: "Base Action", shiftAction: "Shifted Action", step: "Step",
        settings: "Settings", holdTriggerKeyPositions: "Bilateral Combo Keys", holdTriggerOnRelease: "Trigger On Release", retroTap: "Retro Tap", keepMods: "Keep Modifiers", slowRelease: "Slow Release"
    },
    zmk: {
        layers: ".layers", behaviors: "ZMK Behaviors", 
        holdTaps: "&hold_tap", tapDances: "&tap_dance", modMorphs: "&mod_morph", combos: "combos", macros: "&amp;macro", 
        kp: "&kp", mo: "&mo", mt: "&mt", lt: "&lt", sl: "&sl", sk: "&sk", trans: "&trans", none: "&none", custom: "Raw String",
        to: "&to", tog: "&tog", bt: "&bt", out: "&out", rgb_ug: "&rgb_ug", ext_power: "&ext_power", bootloader: "&bootloader", sys_reset: "&sys_reset", caps_word: "&caps_word", key_repeat: "&key_repeat",
        flavor: "flavor", tappingTermMs: "tapping-term-ms", quickTapMs: "quick-tap-ms", requirePriorIdleMs: "require-prior-idle-ms", waitMs: "wait-ms", tapMs: "tap-ms", timeoutMs: "timeout-ms",
        holdAction: "bindings[0]", tapAction: "bindings[1]", baseAction: "bindings[0]", shiftAction: "bindings[1]", step: "bindings[",
        settings: "Root Config", holdTriggerKeyPositions: "hold-trigger-key-positions", holdTriggerOnRelease: "hold-trigger-on-release", retroTap: "retro-tap", keepMods: "keep-mods", slowRelease: "slow-release"
    }
};

const ZMK_MODS = ["LSHFT", "LCTRL", "LALT", "LGUI", "RSHFT", "RCTRL", "RALT", "RGUI"];

const PROPERTY_SCHEMA = {
    tappingTermMs: { type: 'slider', min: 100, max: 500, step: 10 },
    quickTapMs: { type: 'slider', min: -1, max: 500, step: 1 },
    requirePriorIdleMs: { type: 'slider', min: 0, max: 500, step: 10 },
    timeoutMs: { type: 'slider', min: 10, max: 200, step: 5 },
    waitMs: { type: 'slider', min: 0, max: 200, step: 5 },
    tapMs: { type: 'slider', min: 0, max: 200, step: 5 },
    flavor: { type: 'select', options: ['hold-preferred', 'tap-preferred', 'tap-unless-interrupted', 'balanced'] },
    holdTriggerOnRelease: { type: 'boolean' },
    retroTap: { type: 'boolean' },
    slowRelease: { type: 'boolean' },
    holdTriggerKeyPositions: { type: 'keyPositionList' },
};

const SKELETONS = {
    holdTaps: { name: "&new_ht", bindings: ["&kp", "&kp"], tappingTermMs: 200, flavor: "tap-preferred", quickTapMs: -1, requirePriorIdleMs: 0 },
    tapDances: { name: "&new_td", tappingTermMs: 200, bindings: [{ value: "&kp", params: [{value: "A"}] }] },
    modMorphs: { name: "&new_morph", cases: [ { binding: { value: "&kp", params: [{value: "A"}] }, mods: [], keepMods: [] }, { binding: { value: "&kp", params: [{value: "B"}] }, mods: ["LSHFT"], keepMods: [] } ] },
    combos: { name: "new_combo", binding: { value: "&kp", params: [{ value: "ESC" }] }, keyPositions: [], layers: [-1], timeoutMs: 50 },
    macros: { name: "&new_macro", waitMs: 30, tapMs: 30, bindings: [{ value: "&macro_tap" }, { value: "&kp", params: [{value: "A"}] }] }
};

const BEHAVIOR_DEF = {
    "&kp": { name: "Standard Keypress", type: "keycode" },
    "&mo": { name: "Momentary Layer", type: "layer" },
    "&sl": { name: "Sticky Layer", type: "layer" },
    "&sk": { name: "Sticky Modifier", type: "modifier" },
    "&mt": { name: "Mod-Tap", type: "modifier+keycode" },
    "&lt": { name: "Layer-Tap", type: "layer+keycode" },
    "&to": { name: "To Layer", type: "layer" },
    "&tog": { name: "Toggle Layer", type: "layer" },
    "&trans": { name: "Transparent", type: "none" },
    "&none": { name: "None / Dead Key", type: "none" },
    "none": { name: "None / Dead Key", type: "none" },
    "&caps_word": { name: "Caps Word", type: "none" },
    "&key_repeat": { name: "Repeat Last Key", type: "none" },
    "&bootloader": { name: "Bootloader", type: "none" },
    "&sys_reset": { name: "Reset", type: "none" },
    "&bt":         { name: "Bluetooth",        type: "system-select" },
    "&out":        { name: "Output Select",    type: "system-select" },
    "&rgb_ug":     { name: "RGB Underglow",    type: "system-select" },
    "&ext_power":  { name: "External Power",   type: "system-select" },
    "Custom": { name: "Global Behavior / Custom", type: "custom" }
};

const ZMK_MAP = {
    LSHFT:'⇧', LCTRL:'Ctrl', LALT:'Alt', LGUI:'⌘', RSHFT:'⇧', RCTRL:'Ctrl', RALT:'Alt', RGUI:'⌘',
    BSPC:'⌫', RET:'↵', PG_DN:'PgDn', PG_UP:'PgUp', UP:'↑', DOWN:'↓', LEFT:'←', RIGHT:'→', ESC:'Esc', TAB:'Tab',
    MINUS:'-', EQUAL:'=', GRAVE:'`', BSLH:'\\', SEMI:';', SQT:"'", FSLH:'/', LBKT:'[', RBKT:']', COMMA:',', DOT:'.', SPACE:'␣'
};

const MOD_WRAPPER_TO_FULL = { LS: 'LSHFT', RS: 'RSHFT', LC: 'LCTRL', RC: 'RCTRL', LA: 'LALT', RA: 'RALT', LG: 'LGUI', RG: 'RGUI' };

const LAYOUT_US_EN = [
    [{ c: 'GRAVE', m:'`', s:'~' }, { c: 'N1', m:'1', s:'!' }, { c: 'N2', m:'2', s:'@' }, { c: 'N3', m:'3', s:'#' }, { c: 'N4', m:'4', s:'$' }, { c: 'N5', m:'5', s:'%' }, { c: 'N6', m:'6', s:'^' }, { c: 'N7', m:'7', s:'&' }, { c: 'N8', m:'8', s:'*' }, { c: 'N9', m:'9', s:'(' }, { c: 'N0', m:'0', s:')' }, { c: 'MINUS', m:'-', s:'_' }, { c: 'EQUAL', m:'=', s:'+' }, { c: 'BSPC', l: 'Backspace', w: 'k-2' }],
    [{ c: 'TAB', l: 'Tab', w: 'k-1-5' }, { c: 'Q', m:'Q' }, { c: 'W', m:'W' }, { c: 'E', m:'E' }, { c: 'R', m:'R' }, { c: 'T', m:'T' }, { c: 'Y', m:'Y' }, { c: 'U', m:'U' }, { c: 'I', m:'I' }, { c: 'O', m:'O' }, { c: 'P', m:'P' }, { c: 'LBKT', m:'[', s:'{' }, { c: 'RBKT', m:']', s:'}' }, { c: 'BSLH', m:'\\', s:'|', w:'k-1-5' }],
    [{ c: 'CAPS', l: 'Caps', w: 'k-1-75' }, { c: 'A', m:'A' }, { c: 'S', m:'S' }, { c: 'D', m:'D' }, { c: 'F', m:'F' }, { c: 'G', m:'G' }, { c: 'H', m:'H' }, { c: 'J', m:'J' }, { c: 'K', m:'K' }, { c: 'L', m:'L' }, { c: 'SEMI', m:';', s:':' }, { c: 'SQT', m:"'", s:'"' }, { c: 'RET', l: 'Enter', w: 'k-2-25' }],
    [{ c: 'LSHFT', l: 'Shift', w: 'k-2-25', isMod:true }, { c: 'Z', m:'Z' }, { c: 'X', m:'X' }, { c: 'C', m:'C' }, { c: 'V', m:'V' }, { c: 'B', m:'B' }, { c: 'N', m:'N' }, { c: 'M', m:'M' }, { c: 'COMMA', m:',', s:'<' }, { c: 'DOT', m:'.', s:'>' }, { c: 'FSLH', m:'/', s:'?' }, { c: 'RSHFT', l: 'Shift', w: 'k-2-75', isMod:true }]
];

const GLOVE80_GEO = [
    {x:0,y:35},{x:70,y:35},{x:140,y:0},{x:210,y:0},{x:280,y:0},{x:910,y:0},{x:980,y:0},{x:1050,y:0},{x:1120,y:35},{x:1190,y:35},
    {x:0,y:105},{x:70,y:105},{x:140,y:70},{x:210,y:70},{x:280,y:70},{x:350,y:70},{x:840,y:70},{x:910,y:70},{x:980,y:70},{x:1050,y:70},{x:1120,y:105},{x:1190,y:105},
    {x:0,y:175},{x:70,y:175},{x:140,y:140},{x:210,y:140},{x:280,y:140},{x:350,y:140},{x:840,y:140},{x:910,y:140},{x:980,y:140},{x:1050,y:140},{x:1120,y:175},{x:1190,y:175},
    {x:0,y:245},{x:70,y:245},{x:140,y:210},{x:210,y:210},{x:280,y:210},{x:350,y:210},{x:840,y:210},{x:910,y:210},{x:980,y:210},{x:1050,y:210},{x:1120,y:245},{x:1190,y:245},
    {x:0,y:315},{x:70,y:315},{x:140,y:280},{x:210,y:280},{x:280,y:280},{x:350,y:280},
    {x:448,y:280,r:20,o:"-168px 0px"},{x:546,y:231,r:30,o:"-266px 0px"},{x:707,y:105,r:45,o:"-427px 0px"},{x:490,y:105,r:-45,o:"490px 0px"},{x:651,y:231,r:-30,o:"329px 0px"},{x:749,y:280,r:-20,o:"231px 0px"},
    {x:840,y:280},{x:910,y:280},{x:980,y:280},{x:1050,y:280},{x:1120,y:315},{x:1190,y:315},
    {x:0,y:385},{x:70,y:385},{x:140,y:350},{x:210,y:350},{x:280,y:350},
    {x:371,y:378,r:15,o:"-91px 0px"},{x:462,y:350,r:25,o:"-182px 0px"},{x:630,y:224,r:45,o:"-350px 0px"},{x:560,y:224,r:-45,o:"420px 0px"},{x:728,y:350,r:-25,o:"252px 0px"},{x:819,y:378,r:-15,o:"161px 0px"},
    {x:910,y:350},{x:980,y:350},{x:1050,y:350},{x:1120,y:385},{x:1190,y:385}
];

const GO60_GEO = [
    {x:0,y:35},{x:70,y:35},{x:140,y:0},{x:210,y:0},{x:280,y:0},{x:350,y:0},{x:805,y:0},{x:875,y:0},{x:945,y:0},{x:1015,y:0},{x:1085,y:35},{x:1155,y:35},
    {x:0,y:105},{x:70,y:105},{x:140,y:70},{x:210,y:70},{x:280,y:70},{x:350,y:70},{x:805,y:70},{x:875,y:70},{x:945,y:70},{x:1015,y:70},{x:1085,y:105},{x:1155,y:105},
    {x:0,y:175},{x:70,y:175},{x:140,y:140},{x:210,y:140},{x:280,y:140},{x:350,y:140},{x:805,y:140},{x:875,y:140},{x:945,y:140},{x:1015,y:140},{x:1085,y:175},{x:1155,y:175},
    {x:0,y:245},{x:70,y:245},{x:140,y:210},{x:210,y:210},{x:280,y:210},{x:350,y:210},{x:805,y:210},{x:875,y:210},{x:945,y:210},{x:1015,y:210},{x:1085,y:245},{x:1155,y:245},
    {x:140,y:280},{x:210,y:280},{x:280,y:280},{x:875,y:280},{x:945,y:280},{x:1015,y:280},
    {x:364,y:287,r:12.5,o:"0px 0px"},{x:448,y:308,r:25,o:"0px 0px"},{x:525,y:346.5,r:37,o:"0px 0px"},
    {x:640.5,y:385,r:-37,o:"0px 0px"},{x:710.5,y:336,r:-25,o:"0px 0px"},{x:791,y:301,r:-12.5,o:"0px 0px"}
];

// --- 4. FORMATTING AND RENDERING TOOLS ---
const formatKeycode = (val) => {
    if (!val || val === 'none' || val === '&none') return '';
    const normalized = val.toUpperCase().replace('&', '');
    if (ZMK_MAP[normalized]) return ZMK_MAP[normalized];
    if (val.length === 2 && val.startsWith('N') && '0123456789'.includes(val[1])) return val[1];
    return val;
};

// --- 5. VIEW CONTROL LOGIC NODES ---
function triggerAutoZoom() {
    if(!config || !autoZoom) return;
    const rect = els.matrixWrap.getBoundingClientRect();
    const scale = Math.min((rect.width - 60) / matrixBounds.w, (rect.height - 60) / matrixBounds.h);
    applyScale(scale);
}
function closePicker() { activePickerTarget = null; els.pickerDrawer.classList.add('translate-y-full'); }

// History Infrastructure 
function pushHistory() {
    if (!config) return;
    undoStack.push(JSON.stringify(config));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = []; updateUndoRedoUI();
}
function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(config));
    config = JSON.parse(undoStack.pop());
    closePicker(); renderAll(); updateUndoRedoUI();
}
function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(config));
    config = JSON.parse(redoStack.pop());
    closePicker(); renderAll(); updateUndoRedoUI();
}
function resetHistory() { undoStack = []; redoStack = []; updateUndoRedoUI(); }
defineListeners();

function updateUndoRedoUI() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (!btnUndo || !btnRedo) return;
    btnUndo.disabled = undoStack.length === 0; btnRedo.disabled = redoStack.length === 0;
    btnUndo.classList.toggle('opacity-30', undoStack.length === 0); btnRedo.classList.toggle('opacity-30', redoStack.length === 0);
}

function defineListeners() {
    window.addEventListener('keydown', (e) => {
        const isMod = e.ctrlKey || e.metaKey; if (!isMod) return;
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); }
    });
    window.addEventListener('resize', () => triggerAutoZoom());
}

// --- 6. LAYER MANAGEMENT ENGINE ---
const LAYER_REMAP_BEHAVIORS = new Set(['&mo','&to','&tog','&sl','&lt']);
function walkLayerRefs(fn) {
    (config.layers || []).forEach(layer => {
        (layer || []).forEach(binding => applyToBinding(binding, fn));
    });
    (config.combos || []).forEach(c => { if (c.binding) applyToBinding(c.binding, fn); });
}
function applyToBinding(binding, fn) {
    if (!binding || typeof binding !== 'object') return;
    if (LAYER_REMAP_BEHAVIORS.has(binding.value) && binding.params?.length > 0) fn(binding);
    (binding.params || []).forEach(p => applyToBinding(p, fn));
    (binding.bindings || []).forEach(b => applyToBinding(b, fn));
}

function deleteLayer(targetIdx) {
    if (targetIdx === 0) return;
    walkLayerRefs(binding => {
        const p = binding.params?.[0]; if (!p) return;
        const idx = typeof p === 'object' ? p.value : p;
        if (idx === targetIdx) { binding.value = '&none'; binding.params = []; }
        else if (idx > targetIdx) { if (typeof p === 'object') p.value = idx - 1; else binding.params[0] = idx - 1; }
    });
    config.layers.splice(targetIdx, 1); config.layer_names?.splice(targetIdx, 1);
    if (activeLayer >= config.layers.length) activeLayer = config.layers.length - 1;
    inspectorPath = []; renderAll();
}

function reorderLayer(fromIdx, toIdx) {
    if (fromIdx === toIdx || fromIdx === 0 || toIdx === 0) return;
    const lo = Math.min(fromIdx, toIdx), hi = Math.max(fromIdx, toIdx), dir = fromIdx < toIdx ? -1 : +1;
    walkLayerRefs(binding => {
        const p = binding.params?.[0]; if (!p) return;
        const idx = typeof p === 'object' ? p.value : p;
        const set = (v) => { if (typeof p === 'object') p.value = v; else binding.params[0] = v; };
        if (idx === fromIdx) set(toIdx); else if (idx >= lo && idx <= hi) set(idx + dir);
    });
    const [rl] = config.layers.splice(fromIdx, 1); config.layers.splice(toIdx, 0, rl);
    if (config.layer_names) { const [rn] = config.layer_names.splice(fromIdx, 1); config.layer_names.splice(toIdx, 0, rn); }
    activeLayer = toIdx; renderAll();
}

// --- 7. WORKSPACE RENDER PIPELINES ---
function renderSidebar() {
    els.layerList.innerHTML = "";
    config.layers.forEach((_, i) => {
        let name = config.layer_names?.[i] || `Layer ${i}`, isActive = activeLayer === i;
        let row = document.createElement('div');
        row.className = `flex items-center gap-1 group rounded-lg transition-all ${isActive ? 'bg-[color:var(--accent-soft)] border border-[color:var(--accent)]' : 'border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`;
        row.innerHTML = `<button class="flex-1 text-left px-3 py-2 text-xs font-bold transition-colors truncate ${isActive ? 'text-[color:var(--accent)]':'text-slate-500 hover:text-white'}" data-layersel="${i}">${name}</button>
            <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1 shrink-0">
                <button title="Move up" data-layerup="${i}" class="text-slate-400 hover:text-white p-1 text-[10px] ${i===0?'invisible':''}">▲</button>
                <button title="Move down" data-layerdn="${i}" class="text-slate-400 hover:text-white p-1 text-[10px] ${i===config.layers.length-1?'invisible':''}">▼</button>
                <button title="Delete layer" data-layerdel="${i}" class="text-slate-400 hover:text-red-400 p-1 text-[10px] ${i===0?'opacity-20 cursor-not-allowed':''}">✕</button>
            </div>`;
        row.querySelector(`[data-layersel="${i}"]`).onclick = () => { activeLayer = i; inspectorPath = []; renderAll(); };
        if (i > 0) {
            row.querySelector(`[data-layerup="${i}"]`).onclick = () => { pushHistory(); reorderLayer(i, i - 1); };
            row.querySelector(`[data-layerdn="${i}"]`).onclick = () => { pushHistory(); reorderLayer(i, i + 1); };
            row.querySelector(`[data-layerdel="${i}"]`).onclick = () => { if(confirm("Confirm deletion?")) { pushHistory(); deleteLayer(i); } };
        }
        els.layerList.appendChild(row);
    });
    
    els.behaviorNav.innerHTML = "";
    [ 'holdTaps', 'tapDances', 'modMorphs', 'macros', 'combos' ].forEach(g => {
        let count = config[g] ? config[g].length : 0, btn = document.createElement('button');
        btn.className = "w-full flex justify-between items-center px-4 py-2.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:bg-slate-800 hover:text-white";
        btn.innerHTML = `<span>${T[termMode][g] || g}</span> <span class="text-[10px] opacity-60">${count}</span>`;
        btn.onclick = () => { inspectorPath = [{ type: 'behaviorList', group: g }]; closePicker(); renderAll(); };
        els.behaviorNav.appendChild(btn);
    });
}

function renderMatrix() {
    els.matrix.innerHTML = ""; const geo = getKeyboardGeo(), bindings = config.layers[activeLayer];
    geo.forEach((g, idx) => {
        let bind = bindings[idx] || { value: '&none' }, isSelected = inspectorPath[0]?.type === 'matrix' && inspectorPath[0]?.index === idx;
        let keyNode = document.createElement('div'); keyNode.className = `matrix-key ${isSelected ? 'selected' : ''} ${bind.value==='&trans'?'trans':''} ${bind.value==='&none'?'dead':''}`;
        keyNode.style.left = `${g.x}px`; keyNode.style.top = `${g.y}px`;
        if (g.r) { keyNode.style.transform = `rotate(${g.r}deg)`; keyNode.style.transformOrigin = g.o; }

        // AI Pulse mutation check
        const oldState = undoStack.length > 0 ? JSON.parse(undoStack[undoStack.length - 1]).layers?.[activeLayer]?.[idx] : null;
        if (oldState && JSON.stringify(oldState) !== JSON.stringify(bind)) {
            keyNode.className += ' animate-pulse border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]';
        }

        keyNode.innerHTML = `<span class="text-clamp">${generateMatrixLabel(bind)}</span>`;
        keyNode.onclick = () => { inspectorPath = [{ type: 'matrix', layer: activeLayer, index: idx }]; closePicker(); renderAll(); };
        els.matrix.appendChild(keyNode);
    });
}

function renderPhysicalKeyboard() {
    els.physKeyboard.innerHTML = "";
    LAYOUT_US_EN.forEach(row => {
        let rowDiv = document.createElement('div'); rowDiv.className = 'kbd-row';
        row.forEach(key => {
            let btn = document.createElement('div'); btn.className = `phys-key ${key.w || 'k-1'}`;
            btn.innerHTML = `<span class="key-center">${key.m}</span>`;
            btn.onclick = () => { if (activePickerTarget) { pushHistory(); activePickerTarget(key.c); } };
            rowDiv.appendChild(btn);
        });
        els.physKeyboard.appendChild(rowDiv);
    });
}

function renderGenericBindingEditor(bindingObj, context) {
    if (!bindingObj) return; let behaviorVal = bindingObj.value || "&none";
    els.inspContent.innerHTML = `
        <div class="mb-6"><label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Behavior</label>
            <select id="be-select" class="input-field cursor-pointer font-bold">
                <option value="&kp" ${behaviorVal==='&kp'?'selected':''}>Keypress</option>
                <option value="&mo" ${behaviorVal==='&mo'?'selected':''}>Momentary</option>
                <option value="&trans" ${behaviorVal==='&trans'?'selected':''}>Transparent</option>
                <option value="&none" ${behaviorVal==='&none'?'selected':''}>Dead Key</option>
            </select>
        </div><div id="be-params" class="flex flex-col gap-4"></div>`;
    document.getElementById('be-select').onchange = (e) => { pushHistory(); bindingObj.value = e.target.value; bindingObj.params = []; renderAll(); };
    const container = document.getElementById('be-params');
    (BEHAVIOR_PARAMS[behaviorVal] || []).forEach(slot => renderParamSlot(bindingObj, slot, container));
}

function renderParamSlot(obj, slot, target) {
    const currentStr = (typeof obj.params?.[slot.idx] === 'object' ? obj.params[slot.idx]?.value : obj.params?.[slot.idx]) ?? '';
    let wrapper = document.createElement('div'); wrapper.className = 'bg-white dark:bg-slate-800 p-4 border rounded-xl';
    wrapper.innerHTML = `<label class="block text-[10px] font-bold text-slate-400 mb-2 uppercase">${slot.label}</label>
        <input type="text" id="raw-${slot.idx}" class="input-field font-mono" value="${currentStr}">`;
    target.appendChild(wrapper);
    document.getElementById(`raw-${slot.idx}`).onchange = (e) => { pushHistory(); if(!obj.params)obj.params=[]; obj.params[slot.idx]={value:e.target.value}; renderAll(); };
}

function renderInspector() {
    if (inspectorPath.length === 0) { els.inspector.classList.add('hidden'); return; }
    els.inspector.classList.remove('hidden'); els.breadcrumbs.innerHTML = "";
    let context = inspectorPath[inspectorPath.length - 1], targetData = getTargetFromPath(inspectorPath);
    els.inspContent.innerHTML = "";
    if (context.type === 'settings') renderSettingsPanel();
    else if (context.type === 'matrix' || context.type === 'binding') renderGenericBindingEditor(targetData, context);
    else renderSettingsPanel();
}

function renderSettingsPanel() { els.inspContent.innerHTML = `<div class="p-4 bg-white dark:bg-slate-800 border rounded-xl"><h3 class="font-bold text-sm mb-2">Global Workspace</h3></div>`; }
function navigateUp(l) { inspectorPath = inspectorPath.slice(0, l + 1); renderAll(); }
function getTargetFromPath(pathArray) { return config.layers[pathArray[0].layer][pathArray[0].index]; }
function applyScale(scale) { currentScale = scale; els.matrix.style.width = `${matrixBounds.w}px`; els.matrix.style.height = `${matrixBounds.h}px`; els.matrix.style.transform = `translate(-50%, -50%) scale(${scale})`; els.zoomLevelText.textContent = Math.round(scale * 100) + '%'; }

// --- 9. IO BOUND INTERFACES ---
document.getElementById('file-upload').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        let parsed = JSON.parse(event.target.result); config = parsed.keymap !== undefined ? parsed.keymap : parsed;
        activeLayer = 0; inspectorPath = []; closePicker(); resetHistory(); matrixBounds = calculateMatrixBounds();
        document.getElementById('empty-state').classList.add('hidden'); document.getElementById('sidebar-ui').classList.remove('hidden');
        els.matrix.classList.remove('hidden'); els.zoomControls.classList.remove('hidden');
        autoZoom = true; updateZoomUI(); renderAll(); setTimeout(triggerAutoZoom, 10);
    };
    reader.readAsText(file); e.target.value = '';
});

els.btnZoomAuto.onclick = () => { autoZoom = true; updateZoomUI(); triggerAutoZoom(); };
document.getElementById('file-upload').value = '';
document.getElementById('empty-state').classList.remove('hidden');