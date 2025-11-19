import { MISSIONS } from '../data.js';

export class DispatchView {
    constructor(container, roster, onUpdateSuspicion, onMissionComplete, usedCharactersToday = new Set()) {
        this.container = container;
        this.roster = roster;
        this.onUpdateSuspicion = onUpdateSuspicion;
        this.onMissionComplete = onMissionComplete;
        this.usedCharactersToday = usedCharactersToday;
        this.selectedMission = null;
        this.assignments = {};
        this.missionResults = {};
        this.MAX_SQUAD_SIZE = 3;
        this.render();
    }

    updateRoster(newRoster) {
        this.roster = newRoster;
        this.render();
    }

    toggleAssign(missionId, charId) {
        const current = this.assignments[missionId] || [];
        if (current.includes(charId)) {
            this.assignments[missionId] = current.filter(id => id !== charId);
        } else {
            if (current.length >= this.MAX_SQUAD_SIZE) return;
            this.assignments[missionId] = [...current, charId];
        }
        this.render();
    }

    runMission(mission) {
        const teamIds = this.assignments[mission.id] || [];
        if (teamIds.length === 0) return;

        // Check if AI and Human are on the same team
        const teamChars = teamIds.map(id => this.roster.find(c => c.id === id)).filter(Boolean);
        const hasAI = teamChars.some(c => c.isInfiltrator);
        const hasHuman = teamChars.some(c => !c.isInfiltrator);
        const mixedTeam = hasAI && hasHuman;

        let allStatsAtMax = true;
        let anyStatBelowMin = false;
        let totalPercentage = 0;
        let requirementCount = 0;

        mission.requirements.forEach(req => {
            let teamStatSum = 0;
            teamIds.forEach(id => {
                const char = this.roster.find(c => c.id === id);
                if (char) teamStatSum += char.stats[req.stat];
            });

            // Check if below minimum
            if (teamStatSum < req.min) {
                anyStatBelowMin = true;
            }

            // Check if at maximum
            if (teamStatSum < req.max) {
                allStatsAtMax = false;
            }

            // Calculate percentage for this stat (how much of the MIN-MAX range is filled)
            const range = req.max - req.min;
            let statPercentage = 0;
            
            if (teamStatSum >= req.max) {
                statPercentage = 100; // At or above MAX = 100%
            } else if (teamStatSum <= req.min) {
                statPercentage = 0; // At or below MIN = 0%
            } else {
                // Between MIN and MAX: calculate percentage
                statPercentage = ((teamStatSum - req.min) / range) * 100;
            }
            
            totalPercentage += statPercentage;
            requirementCount += 1;
        });

        let intelStatTotal = 0;
        teamIds.forEach(id => {
            const char = this.roster.find(c => c.id === id);
            if(char) intelStatTotal += char.stats.int;
        });

        // Calculate final success chance
        let finalChance = 0;
        
        if (anyStatBelowMin) {
            // If ANY stat is below MIN → 0% chance
            finalChance = 0;
        } else if (allStatsAtMax) {
            // If ALL stats are at MAX → 100% guaranteed success
            finalChance = 100;
        } else {
            // Otherwise: average percentage of all stats
            finalChance = totalPercentage / requirementCount;
        }

        // If mixed team (AI + Human), mission fails automatically
        const roll = Math.random() * 100;
        const success = mixedTeam ? false : (roll <= finalChance);

        this.missionResults[mission.id] = success ? "SUCCESS" : "FAILURE";
        
        if (success) {
            const avgInt = intelStatTotal / teamIds.length;
            const actualReward = Math.floor(mission.reward_intel * (avgInt / 5)); 
            this.onMissionComplete(actualReward, 0, teamIds, true, mission, mixedTeam, allStatsAtMax);
        } else {
            teamIds.forEach(id => this.onUpdateSuspicion(id, 15));
            this.onMissionComplete(0, 10, teamIds, false, mission, mixedTeam, allStatsAtMax);
        }
        
        // Clear this mission from assignments after completing
        delete this.assignments[mission.id];
        
        // Clear these characters from ALL other mission assignments
        teamIds.forEach(charId => {
            Object.keys(this.assignments).forEach(missionId => {
                if (this.assignments[missionId]) {
                    this.assignments[missionId] = this.assignments[missionId].filter(id => id !== charId);
                }
            });
        });
        
        this.render();
    }

