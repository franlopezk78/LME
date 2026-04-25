let currentTab = 'today', items = JSON.parse(localStorage.getItem('vs_items')) || [];
let isListening = false, appMode = 'edit', fullTranscript = "", isCatalogOpen = false;

const app = document.getElementById('app'), listEl = document.getElementById('shopping-list'), emptySt = document.getElementById('empty-state'), voiceOv = document.getElementById('voice-overlay'), transPr = document.getElementById('transcript-preview'), micBt = document.getElementById('mic-trigger'), manIn = document.getElementById('manual-input'), errTo = document.getElementById('error-toast'), shopStats = document.getElementById('shop-stats'), finishBtn = document.getElementById('finish-btn'), catalogArea = document.getElementById('catalog-area');

const CATALOG_DATA = [
    { category: "🥦 Verduras y Hortalizas", items: [ {n: "Tomate", e: "🍅"}, {n: "Lechuga", e: "🥬"}, {n: "Cebolla", e: "🧅"}, {n: "Patatas", e: "🥔"}, {n: "Pimiento", e: "🫑"}, {n: "Ajo", e: "🧄"}, {n: "Zanahoria", e: "🥕"}, {n: "Calabacín", e: "🥒"}, {n: "Berenjena", e: "🍆"}, {n: "Champiñones", e: "🍄"}, {n: "Brócoli", e: "🥦"}, {n: "Coliflor", e: "🥦"}, {n: "Lombarda", e: "🟣"}, {n: "Judías Verdes", e: "🌿"}, {n: "Espárragos", e: "🎋"}, {n: "Pepino", e: "🥒"} ] },
    { category: "🍎 Frutas", items: [ {n: "Plátano", e: "🍌"}, {n: "Manzana", e: "🍎"}, {n: "Pera", e: "🍐"}, {n: "Naranja", e: "🍊"}, {n: "Fresas", e: "🍓"}, {n: "Limón", e: "🍋"}, {n: "Kiwi", e: "🥝"}, {n: "Melón", e: "🍈"}, {n: "Sandía", e: "🍉"}, {n: "Uvas", e: "🍇"}, {n: "Piña", e: "🍍"}, {n: "Melocotón", e: "🍑"} ] },
    { category: "🥩 Carnicería", items: [ {n: "Pechuga Pollo", e: "🍗"}, {n: "Carne Picada", e: "🥩"}, {n: "Lomo Cerdo", e: "🥩"}, {n: "Costillas", e: "🍖"}, {n: "Hamburguesa", e: "🍔"}, {n: "Solomillo", e: "🥩"}, {n: "Muslos Pollo", e: "🍗"}, {n: "Filetes Ternera", e: "🥩"}, {n: "Pavo", e: "🦃"} ] },
    { category: "🐟 Pescados (Congelados)", items: [ {n: "Filetes Merluza", e: "🐟"}, {n: "Salmón", e: "🍣"}, {n: "Gambas", e: "🍤"}, {n: "Calamares", e: "🦑"}, {n: "Varitas Pescado", e: "🥖"}, {n: "Pulpo", e: "🐙"} ] },
    { category: "🌭 Salchichas y Refrigerados", items: [ {n: "Salchichas Leche", e: "🌭"}, {n: "Salchichas Frankfurt", e: "🌭"}, {n: "Salchichas Pavo", e: "🌭"}, {n: "Queso Rallado", e: "🧀"}, {n: "Queso Lonchas", e: "🧀"}, {n: "Mozzarella bolsa", e: "⚪"}, {n: "Bacon", e: "🥓"}, {n: "Salami", e: "🍕"}, {n: "Chorizo", e: "🌭"} ] },
    { category: "🥛 Lácteos y Huevos", items: [ {n: "Leche Entera", e: "🥛"}, {n: "Leche Semi", e: "🥛"}, {n: "Leche Desnatada", e: "🥛"}, {n: "Huevos", e: "🥚"}, {n: "Yogures", e: "🍦"}, {n: "Mantequilla", e: "🧈"}, {n: "Queso Fresco", e: "⚪"} ] },
    { category: "🍞 Panadería y Bollería", items: [ {n: "Pan de barra", e: "🥖"}, {n: "Pan de molde", e: "🍞"}, {n: "Baguette", e: "🥖"}, {n: "Croissants", e: "🥐"}, {n: "Magdalenas", e: "🧁"}, {n: "Galletas", e: "🍪"} ] },
    { category: "🍝 Despensa", items: [ {n: "Arroz", e: "🍚"}, {n: "Macarrones", e: "🍝"}, {n: "Espaguetis", e: "🍝"}, {n: "Aceite Oliva", e: "🫒"}, {n: "Sal", e: "🧂"}, {n: "Azúcar", e: "🍬"}, {n: "Harina", e: "🌾"}, {n: "Tomate frito", e: "🥫"}, {n: "Atún lata", e: "🐟"} ] },
    { category: "☕ Desayuno", items: [ {n: "Café", e: "☕"}, {n: "Cacao", e: "🍫"}, {n: "Cereales", e: "🥣"}, {n: "Mermelada", e: "🍯"}, {n: "Miel", e: "🍯"}, {n: "Galletas", e: "🍪"} ] },
    { category: "🥤 Bebidas y Bodega", items: [ {n: "Agua", e: "💧"}, {n: "Coca-Cola", e: "🥤"}, {n: "Cerveza", e: "🍺"}, {n: "Vino", e: "🍷"}, {n: "Zumo Naranja", e: "🧃"}, {n: "Casera", e: "🥤"} ] },
    { category: "🧼 Limpieza e Higiene", items: [ {n: "Detergente", e: "🧺"}, {n: "Suavizante", e: "🧴"}, {n: "Papel Higiénico", e: "🧻"}, {n: "Lavavajillas", e: "🧼"}, {n: "Champú", e: "🧴"}, {n: "Gel Baño", e: "🧼"}, {n: "Dentífrico", e: "🪥"} ] },
    { category: "🐱 Mascotas", items: [ {n: "Comida Gato", e: "🐈"}, {n: "Chichis Gato", e: "🍖"}, {n: "Arena Gato", e: "🏖️"}, {n: "Comida Perro", e: "🐶"} ] }
];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition(); recognition.lang = 'es-ES'; recognition.interimResults = true; recognition.continuous = true;
    recognition.onstart = () => { isListening = true; fullTranscript = ""; micBt.classList.add('listening'); voiceOv.classList.remove('hidden'); transPr.textContent = 'Escuchando...'; };
    recognition.onresult = (e) => { 
        let interim = '', finalInThisSession = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) { if (e.results[i].isFinal) finalInThisSession += e.results[i][0].transcript + " "; else interim += e.results[i][0].transcript; }
        fullTranscript += finalInThisSession; transPr.textContent = fullTranscript + (interim ? " ... " + interim : "");
    };
    recognition.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') { showError('Error: ' + e.error); stopListening(); } };
    recognition.onend = () => { if (isListening) try { recognition.start(); } catch(e) {} else if (fullTranscript.trim()) { processVoiceItems(fullTranscript); fullTranscript = ""; } };
}

