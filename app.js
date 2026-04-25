// 1. DATA MODULE (State and Catalog)
const dataModule = {
    items: JSON.parse(localStorage.getItem('lme_items')) || [],
    
    CATALOG_DATA: [
        { c: "🥦 Verduras y Hortalizas", col: "var(--cat-verduras)", items: [{n: "Tomate", e: "🍅"}, {n: "Lechuga", e: "🥬"}, {n: "Cebolla", e: "🧅"}, {n: "Patatas", e: "🥔"}, {n: "Zanahoria", e: "🥕"}, {n: "Calabacín", e: "🥒"}, {n: "Brócoli", e: "🥦"}] },
        { c: "🍎 Frutas", col: "var(--cat-frutas)", items: [{n: "Plátano", e: "🍌"}, {n: "Manzana", e: "🍎"}, {n: "Naranja", e: "🍊"}, {n: "Fresas", e: "🍓"}, {n: "Limón", e: "🍋"}, {n: "Melón", e: "🍈"}] },
        { c: "🥩 Carnicería", col: "var(--cat-carne)", items: [{n: "Pechuga Pollo", e: "🍗"}, {n: "Carne Picada", e: "🥩"}, {n: "Lomo", e: "🥩"}, {n: "Hamburguesa", e: "🍔"}, {n: "Pavo", e: "🦃"}] },
        { c: "🐟 Pescadería", col: "var(--cat-pescado)", items: [{n: "Merluza", e: "🐟"}, {n: "Salmón", e: "🍣"}, {n: "Gambas", e: "🍤"}, {n: "Calamares", e: "🦑"}, {n: "Pulpo", e: "🐙"}] },
        { c: "🥛 Lácteos y Quesos", col: "var(--cat-lacteos)", items: [{n: "Leche", e: "🥛"}, {n: "Huevos", e: "🥚"}, {n: "Yogures", e: "🍦"}, {n: "Queso Rallado", e: "🧀"}, {n: "Queso Lonchas", e: "🧀"}, {n: "Mantequilla", e: "🧈"}] },
        { c: "🌭 Charcutería", col: "var(--cat-carne)", items: [{n: "Salchichas", e: "🌭"}, {n: "Bacon", e: "🥓"}, {n: "Chorizo", e: "🌭"}] },
        { c: "🍝 Despensa", col: "var(--cat-despensa)", items: [{n: "Arroz", e: "🍚"}, {n: "Macarrones", e: "🍝"}, {n: "Aceite", e: "🫒"}, {n: "Sal", e: "🧂"}, {n: "Azúcar", e: "🍬"}, {n: "Tomate frito", e: "🥫"}] },
        { c: "🍞 Pan y Desayuno", col: "var(--cat-pan)", items: [{n: "Pan", e: "🥖"}, {n: "Café", e: "☕"}, {n: "Cereales", e: "🥣"}, {n: "Galletas", e: "🍪"}] },
        { c: "🧼 Limpieza", col: "var(--cat-limpieza)", items: [{n: "Detergente", e: "🧺"}, {n: "Papel Higiénico", e: "🧻"}, {n: "Lavavajillas", e: "🧼"}, {n: "Gel Baño", e: "🧼"}] },
        { c: "🐱 Mascotas", col: "var(--cat-mascotas)", items: [{n: "Comida Gato", e: "🐈"}, {n: "Arena Gato", e: "🏖️"}, {n: "Chichis Gato", e: "🍖"}] }
    ],

    getCategoryInfo: function(text) {
        const t = text.toLowerCase();
        for (const cat of this.CATALOG_DATA) {
            if (cat.items.some(item => t.includes(item.n.toLowerCase()))) return { name: cat.c, color: cat.col };
        }
        return { name: "⚪ Varios", color: "var(--cat-default)" };
    },

    save: function() { localStorage.setItem('lme_items', JSON.stringify(this.items)); }
};

