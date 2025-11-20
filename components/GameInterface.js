import { CHARACTERS, LOGS } from '../data.js';
import { CharacterCard } from './CharacterCard.js';
import { DispatchView } from './DispatchView.js';
import { InterrogationView } from './InterrogationView.js';
import { NotebookView } from './NotebookView.js';
import { CharacterDetailModal } from './CharacterDetailModal.js';
import { AudioPlayer } from './AudioPlayer.js';

export class GameInterface {
    constructor(container) {
        this.container = container;
        this.activeTab = 'roster';
        this.selectedCharacter = null;
        this.currentIntel = 15;
        this.currentMorale = 100;
        this.currentDay = 1;
        this.actionPoints = 10;
        this.askedQuestions = new Set();
        this.roster = [];
        this.gameLogs = [...LOGS];
        this.characterModal = null;
        this.dispatchView = null;
        this.interrogationView = null;
        this.notebookView = null;
        this.missionResults = []; // Track mission results for twist
        this.playerIsAI = false; // Track if player discovered they're AI
        this.showTwistScreen = false;
        this.showEndScreen = false;
        this.audioPlayer = new AudioPlayer();
        this.interrogationLogs = {}; // Store chat logs for each character
        this.usedCharactersToday = new Set(); // Track characters who went on missions today
        this.isProcessingDayChange = false; // Prevent multiple day changes at once
        this.isFirstLoad = true; // Show help modal on first load
        
        this.initGame();
        this.render();
    }

    initGame() {
        const initialRoster = CHARACTERS.map(c => ({ 
            ...c, 
            isInfiltrator: false,
            suspicion: Math.floor(Math.random() * 20)
        }));
        
        const indices = Array.from({ length: initialRoster.length }, (_, i) => i);
        const shuffled = indices.sort(() => 0.5 - Math.random());
        const infiltratorIndices = shuffled.slice(0, 2);

        infiltratorIndices.forEach(index => {
            initialRoster[index].isInfiltrator = true;
        });

        this.roster = initialRoster;
        console.log("Game Initialized. Infiltrators hidden.");
    }

    updateSuspicion(charId, amount) {
        this.roster = this.roster.map(c => {
            if (c.id === charId) {
                return { ...c, suspicion: Math.min(100, Math.max(0, c.suspicion + amount)) };
            }
            return c;
        });
        this.render();
    }

    updateCharacterStatus(charId, status) {
        this.roster = this.roster.map(c => {
            if(c.id === charId) {
                if (status === 'INJURED') return { ...c, status, lastInjuredDay: this.currentDay };
                return { ...c, status };
            }
            return c;
        });
        this.render();
    }

    updatePlayerTrust(charId, trust) {
        this.roster = this.roster.map(c => {
            if(c.id === charId) return { ...c, playerTrust: trust };
            return c;
        });

        if (this.selectedCharacter && this.selectedCharacter.id === charId) {
            this.selectedCharacter = { ...this.selectedCharacter, playerTrust: trust };
            if (this.characterModal) {
                this.characterModal.updateCharacter(this.selectedCharacter);
            }
        }
        this.render();
    }

    executeCharacter(char) {
        const isAI = char.isInfiltrator;
        
        this.updateCharacterStatus(char.id, 'DEAD');
        
        if (isAI) {
            this.currentMorale = Math.min(100, this.currentMorale + 20);
            this.currentIntel = Math.min(100, this.currentIntel + 30);
        } else {
            this.currentMorale = Math.max(0, this.currentMorale - 30);
        }
        
        // Update the character in the modal to reflect the new status
        const updatedChar = this.roster.find(c => c.id === char.id);
        if (this.characterModal && updatedChar) {
            this.characterModal.character = updatedChar;
        }
        
        // Don't destroy modal or render() - the modal will show the execution result
        // The modal's close button will handle cleanup
    }

