// settings.js

class Settings {
    constructor() {
        this.isOpen = false;
        this.musicVolume = localStorage.getItem('musicVolume') || 0.5;
        this.soundVolume = localStorage.getItem('soundVolume') || 0.5;

        // Create and append styles
        this.addStyles();
        
        // Create settings menu
        this.createSettingsMenu();
        
        // Add click listener to settings icon in navbar
        const settingsIcon = document.querySelector('.nav-item img[src*="settings.png"]');
        if (settingsIcon) {
            settingsIcon.parentElement.addEventListener('click', () => this.toggleMenu());
        }
    }

    addStyles() {
        const styles = `
            .settings-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                z-index: 1000;
            }

            .settings-menu {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 32px;
                border-radius: 24px;
                width: 320px;
                z-index: 1001;
            }

            .settings-title {
                color: #9e4db2;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 24px;
            }

            .volume-control {
                margin-bottom: 24px;
            }

            .volume-label {
                color: #FFA500;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 8px;
                display: block;
            }

            .volume-slider {
                width: 100%;
                height: 5px;
                -webkit-appearance: none;
                background: #ea84f5;
                border-radius: 10px;
                outline: none;
            }

            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 15px;
                height: 15px;
                background: #FFA500;
                border-radius: 50%;
                cursor: pointer;
            }

            .close-button {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
            }

            .close-button img {
                width: 24px;
                height: 24px;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createSettingsMenu() {
        const settingsHTML = `
            <div class="settings-overlay">
                <div class="settings-menu">
                    <div class="settings-title">SETTINGS</div>
                    <div class="volume-control">
                        <label class="volume-label">Music Volume:</label>
                        <input type="range" class="volume-slider" id="musicVolume" 
                               min="0" max="1" step="0.1" value="${this.musicVolume}">
                    </div>
                    <div class="volume-control">
                        <label class="volume-label">Practice Sounds:</label>
                        <input type="range" class="volume-slider" id="soundVolume" 
                               min="0" max="1" step="0.1" value="${this.soundVolume}">
                    </div>
                    <button class="close-button">
                        <img src="./images/close.png" alt="Close">
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', settingsHTML);

        // Add event listeners
        this.overlay = document.querySelector('.settings-overlay');
        this.musicSlider = document.getElementById('musicVolume');
        this.soundSlider = document.getElementById('soundVolume');
        const closeButton = document.querySelector('.close-button');

        this.musicSlider.addEventListener('input', (e) => this.updateMusicVolume(e.target.value));
        this.soundSlider.addEventListener('input', (e) => this.updateSoundVolume(e.target.value));
        closeButton.addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.toggleMenu();
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.overlay.style.display = this.isOpen ? 'block' : 'none';
    }

    updateMusicVolume(value) {
        this.musicVolume = value;
        localStorage.setItem('musicVolume', value);
        
        // Update background music volume
        if (window.backgroundMusic?.audio) {
            window.backgroundMusic.audio.volume = value;
        }
    }

    updateSoundVolume(value) {
        this.soundVolume = value;
        localStorage.setItem('soundVolume', value);
        
        // Dispatch storage event to notify practice sounds
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'soundVolume',
            newValue: value
        }));

        // Update practice sound effects volume if instance exists
        if (window.practiceSound) {
            window.practiceSound.updateVolume(value);
        }
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
});