// 2. AUDIO MODULE (Beeps)
const audioModule = {
    ctx: null,
    init: function() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    beep: function(type) {
        try {
            this.init();
            if(this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            const now = this.ctx.currentTime;
            
            if (type === 'start') {
                osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            } else {
                osc.type = 'sine'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
                gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            }
            osc.start(now); osc.stop(now + 0.1);
        } catch(e) {} // Ignorar si el navegador bloquea audio sin interacción
    }
};

// 3. VOICE MODULE
const voiceModule = {
    recognition: null,
    isListening: false,
    transcript: "",
    
    init: function() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;
        
        this.recognition = new SpeechRec();
        this.recognition.lang = 'es-ES';
        this.recognition.interimResults = true;
        this.recognition.continuous = true;
        
        this.recognition.onstart = () => { 
            this.isListening = true; this.transcript = ""; 
            document.getElementById('mic-trigger').classList.add('listening'); 
            document.getElementById('voice-overlay').classList.remove('hidden'); 
            document.getElementById('transcript-preview').textContent = 'Te escucho...'; 
            audioModule.beep('start');
        };
        
        this.recognition.onresult = (e) => { 
            let interim = '', finalS = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) finalS += e.results[i][0].transcript + " ";
                else interim += e.results[i][0].transcript;
            }
            this.transcript += finalS;
            document.getElementById('transcript-preview').textContent = this.transcript + (interim ? " ... " + interim : "");
        };
        
        this.recognition.onerror = (e) => { this.stopListening(); };
        this.recognition.onend = () => { 
            if (this.isListening) { try { this.recognition.start(); } catch(e){} } 
            else if (this.transcript.trim()) appController.processVoice(this.transcript); 
        };
    },
    
    toggle: function() {
        if (!this.recognition) return appController.showError('Micro no compatible');
        if (this.isListening) this.stopListening();
        else { audioModule.init(); this.isListening = true; this.recognition.start(); }
    },
    
    stopListening: function() {
        if(this.isListening) audioModule.beep('stop');
        this.isListening = false;
        try { this.recognition.stop(); } catch(e){}
        document.getElementById('voice-overlay').classList.add('hidden');
        document.getElementById('mic-trigger').classList.remove('listening');
    }
};

