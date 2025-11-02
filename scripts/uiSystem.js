import { Character } from "./Characters.js";
// uiSystem.js
export const heartMatrix = [
    [0,0,1,1,0,0,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
];

const pixelSize = 2;

export function drawHeart(ctx, x, y, scale, color = '#FF3B3B') {
    for (let row = 0; row < heartMatrix.length; row++) {
        for (let col = 0; col < heartMatrix[row].length; col++) {
            if (heartMatrix[row][col]) {
                ctx.fillStyle = color;
                ctx.fillRect(
                    x + col * pixelSize * scale,
                    y + row * pixelSize * scale,
                    pixelSize * scale,
                    pixelSize * scale
                );
            }
        }
    }
}

export function drawPlayerLives(ctx, canvas, player, isTopPlayer) {
    const heartSpacing = pixelSize * 12; // Space between hearts
    const startY = isTopPlayer ? 10 : canvas.height - (pixelSize * 10);
    const startX = canvas.width / 2 - (player.lives * heartSpacing) / 2;

    player.updateHeartPulse(); // Update heart pulse scales

    player.heartScales.forEach((scale, index) => {
        const heartX = startX + index * heartSpacing;
        if (index < player.lives) {
            drawHeart(ctx, heartX, startY, scale);
        }
    });
}

export function updateScoreDisplays(score, highScore, peerData) {
    const myHighScore = document.getElementById('highScore');
    const myScore = document.getElementById('score');
    const peerHighScore = document.getElementById('peerHighScore');
    const peerScore = document.getElementById('peerScore');

    myHighScore.textContent = 'High Score: ' + highScore;
    myScore.textContent = 'Score: ' + score;
    if (peerData) {
        peerScore.textContent = 'Their Score: ' + peerData.score;
        peerHighScore.textContent = 'Their High Score: ' + peerData.highScore;
    } else {
        // If no connection, this basically hides the element.
        peerScore.textContent = '';
        peerHighScore.textContent = '';
    }
}

export function drawCharacters(ctx, canvas, p1Char, p2Char, deltaTime) {
    if (p1Char) {
        p1Char.draw(ctx, canvas.width / 1.2, 1 + canvas.height / 2 - 8.5 * canvas.width / 48, canvas.height / 4);
        p1Char.update(deltaTime)
    }
    if (p2Char) {
        p2Char.draw(ctx, canvas.width / 6, canvas.height / 1, canvas.height / 4, true);
        p2Char.update(deltaTime);
    }

}