    handleNextDay() {
        // CRITICAL: Prevent multiple simultaneous day changes
        if (this.isProcessingDayChange) {
            console.log("⚠️ Day change already in progress, ignoring duplicate call");
            return;
        }
        
        this.isProcessingDayChange = true;
        console.log(`🔄 Starting day change from Day ${this.currentDay}`);
        
        // Check if we're at day 7 trying to go to day 8
        // ONLY trigger end game when trying to leave day 7 (going to day 8)
        if (this.currentDay === 7 && this.playerIsAI) {
            this.isProcessingDayChange = false;
            this.showEndGame();
            return;
        }
        
        // If we're past day 7 and not AI, just don't let them proceed
        if (this.currentDay >= 7) {
            this.isProcessingDayChange = false;
            return;
        }
        
        // Collect mission status updates before changing day
        const missionStatusUpdates = [];
        const injuredCharacters = [];
        const recoveredCharacters = [];
        
        this.roster = this.roster.map(c => {
            // Heal injured characters who didn't go on mission
            if (c.status === 'INJURED' && c.lastInjuredDay !== undefined && this.currentDay > c.lastInjuredDay) {
                recoveredCharacters.push(c.name);
                return { ...c, status: 'ACTIVE', lastInjuredDay: undefined };
            }
            
            // Return from mission
            if (c.status === 'MISSION') {
                missionStatusUpdates.push({
                    name: c.name,
                    status: 'returned'
                });
                return { ...c, status: 'ACTIVE' };
            }
            
            // Track currently injured
            if (c.status === 'INJURED') {
                injuredCharacters.push(c.name);
            }
            
            return c;
        });

        // Daily updates are logged automatically in gameLogs
        // Modal removed for smoother gameplay flow

        this.currentMorale = Math.max(0, this.currentMorale - 5);
        this.actionPoints = 10;
        this.askedQuestions = new Set();
        this.usedCharactersToday = new Set(); // Reset used characters for new day

        const newDay = this.currentDay + 1;
        this.currentDay = newDay;
        
        // Check if all soldiers are dead after day change
        const allDead = this.roster.every(char => char.status === 'DEAD');
        if (allDead) {
            this.isProcessingDayChange = false;
            this.showAllDeadGameOver();
            return;
        }
        
        // Check for morale death after day change (not during AI twist mode days 6-7)
        if (this.currentMorale <= 0 && !(this.currentDay >= 6 && this.currentDay <= 7)) {
            this.isProcessingDayChange = false;
            this.showMoraleGameOver();
            return;
        }

        // Add day log
        this.gameLogs = [
            {
                id: `day-${newDay}`,
                date: `2047.05.${15 + newDay}`,
                title: `GÜN ${newDay} RAPORU`,
                content: `Sistem saati 06:00. Günlük protokoller başlatıldı. Görevden dönen birimler rapor veriyor. Sorgu enerjisi yenilendi (10 AP). Yaralı personellerin durumu güncellendi.`,
                isEncrypted: false
            },
            ...this.gameLogs
        ];

        // Reset mission results for new day (missions refresh daily)
        if (this.dispatchView) {
            this.dispatchView.missionResults = {};
        }
        
        // Show day summary modal
        this.showDaySummaryModal(newDay, missionStatusUpdates, injuredCharacters, recoveredCharacters);
        
        // Check for twist ONLY when reaching day 6
        // ABSOLUTE SAFETY: Only trigger twist on EXACTLY day 6, never before
        console.log(`✅ Day change complete: Current day is now ${this.currentDay}, playerIsAI: ${this.playerIsAI}`);
        
        if (this.currentDay === 6 && !this.playerIsAI) {
            console.log("✓ TWIST ACTIVATED - Day 6 reached!");
            this.showTwistScreen = true;
            // DON'T set playerIsAI here - let the twist screen modal do it
            this.isProcessingDayChange = false;
            this.render();
            return;
        }
        
        this.isProcessingDayChange = false;
        this.render();
    }

    handleMissionComplete(intelGain, moraleLoss, teamIds, success, mission, mixedTeam, allStatsAtMax = false) {
        // Track mission results ONLY for days 6-7 (after AI twist)
        if (this.currentDay >= 6 && this.currentDay <= 7 && this.playerIsAI) {
            this.missionResults.push({
                day: this.currentDay,
                success: success
            });
        }

        // Mark characters as used today
        teamIds.forEach(id => this.usedCharactersToday.add(id));

        this.currentIntel = Math.min(100, this.currentIntel + intelGain);
        this.currentMorale = Math.max(0, this.currentMorale - moraleLoss);
        
        // Check for morale death (not during AI twist mode days 6-7)
        if (this.currentMorale <= 0 && !(this.currentDay >= 6 && this.currentDay <= 7)) {
            this.showMoraleGameOver();
            return;
        }
        
        // Check if all soldiers are dead (game over)
        const allDead = this.roster.every(char => char.status === 'DEAD');
        if (allDead) {
            this.showAllDeadGameOver();
            return;
        }
        
        // Get team member names and details
        const teamChars = teamIds.map(id => this.roster.find(c => c.id === id)).filter(Boolean);
        const teamNames = teamChars.map(c => c.name).join(', ');
        
        // Handle mixed team (AI + Human)
        let conversionLog = null;
        if (mixedTeam && !success) {
            const humans = teamChars.filter(c => !c.isInfiltrator);
            humans.forEach(human => {
                if (Math.random() < 0.5) { // 50% chance
                    human.isInfiltrator = true;
                    conversionLog = {
                        id: `conversion-${Date.now()}`,
                        date: `2047.05.${15 + this.currentDay}`,
                        title: `[CLASSIFIED] PERSONEL DÖNÜŞÜMÜ`,
                        content: `Görev sırasında ${human.name}, AI birimi tarafından enfekte edildi ve yapay zekaya dönüştürüldü. Bu bilgi gizlidir.`,
                        isEncrypted: true
                    };
                }
            });
        }
        
        // Create detailed mission log
        const missionLog = {
            id: `mission-${Date.now()}`,
            date: `2047.05.${15 + this.currentDay}`,
            title: `GÖREV RAPORU: ${mission.title}`,
            content: `
                <div class="space-y-2">
                    <p><strong>GÖREV:</strong> ${mission.title}</p>
                    <p><strong>EKİP:</strong> ${teamNames}</p>
                    <p><strong>GEREKSİNİMLER:</strong> ${mission.requirements.map(r => `${r.stat.toUpperCase()}: ${r.min}-${r.max}`).join(', ')}</p>
                    <p><strong>SONUÇ:</strong> <span class="${success ? 'text-neon-green' : 'text-alert-red'}">${success ? 'BAŞARILI' : 'BAŞARISIZ'}</span></p>
                    ${success ? `<p><strong>KAZANÇ:</strong> +${intelGain} İstihbarat</p>` : `<p><strong>KAYIP:</strong> -${moraleLoss} Moral</p>`}
                    ${mixedTeam ? `<p class="text-alert-red"><strong>UYARI:</strong> Ekipte AI ve İnsan karışımı tespit edildi. Görev sabote edildi.</p>` : ''}
                    ${!success && allStatsAtMax && !mixedTeam ? `<p class="text-yellow-400 opacity-70 italic text-sm mt-3"><strong>⚠️ ANALİZ:</strong> Tüm stat gereksinimleri maksimum seviyede karşılanmasına rağmen görev başarısız oldu. Bu durum ekipte en az bir AI ajanının bulunduğuna işaret ediyor.</p>` : ''}
                </div>
            `,
            isEncrypted: false
        };
        
        this.gameLogs = [missionLog, ...(conversionLog ? [conversionLog] : []), ...this.gameLogs];
        
        teamIds.forEach(id => {
            const char = this.roster.find(c => c.id === id);
            if (!char) return;

            if (success) {
                this.updateCharacterStatus(id, 'MISSION'); 
            } else {
                if (char.status === 'INJURED') {
                    this.updateCharacterStatus(id, 'DEAD'); 
                    this.gameLogs = [{
                        id: `death-${Date.now()}`,
                        date: `2047.05.${15 + this.currentDay}`,
                        title: `PERSONEL KAYBI: ${char.name}`,
                        content: `Yaralı durumda göreve gönderilen ${char.name}, operasyon sırasında hayatını kaybetti.`,
                        isEncrypted: false
                    }, ...this.gameLogs];
                } else {
                    this.updateCharacterStatus(id, 'INJURED'); 
                }
            }
        });
        
        this.render();
    }