// 4. APP CONTROLLER (UI & Logic)
const appController = {
    mode: 'edit',
    isCatalogOpen: false,

    init: function() {
        voiceModule.init();
        document.getElementById('mic-trigger').onclick = () => voiceModule.toggle();
        document.getElementById('manual-input').onkeypress = (e) => { if (e.key === 'Enter') this.addManualItem(); };
        this.renderList();
    },

    addItemData: function(text) {
        if (!text || !text.trim()) return;
        const clean = text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();
        const info = dataModule.getCategoryInfo(clean);
        dataModule.items.push({ id: Date.now() + Math.random(), text: clean, checked: false, catName: info.name, catColor: info.color });
        if(navigator.vibrate) navigator.vibrate(30);
    },

    processVoice: function(t) {
        let rawParts = t.split(/ y |,|\.|\n/i);
        rawParts.forEach(part => {
            let words = part.trim().split(/\s+/);
            if (words.length === 0) return;
            let currentB = [];
            const conn = ['de', 'con', 'sin', 'para', 'la', 'el', 'en', 'un', 'una', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'del', 'al', 'los', 'las', 'kilo', 'gramos', 'litros', 'paquete', 'bolsa'];
            words.forEach((word, index) => {
                const w = word.toLowerCase();
                if (index === 0) currentB.push(word);
                else { if (conn.includes(w) || conn.includes(words[index-1].toLowerCase()) || w.length <= 2) currentB.push(word); else { this.addItemData(currentB.join(" ")); currentB = [word]; } }
            });
            if (currentB.length > 0) this.addItemData(currentB.join(" "));
        });
        dataModule.save(); this.renderList();
    },

    renderList: function() {
        const listEl = document.getElementById('shopping-list');
        const emptySt = document.getElementById('empty-state');
        const shopStats = document.getElementById('shop-stats');
        const finishBtn = document.getElementById('finish-btn');

        if (dataModule.items.length === 0) { emptySt.style.display = 'flex'; listEl.innerHTML = ''; return; }
        emptySt.style.display = 'none';

        const grouped = dataModule.items.reduce((acc, item) => {
            if (!acc[item.catName]) acc[item.catName] = [];
            acc[item.catName].push(item);
            return acc;
        }, {});

        const sortedCats = Object.keys(grouped).sort();
        listEl.innerHTML = sortedCats.map(cat => `
            <div class="category-header" style="--cat-color: ${grouped[cat][0].catColor}">${cat}</div>
            ${grouped[cat].map(i => `
                <li class="list-item ${i.checked ? 'checked' : ''}" data-id="${i.id}" style="--cat-color: ${i.catColor}" onclick="appController.toggleItem(${i.id}, this)">
                    <div class="checkbox-wrapper"><div class="checkmark"></div></div>
                    <span class="item-text">${i.text}</span>
                    <button class="delete-btn" onclick="event.stopPropagation(); appController.deleteItem(${i.id}, this.parentElement)"><i data-lucide="trash-2"></i></button>
                </li>
            `).join('')}
        `).join('');

        if (this.mode === 'shop') {
            const total = dataModule.items.length, checked = dataModule.items.filter(i => i.checked).length;
            shopStats.textContent = `${checked} de ${total} comprados`;
            if (total > 0 && total === checked) finishBtn.classList.remove('hidden'); else finishBtn.classList.add('hidden');
        }
        if (window.lucide) lucide.createIcons();
    },

    toggleItem: function(id, el) {
        dataModule.items = dataModule.items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
        if(navigator.vibrate) navigator.vibrate(20);
        dataModule.save();
        
        // Optimización visual (sin re-renderizado completo)
        el.classList.toggle('checked');
        setTimeout(() => this.renderList(), 300); // Reordenar tras animación
    },

    deleteItem: function(id, el) {
        el.classList.add('removing');
        if(navigator.vibrate) navigator.vibrate([10, 30, 10]);
        setTimeout(() => {
            dataModule.items = dataModule.items.filter(i => i.id !== id);
            dataModule.save(); this.renderList();
        }, 300);
    },

    clearChecked: function() { dataModule.items = dataModule.items.filter(i => !i.checked); dataModule.save(); this.renderList(); },
    resetAll: function() { if (confirm("¿Borrar toda la lista?")) { dataModule.items = []; dataModule.save(); if (this.mode === 'shop') this.toggleMode(); else this.renderList(); } },
    
    toggleCatalog: function() {
        const area = document.getElementById('catalog-area');
        const btn = document.querySelector('.catalog-btn-bottom');
        this.isCatalogOpen = !this.isCatalogOpen;
        area.classList.toggle('hidden', !this.isCatalogOpen);
        btn.classList.toggle('active', this.isCatalogOpen);
        if (this.isCatalogOpen) area.innerHTML = `<div class="catalog-grid">${dataModule.CATALOG_DATA.map(c => c.items.map(i => `<div class="catalog-item" onclick="appController.addSingleItem('${i.n}')"><span>${i.e}</span><span>${i.n}</span></div>`).join('')).join('')}</div>`;
    },

    addSingleItem: function(t) { this.addItemData(t); dataModule.save(); this.renderList(); },
    addManualItem: function() { const v = document.getElementById('manual-input').value.trim(); if(v) { this.addSingleItem(v); document.getElementById('manual-input').value = ''; } },
    
    toggleMode: function() {
        this.mode = (this.mode === 'edit') ? 'shop' : 'edit';
        document.getElementById('app').className = this.mode + '-mode';
        if (this.mode === 'shop') { voiceModule.stopListening(); this.isCatalogOpen = false; document.getElementById('catalog-area').classList.add('hidden'); document.querySelector('.catalog-btn-bottom').classList.remove('active'); }
        this.renderList();
    },

    shareWhatsApp: function() {
        const f = dataModule.items.filter(i => !i.checked);
        if (f.length === 0) return this.showError("La lista está vacía");
        let t = "🛒 *Lista de Los Mandaos de Evi*\n\n" + f.map(i => `• ${i.text}`).join('\n');
        window.open("whatsapp://send?text=" + encodeURIComponent(t), '_blank');
    },

    showError: function(m) {
        const t = document.getElementById('error-toast');
        t.textContent = m; t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 4000);
    }
};

// Start App
appController.init();