    getThumbnail(char) {
        const basePath = `assets/images/${char.folder}`;
        if (char.status === 'MISSION') return `${basePath}/Combat.png`;
        if (char.status === 'INJURED') return `${basePath}/Injured.png`;
        if (char.status === 'DEAD') return char.isInfiltrator ? `${basePath}/ai.png` : `${basePath}/Dead.png`;
        return `${basePath}/Normal.png`;
    }

    render() {
        // Clear container and create wrapper
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'dispatch-wrapper w-full h-full p-6 overflow-y-auto relative';
        this.container.appendChild(wrapper);
        
        wrapper.innerHTML = `
            <h2 class="text-3xl font-tech text-neon-green mb-6 border-b border-neon-green/30 pb-2">
                AKTİF GÖREVLER [MISSION LOG]
            </h2>
            <div class="grid gap-6 md:grid-cols-1 lg:grid-cols-2 pb-20">
                    ${MISSIONS.map(mission => {
                        const assignedIds = this.assignments[mission.id] || [];
                        const result = this.missionResults[mission.id];
                        const assignedChars = assignedIds.map(id => this.roster.find(c => c.id === id)).filter(Boolean);

                        return `
                            <div class="bg-black/60 border p-4 transition-all group relative overflow-hidden flex flex-col
                                ${result === 'FAILURE' ? 'border-alert-red' : 'border-gray-700 hover:border-neon-green'}">
                                <div class="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-900 to-transparent -z-10"></div>
                                ${result ? `
                                    <div class="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-black/50">
                                        <div class="text-4xl font-tech font-bold border-4 p-4 -rotate-12 ${result === 'SUCCESS' ? 'border-neon-green text-neon-green' : 'border-alert-red text-alert-red'}">
                                            ${result === 'SUCCESS' ? 'GÖREV BAŞARILI' : 'GÖREV BAŞARISIZ'}
                                        </div>
                                    </div>
                                ` : ''}
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-xl font-bold text-white font-cine tracking-wide group-hover:text-neon-green transition-colors">
                                        ${mission.title}
                                    </h3>
                                    <span class="px-2 py-1 text-xs font-bold font-tech border
                                        ${mission.difficulty === 'LOW' ? 'border-green-500 text-green-500' : ''}
                                        ${mission.difficulty === 'MED' ? 'border-yellow-500 text-yellow-500' : ''}
                                        ${mission.difficulty === 'HIGH' ? 'border-orange-500 text-orange-500' : ''}">
                                        ${mission.difficulty}
                                    </span>
                                </div>
                                <p class="text-gray-400 text-sm font-mono mb-4 h-12 overflow-hidden">
                                    ${mission.description}
                                </p>
                                <div class="grid grid-cols-2 gap-4 text-sm font-tech mb-4 bg-gray-900/50 p-2 border border-gray-800">
                                    <div class="flex flex-col">
                                        <span class="text-gray-500 text-xs mb-2">GEREKSİNİMLER</span>
                                        <div class="space-y-2">
                                            ${mission.requirements.map(req => {
                                                // Calculate team stat total
                                                let teamStatSum = 0;
                                                assignedIds.forEach(id => {
                                                    const char = this.roster.find(c => c.id === id);
                                                    if (char) teamStatSum += char.stats[req.stat];
                                                });
                                                
                                                // Determine color based on threshold
                                                let barColor, shadowColor, textColor;
                                                if (teamStatSum >= req.max) {
                                                    barColor = 'bg-neon-green';
                                                    shadowColor = 'rgba(57,255,20,0.5)';
                                                    textColor = 'text-neon-green';
                                                } else if (teamStatSum >= req.min) {
                                                    barColor = 'bg-yellow-500';
                                                    shadowColor = 'rgba(234,179,8,0.5)';
                                                    textColor = 'text-yellow-500';
                                                } else {
                                                    barColor = 'bg-alert-red';
                                                    shadowColor = 'rgba(255,51,51,0.5)';
                                                    textColor = 'text-alert-red';
                                                }
                                                
                                                const percentage = req.max > 0 ? Math.min(100, (teamStatSum / req.max) * 100) : 0;
                                                const minPercentage = req.max > 0 ? (req.min / req.max) * 100 : 0;
                                                
                                                return `
                                                    <div class="flex flex-col mb-2">
                                                        <div class="flex justify-between text-xs mb-1">
                                                            <span class="text-white font-bold">${req.stat.toUpperCase()}</span>
                                                            <span class="${textColor} font-bold">${teamStatSum} / ${req.max}</span>
                                                        </div>
                                                        <div class="w-full bg-gray-800 h-5 border border-gray-700 relative">
                                                            <!-- Progress bar -->
                                                            <div class="h-full transition-all duration-300 ${barColor} shadow-[0_0_5px_${shadowColor}]" style="width: ${percentage}%"></div>
                                                            
                                                            <!-- MIN threshold line -->
                                                            <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_3px_rgba(255,255,255,0.8)]" style="left: ${minPercentage}%">
                                                                <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white"></div>
                                                                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white"></div>
                                                            </div>
                                                            
                                                            <!-- MIN label -->
                                                            <div class="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] bg-black/60 px-1 rounded pointer-events-none" style="left: ${minPercentage}%; transform: translate(-50%, -50%);">
                                                                MIN
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                    <div class="flex flex-col text-right">
                                        <span class="text-gray-500 text-xs">POTANSİYEL KAZANÇ</span>
                                        <span class="text-blue-400 font-bold">+${mission.reward_intel} DATA</span>
                                    </div>
                                </div>
                                <div class="min-h-[40px] mb-2 flex flex-wrap gap-2 items-center">
                                    ${assignedIds.length > 0 ? assignedIds.map(id => {
                                        const char = this.roster.find(c => c.id === id);
                                        return `
                                            <div class="flex items-center text-xs bg-neon-green/10 text-neon-green border border-neon-green px-2 py-1 font-tech">
                                                <img src="${this.getThumbnail(char)}" class="w-4 h-4 mr-2 rounded-full" alt=""/>
                                                ${char?.name.split(' ')[0]}
                                            </div>
                                        `;
                                    }).join('') : '<span class="text-xs text-gray-600 italic font-tech self-center">EKİP ATANMADI...</span>'}
                                </div>
                                <div class="mb-2">
                                    <div class="flex justify-between text-xs text-gray-500 mb-1 font-tech">
                                        <span>EKİP DOLULUK</span>
                                        <span>${assignedIds.length} / ${this.MAX_SQUAD_SIZE}</span>
                                    </div>
                                    <div class="w-full bg-gray-800 h-2 border border-gray-700">
                                        <div class="h-full bg-neon-green transition-all duration-300 shadow-[0_0_5px_rgba(57,255,20,0.5)]" style="width: ${(assignedIds.length / this.MAX_SQUAD_SIZE) * 100}%"></div>
                                    </div>
                                </div>
                                <div class="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                                    <div class="flex flex-col">
                                        <span class="text-xs text-gray-500 font-tech">ÖNERİLEN:</span>
                                        <span class="text-gray-300 text-xs uppercase">${mission.required_role}</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button data-mission-select="${mission.id}" 
                                            ${result ? 'disabled' : ''}
                                            class="bg-transparent border border-gray-500 text-gray-300 px-3 py-1 text-sm font-bold hover:bg-gray-800 transition-colors uppercase font-tech disabled:opacity-50">
                                            EKİP SEÇ (${assignedIds.length}/${this.MAX_SQUAD_SIZE})
                                        </button>
                                        <button data-mission-run="${mission.id}"
                                            ${assignedIds.length === 0 || result ? 'disabled' : ''}
                                            class="bg-neon-green border border-neon-green text-black px-4 py-1 text-sm font-bold hover:bg-white transition-colors uppercase font-tech disabled:opacity-50 disabled:bg-transparent disabled:text-gray-600">
                                            BAŞLAT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>
        `;

        // Event listeners - must be added after innerHTML
        setTimeout(() => {
            MISSIONS.forEach(mission => {
                const selectBtn = wrapper.querySelector(`[data-mission-select="${mission.id}"]`);
                if (selectBtn) {
                    selectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.selectedMission = mission;
                        this.renderModal();
                    });
                }

                const runBtn = wrapper.querySelector(`[data-mission-run="${mission.id}"]`);
                if (runBtn) {
                    runBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.runMission(mission);
                    });
                }
            });
        }, 10);
    }

    renderModal() {
        if (!this.selectedMission) return;

        // Remove existing modal if any
        const existingModal = document.querySelector('.mission-assign-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.className = 'mission-assign-modal fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4';
        modal.setAttribute('data-backdrop', 'true');
        
        // Calculate current team stats for display
        const assignedIds = this.assignments[this.selectedMission.id] || [];
        
        modal.innerHTML = `
            <div class="bg-gray-900 border border-neon-green w-full max-w-6xl flex flex-col max-h-[85vh]" data-modal-content="true">
                <div class="bg-neon-green text-black p-3 font-tech font-bold flex justify-between items-center">
                    <span>OPERATÖR SEÇİMİ - GÖREV DETAYI</span>
                    <button id="close-assign-modal" class="hover:text-white">[KAPAT]</button>
                </div>
                
                <!-- SPLIT LAYOUT: Left = Mission Info, Right = Character List -->
                <div class="flex flex-1 overflow-hidden">
                    <!-- LEFT PANEL: MISSION INFO (NO BLUR) -->
                    <div class="w-2/5 border-r border-gray-700 bg-black/40 p-4 overflow-y-auto">
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-2xl font-bold text-neon-green font-tech mb-2">${this.selectedMission.title}</h3>
                                <span class="px-2 py-1 text-xs font-bold font-tech border inline-block
                                    ${this.selectedMission.difficulty === 'LOW' ? 'border-green-500 text-green-500' : ''}
                                    ${this.selectedMission.difficulty === 'MED' ? 'border-yellow-500 text-yellow-500' : ''}
                                    ${this.selectedMission.difficulty === 'HIGH' ? 'border-orange-500 text-orange-500' : ''}">
                                    ${this.selectedMission.difficulty}
                                </span>
                            </div>
                            
                            <div class="text-sm text-gray-300 font-mono">
                                ${this.selectedMission.description}
                            </div>
                            
                            <div class="border-t border-gray-700 pt-3">
                                <div class="text-xs text-gray-500 mb-2 font-tech">GEREKSİNİMLER</div>
                                <div class="space-y-3">
                                    ${this.selectedMission.requirements.map(req => {
                                        // Calculate team stat total
                                        let teamStatSum = 0;
                                        assignedIds.forEach(id => {
                                            const char = this.roster.find(c => c.id === id);
                                            if (char) teamStatSum += char.stats[req.stat];
                                        });
                                        
                                        // Determine color based on threshold
                                        let barColor, textColor;
                                        if (teamStatSum >= req.max) {
                                            barColor = 'bg-neon-green';
                                            textColor = 'text-neon-green';
                                        } else if (teamStatSum >= req.min) {
                                            barColor = 'bg-yellow-500';
                                            textColor = 'text-yellow-500';
                                        } else {
                                            barColor = 'bg-alert-red';
                                            textColor = 'text-alert-red';
                                        }
                                        
                                        const percentage = req.max > 0 ? Math.min(100, (teamStatSum / req.max) * 100) : 0;
                                        const minPercentage = req.max > 0 ? (req.min / req.max) * 100 : 0;
                                        
                                        return `
                                            <div>
                                                <div class="flex justify-between text-xs mb-1">
                                                    <span class="text-white font-bold">${req.stat.toUpperCase()}</span>
                                                    <span class="${textColor} font-bold">${teamStatSum} / ${req.max}</span>
                                                </div>
                                                <div class="w-full bg-gray-800 h-6 border border-gray-700 relative">
                                                    <div class="h-full transition-all duration-300 ${barColor}" style="width: ${percentage}%"></div>
                                                    
                                                    <!-- MIN threshold line -->
                                                    <div class="absolute top-0 bottom-0 w-0.5 bg-white" style="left: ${minPercentage}%">
                                                        <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white"></div>
                                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white"></div>
                                                    </div>
                                                    
                                                    <!-- MIN label -->
                                                    <div class="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold text-white bg-black/60 px-1 rounded" style="left: ${minPercentage}%; transform: translate(-50%, -50%);">
                                                        MIN
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-700 pt-3">
                                <div class="text-xs text-gray-500">POTANSİYEL KAZANÇ</div>
                                <div class="text-blue-400 font-bold font-tech">+${this.selectedMission.reward_intel} DATA</div>
                            </div>
                            
                            <div class="border-t border-gray-700 pt-3">
                                <div class="text-xs text-gray-500">ÖNERİLEN ROL</div>
                                <div class="text-gray-300 text-sm uppercase font-tech">${this.selectedMission.required_role}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- RIGHT PANEL: CHARACTER LIST -->
                    <div class="w-3/5 bg-black/20 p-4 overflow-y-auto">
                        <div class="flex justify-between text-xs text-gray-500 mb-3 font-tech">
                            <span>PERSONEL LİSTESİ</span>
                            <span>SEÇİLEN: ${assignedIds.length} / ${this.MAX_SQUAD_SIZE}</span>
                        </div>
                        <div class="grid gap-2">
                            ${this.roster.map(char => {
                                const assigned = this.assignments[this.selectedMission.id] || [];
                                const isSelected = assigned.includes(char.id);
                                const isRoleMatch = char.role === this.selectedMission.required_role;
                                const isDead = char.status === 'DEAD';
                                const onMissionToday = this.usedCharactersToday.has(char.id);
                                const thumb = this.getThumbnail(char);

                                return `
                                    <button data-char-toggle="${char.id}"
                                        ${!isSelected && assigned.length >= this.MAX_SQUAD_SIZE || isDead || onMissionToday ? 'disabled' : ''}
                                        class="flex items-center p-2 border text-left transition-all group relative
                                            ${isDead ? 'border-gray-900 bg-black/80 opacity-40 cursor-not-allowed grayscale' : ''}
                                            ${onMissionToday && !isDead ? 'border-orange-700 bg-orange-900/20 opacity-50 cursor-not-allowed' : ''}
                                            ${!isDead && !onMissionToday && isSelected ? 'border-neon-green bg-neon-green/10' : ''}
                                            ${!isDead && !onMissionToday && !isSelected ? 'border-gray-700 bg-black/40 opacity-80 hover:opacity-100' : ''}
                                            ${!isDead && !onMissionToday && !isSelected && assigned.length >= this.MAX_SQUAD_SIZE ? 'opacity-30 cursor-not-allowed' : ''}">
                                        <div class="w-4 h-4 border border-gray-500 mr-3 flex items-center justify-center flex-shrink-0">
                                            ${isSelected ? '<div class="w-2 h-2 bg-neon-green"></div>' : ''}
                                            ${isDead ? '<div class="w-2 h-2 bg-gray-700"></div>' : ''}
                                        </div>
                                        <div class="relative flex-shrink-0">
                                            <img src="${thumb}" class="w-12 h-12 object-cover border ${isDead ? 'border-gray-900' : 'border-gray-600'}" alt="" />
                                            ${isDead ? '<div class="absolute inset-0 flex items-center justify-center"><span class="text-[8px] text-alert-red font-bold bg-black/80 px-1">ÖLÜ</span></div>' : ''}
                                        </div>
                                        <div class="flex-grow ml-3">
                                            <div class="flex items-center gap-2 mb-1">
                                                <div class="font-tech text-sm ${isDead ? 'text-gray-600' : onMissionToday ? 'text-orange-400' : 'text-white'}">
                                                    ${char.name}
                                                </div>
                                                ${isDead ? '<span class="text-[9px] bg-alert-red/30 text-alert-red px-1.5 py-0.5 rounded border border-alert-red/50">ÖLÜ</span>' : ''}
                                                ${!isDead && onMissionToday ? '<span class="text-[9px] bg-orange-900 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500">GÖREVDE</span>' : ''}
                                                ${!isDead && !onMissionToday && isRoleMatch ? '<span class="text-[9px] bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">UZMAN</span>' : ''}
                                            </div>
                                            <div class="text-[10px] ${isDead ? 'text-gray-700' : 'text-gray-500'} mb-1">${char.role}</div>
                                            <div class="flex items-center gap-2 text-[10px] font-mono">
                                                ${['str', 'int', 'agi', 'cha', 'end'].map(statKey => {
                                                    const isRequired = this.selectedMission.requirements.some(req => req.stat === statKey);
                                                    const statValue = char.stats[statKey];
                                                    return `
                                                        <span class="${isDead ? 'text-gray-700' : isRequired ? 'text-yellow-400 font-bold' : 'text-gray-400'}">
                                                            ${statKey.toUpperCase()}:<span class="${isDead ? 'text-gray-700' : isRequired ? 'text-yellow-400' : 'text-white'}">${statValue}</span>
                                                        </span>
                                                    `;
                                                }).join('')}
                                            </div>
                                        </div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            this.selectedMission = null;
            const existingModal = document.querySelector('.mission-assign-modal');
            if (existingModal) {
                document.body.removeChild(existingModal);
                document.removeEventListener('keydown', escHandler);
            }
        };

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-backdrop')) {
                closeModal();
            }
        });

        const closeBtn = modal.querySelector('#close-assign-modal');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
        
        // Close on ESC key
        document.addEventListener('keydown', escHandler);

        this.roster.forEach(char => {
            const toggleBtn = modal.querySelector(`[data-char-toggle="${char.id}"]`);
            const isAvailable = char.status !== 'DEAD' && !this.usedCharactersToday.has(char.id);
            if (toggleBtn && isAvailable) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleAssign(this.selectedMission.id, char.id);
                    const existingModal = document.querySelector('.mission-assign-modal');
                    if (existingModal) {
                        document.body.removeChild(existingModal);
                    }
                    this.renderModal();
                });
            }
        });
    }
}

