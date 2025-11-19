export class CharacterCard {
    static getImagePath(character) {
        const basePath = `assets/images/${character.folder}`;
        
        if (character.status === 'DEAD') {
            return character.isInfiltrator ? `${basePath}/ai.png` : `${basePath}/Dead.png`;
        }
        if (character.status === 'MISSION') return `${basePath}/Combat.png`;
        if (character.status === 'INJURED') return `${basePath}/Injured.png`;
        
        return `${basePath}/Normal.png`;
    }

    static getTrustColor(trust) {
        switch(trust) {
            case 'TRUSTED': return 'bg-green-600 text-white border-green-400';
            case 'UNTRUSTED': return 'bg-red-600 text-white border-red-400';
            case 'UNSURE': return 'bg-yellow-600 text-black border-yellow-400';
            default: return 'bg-gray-600';
        }
    }

    static render(character, onClick) {
        const imagePath = this.getImagePath(character);
        const trustColor = this.getTrustColor(character.playerTrust);
        
        const card = document.createElement('div');
        card.className = `group relative flex flex-col h-[380px] bg-black/80 border transition-all duration-300 cursor-pointer overflow-hidden
            ${character.status === 'DEAD' ? 'border-gray-900 opacity-80' : 
              character.status === 'INJURED' ? 'border-alert-red bg-red-900/10' :
              'border-gray-800 hover:border-neon-green hover:scale-105 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]'}
        `;
        card.style.cssText = 'pointer-events: auto; position: relative; z-index: 10;';
        
        card.innerHTML = `
            <div class="h-[70%] w-full bg-[#111] border-b border-gray-800 relative overflow-hidden">
                <img 
                    src="${imagePath}" 
                    alt="${character.name}"
                    class="w-full h-full object-cover object-top transition-all duration-500 ease-out
                       ${character.status === 'DEAD' ? '' : 
                         character.status === 'INJURED' ? 'sepia-[.5]' :
                         'sepia-[20%] brightness-75 group-hover:filter-none group-hover:scale-110'}
                    "
                    onerror="this.src='https://picsum.photos/200/250?random=${character.id}'"
                />
                <div class="absolute top-2 left-2 bg-black/70 border border-neon-green text-neon-green text-[10px] px-2 py-1 font-tech tracking-widest">
                    ${character.role}
                </div>
                ${character.status === 'MISSION' ? `
                    <div class="absolute inset-0 bg-yellow-500/10 flex items-center justify-center backdrop-blur-[0px]">
                        <div class="bg-yellow-500 text-black font-tech font-bold px-4 py-1 -rotate-12 border-2 border-black shadow-lg">
                            GÖREVDE
                        </div>
                    </div>
                ` : ''}
                ${character.status === 'INJURED' ? `
                    <div class="absolute inset-0 bg-red-900/20 flex items-center justify-center backdrop-blur-[0px]">
                        <div class="text-white bg-alert-red font-tech font-bold text-xl border-2 border-white px-4 py-2 rotate-6 animate-pulse">
                            YARALI
                        </div>
                    </div>
                ` : ''}
                ${character.status === 'DEAD' ? `
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div class="text-alert-red font-tech font-bold text-3xl border-4 border-alert-red p-2 rotate-12 opacity-80">
                            ÖLDÜ
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="h-[30%] p-3 flex flex-col justify-center bg-gradient-to-t from-black to-[#111]">
                <div class="flex justify-between items-center mb-1">
                    <div class="text-xs text-neon-green font-tech tracking-wider">
                        ID: ${character.id.toUpperCase()}
                    </div>
                    <div class="text-[9px] px-1 border font-bold font-mono ${trustColor}">
                        ${character.playerTrust === 'TRUSTED' ? 'GÜVENLİ' : character.playerTrust === 'UNTRUSTED' ? 'TEHDİT' : '?'}
                    </div>
                </div>
                <div class="text-base text-gray-200 font-bold text-center font-tech leading-tight overflow-hidden min-h-[3rem]" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    ${character.name}
                </div>
                <div class="mt-2 w-full bg-gray-800 h-1">
                    <div class="h-full bg-alert-red shadow-[0_0_5px_#ff3333]" style="width: ${character.suspicion}%"></div>
                </div>
                <div class="flex justify-between text-[9px] text-gray-500 mt-1 font-tech">
                    <span>ŞÜPHE</span>
                    <span>${character.suspicion}%</span>
                </div>
            </div>
        `;
        
        if (onClick) {
            card.onclick = (e) => {
                e.stopPropagation();
                onClick(character);
            };
        }
        
        return card;
    }
}

