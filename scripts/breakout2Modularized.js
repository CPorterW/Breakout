// main.js - Your main game file
import { GameEngine } from './gameEngine.js';
import { initializeInputSystem } from './inputSystem.js';

const canvas = document.getElementById("myCanvas");

window.onload = function() {
    // Initialize input system
    initializeInputSystem();
    
    // Create and start the game
    const game = new GameEngine(canvas);
    game.startGame();
};