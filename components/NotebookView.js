export class NotebookView {
    constructor(container, roster = [], logs = [], onCharacterClick = null) {
        this.container = container;
        this.roster = roster;
        this.logs = logs;
        this.onCharacterClick = onCharacterClick;
        this.render();
    }

    updateData(newRoster, newLogs, onCharacterClick = null) {
        this.roster = newRoster;
        this.logs = newLogs;
        if (onCharacterClick) this.onCharacterClick = onCharacterClick;
        this.render();
    }

    render() {
        const sortedRoster = [...this.roster].sort((a, b) => b.suspicion - a.suspicion);

        // Clear container and create wrapper
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'notebook-wrapper w-full h-full p-8 overflow-y-auto bg-black text-green-500 font-mono';
        this.container.appendChild(wrapper);
        
        wrapper.innerHTML = `
            <div class="w-full h-full p-8 overflow-y-auto bg-black text-green-500 font-mono">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-3xl font-tech text-white mb-8 border-b border-gray-700 pb-4">
                            ŞİFRELİ VERİ TABANI [NOTEBOOK]
                        </h2>
                        <div class="space-y-8">
                            ${this.logs.map(log => `
                                <div class="mb-6">
                                    <div class="flex items-center gap-4 mb-2">
                                        <span class="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">${log.date}</span>
                                        <h3 class="text-xl font-bold text-neon-green uppercase tracking-wide">
                                            ${log.isEncrypted ? '🔒 ' + log.title : log.title}
                                        </h3>
                                    </div>
                                    <div class="p-4 border-l-2 
                                        ${log.isEncrypted ? 'border-alert-red bg-alert-red/5 text-alert-red blur-[1px] hover:blur-0 transition-all cursor-help' : 'border-gray-600 bg-gray-900/50 text-gray-300'}">
                                        <p class="leading-relaxed whitespace-pre-wrap">${log.content}</p>
                                    </div>
                                    ${log.isEncrypted ? `
                                        <div class="mt-2 text-xs text-right text-gray-600 animate-pulse">
                                            DECRYPT KEY REQUIRED (INTEL LVL 5)
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="bg-gray-900/30 border border-gray-700 p-6 h-fit">
                        <h2 class="text-2xl font-tech text-white mb-6 flex justify-between items-center">
                            PERSONEL DURUM RAPORU
                            <span class="text-sm text-gray-500">GİZLİ BELGE</span>
                        </h2>
                        <table class="w-full text-xs md:text-sm text-left">
                            <thead class="text-gray-500 border-b border-gray-700 uppercase font-tech">
                                <tr>
                                    <th class="pb-2">KOD ADI</th>
                                    <th class="pb-2">DURUM</th>
                                    <th class="pb-2">OYUNCU ANALİZİ</th>
                                    <th class="pb-2">GERÇEK KİMLİK</th>
                                    <th class="pb-2 text-right">ŞÜPHE</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800">
                                ${sortedRoster.map(char => `
                                    <tr class="group cursor-pointer hover:bg-gray-800/50 transition-colors ${char.status === 'DEAD' ? 'opacity-60' : ''}" data-char-id="${char.id}">
                                        <td class="py-3 font-bold group-hover:text-neon-green ${char.status === 'DEAD' ? 'text-red-500 line-through' : 'text-white'}">${char.name}</td>
                                        <td class="py-3">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold
                                                ${char.status === 'DEAD' ? 'bg-red-900 text-red-200' : 
                                                  char.status === 'INJURED' ? 'bg-orange-900 text-orange-200' :
                                                  char.status === 'MISSION' ? 'bg-yellow-900 text-yellow-200' : 
                                                  'bg-green-900 text-green-200'}">
                                                ${char.status === 'INJURED' ? 'YARALI' : char.status}
                                            </span>
                                        </td>
                                        <td class="py-3">
                                            ${char.playerTrust === 'TRUSTED' ? '<span class="text-neon-green font-bold">GÜVENLİ</span>' : 
                                              char.playerTrust === 'UNSURE' ? '<span class="text-yellow-400 font-bold">EMİN DEĞİLİM</span>' :
                                              char.playerTrust === 'UNTRUSTED' ? '<span class="text-alert-red font-bold">GÜVENSİZ</span>' :
                                              '<span class="text-gray-600">-</span>'}
                                        </td>
                                        <td class="py-3">
                                            ${char.status === 'DEAD' ? `
                                                <span class="font-bold ${char.isInfiltrator ? 'text-neon-green' : 'text-white'}">
                                                    ${char.isInfiltrator ? 'YZ [AI]' : 'İNSAN [HUMAN]'}
                                                </span>
                                            ` : `
                                                <span class="text-gray-600">BİLİNMİYOR</span>
                                            `}
                                        </td>
                                        <td class="py-3 text-right font-mono">
                                            <span class="${char.suspicion > 50 ? 'text-alert-red' : 'text-gray-400'}">
                                                ${char.suspicion}%
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="mt-4 text-xs text-gray-600 italic text-center">
                            * Veriler oyuncu analizlerine dayanmaktadır. Otomatik güncellenir.
                            <br/>* Ölen personelin otopsi sonuçları "Gerçek Kimlik" sütununa işlenir.
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for character rows
        if (this.onCharacterClick) {
            setTimeout(() => {
                this.roster.forEach(char => {
                    const row = wrapper.querySelector(`[data-char-id="${char.id}"]`);
                    if (row) {
                        row.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.onCharacterClick(char);
                        });
                    }
                });
            }, 10);
        }
    }
}

