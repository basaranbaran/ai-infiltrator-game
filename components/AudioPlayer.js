export class AudioPlayer {
    constructor() {
        this.currentTrack = 0;
        this.isPlaying = false;
        this.isRepeat = false;
        this.audio = new Audio();
        
        // Load all tracks from theme folder
        this.tracks = [
            'assets/audio/theme/1- Enigma - Sadeness - Part i (Official Video) [4F9DxYhqmKw].mp3',
            'assets/audio/theme/2- Enigma - Callas Went Away (Official Video) [qo-j9vGEY9U].mp3',
            'assets/audio/theme/3- Enigma - Mea Culpa (Official Video) [b_OZaZ2dUE4].mp3',
            'assets/audio/theme/4- Enigma - The Voice & The Snake (Official Video) [z18HWWX6yYM].mp3',
            'assets/audio/theme/5- Enigma - Knocking On Forbidden Doors (Official Video) [q9ZgVkJIexI].mp3',
            'assets/audio/theme/6- Enigma - The Rivers Of Belief (Official Video) [Xqb18bqNtEw].mp3',
            'assets/audio/theme/7- Game of Thrones S8 Official Soundtrack _ The Night King - Ramin Djawadi _ WaterTower [k1frgt0D_f4].mp3',
            'assets/audio/theme/8- Hans Zimmer - Journey to the Line _ The Thin Red Line (Original Motion Picture Soundtrack) [PpEIoBnQsKs].mp3',
            'assets/audio/theme/9- Trippie Redd Performs _Wish_ With Live Orchestra _ Audiomack Trap Symphony [zOdKS_ayMyM].mp3'
        ];
        
        this.trackNames = [
            'Enigma - Sadeness',
            'Enigma - Callas Went Away',
            'Enigma - Mea Culpa',
            'Enigma - The Voice & The Snake',
            'Enigma - Knocking On Forbidden Doors',
            'Enigma - The Rivers Of Belief',
            'Game of Thrones - The Night King',
            'Hans Zimmer - Journey to the Line',
            'Trippie Redd - Wish'
        ];
        
        this.audio.volume = 0.3;
        
        // Auto-play next track when current ends
        this.audio.addEventListener('ended', () => {
            if (this.isRepeat) {
                this.play();
            } else {
                this.next();
            }
        });
        
        this.loadTrack(this.currentTrack);
    }
    
    loadTrack(index) {
        this.currentTrack = index;
        this.audio.src = this.tracks[index];
        this.updateDisplay();
    }
    
    play() {
        this.audio.play();
        this.isPlaying = true;
        this.updateDisplay();
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateDisplay();
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    next() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    previous() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const trackNameEl = document.getElementById('track-name');
        const playBtn = document.getElementById('play-btn');
        const repeatBtn = document.getElementById('repeat-btn');
        
        if (trackNameEl) {
            trackNameEl.textContent = this.trackNames[this.currentTrack];
        }
        
        if (playBtn) {
            playBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }
        
        if (repeatBtn) {
            repeatBtn.style.opacity = this.isRepeat ? '1' : '0.5';
            repeatBtn.style.color = this.isRepeat ? '#39ff14' : '#9ca3af';
        }
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'flex items-center gap-3 bg-black/60 border border-gray-700 px-4 py-2 rounded';
        container.innerHTML = `
            <button id="prev-btn" class="text-gray-400 hover:text-neon-green transition-colors text-lg" title="Önceki">
                ⏮
            </button>
            <button id="play-btn" class="text-white hover:text-neon-green transition-colors text-xl font-bold" title="Oynat/Duraklat">
                ${this.isPlaying ? '⏸' : '▶'}
            </button>
            <button id="next-btn" class="text-gray-400 hover:text-neon-green transition-colors text-lg" title="Sonraki">
                ⏭
            </button>
            <button id="repeat-btn" class="text-gray-400 hover:text-neon-green transition-colors text-lg" title="Tekrar" style="opacity: ${this.isRepeat ? '1' : '0.5'}; color: ${this.isRepeat ? '#39ff14' : '#9ca3af'}">
                🔁
            </button>
            <div class="border-l border-gray-600 pl-3 ml-2">
                <div id="track-name" class="text-xs text-gray-300 font-tech max-w-[200px] truncate">
                    ${this.trackNames[this.currentTrack]}
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            const playBtn = container.querySelector('#play-btn');
            const prevBtn = container.querySelector('#prev-btn');
            const nextBtn = container.querySelector('#next-btn');
            const repeatBtn = container.querySelector('#repeat-btn');
            
            if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
            if (prevBtn) prevBtn.addEventListener('click', () => this.previous());
            if (nextBtn) nextBtn.addEventListener('click', () => this.next());
            if (repeatBtn) repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }, 0);
        
        return container;
    }
}

