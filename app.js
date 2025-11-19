import { StartScene } from './components/StartScene.js';
import { IntroScene } from './components/IntroScene.js';
import { GameInterface } from './components/GameInterface.js';

class App {
    constructor() {
        this.currentScene = 'start';
        this.root = document.getElementById('root');
        this.render();
    }

    setScene(scene) {
        this.currentScene = scene;
        this.render();
    }

    render() {
        this.root.innerHTML = `
            <div class="w-screen h-screen bg-cyber-black relative text-gray-200">
                <div class="scanlines"></div>
                <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-50"></div>
            </div>
        `;
        
        const container = this.root.querySelector('div');

        if (this.currentScene === 'start') {
            new StartScene(container, () => this.setScene('intro'));
        } else if (this.currentScene === 'intro') {
            new IntroScene(container, () => this.setScene('game'));
        } else if (this.currentScene === 'game') {
            new GameInterface(container);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}

