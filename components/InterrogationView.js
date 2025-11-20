export class InterrogationView {
    constructor(container, roster, onUpdateSuspicion, onViewDetails, actionPoints, onAction, askedQuestions, interrogationLogs = {}, currentDay = 1, onAddLog = null) {
        this.container = container;
        this.roster = roster;
        this.onUpdateSuspicion = onUpdateSuspicion;
        this.onViewDetails = onViewDetails;
        this.actionPoints = actionPoints;
        this.onAction = onAction;
        this.askedQuestions = askedQuestions;
        this.interrogationLogs = interrogationLogs;
        this.currentDay = currentDay;
        this.onAddLog = onAddLog;
        this.selectedChar = null;
        this.chatLog = [];
        this.isTyping = false;
        this.render();
    }

    updateState(newRoster, newActionPoints, newAskedQuestions, interrogationLogs = {}, currentDay = 1) {
        this.roster = newRoster;
        this.actionPoints = newActionPoints;
        this.askedQuestions = newAskedQuestions;
        this.interrogationLogs = interrogationLogs;
        this.currentDay = currentDay;
        if (this.selectedChar) {
            const updated = this.roster.find(c => c.id === this.selectedChar.id);
            if (updated) this.selectedChar = updated;
        }
        this.updateQuestionButtons();
        this.updateAPDisplay();
    }

    updateAPDisplay() {
        const wrapper = this.container.querySelector('.interrogation-wrapper');
        if (!wrapper) return;
        
        const apBars = wrapper.querySelectorAll('.ap-bar');
        apBars.forEach((bar, i) => {
            if (i < this.actionPoints) {
                bar.classList.add('bg-neon-green', 'shadow-[0_0_5px_lime]');
                bar.classList.remove('bg-gray-800');
            } else {
                bar.classList.remove('bg-neon-green', 'shadow-[0_0_5px_lime]');
                bar.classList.add('bg-gray-800');
            }
        });
        
        const apText = wrapper.querySelector('.ap-text');
        if (apText) {
            apText.textContent = `${this.actionPoints} / 10 AP`;
        }
    }

    getSidebarImage(char) {
        const basePath = `assets/images/${char.folder}`;
        if (char.status === 'DEAD') return char.isInfiltrator ? `${basePath}/ai.png` : `${basePath}/Dead.png`;
        if (char.status === 'MISSION') return `${basePath}/Combat.png`;
        if (char.status === 'INJURED') return `${basePath}/Injured.png`;
        return `${basePath}/Normal.png`;
    }

    getMonitorImage(char) {
        return `assets/images/${char.folder}/Scared.png`;
    }

    handleSelectChar(char) {
        if (char.status === 'MISSION' || char.status === 'DEAD') return;
        
        // Save current chat log if there's a selected character
        if (this.selectedChar) {
            if (!this.interrogationLogs[this.selectedChar.id]) {
                this.interrogationLogs[this.selectedChar.id] = {};
            }
            if (!this.interrogationLogs[this.selectedChar.id][this.currentDay]) {
                this.interrogationLogs[this.selectedChar.id][this.currentDay] = [];
            }
            this.interrogationLogs[this.selectedChar.id][this.currentDay] = [...this.chatLog];
        }
        
        this.selectedChar = char;
        
        // Load existing chat log for this character and day, or create new one
        if (this.interrogationLogs[char.id] && this.interrogationLogs[char.id][this.currentDay]) {
            this.chatLog = [...this.interrogationLogs[char.id][this.currentDay]];
        } else {
            this.chatLog = [
                { speaker: 'SYSTEM', text: `Nöral bağlantı ${char.name} ile senkronize edildi. Sorgu protokolü başlatılıyor. [Gün ${this.currentDay}]`, isSystem: true }
            ];
        }
        
        this.render();
    }

    handleQuestion(questionKey, questionText) {
        if (!this.selectedChar || this.isTyping || this.actionPoints <= 0) return;

        const qId = `${this.selectedChar.id}-${questionKey}`;
        if (this.askedQuestions.has(qId)) return;

        this.onAction(1, qId);

        this.chatLog.push({ speaker: 'KOMUTAN', text: questionText });
        this.isTyping = true;
        this.updateChatDisplay();
        this.scrollToBottom();

        setTimeout(() => {
            let response = this.selectedChar.interrogation[questionKey];
            
            if (questionKey === 'q4') {
                const stressRoll = Math.random() * 100;
                const isAI = this.selectedChar.isInfiltrator;

                if (!isAI && stressRoll < this.selectedChar.stressLevel && this.selectedChar.stressLevel > 30) {
                    const errorPhrases = [
                        "Kod... Bir dakika... Lanet olsun, unuttum! Sanırım ALPHA... hayır...",
                        "Bu baskı altında hatırlayamıyorum! Beni öldürme!",
                        "Kod değişti mi? Benim bildiğim... " + this.selectedChar.securityCode.substring(0, 3) + "... gerisi yok.",
                        "..."
                    ];
                    response = errorPhrases[Math.floor(Math.random() * errorPhrases.length)];
                }
            }

            this.chatLog.push({ speaker: this.selectedChar.name.split(' ')[0], text: response });
            
            if (questionKey === 'q4') {
                const code = this.selectedChar.securityCode || "UNKNOWN";
                if (!response.toUpperCase().includes(code.toUpperCase()) && !response.includes("...")) {
                    this.onUpdateSuspicion(this.selectedChar.id, 20);
                    this.chatLog.push({ 
                        speaker: 'SYSTEM', 
                        text: `UYARI: GÜVENLİK KODU EŞLEŞMEDİ. [${code}] BEKLENİYORDU.`, 
                        isSystem: true,
                        isWarning: true 
                    });
                    
                    // Add to game logs
                    if (this.onAddLog) {
                        this.onAddLog({
                            title: `SORGU RAPORU: ${this.selectedChar.name} - GÜVENLİK KODU HATASI`,
                            content: `Gün ${this.currentDay} - Sadakat protokolü sırasında ${this.selectedChar.name} yanlış güvenlik kodu verdi. Beklenen kod: [${code}]. Şüphe seviyesi artırıldı (+20).`,
                            isEncrypted: false
                        });
                    }
                } else if (response.includes("...") || response.includes("unuttum")) {
                    this.onUpdateSuspicion(this.selectedChar.id, 10);
                    this.chatLog.push({ 
                        speaker: 'SYSTEM', 
                        text: `UYARI: PERSONEL TEREDDÜT ETTİ. DOĞRULANAMADI.`, 
                        isSystem: true,
                        isWarning: true 
                    });
                    
                    // Add to game logs
                    if (this.onAddLog) {
                        this.onAddLog({
                            title: `SORGU RAPORU: ${this.selectedChar.name} - TEREDDÜT`,
                            content: `Gün ${this.currentDay} - ${this.selectedChar.name} sorgu sırasında tereddüt etti ve net bir cevap veremedi. Stres altında olabilir veya bilgi gizliyor olabilir. Şüphe seviyesi artırıldı (+10).`,
                            isEncrypted: false
                        });
                    }
                } else {
                    this.chatLog.push({ speaker: 'SYSTEM', text: `KOD DOĞRULANDI: ${code}`, isSystem: true });
                }
            }
            
            // Save updated chat log
            if (!this.interrogationLogs[this.selectedChar.id]) {
                this.interrogationLogs[this.selectedChar.id] = {};
            }
            if (!this.interrogationLogs[this.selectedChar.id][this.currentDay]) {
                this.interrogationLogs[this.selectedChar.id][this.currentDay] = [];
            }
            this.interrogationLogs[this.selectedChar.id][this.currentDay] = [...this.chatLog];

            this.isTyping = false;
            this.updateChatDisplay();
            this.scrollToBottom();
            this.updateQuestionButtons();
        }, 1500);
    }

    updateChatDisplay() {
        const wrapper = this.container.querySelector('.interrogation-wrapper');
        if (!wrapper) return;
        
        const chatContainer = wrapper.querySelector('.chat-logs');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = `
            ${this.chatLog.map((msg, idx) => `
                <div class="${msg.isSystem ? 'text-neon-green italic opacity-70' : ''}
                    ${msg.isWarning ? '!text-alert-red !opacity-100 font-bold' : ''}
                    ${msg.speaker === 'KOMUTAN' ? 'text-right' : ''}">
                    ${!msg.isSystem ? `
                        <span class="block text-xs font-bold mb-1
                            ${msg.speaker === 'KOMUTAN' ? 'text-blue-400' : 'text-alert-red'}">
                            [${msg.speaker}]
                        </span>
                    ` : ''}
                    <span class="inline-block p-2 border-l-2
                        ${msg.isSystem ? 'border-transparent' : ''}
                        ${msg.speaker === 'KOMUTAN' ? 'border-blue-500 bg-blue-900/20 text-gray-200' : ''}
                        ${msg.speaker !== 'KOMUTAN' && !msg.isSystem ? 'border-alert-red bg-alert-red/10 text-white' : ''}">
                        ${msg.text}
                    </span>
                </div>
            `).join('')}
            ${this.isTyping ? '<div class="text-neon-green animate-pulse">Analiz ediliyor...</div>' : ''}
            <div class="chat-end"></div>
        `;
    }

    updateQuestionButtons() {
        const wrapper = this.container.querySelector('.interrogation-wrapper');
        if (!wrapper || !this.selectedChar) return;
        
        const questionTexts = [
            '1. KONUM SORGUSU [DÜN]',
            '2. İDEOLOJİ TESTİ',
            '3. BASKI KUR',
            '4. SADAKAT PROTOKOLÜ'
        ];
        
        ['q1', 'q2', 'q3', 'q4'].forEach((q, idx) => {
            const btn = wrapper.querySelector(`[data-question="${q}"]`);
            if (btn) {
                const isAsked = this.askedQuestions.has(`${this.selectedChar.id}-${q}`);
                const isOutOfAP = this.actionPoints <= 0;
                
                btn.disabled = this.isTyping || isOutOfAP || isAsked;
                btn.className = `bg-gray-900 border py-2 px-4 transition-all text-xs md:text-sm font-tech
                    ${isAsked ? 'border-gray-800 text-gray-600 line-through decoration-2' : isOutOfAP ? 'border-gray-800 text-gray-600' : 'border-gray-600 text-gray-300 hover:border-neon-green hover:text-neon-green'}
                    disabled:opacity-50 disabled:cursor-not-allowed`;
                btn.innerHTML = `${questionTexts[idx]} ${isAsked ? '[SORULDU]' : ''}`;
            }
        });
    }

    scrollToBottom() {
        const wrapper = this.container.querySelector('.interrogation-wrapper');
        if (!wrapper) return;
        const chatContainer = wrapper.querySelector('.chat-logs');
        if (chatContainer) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
    }

    render() {
        // Clear container and create wrapper
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'interrogation-wrapper flex w-full h-full overflow-hidden';
        this.container.appendChild(wrapper);
        
        wrapper.innerHTML = `
            <div class="flex w-full h-full overflow-hidden">
                <div class="w-1/3 max-w-xs border-r border-gray-800 bg-black/40 flex flex-col">
                    <div class="p-4 border-b border-gray-800 bg-blue-900/10">
                        <h2 class="text-sm font-tech text-blue-400 tracking-widest mb-2">SORGU PANELİ</h2>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-400">ENERJİ:</span>
                        <div class="flex gap-1">
                            ${Array.from({length: 10}).map((_, i) => `
                                <div class="ap-bar w-2 h-4 ${i < this.actionPoints ? 'bg-neon-green shadow-[0_0_5px_lime]' : 'bg-gray-800'}"></div>
                            `).join('')}
                        </div>
                        </div>
                        <div class="ap-text text-[10px] text-gray-500 mt-1 text-right">${this.actionPoints} / 10 AP</div>
                    </div>
                    <div class="flex-grow overflow-y-auto">
                        ${this.roster.filter(char => char.status !== 'DEAD').map(char => `
                            <div data-char-select="${char.id}"
                                class="p-3 border-b border-gray-800 transition-colors flex items-center gap-3
                                    ${this.selectedChar?.id === char.id ? 'bg-gray-800 border-l-4 border-l-neon-green' : 'border-l-4 border-l-transparent'}
                                    ${char.status === 'MISSION' ? 'opacity-60 pointer-events-none' : 'cursor-pointer hover:bg-gray-900'}">
                                <div class="w-10 h-10 bg-gray-700 overflow-hidden rounded-full border border-gray-600 relative">
                                    <img src="${this.getSidebarImage(char)}" class="w-full h-full object-cover" alt="avatar" />
                                    ${char.status !== 'ACTIVE' ? `
                                        <div class="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] text-white font-bold">
                                            ${char.status === 'DEAD' ? 'EX' : char.status === 'INJURED' ? 'YRL' : 'MSN'}
                                        </div>
                                    ` : ''}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-gray-200 font-tech">${char.name}</div>
                                    <div class="text-xs text-gray-500">Suspicion: ${char.suspicion}%</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="flex-grow flex flex-col relative">
                    ${this.selectedChar ? `
                        <!-- Background image for entire right panel -->
                        <div class="absolute inset-0 z-0">
                            <img 
                                src="${this.getMonitorImage(this.selectedChar)}" 
                                class="w-full h-full object-cover opacity-30 filter contrast-125"
                                alt="Background"
                            />
                            <div class="absolute inset-0 bg-black/70"></div>
                        </div>
                        
                        <div data-monitor-click class="h-1/3 min-h-[200px] border-b border-neon-green/30 relative z-10 cursor-zoom-in group">
                            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div class="bg-black/80 border border-neon-green text-neon-green px-4 py-2 font-tech text-xl animate-pulse">
                                    VERİ TABANINI AÇ [DETAILS]
                                </div>
                            </div>
                            <div class="absolute bottom-4 left-4">
                                <h2 class="text-3xl font-tech text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">${this.selectedChar.name.toUpperCase()}</h2>
                                <p class="text-neon-green text-sm tracking-[0.5em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">BAĞLANTI KURULDU</p>
                            </div>
                            <div class="absolute top-4 right-4 text-right font-mono text-xs text-alert-red bg-black/80 p-2 border border-alert-red/50">
                                <p>HR: ${100 + (this.selectedChar.stressLevel || 0)} BPM</p>
                                <p>STRES: %${this.selectedChar.stressLevel}</p>
                                <p>SUSPICION: ${this.selectedChar.suspicion}%</p>
                            </div>
                        </div>
                        <div class="flex-grow p-6 flex flex-col justify-between font-mono text-sm relative z-10 overflow-hidden">
                            <div class="chat-logs flex-grow overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-neon-green scrollbar-track-gray-900 relative z-10">
                                ${this.chatLog.map((msg, idx) => `
                                    <div class="${msg.isSystem ? 'text-neon-green italic opacity-70' : ''}
                                        ${msg.isWarning ? '!text-alert-red !opacity-100 font-bold' : ''}
                                        ${msg.speaker === 'KOMUTAN' ? 'text-right' : ''}">
                                        ${!msg.isSystem ? `
                                            <span class="block text-xs font-bold mb-1
                                                ${msg.speaker === 'KOMUTAN' ? 'text-blue-400' : 'text-alert-red'}">
                                                [${msg.speaker}]
                                            </span>
                                        ` : ''}
                                        <span class="inline-block p-2 border-l-2
                                            ${msg.isSystem ? 'border-transparent' : ''}
                                            ${msg.speaker === 'KOMUTAN' ? 'border-blue-500 bg-blue-900/20 text-gray-200' : ''}
                                            ${msg.speaker !== 'KOMUTAN' && !msg.isSystem ? 'border-alert-red bg-alert-red/10 text-white' : ''}">
                                            ${msg.text}
                                        </span>
                                    </div>
                                `).join('')}
                                ${this.isTyping ? '<div class="text-neon-green animate-pulse">Analiz ediliyor...</div>' : ''}
                                <div class="chat-end"></div>
                            </div>
                            <div class="border-t border-gray-700 pt-4 grid grid-cols-2 gap-2">
                                ${[
                                    { k: 'q1', t: '1. KONUM SORGUSU [DÜN]' },
                                    { k: 'q2', t: '2. İDEOLOJİ TESTİ' },
                                    { k: 'q3', t: '3. BASKI KUR' },
                                    { k: 'q4', t: '4. SADAKAT PROTOKOLÜ' }
                                ].map(btn => {
                                    const isAsked = this.askedQuestions.has(`${this.selectedChar.id}-${btn.k}`);
                                    const isOutOfAP = this.actionPoints <= 0;
                                    return `
                                        <button data-question="${btn.k}"
                                            ${this.isTyping || isOutOfAP || isAsked ? 'disabled' : ''}
                                            class="bg-gray-900 border py-2 px-4 transition-all text-xs md:text-sm font-tech
                                                ${isAsked ? 'border-gray-800 text-gray-600 line-through decoration-2' : isOutOfAP ? 'border-gray-800 text-gray-600' : 'border-gray-600 text-gray-300 hover:border-neon-green hover:text-neon-green'}
                                                disabled:opacity-50 disabled:cursor-not-allowed">
                                            ${btn.t} ${isAsked ? '[SORULDU]' : ''}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="w-full h-full flex flex-col items-center justify-center text-gray-600">
                            <div class="text-6xl mb-4 opacity-20">?</div>
                            <p class="font-tech text-xl tracking-widest">SORGULANACAK HEDEFİ SEÇİN</p>
                            <p class="text-sm text-gray-700 mt-2">SADECE [ACTIVE] DURUMDAKİ PERSONEL SORGULANABİLİR</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Event listeners - must be added after innerHTML
        setTimeout(() => {
            this.roster.forEach(char => {
                const selectBtn = wrapper.querySelector(`[data-char-select="${char.id}"]`);
                if (selectBtn && char.status !== 'DEAD' && char.status !== 'MISSION') {
                    // Remove old listener if exists
                    const newSelectBtn = selectBtn.cloneNode(true);
                    selectBtn.parentNode.replaceChild(newSelectBtn, selectBtn);
                    
                    newSelectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.handleSelectChar(char);
                    });
                }
            });

            if (this.selectedChar) {
                const monitorClick = wrapper.querySelector('[data-monitor-click]');
                if (monitorClick) {
                    monitorClick.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.onViewDetails(this.selectedChar);
                    });
                }

                const questionTexts = [
                    '1. KONUM SORGUSU [DÜN]',
                    '2. İDEOLOJİ TESTİ',
                    '3. BASKI KUR',
                    '4. SADAKAT PROTOKOLÜ'
                ];

                ['q1', 'q2', 'q3', 'q4'].forEach((q, idx) => {
                    const btn = wrapper.querySelector(`[data-question="${q}"]`);
                    if (btn) {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.handleQuestion(q, questionTexts[idx]);
                        });
                    }
                });
            }
        }, 10);
    }
}

