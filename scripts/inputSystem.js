// inputSystem.js
export const keys = {
    a: false,
    d: false,
    ArrowLeft: false,
    ArrowRight: false
};

export function initializeInputSystem() {
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault(); // Prevents the page from scrolling
                keys.ArrowLeft = true;
                break;
            case 'ArrowRight':
                event.preventDefault();
                keys.ArrowRight = true;
                break;
            case 'a':
                keys.a = true;
                break;
            case 'd':
                keys.d = true;
                break;
        }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                keys.ArrowLeft = false;
                break;
            case 'ArrowRight':
                keys.ArrowRight = false;
                break;
            case 'a':
                keys.a = false;
                break;
            case 'd':
                keys.d = false;
                break;
        }
    });
}