function vibrate() { if (navigator.vibrate) navigator.vibrate(40); }

function getCategory(text) {
    const t = text.toLowerCase();
    for (const cat of CATALOG_DATA) {
        if (cat.items.some(item => t.includes(item.n.toLowerCase()))) return cat.category;
    }
    return "⚪ Otros";
}

function addItemData(text) {
    const clean = text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();
    const cat = getCategory(clean);
    items.push({ id: Date.now() + Math.random(), text: clean, checked: false, target: currentTab, category: cat });
    vibrate();
}

function processVoiceItems(t) {
    let rawParts = t.split(/ y |,|\.|\n/i);
    rawParts.forEach(part => {
        let words = part.trim().split(/\s+/);
        if (words.length === 0) return;
        let currentBuffer = [];
        const connectors = ['de', 'con', 'sin', 'para', 'la', 'el', 'en', 'un', 'una', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'del', 'al', 'los', 'las', 'medio', 'cuarto', 'kilo', 'kilos', 'gramos', 'gr', 'litros', 'l', 'botella', 'paquete', 'caja', 'picada', 'picado', 'rojo', 'verde', 'grande', 'pequeño', 'fría', 'caliente', 'entera', 'desnatada', 'semi', 'bolsa', 'botellas', 'paquetes'];
        words.forEach((word, index) => {
            const w = word.toLowerCase();
            if (index === 0) currentBuffer.push(word);
            else {
                if (connectors.includes(w) || connectors.includes(words[index-1].toLowerCase()) || w.length <= 2) currentBuffer.push(word);
                else { addItemData(currentBuffer.join(" ")); currentBuffer = [word]; }
            }
        });
        if (currentBuffer.length > 0) addItemData(currentBuffer.join(" "));
    });
    saveAndRender();
}

