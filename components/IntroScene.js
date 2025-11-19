import { INTRO_DATA } from '../data.js';

export class IntroScene {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.activeSlideIndex = 0;
        this.subtitle = '';
        this.subtitleVisible = false;
        this.audioMusic = null;
        this.audioVoice = null;
        this.timeouts = [];
        this.render();
        this.init();
    }

    init() {
        // Setup Audio
        this.audioMusic = new Audio('assets/audio/bg_music.mp3');
        this.audioVoice = new Audio('assets/audio/intro_voice.mp3');

        this.audioMusic.volume = 0.5;
        this.audioMusic.currentTime = 133;
        this.audioMusic.loop = true;

        const playAudio = async () => {
            try {
                await this.audioMusic.play();
                await this.audioVoice.play();
            } catch (err) {
                console.error("Audio playback failed", err);
            }
        };
        playAudio();

        // Schedule Timeline
        INTRO_DATA.forEach((slide, index) => {
            const delay = slide.startTime;
            
            const t1 = setTimeout(() => {
                this.activeSlideIndex = index;
                this.subtitleVisible = false;
                
                const tSub = setTimeout(() => {
                    this.subtitle = slide.text;
                    this.subtitleVisible = true;
                    this.updateSubtitle();
                }, 300);
                
                this.timeouts.push(tSub);
                this.updateImages();
            }, delay);
            
            this.timeouts.push(t1);
        });

        // Auto-complete when voice ends
        this.audioVoice.onended = () => {
            const tEnd = setTimeout(() => {
                this.handleSkip();
            }, 2000);
            this.timeouts.push(tEnd);
        };
    }

    handleSkip() {
        if (this.audioMusic) {
            const fadeOut = setInterval(() => {
                if (this.audioMusic && this.audioMusic.volume > 0.1) {
                    this.audioMusic.volume -= 0.1;
                } else {
                    clearInterval(fadeOut);
                    this.audioMusic?.pause();
                }
            }, 100);
        }
        if (this.audioVoice) this.audioVoice.pause();
        
        this.timeouts.forEach(clearTimeout);
        this.onComplete();
    }

    isImageActive(imgSrc) {
        const activeSrc = INTRO_DATA[this.activeSlideIndex]?.img;
        return activeSrc === imgSrc;
    }

    updateImages() {
        const images = this.sceneDiv.querySelectorAll('.intro-img');
        images.forEach(img => {
            const src = img.dataset.src;
            if (this.isImageActive(src)) {
                img.classList.remove('opacity-0', 'scale-100');
                img.classList.add('opacity-100', 'scale-110');
            } else {
                img.classList.remove('opacity-100', 'scale-110');
                img.classList.add('opacity-0', 'scale-100');
            }
        });
    }

    updateSubtitle() {
        const subtitleEl = this.sceneDiv.querySelector('#subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = this.subtitle;
            subtitleEl.className = `
                bg-black/70 text-gray-200 px-6 py-3 rounded text-xl md:text-2xl font-cine 
                shadow-lg text-center transition-opacity duration-500
                ${this.subtitleVisible ? 'opacity-100' : 'opacity-0'}
            `;
        }
    }

    render() {
        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'relative w-full h-full bg-black overflow-hidden z-50';
        this.sceneDiv = sceneDiv;

        const uniqueImages = Array.from(new Set(INTRO_DATA.map(s => s.img)));

        // Background Images
        uniqueImages.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Intro Sequence';
            img.dataset.src = src;
            const isIntro5 = src.includes('intro_5');
            img.className = `
                intro-img absolute inset-0 w-full h-full ${isIntro5 ? 'object-contain' : 'object-cover'}
                transition-opacity duration-[2000ms] ease-in-out
                transform transition-transform duration-[15000ms] linear
                ${this.isImageActive(src) ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}
            `;
            img.onerror = (e) => {
                e.currentTarget.src = `https://picsum.photos/1920/1080?random=${src.length}`;
            };
            sceneDiv.appendChild(img);
        });

        // Cinematic Bars
        const topBar = document.createElement('div');
        topBar.className = 'absolute top-0 left-0 w-full h-[10%] bg-black z-20';
        sceneDiv.appendChild(topBar);

        const bottomBar = document.createElement('div');
        bottomBar.className = 'absolute bottom-0 left-0 w-full h-[10%] bg-black z-20';
        sceneDiv.appendChild(bottomBar);

        // Subtitles
        const subtitleContainer = document.createElement('div');
        subtitleContainer.className = 'absolute bottom-[15%] w-full flex justify-center z-30 px-4';
        subtitleContainer.innerHTML = `
            <div id="subtitle" class="bg-black/70 text-gray-200 px-6 py-3 rounded text-xl md:text-2xl font-cine 
                shadow-lg text-center transition-opacity duration-500 opacity-0">
            </div>
        `;
        sceneDiv.appendChild(subtitleContainer);

        // Skip Button
        const skipBtn = document.createElement('button');
        skipBtn.className = 'absolute top-6 right-6 z-40 border border-gray-600 text-gray-400 hover:text-white hover:border-white px-4 py-2 font-tech text-sm uppercase transition-colors';
        skipBtn.textContent = 'Atlama [ESC]';
        skipBtn.addEventListener('click', () => this.handleSkip());
        sceneDiv.appendChild(skipBtn);

        // ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.handleSkip();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        this.container.appendChild(sceneDiv);
    }
}

