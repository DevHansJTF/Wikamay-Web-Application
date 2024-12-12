class BackgroundMusic {
    constructor() {
        console.log('Initializing BackgroundMusic...');
        
        const audioPath = '../audio/audio.mp3';
        console.log('Attempting to load audio from:', audioPath);
        
        this.audio = new Audio(audioPath);
        this.isPlaying = false;
        this.volume = localStorage.getItem('musicVolume') || 0.5;
        console.log('Initial volume:', this.volume);
        
        this.audio.volume = this.volume;
        this.isMuted = localStorage.getItem('musicMuted') === 'true';
        console.log('Initial mute state:', this.isMuted);

        // Add error handling
        this.audio.onerror = (e) => {
            console.error('Audio failed to load:', {
                error: e,
                src: this.audio.src,
                networkState: this.audio.networkState,
                readyState: this.audio.readyState
            });
        };

        // Add load handler
        this.audio.onloadeddata = () => {
            console.log('Audio loaded successfully:', {
                duration: this.audio.duration,
                src: this.audio.src
            });
            // Try to play immediately after loading
            if (!this.isMuted) {
                this.play();
            }
        };

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            console.log('Visibility changed. Hidden:', document.hidden);
            if (document.hidden) {
                if (this.isPlaying) {
                    console.log('Page hidden, pausing audio');
                    this.audio.pause();
                }
            } else {
                if (this.isPlaying) {
                    console.log('Page visible, resuming audio');
                    this.audio.play().catch(error => {
                        console.error('Failed to resume audio:', error);
                    });
                }
            }
        });

        console.log('BackgroundMusic initialization complete');
    }

    play() {
        console.log('Attempting to play audio...');
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Audio playing successfully');
                this.isPlaying = true;
                localStorage.setItem('musicPlaying', 'true');
            }).catch(error => {
                console.error('Autoplay prevented:', {
                    error,
                    errorName: error.name,
                    errorMessage: error.message,
                    audioState: {
                        paused: this.audio.paused,
                        currentTime: this.audio.currentTime,
                        volume: this.audio.volume,
                        muted: this.audio.muted,
                        src: this.audio.src
                    }
                });
                // Setup for user interaction
                this.setupAutoplayFallback();
            });
        }
    }

    setupAutoplayFallback() {
        console.log('Setting up autoplay fallback...');
        const handleInteraction = () => {
            console.log('User interaction detected, attempting to play audio...');
            this.audio.play().then(() => {
                console.log('Audio playing after user interaction');
                this.isPlaying = true;
                localStorage.setItem('musicPlaying', 'true');
                // Remove listeners after successful play
                document.removeEventListener('click', handleInteraction);
                document.removeEventListener('touchstart', handleInteraction);
            }).catch(error => {
                console.error('Failed to play after interaction:', error);
            });
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
    }

    pause() {
        console.log('Pausing audio');
        this.audio.pause();
        this.isPlaying = false;
        localStorage.setItem('musicPlaying', 'false');
    }

    toggleMute() {
        console.log('Toggling mute state');
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        localStorage.setItem('musicMuted', this.isMuted);
        console.log('New mute state:', this.isMuted);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating BackgroundMusic instance');
    window.backgroundMusic = new BackgroundMusic();
});