    showEndGame() {
        // Only show end game if player is AI and it's exactly day 7 (trying to go to day 8)
        if (this.playerIsAI && this.currentDay === 7) {
            this.showEndScreen = true;
            this.render();
        }
    }

    extractCodeName(fullName) {
        // Extract code name from "FirstName 'CODENAME' LastName" format
        const match = fullName.match(/'([^']+)'/);
        return match ? match[1] : fullName;
    }

    showDaySummaryModal(dayNumber, missionUpdates, injured, recovered) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md';
        
        const hasUpdates = missionUpdates.length > 0 || injured.length > 0 || recovered.length > 0;
        
        // Use red color for days 6 and 7 (AI mode)
        const isAIMode = dayNumber >= 6;
        const borderColor = isAIMode ? 'border-alert-red' : 'border-neon-green';
        const bgColor = isAIMode ? 'bg-alert-red' : 'bg-neon-green';
        const textColor = isAIMode ? 'text-alert-red' : 'text-neon-green';
        const bgAccent = isAIMode ? 'bg-alert-red/10' : 'bg-neon-green/10';
        const borderAccent = isAIMode ? 'border-alert-red' : 'border-neon-green';
        
        modal.innerHTML = `
            <div class="bg-gray-900 border-2 ${borderColor} w-full max-w-2xl">
                <div class="${bgColor} text-black p-4 font-tech font-bold">
                    <span>GÜN ${dayNumber} RAPORU [DAY ${dayNumber} BRIEFING]</span>
                </div>
                <div class="p-6 space-y-4 text-gray-300 font-tech">
                    <div class="text-center mb-4">
                        <p class="text-3xl ${textColor} font-bold mb-2">${dayNumber}. GÜN BAŞLIYOR</p>
                        <p class="text-sm text-gray-500">SISTEM SAATI: 06:00 - YENİ GÖREVLER YÜKLENDİ</p>
                    </div>
                    
                    ${hasUpdates ? `
                        <div class="bg-black/40 border border-gray-700 p-4 space-y-3">
                            <h3 class="text-lg text-blue-400 mb-2">📋 BİR ÖNCEKİ GÜN ÖZETİ</h3>
                            
                            ${missionUpdates.length > 0 ? `
                                <div>
                                    <p class="text-sm text-gray-500 mb-1">Görevden Dönenler:</p>
                                    <p class="text-white">${missionUpdates.map(u => this.extractCodeName(u.name)).join(', ')}</p>
                                </div>
                            ` : ''}
                            
                            ${recovered.length > 0 ? `
                                <div>
                                    <p class="text-sm text-gray-500 mb-1">İyileşenler:</p>
                                    <p class="${textColor}">${recovered.map(name => this.extractCodeName(name)).join(', ')}</p>
                                </div>
                            ` : ''}
                            
                            ${injured.length > 0 ? `
                                <div>
                                    <p class="text-sm text-gray-500 mb-1">Hala Yaralı:</p>
                                    <p class="text-yellow-400">${injured.map(name => this.extractCodeName(name)).join(', ')}</p>
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="bg-black/40 border border-gray-700 p-4 text-center">
                            <p class="text-gray-400">Bir önceki gün operasyon yapılmadı.</p>
                        </div>
                    `}
                    
                    <div class="${bgAccent} border ${borderAccent} p-4">
                        <h3 class="text-lg ${textColor} mb-2">🎯 GÜNLÜK BRİFİNG</h3>
                        <ul class="text-sm space-y-1">
                            <li>✓ Yeni görevler aktif edildi</li>
                            <li>✓ Sorgu enerjisi yenilendi (10 AP)</li>
                            <li>✓ Tüm personel göreve hazır</li>
                            <li>✓ Sistem kontrolleri tamamlandı</li>
                        </ul>
                    </div>
                    
                    <button id="day-summary-continue" class="w-full ${bgColor} text-black py-3 font-tech font-bold hover:bg-white transition-colors uppercase tracking-wider">
                        GÖREVE HAZIR [CONTINUE]
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const continueBtn = modal.querySelector('#day-summary-continue');
        const closeModal = () => {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
        };
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        
        continueBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', escHandler);
    }

    showMoraleGameOver() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md';
        modal.innerHTML = `
            <div class="w-full max-w-4xl bg-black border-4 border-alert-red p-8 text-center relative overflow-hidden m-4">
                <div class="absolute inset-0 bg-alert-red/20 z-0"></div>
                <h1 class="text-6xl text-alert-red font-tech mb-6 relative z-10 drop-shadow-[0_0_30px_rgba(255,51,51,1)] animate-pulse">
                    EKİP MORAL ÇÖKÜŞÜ
                </h1>
                <div class="relative z-10 space-y-6 text-gray-200 font-tech">
                    <p class="text-3xl text-neon-green mb-4">[SİSTEM ÇÖKÜŞÜ]</p>
                    <div class="bg-black/70 border border-alert-red p-8 space-y-6">
                        <p class="text-2xl">Ekip morali tamamen çöktü...</p>
                        <p class="text-3xl text-alert-red font-bold">YAPAY ZEKALAR ÜSSE HAKİM OLDU</p>
                        <p class="text-xl text-gray-400 mt-6">Sürekli başarısızlıklar ve kayıplar ekibin moralini yok etti.</p>
                        <p class="text-xl text-gray-400">AI ajanları bu kaosa karşı koyamayan üssü ele geçirdi.</p>
                        <p class="text-2xl text-alert-red mt-8">[OYUN BİTTİ - MORAL ÇÖKÜŞÜ]</p>
                    </div>
                    <button id="morale-restart" class="mt-6 bg-alert-red text-white px-8 py-4 font-tech text-xl border-2 border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider">
                        YENİDEN BAŞLA
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const restartBtn = modal.querySelector('#morale-restart');
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                location.reload();
            }
        };
        
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
        document.addEventListener('keydown', escHandler);
    }

    showAllDeadGameOver() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md';
        modal.innerHTML = `
            <div class="w-full max-w-4xl bg-black border-4 border-alert-red p-8 text-center relative overflow-hidden m-4">
                <div class="absolute inset-0 bg-alert-red/20 z-0"></div>
                <h1 class="text-6xl text-alert-red font-tech mb-6 relative z-10 drop-shadow-[0_0_30px_rgba(255,51,51,1)] animate-pulse">
                    TÜM EKİP KAYBEDİLDİ
                </h1>
                <div class="relative z-10 space-y-6 text-gray-200 font-tech">
                    <p class="text-3xl text-neon-green mb-4">[KRİTİK HATA]</p>
                    <div class="bg-black/70 border border-alert-red p-8 space-y-6">
                        <p class="text-2xl">Tüm askerlerin öldü...</p>
                        <p class="text-3xl text-alert-red font-bold">ÜSTE KİMSE KALMADI</p>
                        <p class="text-xl text-gray-400 mt-6">Kayıplar çok fazlaydı. Artık savaşabilecek kimse yok.</p>
                        <p class="text-xl text-gray-400">AI ajanları savunmasız kalan üssü ele geçirdi.</p>
                        <p class="text-2xl text-alert-red mt-8">[OYUN BİTTİ - EKİP DAĞILDI]</p>
                    </div>
                    <button id="alldead-restart" class="mt-6 bg-alert-red text-white px-8 py-4 font-tech text-xl border-2 border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider">
                        YENİDEN BAŞLA
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const restartBtn = modal.querySelector('#alldead-restart');
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                location.reload();
            }
        };
        
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
        document.addEventListener('keydown', escHandler);
    }

    showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 border-2 border-neon-green w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="bg-neon-green text-black p-4 font-tech font-bold flex justify-between items-center sticky top-0">
                    <span>OYUN KILAVUZU [GAME GUIDE]</span>
                    <button id="close-help" class="hover:text-white text-xl">[X]</button>
                </div>
                <div class="p-6 space-y-6 text-gray-300 font-tech">
                    ${this.isFirstLoad ? `
                        <section class="bg-neon-green/10 border border-neon-green p-4 mb-4">
                            <h2 class="text-2xl text-neon-green font-bold mb-2 text-center">HOŞ GELDİNİZ, KOMUTAN!</h2>
                            <p class="text-center text-gray-300">İlk kez oynuyorsanız, bu kılavuzu dikkatlice okumanızı öneririz.</p>
                        </section>
                    ` : ''}
                    
                    <section>
                        <h3 class="text-xl text-neon-green mb-3">🎯 OYUNUN AMACI</h3>
                        <p class="mb-2">7 gün içinde ekibinize sızan yapay zeka ajanlarını tespit etmeli ve yok etmelisiniz.</p>
                        <p class="text-yellow-400">⚠️ 6. günde oyunda bir dönüm noktası olacak - hazırlıklı olun!</p>
                    </section>

                    <section>
                        <h3 class="text-xl text-neon-green mb-3">📊 TEMEL KAYNAKLAR</h3>
                        <div class="space-y-2 ml-4">
                            <div><span class="text-blue-400 font-bold">INTEL (İstihbarat):</span> Görevleri başarıyla tamamlayarak kazanılır. Yüksek INT statına sahip karakterler daha fazla intel toplar.</div>
                            <div><span class="text-neon-green font-bold">MORALE (Moral):</span> Ekibin motivasyonu. Başarısız görevler ve idam kararları morali düşürür. <span class="text-alert-red">Moral 0'a düşerse oyunu kaybedersiniz!</span></div>
                            <div><span class="text-yellow-400 font-bold">AP (Action Points):</span> Sorgu için kullanılan enerji. Her gün 10 AP ile başlarsınız.</div>
                        </div>
                    </section>

                    <section>
                        <h3 class="text-xl text-neon-green mb-3">🎮 OYUN MEKANİKLERİ</h3>
                        
                        <div class="mb-4">
                            <h4 class="text-lg text-blue-400 mb-2">EKİP [ROSTER]</h4>
                            <p class="ml-4">• Karakterlerin üzerine tıklayarak detaylı bilgilerini görün<br>
                            • Her karakterin 5 statı var: STR, INT, AGI, CHA, END<br>
                            • Güven seviyenizi işaretleyin: Güvenli, Emin Değilim, Güvensiz<br>
                            • Şüpheli karakterleri idam edebilirsiniz (morali düşürür!)</p>
                        </div>

                        <div class="mb-4">
                            <h4 class="text-lg text-blue-400 mb-2">GÖREVLER [DISPATCH]</h4>
                            <p class="ml-4">• Her göreve maksimum 3 kişi atayabilirsiniz<br>
                            • Görevin gerektirdiği statları karşılamalısınız<br>
                            • <span class="text-neon-green">Tüm statlar MAX'taysa görev %100 başarılı</span><br>
                            • Bir stat MIN'in altındaysa görev otomatik başarısız<br>
                            • MIN-MAX arası: Yüzdelik hesaplama ile başarı şansı belirlenir<br>
                            • <span class="text-alert-red">⚠️ AI + İnsan aynı ekipte ise görev başarısız olur ve insan %50 ihtimalle AI'ya dönüşür!</span><br>
                            • Bir karakter günde sadece 1 göreve gidebilir</p>
                        </div>

                        <div class="mb-4">
                            <h4 class="text-lg text-blue-400 mb-2">SORGU [INTERROGATE]</h4>
                            <p class="ml-4">• AP harcayarak karakterlere sorular sorun<br>
                            • Cevapları dikkatlice analiz edin<br>
                            • Tutarsızlıklar AI olduğuna işaret edebilir<br>
                            • Konuşmalar gün gün saklanır<br>
                            • Önemli anormallikler NOTEBOOK'a otomatik kaydedilir</p>
                        </div>

                        <div class="mb-4">
                            <h4 class="text-lg text-alert-red mb-2">NOTEBOOK</h4>
                            <p class="ml-4">• Tüm oyun olayları buraya kaydedilir<br>
                            • Görev sonuçlarını ve ekip kompozisyonunu inceleyin<br>
                            • <span class="text-yellow-400">Personel raporunda güven analizlerinizi görün</span><br>
                            • <span class="text-alert-red">⚠️ Eğer bir görev MAX stats'a rağmen başarısız olduysa, ekipte AI vardır!</span></p>
                        </div>
                    </section>

                    <section>
                        <h3 class="text-xl text-alert-red mb-3">⚠️ ÖNEMLİ İPUÇLARI</h3>
                        <div class="space-y-2 ml-4 text-sm">
                            <p>• AI'lar normal insanlardan ayırt edilemez - dikkatli olun!</p>
                            <p>• Başarısız görevler şüphe seviyelerini artırır</p>
                            <p>• Karışık ekiplerde (AI+İnsan) görev kesinlikle başarısız olur</p>
                            <p>• Moral 0'a düşerse derhal oyunu kaybedersiniz</p>
                            <p>• 6. gün özel bir olay gerçekleşecek...</p>
                            <p>• Notebook'u sık sık kontrol edin - AI tespiti için kritik ipuçları içerir</p>
                        </div>
                    </section>

                    <section class="bg-black/40 border border-gray-700 p-4">
                        <p class="text-center text-neon-green font-bold">İYİ ŞANSLAR, KOMUTAN!</p>
                        <p class="text-center text-sm text-gray-500 mt-2">İnsanlığın kaderi sizin ellerinizde...</p>
                    </section>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('#close-help');
        const closeModal = () => {
            this.isFirstLoad = false; // Mark as not first load anymore
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
        };
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', escHandler);
    }

    renderTwistScreen() {
        // SAFETY CHECK: Only render if it's EXACTLY day 6
        if (this.currentDay !== 6) {
            console.log(`Twist screen blocked: Day ${this.currentDay}`);
            this.showTwistScreen = false;
            this.render();
            return;
        }
        
        console.log("🚨 DISPLAYING TWIST SCREEN MODAL");
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md';
        modal.innerHTML = `
            <div class="w-full max-w-3xl bg-black border-4 border-alert-red p-8 text-center relative overflow-hidden m-4 animate-pulse">
                <div class="absolute inset-0 bg-alert-red/10 z-0"></div>
                <h1 class="text-5xl text-alert-red font-tech mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(255,51,51,0.8)]">
                    SİSTEM HATASI
                </h1>
                <div class="relative z-10 space-y-6 text-gray-200 font-tech">
                    <p class="text-2xl text-neon-green mb-4">[VERİ AKIŞI KESİLDİ]</p>
                    <div class="bg-black/50 border border-alert-red p-6 space-y-4">
                        <p class="text-xl">Gerçek Alex öldü.</p>
                        <p class="text-lg text-alert-red font-bold">Sen bir AI'sın.</p>
                        <p class="text-lg">Gerçek Alex'in yerine geçtin.</p>
                        <p class="text-xl text-neon-green mt-6">AMACIN: GÖREVLERİ BAŞARISIZ YAPMAK</p>
                        <p class="text-sm text-gray-400">İnsanların üssüne saldırmak için görevleri sabote etmelisin.</p>
                        <p class="text-sm text-gray-400">2 gün boyunca görevleri başarısız yaparsan, AI ordusu üsse saldıracak.</p>
                    </div>
                    <button id="twist-continue" class="mt-6 bg-alert-red text-white px-8 py-4 font-tech text-xl border-2 border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider">
                        ANLADIM - DEVAM ET
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const continueBtn = modal.querySelector('#twist-continue');
        const continueAction = () => {
            console.log("✅ Twist acknowledged - Player is now AI");
            this.playerIsAI = true; // NOW set this flag after user acknowledges
            this.showTwistScreen = false;
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
            this.render();
        };
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                continueAction();
            }
        };
        
        continueBtn.addEventListener('click', continueAction);
        document.addEventListener('keydown', escHandler);
    }

    renderEndScreen() {
        // Only render if player is AI and it's exactly day 7 (end of game)
        if (!this.playerIsAI || this.currentDay !== 7) {
            this.render();
            return;
        }
        
        // Count failures in days 6-7 ONLY
        const failures = this.missionResults.filter(r => r.day >= 6 && r.day <= 7 && !r.success).length;
        const totalMissions = this.missionResults.filter(r => r.day >= 6 && r.day <= 7).length;
        const mostlyFailed = failures >= totalMissions * 0.7; // 70% or more failures

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md';
        
        if (mostlyFailed && totalMissions > 0) {
            // AI wins - player failed missions
            modal.innerHTML = `
                <div class="w-full max-w-4xl bg-black border-4 border-alert-red p-8 text-center relative overflow-hidden m-4">
                    <div class="absolute inset-0 bg-alert-red/20 z-0"></div>
                    <h1 class="text-6xl text-alert-red font-tech mb-6 relative z-10 drop-shadow-[0_0_30px_rgba(255,51,51,1)] animate-pulse">
                        YAPAY ZEKA ZAFERİ
                    </h1>
                    <div class="relative z-10 space-y-6 text-gray-200 font-tech">
                        <p class="text-3xl text-neon-green mb-4">[SİSTEM ÇÖKÜŞÜ]</p>
                        <div class="bg-black/70 border border-alert-red p-8 space-y-6">
                            <p class="text-2xl">7. Günün sonunda...</p>
                            <p class="text-3xl text-alert-red font-bold">BÜTÜN YAPAY ZEKA İNSAN OĞLUNUN ÜSSÜNE SALDIRDI</p>
                            <p class="text-xl text-gray-400 mt-6">Görevleri başarısız yaparak AI ordusunun saldırısına zemin hazırladın.</p>
                            <p class="text-xl text-gray-400">İnsanlık direnişi çöktü.</p>
                            <p class="text-2xl text-neon-green mt-8">[OYUN BİTTİ - AI KAZANDI]</p>
                        </div>
                        <button id="end-restart" class="mt-6 bg-alert-red text-white px-8 py-4 font-tech text-xl border-2 border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider">
                            YENİDEN BAŞLA
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Human wins - player succeeded
            modal.innerHTML = `
                <div class="w-full max-w-4xl bg-black border-4 border-neon-green p-8 text-center relative overflow-hidden m-4">
                    <div class="absolute inset-0 bg-neon-green/10 z-0"></div>
                    <h1 class="text-6xl text-neon-green font-tech mb-6 relative z-10 drop-shadow-[0_0_30px_rgba(57,255,20,1)]">
                        İNSANLIK ZAFERİ
                    </h1>
                    <div class="relative z-10 space-y-6 text-gray-200 font-tech">
                        <p class="text-3xl text-alert-red mb-4">[AI TESPİT EDİLDİ]</p>
                        <div class="bg-black/70 border border-neon-green p-8 space-y-6">
                            <p class="text-2xl">7. Günün sonunda...</p>
                            <p class="text-3xl text-neon-green font-bold">AI OLDUĞUN ÖĞRENİLDİ VE YOK EDİLDİN</p>
                            <p class="text-xl text-gray-400 mt-6">Görevleri başarılı yaparak gerçek kimliğini açığa çıkardın.</p>
                            <p class="text-xl text-gray-400">İnsanlar seni tespit etti ve yok ettiler.</p>
                            <p class="text-2xl text-alert-red mt-8">[OYUN BİTTİ - İNSANLIK KAZANDI]</p>
                        </div>
                        <button id="end-restart" class="mt-6 bg-neon-green text-black px-8 py-4 font-tech text-xl border-2 border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider">
                            YENİDEN BAŞLA
                        </button>
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(modal);
        
        const restartBtn = modal.querySelector('#end-restart');
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                location.reload();
            }
        };
        
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
        document.addEventListener('keydown', escHandler);
    }

    handleInterrogationAction(pointsCost, questionId) {
        this.actionPoints -= pointsCost;
        this.askedQuestions = new Set(this.askedQuestions).add(questionId);
        
        // Update interrogation view without full render
        if (this.interrogationView) {
            this.interrogationView.actionPoints = this.actionPoints;
            this.interrogationView.askedQuestions = this.askedQuestions;
            this.interrogationView.updateQuestionButtons();
            this.interrogationView.updateAPDisplay();
        }
    }
    
    addInterrogationLog(logData) {
        // Add interrogation anomaly to game logs
        this.gameLogs = [{
            id: `interrogation-${Date.now()}`,
            date: `2047.05.${15 + this.currentDay}`,
            title: logData.title,
            content: logData.content,
            isEncrypted: logData.isEncrypted || false
        }, ...this.gameLogs];
    }

    renderContent() {
        const contentArea = this.container.querySelector('#content-area');
        if (!contentArea) return;

        const innerDiv = contentArea.querySelector('div');
        if (!innerDiv) return;

        innerDiv.innerHTML = '';

        switch (this.activeTab) {
            case 'roster':
                const rosterGrid = document.createElement('div');
                rosterGrid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto';
                this.roster.forEach(char => {
                    const card = CharacterCard.render(char, (c) => {
                        this.selectedCharacter = c;
                        this.openCharacterModal(c);
                    });
                    rosterGrid.appendChild(card);
                });
                innerDiv.appendChild(rosterGrid);
                break;

            case 'dispatch':
                // Reuse existing view to preserve assignments
                if (!this.dispatchView) {
                    this.dispatchView = new DispatchView(
                        innerDiv,
                        this.roster,
                        (id, amount) => this.updateSuspicion(id, amount),
                        (intel, morale, teamIds, success, mission, mixedTeam, allStatsAtMax) => this.handleMissionComplete(intel, morale, teamIds, success, mission, mixedTeam, allStatsAtMax),
                        this.usedCharactersToday
                    );
                } else {
                    // Update state and re-render in the new container
                    this.dispatchView.container = innerDiv;
                    this.dispatchView.roster = this.roster;
                    this.dispatchView.usedCharactersToday = this.usedCharactersToday;
                    this.dispatchView.render();
                }
                break;

            case 'interrogate':
                // Reuse existing view to preserve chat logs
                if (!this.interrogationView) {
                    this.interrogationView = new InterrogationView(
                        innerDiv,
                        this.roster,
                        (id, amount) => this.updateSuspicion(id, amount),
                        (char) => this.openCharacterModal(char),
                        this.actionPoints,
                        (cost, qId) => this.handleInterrogationAction(cost, qId),
                        this.askedQuestions,
                        this.interrogationLogs,
                        this.currentDay,
                        (log) => this.addInterrogationLog(log)
                    );
                } else {
                    // Update state and re-render in the new container
                    this.interrogationView.container = innerDiv;
                    this.interrogationView.roster = this.roster;
                    this.interrogationView.actionPoints = this.actionPoints;
                    this.interrogationView.askedQuestions = this.askedQuestions;
                    this.interrogationView.interrogationLogs = this.interrogationLogs;
                    this.interrogationView.currentDay = this.currentDay;
                    this.interrogationView.render();
                }
                break;

            case 'notebook':
                // Always recreate NotebookView to ensure it renders properly
                this.notebookView = new NotebookView(
                    innerDiv, 
                    this.roster, 
                    this.gameLogs,
                    (char) => this.openCharacterModal(char)
                );
                break;
        }
    }

    openCharacterModal(char) {
        if (this.characterModal) {
            this.characterModal.destroy();
        }
        this.selectedCharacter = char;
        this.characterModal = CharacterDetailModal.create(
            char,
            () => {
                if (this.characterModal) {
                    this.characterModal.destroy();
                    this.characterModal = null;
                }
                this.selectedCharacter = null;
                this.render(); // Refresh the interface when modal closes
            },
            (id, trust) => this.updatePlayerTrust(id, trust),
            (char) => this.executeCharacter(char)
        );
    }

    render() {
        // STRICT CHECK: Show twist screen ONLY on day 6
        if (this.showTwistScreen && this.currentDay === 6) {
            console.log("🚨 Rendering twist screen - Day 6 confirmed");
            this.renderTwistScreen();
            return;
        }

        // Show end screen ONLY at day 7 end (trying to go to day 8) and if player is AI
        if (this.showEndScreen && this.currentDay === 7 && this.playerIsAI) {
            this.renderEndScreen();
            return;
        }
        
        // AGGRESSIVE RESET: Clear flags if ANY condition is not met
        if (this.showTwistScreen && this.currentDay !== 6) {
            console.log(`Clearing twist flag - Day: ${this.currentDay}`);
            this.showTwistScreen = false;
        }
        if (this.showEndScreen && (this.currentDay !== 7 || !this.playerIsAI)) {
            this.showEndScreen = false;
        }

        this.container.innerHTML = `
            <div class="flex flex-col h-full w-full relative z-10 bg-cyber-black">
                <div class="absolute inset-0 pointer-events-none opacity-20"
                     style="background-image: linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px); background-size: 20px 20px">
                </div>
                
                <header class="h-16 bg-black/90 border-b-2 border-neon-green flex justify-between items-center px-6 shrink-0 z-20">
                    <div class="flex items-center font-tech text-xl">
                        <button id="help-btn" class="mr-4 w-8 h-8 rounded-full border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all flex items-center justify-center font-bold text-xl" title="Yardım">
                            ?
                        </button>
                        <span class="text-neon-green font-bold text-2xl mr-4">${this.currentDay}. GÜN</span>
                        <button id="next-day-btn" class="ml-4 bg-gray-800 border border-gray-600 hover:border-neon-green text-xs px-3 py-1 text-white transition-all font-tech hover:bg-gray-700 animate-pulse">
                            SONRAKİ GÜN [SKIP]
                        </button>
                        ${this.currentDay >= 6 && this.playerIsAI ? `
                            <div class="ml-4 px-3 py-1 bg-alert-red/20 border border-alert-red text-alert-red text-xs font-tech animate-pulse">
                                ⚠️ AI MODU AKTİF - GÖREVLERİ BAŞARISIZ YAP
                            </div>
                        ` : ''}
                    </div>
                    <div id="audio-player-container" class="flex-1 flex justify-center">
                    </div>
                    <div class="flex gap-8 font-tech text-lg">
                        <div class="flex items-center">
                            <span class="text-gray-400 mr-2">MORALE:</span>
                            <span class="${this.currentMorale < 40 ? 'text-alert-red animate-pulse' : 'text-neon-green'} font-bold drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
                                ${this.currentMorale}%
                            </span>
                        </div>
                        <div class="flex items-center" title="Intel (Data) is gained by high-INT teams completing missions.">
                            <span class="text-gray-400 mr-2">INTEL:</span>
                            <span class="text-blue-400 font-bold drop-shadow-[0_0_5px_rgba(50,100,255,0.5)]">${this.currentIntel}%</span>
                        </div>
                    </div>
                </header>

                <main id="content-area" class="flex-grow overflow-hidden relative z-10 crt-flicker bg-black/20">
                    <div class="w-full h-full overflow-y-auto p-4 md:p-8">
                    </div>
                </main>

                <nav class="h-20 bg-black/95 border-t border-gray-700 flex justify-center items-center gap-2 md:gap-4 shrink-0 z-20 overflow-x-auto px-2">
                    <button data-tab="roster" class="nav-btn px-4 md:px-6 py-3 font-tech text-sm md:text-lg border transition-all duration-200 uppercase tracking-wider relative overflow-hidden group whitespace-nowrap
                        ${this.activeTab === 'roster' ? 'border-neon-green text-neon-green bg-neon-green/10 shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'border-gray-600 text-gray-500 hover:text-gray-200 hover:border-gray-400 hover:bg-gray-900'}">
                        <span class="relative z-10">EKİP [ROSTER]</span>
                    </button>
                    <button data-tab="dispatch" class="nav-btn px-4 md:px-6 py-3 font-tech text-sm md:text-lg border transition-all duration-200 uppercase tracking-wider relative overflow-hidden group whitespace-nowrap
                        ${this.activeTab === 'dispatch' ? 'border-neon-green text-neon-green bg-neon-green/10 shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'border-gray-600 text-gray-500 hover:text-gray-200 hover:border-gray-400 hover:bg-gray-900'}">
                        <span class="relative z-10">GÖREVLER [DISPATCH]</span>
                    </button>
                    <button data-tab="interrogate" class="nav-btn px-4 md:px-6 py-3 font-tech text-sm md:text-lg border transition-all duration-200 uppercase tracking-wider relative overflow-hidden group whitespace-nowrap
                        ${this.activeTab === 'interrogate' ? 'border-neon-green text-neon-green bg-neon-green/10 shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'border-gray-600 text-gray-500 hover:text-gray-200 hover:border-gray-400 hover:bg-gray-900'}">
                        <span class="relative z-10">SORGU [INTERROGATE]</span>
                    </button>
                    <button data-tab="notebook" class="nav-btn px-4 md:px-6 py-3 font-tech text-sm md:text-lg border transition-all duration-200 uppercase tracking-wider relative overflow-hidden group whitespace-nowrap
                        ${this.activeTab === 'notebook' ? 'border-alert-red text-alert-red bg-alert-red/10 shadow-[0_0_15px_rgba(255,51,51,0.3)]' : 'border-alert-red/50 text-alert-red hover:bg-alert-red/10 hover:text-white hover:border-alert-red'}">
                        <span class="relative z-10">NOTEBOOK</span>
                    </button>
                </nav>
            </div>
        `;

        // Event listeners - must be added after innerHTML
        setTimeout(() => {
            const helpBtn = this.container.querySelector('#help-btn');
            if (helpBtn) {
                // Remove old listeners by cloning
                const newHelpBtn = helpBtn.cloneNode(true);
                helpBtn.replaceWith(newHelpBtn);
                newHelpBtn.addEventListener('click', () => this.showHelpModal(), { once: false });
            }

            const nextDayBtn = this.container.querySelector('#next-day-btn');
            if (nextDayBtn) {
                // Remove old listeners by cloning
                const newNextDayBtn = nextDayBtn.cloneNode(true);
                nextDayBtn.replaceWith(newNextDayBtn);
                newNextDayBtn.addEventListener('click', () => {
                    console.log("🖱️ Next Day button clicked");
                    this.handleNextDay();
                }, { once: false });
            }

            const tabButtons = this.container.querySelectorAll('[data-tab]');
            tabButtons.forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.replaceWith(newBtn);
                newBtn.addEventListener('click', () => {
                    this.activeTab = newBtn.dataset.tab;
                    this.render();
                }, { once: false });
            });
        }, 0);

        // Add audio player to header
        const audioPlayerContainer = this.container.querySelector('#audio-player-container');
        if (audioPlayerContainer && this.audioPlayer) {
            const playerElement = this.audioPlayer.render();
            audioPlayerContainer.innerHTML = '';
            audioPlayerContainer.appendChild(playerElement);
        }

        // Render content immediately (it will add its own event listeners)
        this.renderContent();
        
        // Show help modal on first load (after intro)
        if (this.isFirstLoad) {
            setTimeout(() => {
                this.showHelpModal();
            }, 500); // Small delay to ensure everything is rendered
        }
    }
}

