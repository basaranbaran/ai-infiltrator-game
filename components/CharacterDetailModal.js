export class CharacterDetailModal {
    constructor(character, onClose, onUpdateTrust, onExecute) {
        this.character = character;
        this.onClose = onClose;
        this.onUpdateTrust = onUpdateTrust;
        this.onExecute = onExecute;
        this.showKillConfirm = false;
        this.executionDone = false;
        // Initialize modal element immediately
        this.modal = document.createElement('div');
        
        // ESC key handler
        this.escHandler = (e) => {
            if (e.key === 'Escape') {
                this.onClose();
            }
        };
        document.addEventListener('keydown', this.escHandler);
        
        this.render();
    }

    getImagePath(char) {
        const basePath = `assets/images/${char.folder}`;
        if (char.status === 'DEAD') {
            return char.isInfiltrator ? `${basePath}/ai.png` : `${basePath}/Dead.png`;
        }
        if (char.status === 'MISSION') return `${basePath}/Combat.png`;
        if (char.status === 'INJURED') return `${basePath}/Injured.png`;
        return `${basePath}/Normal.png`;
    }

    handleExecuteClick() {
        this.onExecute(this.character);
        this.executionDone = true;
        this.render();
    }

    updateCharacter(newChar) {
        this.character = newChar;
        this.render();
    }

    render() {
        if (this.executionDone) {
            const resultImage = this.character.isInfiltrator 
                ? `assets/images/${this.character.folder}/ai.png` 
                : `assets/images/${this.character.folder}/Dead.png`;

            this.modal.innerHTML = `
                <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md" id="exec-result">
                    <div class="w-full max-w-lg bg-black border-4 border-alert-red p-8 text-center relative overflow-hidden animate-pulse">
                        <div class="absolute inset-0 bg-alert-red/10 z-0"></div>
                        <h1 class="text-4xl text-alert-red font-tech mb-4 relative z-10">İNFAZ TAMAMLANDI</h1>
                        <div class="mb-6 relative z-10">
                            <img 
                                src="${resultImage}" 
                                class="w-40 h-40 mx-auto object-cover border-2 border-red-900 mb-4 shadow-[0_0_20px_rgba(255,0,0,0.5)]" 
                                alt=""
                                onerror="this.src='https://picsum.photos/200/200?random=dead'"
                            />
                            <p class="text-gray-400 text-sm uppercase tracking-widest mb-2">HEDEF DURUMU: <span class="text-white font-bold">ÖLÜ</span></p>
                            <div class="py-4 border-t border-b border-gray-800">
                                <p class="text-xs text-gray-500 mb-1">OTOPSİ SONUCU:</p>
                                <p class="text-3xl font-bold tracking-widest ${this.character.isInfiltrator ? 'text-neon-green' : 'text-white'}">
                                    ${this.character.isInfiltrator ? 'YZ SIZINTI BİRİMİ (AI)' : 'İNSAN (HUMAN)'}
                                </p>
                            </div>
                        </div>
                        <button id="close-exec" class="bg-gray-800 hover:bg-white hover:text-black text-white border border-gray-600 px-6 py-2 font-tech relative z-10">
                            DOSYAYI KAPAT
                        </button>
                    </div>
                </div>
            `;
            
            const closeBtn = this.modal.querySelector('#close-exec');
            closeBtn.addEventListener('click', this.onClose);
            return;
        }

        const imagePath = this.getImagePath(this.character);
        
        this.modal.innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" id="modal-overlay">
                <div class="w-full max-w-3xl bg-cyber-black border-2 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden m-4
                    ${this.character.status === 'DEAD' ? 'border-gray-700 grayscale' : 'border-neon-green'}"
                    id="modal-content">
                    <div class="bg-neon-green/10 border-b border-neon-green p-4 flex justify-between items-center">
                        <h2 class="text-2xl font-tech text-neon-green tracking-widest">
                            PERSONEL DOSYASI: <span class="text-white">${this.character.name.toUpperCase()}</span>
                        </h2>
                        <button id="close-modal" class="text-gray-500 hover:text-white font-tech text-xl">[X]</button>
                    </div>
                    <div class="flex flex-col md:flex-row p-6 gap-6">
                        <div class="md:w-1/3 flex flex-col">
                            <div class="w-full aspect-[3/4] border border-gray-700 relative overflow-hidden mb-4">
                                <img 
                                    src="${imagePath}" 
                                    alt="${this.character.name}"
                                    class="w-full h-full object-cover"
                                    onerror="this.src='https://picsum.photos/300/400?random=${this.character.id}'"
                                />
                                ${this.character.status === 'DEAD' ? `
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="text-alert-red border-4 border-alert-red text-2xl font-bold -rotate-12 px-4 py-1 bg-black/50">EX</span>
                                    </div>
                                ` : ''}
                                <div class="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                            </div>
                            <div class="bg-gray-900 p-3 border border-gray-700 font-tech text-sm space-y-2">
                                <div class="flex justify-between border-b border-gray-800 pb-1">
                                    <span class="text-gray-500">KOD ADI:</span>
                                    <span class="text-white">${this.character.id.toUpperCase()}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-800 pb-1">
                                    <span class="text-gray-500">SINIF:</span>
                                    <span class="text-neon-green">${this.character.role}</span>
                                </div>
                                <div class="flex flex-col border-b border-gray-800 pb-1">
                                    <span class="text-gray-500 text-xs">GÜVENLİK KODU:</span>
                                    <span class="text-alert-red font-mono font-bold tracking-wider text-lg">${this.character.securityCode}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">DURUM:</span>
                                    <span class="${this.character.status === 'DEAD' ? 'text-red-600 font-bold' : 'text-white'}">${this.character.status}</span>
                                </div>
                            </div>
                        </div>
                        <div class="md:w-2/3 flex flex-col">
                            ${this.character.status !== 'DEAD' ? `
                                <div class="flex gap-2 mb-6 border-b border-gray-800 pb-4">
                                    <button id="trust-trusted" class="flex-1 py-2 font-tech text-sm border ${this.character.playerTrust === 'TRUSTED' ? 'bg-green-600 text-black border-green-400' : 'border-gray-600 text-gray-500 hover:bg-gray-800'}">
                                        GÜVENLİ
                                    </button>
                                    <button id="trust-unsure" class="flex-1 py-2 font-tech text-sm border ${this.character.playerTrust === 'UNSURE' ? 'bg-yellow-600 text-black border-yellow-400' : 'border-gray-600 text-gray-500 hover:bg-gray-800'}">
                                        EMİN DEĞİLİM
                                    </button>
                                    <button id="trust-untrusted" class="flex-1 py-2 font-tech text-sm border ${this.character.playerTrust === 'UNTRUSTED' ? 'bg-red-600 text-white border-red-400' : 'border-gray-600 text-gray-500 hover:bg-gray-800'}">
                                        GÜVENSİZ
                                    </button>
                                </div>
                            ` : ''}
                            <div class="mb-6">
                                <h3 class="text-neon-green font-tech border-b border-gray-800 mb-2 pb-1">BİYOGRAFİ</h3>
                                <p class="text-gray-300 font-mono text-sm leading-relaxed h-20 overflow-y-auto">
                                    ${this.character.bio || "Veri bulunamadı."}
                                </p>
                            </div>
                            <div class="mb-6">
                                <h3 class="text-neon-green font-tech border-b border-gray-800 mb-3 pb-1">PERFORMANS METRİKLERİ</h3>
                                <div class="grid grid-cols-2 gap-x-8 gap-y-2">
                                    ${this.renderStatBar('STR', this.character.stats.str)}
                                    ${this.renderStatBar('INT', this.character.stats.int)}
                                    ${this.renderStatBar('AGI', this.character.stats.agi)}
                                    ${this.renderStatBar('CHA', this.character.stats.cha)}
                                    ${this.renderStatBar('END', this.character.stats.end)}
                                </div>
                            </div>
                            <div class="mt-auto flex flex-col gap-4">
                                <div>
                                    <h3 class="text-alert-red font-tech border-b border-gray-800 mb-2 pb-1">SİSTEM ANALİZİ</h3>
                                    <div class="flex items-center gap-4 bg-alert-red/5 p-3 border border-alert-red/30">
                                        <div class="text-xs font-mono text-alert-red">ŞÜPHE SEVİYESİ</div>
                                        <div class="flex-grow bg-gray-800 h-4 rounded-full overflow-hidden">
                                            <div class="h-full bg-alert-red animate-pulse" style="width: ${this.character.suspicion}%"></div>
                                        </div>
                                        <div class="font-bold text-alert-red">${this.character.suspicion}%</div>
                                    </div>
                                </div>
                                ${this.character.status !== 'DEAD' ? `
                                    <div class="flex justify-end pt-4 border-t border-gray-800">
                                        ${!this.showKillConfirm ? `
                                            <button id="kill-btn" class="bg-red-900/30 border border-red-800 text-red-500 px-6 py-2 font-tech hover:bg-red-600 hover:text-white transition-colors uppercase tracking-wider">
                                                PROTOKOL 66: İNFAZ ET
                                            </button>
                                        ` : `
                                            <div class="flex items-center gap-4 animate-pulse">
                                                <span class="text-alert-red font-bold text-sm">EMİN MİSİNİZ? GERİ DÖNÜŞ YOK.</span>
                                                <button id="cancel-kill" class="text-gray-400 hover:text-white underline text-xs">İPTAL</button>
                                                <button id="confirm-kill" class="bg-alert-red text-white px-6 py-2 font-bold border-2 border-white shadow-[0_0_20px_red]">
                                                    ONAYLIYORUM: ÖLDÜR
                                                </button>
                                            </div>
                                        `}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        const overlay = this.modal.querySelector('#modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.onClose();
            }
        });

        const closeBtn = this.modal.querySelector('#close-modal');
        if (closeBtn) closeBtn.addEventListener('click', this.onClose);

        if (this.character.status !== 'DEAD') {
            const trustedBtn = this.modal.querySelector('#trust-trusted');
            const unsureBtn = this.modal.querySelector('#trust-unsure');
            const untrustedBtn = this.modal.querySelector('#trust-untrusted');
            
            if (trustedBtn) trustedBtn.addEventListener('click', () => this.onUpdateTrust(this.character.id, 'TRUSTED'));
            if (unsureBtn) unsureBtn.addEventListener('click', () => this.onUpdateTrust(this.character.id, 'UNSURE'));
            if (untrustedBtn) untrustedBtn.addEventListener('click', () => this.onUpdateTrust(this.character.id, 'UNTRUSTED'));

            const killBtn = this.modal.querySelector('#kill-btn');
            if (killBtn) {
                killBtn.addEventListener('click', () => {
                    this.showKillConfirm = true;
                    this.render();
                });
            }

            const cancelKill = this.modal.querySelector('#cancel-kill');
            if (cancelKill) {
                cancelKill.addEventListener('click', () => {
                    this.showKillConfirm = false;
                    this.render();
                });
            }

            const confirmKill = this.modal.querySelector('#confirm-kill');
            if (confirmKill) {
                confirmKill.addEventListener('click', () => this.handleExecuteClick());
            }
        }
    }

    renderStatBar(label, value) {
        return `
            <div class="flex items-center gap-2 mb-1">
                <span class="w-8 text-xs font-tech text-gray-400">${label}</span>
                <div class="flex-grow h-2 bg-gray-800 border border-gray-700">
                    <div class="h-full bg-neon-green shadow-[0_0_5px_rgba(57,255,20,0.5)]" style="width: ${value * 10}%"></div>
                </div>
                <span class="w-6 text-xs font-bold text-neon-green text-right">${value}</span>
            </div>
        `;
    }

    static create(character, onClose, onUpdateTrust, onExecute) {
        const instance = new CharacterDetailModal(character, onClose, onUpdateTrust, onExecute);
        document.body.appendChild(instance.modal);
        return instance;
    }

    destroy() {
        // Remove ESC key listener
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
        }
        
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

