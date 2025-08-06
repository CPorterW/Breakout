// Player.js
export class Player {
    constructor(name, lives, character) {
        this.lives = lives;
        this.name = name;
        this.character = character;
        this.heartScales = Array(lives).fill(1); // Track individual heart scales
    }

    updateHeartPulse() {
        // Update heart scales for a subtle pulse effect
        this.heartScales = this.heartScales.map((scale, index) => {
            if (scale >= 1.2) return 1;
            if (scale <= 1) return 1.1;
            return scale + 0.002; // Adjust pulse speed
        });
    }
}