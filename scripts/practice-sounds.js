// practice-sounds.js

class PracticeSoundEffects {
    constructor() {
        // Initialize sound effects
        this.sounds = {
            yay: new Audio('../audio/yay.mp3'),
            amazing: new Audio('../audio/amazing.mp3'),
            goodjob: new Audio('../audio/goodjob.mp3')
        };

        // Get stored sound volume or use default
        const soundVolume = localStorage.getItem('soundVolume') || 0.5;
        
        // Set initial volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = soundVolume;
        });

        // Listen for sound volume changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'soundVolume') {
                this.updateVolume(e.newValue);
            }
        });
    }

    updateVolume(value) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = value;
        });
    }

    playRandomSound() {
        // Get all sound keys
        const soundKeys = Object.keys(this.sounds);
        
        // Select random sound
        const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
        
        // Stop any currently playing sounds
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });

        // Play the selected sound
        try {
            const playPromise = this.sounds[randomKey].play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Sound playback prevented:", error);
                });
            }
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }
}

// Create global instance
window.practiceSound = new PracticeSoundEffects();