function renderList() {
    let f = items.filter(i => appMode === 'edit' ? i.target === currentTab : true);
    if (f.length === 0) { emptySt.style.display = 'flex'; listEl.innerHTML = ''; return; }
    emptySt.style.display = 'none';

    const grouped = f.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const sortedCats = Object.keys(grouped).sort();
    listEl.innerHTML = sortedCats.map(cat => `
        <div class="category-header">${cat}</div>
        ${grouped[cat].map(i => `
            <li class="list-item ${i.checked ? 'checked' : ''}" data-id="${i.id}">
                <div class="checkbox-wrapper">
                    <input type="checkbox" ${i.checked ? 'checked' : ''} onchange="toggleItem(${i.id})">
                    <span class="checkmark"></span>
                </div>
                <span class="item-text">${i.text}</span>
                <button class="delete-btn" onclick="deleteItem(${i.id})"><i data-lucide="trash-2"></i></button>
            </li>
        `).join('')}
    `).join('');

    if (appMode === 'shop') {
        const total = f.length, checked = f.filter(i => i.checked).length;
        shopStats.textContent = `${checked} de ${total} comprados`;
        if (total > 0 && total === checked) finishBtn.classList.remove('hidden'); else finishBtn.classList.add('hidden');
    }
    if (window.lucide) lucide.createIcons();
    initSwipe();
}

function shareWhatsApp() {
    let text = "🛒 *Mi Lista de la Compra (VoiceShop AI)*\n\n";
    const f = items.filter(i => i.target === currentTab && !i.checked);
    if (f.length === 0) return showError("La lista está vacía");
    f.forEach(i => { text += `• ${i.text}\n`; });
    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, '_blank');
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('vs_last_date');
    if (lastDate && lastDate !== today && items.length > 0) {
        if (confirm("¿Quieres limpiar la lista de ayer para empezar el día?")) resetAll();
    }
    localStorage.setItem('vs_last_date', today);
}

function initSwipe() {
    let startX;
    document.querySelectorAll('.list-item').forEach(item => {
        item.ontouchstart = (e) => { startX = e.touches[0].clientX; };
        item.ontouchmove = (e) => {
            let diff = startX - e.touches[0].clientX;
            if (diff > 50) item.style.transform = `translateX(-${diff}px)`;
        };
        item.ontouchend = (e) => {
            let diff = startX - e.changedTouches[0].clientX;
            if (diff > 100) { item.classList.add('swiping'); setTimeout(() => deleteItem(parseInt(item.dataset.id)), 300); }
            else item.style.transform = '';
        };
    });
}

function toggleItem(id) { items = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i); vibrate(); saveAndRender(); }
function deleteItem(id) { items = items.filter(i => i.id !== id); saveAndRender(); }
function clearChecked() { items = items.filter(i => !i.checked); saveAndRender(); }
function resetAll() { items = []; saveAndRender(); if (appMode === 'shop') toggleMode(); }
function saveAndRender() { localStorage.setItem('vs_items', JSON.stringify(items)); renderList(); }
function toggleCatalog() { isCatalogOpen = !isCatalogOpen; catalogArea.classList.toggle('hidden', !isCatalogOpen); document.getElementById('tab-catalog').classList.toggle('active', isCatalogOpen); if (isCatalogOpen) renderCatalog(); }
function renderCatalog() { catalogArea.innerHTML = CATALOG_DATA.map(cat => `<div class="catalog-category"><span class="category-title">${cat.category}</span><div class="catalog-grid">${cat.items.map(item => `<div class="catalog-item" onclick="addSingleItem('${item.n}')"><span>${item.e}</span><span>${item.n}</span></div>`).join('')}</div></div>`).join(''); }
function addSingleItem(text) { addItemData(text); saveAndRender(); }
function setTab(t) { currentTab = t; isCatalogOpen = false; catalogArea.classList.add('hidden'); document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.getElementById('tab-'+t).classList.add('active'); renderList(); }
function addManualItem() { addSingleItem(manIn.value); manIn.value = ''; }
manIn.onkeypress = (e) => { if (e.key === 'Enter') addManualItem(); };
function toggleMode() { appMode = (appMode === 'edit') ? 'shop' : 'edit'; app.className = appMode + '-mode'; if (appMode === 'shop') { stopListening(); isCatalogOpen = false; catalogArea.classList.add('hidden'); } renderList(); if (window.lucide) lucide.createIcons(); }
function stopListening() { isListening = false; try { recognition.stop(); } catch(e) {} voiceOv.classList.add('hidden'); micBt.classList.remove('listening'); }
function toggleListening() { if (isListening) stopListening(); else startListening(); }
async function startListening() { if (!recognition) return showError('Voz no soportada'); try { await navigator.mediaDevices.getUserMedia({ audio: true }); isListening = true; recognition.start(); } catch (e) { showError('Sin acceso al micro'); } }
function showError(m) { errTo.textContent = m; errTo.classList.remove('hidden'); setTimeout(() => errTo.classList.add('hidden'), 5000); }
micBt.onclick = toggleListening;
checkDailyReset();
renderList();
lucide.createIcons();
