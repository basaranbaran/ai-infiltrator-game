export class StartScene {
    constructor(container, onStart) {
        this.container = container;
        this.onStart = onStart;
        this.render();
    }

    render() {
        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'relative w-full h-full flex items-center justify-center z-40';
        sceneDiv.innerHTML = `
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)] -z-10"></div>
            <div class="text-center p-10 bg-black/80 border border-neon-green shadow-[0_0_20px_rgba(57,255,20,0.2)] max-w-2xl mx-4">
                <h1 class="text-5xl md:text-7xl font-tech text-neon-green mb-2 drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
                    AI INFILTRATOR
                </h1>
                <p class="text-white text-xl tracking-[0.5em] font-bold mb-8 font-tech">
                    DISPATCH PROTOCOL
                </p>
                <div class="border border-alert-red text-alert-red p-4 mb-8 font-mono text-sm md:text-base animate-pulse-fast">
                    <p class="font-bold">⚠️ UYARI: BU SİMÜLASYON SESLİDİR.</p>
                    <p>LÜTFEN KULAKLIK TAKINIZ.</p>
                </div>
                <button id="start-btn" class="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-neon-green transition-all duration-300 bg-transparent border-2 border-neon-green hover:bg-neon-green hover:text-black focus:outline-none">
                    <span class="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                    <span class="relative text-lg md:text-xl tracking-widest">SİSTEMİ BAŞLAT [INIT]</span>
                </button>
            </div>
        `;
        
        this.container.appendChild(sceneDiv);
        
        const startBtn = sceneDiv.querySelector('#start-btn');
        startBtn.addEventListener('click', this.onStart);
    }
}

